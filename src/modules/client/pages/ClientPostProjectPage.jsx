import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, Image as ImageIcon, MapPin, Calendar, Clock, DollarSign, Briefcase, Users, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast';
import filmIndustrySkills from '@/data/filmIndustrySkills.json';
import CountrySelector from '@/components/CountrySelector';

const PROJECT_TYPES = [
  'commercial', 'short_film', 'film', 'music_video', 'documentary', 'other'
];

const PAYMENT_TYPES = ['Fixed', 'Hourly', 'Daily'];

// Flatten skills from JSON for display
const SKILLS_OPTIONS = Object.values(filmIndustrySkills).flat();

export default function ClientPostProject() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
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

  React.useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      // In production, upload to server here
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
        image_url: imagePreview, // In production, this would be the uploaded URL
        status: 'submitted'
      });

      success('Project Posted', 'Your project has been submitted successfully');
      navigate(createPageUrl('ClientDashboard'));
    } catch (err) {
      console.error('Error posting project:', err);
      toastError('Posting Failed', 'Failed to post project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('ClientDashboard'))}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">Post a New Project</h1>
            <p className="text-gray-300">Share your project details to connect with talented creators</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Project Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Project Image
              </label>
              <div className="relative">
                {imagePreview ? (
                  <div className="relative h-48 rounded-xl overflow-hidden">
                    <img src={imagePreview} alt="Project preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ArrowLeft className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Project Title</label>
                <Input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="Enter project title"
                  required
                  className="h-12 text-base"
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
                  className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
                <Input
                  type="text"
                  value={projectForm.location}
                  onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                  placeholder="Project location or 'Remote'"
                  className="h-12"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Project Description</label>
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Describe your project in detail..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Budget & Duration */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Budget & Duration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                  <select
                    value={projectForm.budget_type}
                    onChange={(e) => setProjectForm({ ...projectForm, budget_type: e.target.value })}
                    className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {PAYMENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget (€)</label>
                  <Input
                    type="number"
                    value={projectForm.budget_min}
                    onChange={(e) => setProjectForm({ ...projectForm, budget_min: e.target.value })}
                    placeholder="0"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget (€)</label>
                  <Input
                    type="number"
                    value={projectForm.budget_max}
                    onChange={(e) => setProjectForm({ ...projectForm, budget_max: e.target.value })}
                    placeholder="Optional"
                    className="h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration
                </label>
                <Input
                  type="text"
                  value={projectForm.duration}
                  onChange={(e) => setProjectForm({ ...projectForm, duration: e.target.value })}
                  placeholder="e.g., 2 weeks, 1 month, 3 months"
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={projectForm.timeline_start}
                    onChange={(e) => setProjectForm({ ...projectForm, timeline_start: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={projectForm.timeline_end}
                    onChange={(e) => setProjectForm({ ...projectForm, timeline_end: e.target.value })}
                    className="h-11"
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
              <div className="flex flex-wrap gap-2">
                {SKILLS_OPTIONS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSkills.includes(skill)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="flex-1 bg-black text-white hover:bg-gray-800 h-12 font-medium text-base"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Project'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(createPageUrl('ClientDashboard'))}
                className="h-12 px-8"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}