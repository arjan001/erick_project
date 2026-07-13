import React, { useState, useEffect } from 'react';
import { Project } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Image as ImageIcon, MapPin, Calendar, Clock, DollarSign, Briefcase, Users, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import filmIndustrySkills from '@/data/filmIndustrySkills.json';
import filmIndustryRoles from '@/data/filmIndustryRoles.json';

const PROJECT_TYPES = [
  'commercial', 'short_film', 'film', 'music_video', 'documentary', 'other'
];

const PAYMENT_TYPES = ['Fixed', 'Hourly', 'Daily'];

// Flatten skills from JSON
const ALL_SKILLS = Object.values(filmIndustrySkills).flat();
// Flatten roles from JSON
const ALL_ROLES = Object.values(filmIndustryRoles).flat().filter(item => typeof item === 'string');
const ALL_OPTIONS = [...new Set([...ALL_SKILLS, ...ALL_ROLES])];

export default function ClientPostProjectModal({ open, onClose, user }) {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    project_type: 'commercial',
    budget_type: 'Fixed',
    budget_min: '',
    budget_max: '',
    location: '',
    duration: '',
    timeline_start: '',
    timeline_end: '',
    requirements: '',
    skills_needed: []
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setProjectForm({
        title: '',
        description: '',
        project_type: 'commercial',
        budget_type: 'Fixed',
        budget_min: '',
        budget_max: '',
        location: '',
        duration: '',
        timeline_start: '',
        timeline_end: '',
        requirements: '',
        skills_needed: []
      });
      setSelectedSkills([]);
      setImagePreview(null);
      setSkillSearch('');
      setLocationSearch('');
    }
  }, [open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    } catch (err) {
      console.error('Error uploading image:', err);
      toastError('Upload Failed', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Filter skills based on search
  const filteredSkills = ALL_OPTIONS.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  ).slice(0, 20);

  // OpenStreetMap location search
  const searchLocation = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setLocationSuggestions(data.map(item => ({
        display: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village || '',
        country: item.address?.country || '',
        lat: item.lat,
        lon: item.lon
      })));
    } catch (err) {
      console.error('Error searching location:', err);
    } finally {
      setSearchingLocation(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (locationSearch) {
        searchLocation(locationSearch);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [locationSearch]);

  const selectLocation = (location) => {
    setProjectForm({ ...projectForm, location: location.display });
    setLocationSearch(location.display);
    setShowLocationSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const budget_min = parseFloat(projectForm.budget_min) || 0;
      const budget_max = parseFloat(projectForm.budget_max) || 0;
      
      const budget_range =
        budget_min <= 0 ? 'not_disclosed' :
        budget_min < 10000 ? 'under_10k' :
        budget_min < 25000 ? '10k_25k' :
        budget_min < 50000 ? '25k_50k' :
        budget_min < 100000 ? '50k_100k' :
        budget_min < 250000 ? '100k_250k' : '250k_plus';

      await Project.create({
        project_owner_email: user.email,
        project_owner_name: user.full_name,
        title: projectForm.title,
        description: projectForm.description,
        project_type: projectForm.project_type,
        location_city: projectForm.location,
        timeline_start: projectForm.timeline_start || undefined,
        timeline_deadline: projectForm.timeline_end || undefined,
        budget_range,
        budget_amount: budget_min,
        budget_min,
        budget_max,
        budget_type: projectForm.budget_type,
        payment_type: projectForm.budget_type === 'Hourly' ? 'per hour' : projectForm.budget_type === 'Daily' ? 'per day' : 'fixed price',
        duration: projectForm.duration,
        requirements: projectForm.requirements,
        departments_needed: selectedSkills,
        image_url: imagePreview,
        status: 'submitted'
      });

      success('Project Posted', 'Your project has been submitted successfully');
      onClose();
      // Refresh the page to show new project
      window.location.reload();
    } catch (err) {
      console.error('Error posting project:', err);
      toastError('Posting Failed', 'Failed to post project');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Post a New Project</h2>
            <p className="text-gray-300 text-sm">Share your project details to connect with talented creators</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Project Image
            </label>
            <div className="relative">
              {imagePreview ? (
                <div className="relative h-40 rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Project preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload project image</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="absolute inset-0 cursor-pointer" />
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Project Title</label>
              <Input
                type="text"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                placeholder="Enter project title"
                required
                className="h-11"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Project Type
              </label>
              <select
                value={projectForm.project_type}
                onChange={(e) => setProjectForm({ ...projectForm, project_type: e.target.value })}
                className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {PROJECT_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    value={locationSearch || projectForm.location}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setProjectForm({ ...projectForm, location: e.target.value });
                      setShowLocationSuggestions(true);
                    }}
                    placeholder="Search location..."
                    onFocus={() => setShowLocationSuggestions(true)}
                    className="h-11 pl-10"
                  />
                  {searchingLocation && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                    {locationSuggestions.map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectLocation(loc)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm"
                      >
                        <div className="font-medium text-gray-900">{loc.city || loc.display.split(',')[0]}</div>
                        <div className="text-gray-500 text-xs truncate">{loc.display}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Project Description</label>
            <textarea
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="Describe your project in detail..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Budget & Duration */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget & Duration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                <select
                  value={projectForm.budget_type}
                  onChange={(e) => setProjectForm({ ...projectForm, budget_type: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {PAYMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget (€)</label>
                <Input
                  type="number"
                  value={projectForm.budget_min}
                  onChange={(e) => setProjectForm({ ...projectForm, budget_min: e.target.value })}
                  placeholder="0"
                  className="h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget (€)</label>
                <Input
                  type="number"
                  value={projectForm.budget_max}
                  onChange={(e) => setProjectForm({ ...projectForm, budget_max: e.target.value })}
                  placeholder="Optional"
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Duration
                </label>
                <Input
                  type="text"
                  value={projectForm.duration}
                  onChange={(e) => setProjectForm({ ...projectForm, duration: e.target.value })}
                  placeholder="e.g., 2 weeks, 1 month"
                  className="h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={projectForm.timeline_start}
                  onChange={(e) => setProjectForm({ ...projectForm, timeline_start: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Skills Needed */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Skills Needed
            </label>
            
            {/* Search for skills */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                value={skillSearch}
                onChange={(e) => {
                  setSkillSearch(e.target.value);
                  setShowSkillSuggestions(true);
                }}
                onFocus={() => setShowSkillSuggestions(true)}
                placeholder="Search skills or roles..."
                className="h-10 pl-10"
              />
            </div>

            {/* Suggestions dropdown */}
            {showSkillSuggestions && skillSearch && filteredSkills.length > 0 && (
              <div className="relative mb-3">
                <div className="absolute top-0 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (!selectedSkills.includes(skill)) {
                          setSelectedSkills([...selectedSkills, skill]);
                        }
                        setSkillSearch('');
                        setShowSkillSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected skills */}
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="px-3 py-1.5 bg-black text-white rounded-full text-sm font-medium flex items-center gap-1 hover:bg-gray-800"
                >
                  {skill}
                  <X className="w-3 h-3" />
                </button>
              ))}
              {selectedSkills.length === 0 && (
                <p className="text-sm text-gray-500">Search and select skills above</p>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Additional Requirements</label>
            <textarea
              value={projectForm.requirements}
              onChange={(e) => setProjectForm({ ...projectForm, requirements: e.target.value })}
              placeholder="Specific requirements for the project..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              className="flex-1 bg-black text-white hover:bg-gray-800 h-11 font-medium"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Project'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
