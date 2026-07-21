import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Project } from '@/lib/supabaseEntities';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Image as ImageIcon, MapPin, Calendar, DollarSign, ArrowLeft, Check, Film, Video, Tv, Music, FileText, FileText as FileTextIcon, Sparkles, Globe, Building, Trophy, Wand2, Box, Headphones, Code, Scissors, Video as VideoIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import filmIndustrySkills from '@/data/filmIndustrySkills.json';
import filmIndustryRoles from '@/data/filmIndustryRoles.json';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';

const PROJECT_TYPES = [
  { value: 'commercial', label: 'Commercial', icon: Tv, description: 'Brand campaigns and advertising' },
  { value: 'short_film', label: 'Short Film', icon: Film, description: 'Narrative short form content' },
  { value: 'film', label: 'Feature Film', icon: Video, description: 'Long-form cinema production' },
  { value: 'music_video', label: 'Music Video', icon: Music, description: 'Music and performance videos' },
  { value: 'documentary', label: 'Documentary', icon: FileText, description: 'Non-fiction storytelling' },
  { value: 'funding_coproduction', label: 'Funding / Co-Production', icon: Sparkles, description: 'Seeking investment or production partners' },
  { value: 'other', label: 'Other', icon: Sparkles, description: 'Other creative projects' },
];

const USAGE_OPTIONS = [
  { value: 'online', label: 'Online', icon: Globe, description: 'Social media, websites, digital' },
  { value: 'cinema', label: 'Cinema', icon: Film, description: 'Theatrical release' },
  { value: 'broadcast', label: 'Broadcast', icon: Tv, description: 'TV and streaming platforms' },
  { value: 'festival', label: 'Festival', icon: Trophy, description: 'Film festival submissions' },
  { value: 'internal', label: 'Internal', icon: Building, description: 'Corporate and internal use' },
];

const BUDGET_RANGES = [
  { value: 'under_10k', label: 'Under €10k', description: 'Small projects' },
  { value: '10k_25k', label: '€10k - €25k', description: 'Medium projects' },
  { value: '25k_50k', label: '€25k - €50k', description: 'Standard commercials' },
  { value: '50k_100k', label: '€50k - €100k', description: 'Premium productions' },
  { value: '100k_250k', label: '€100k - €250k', description: 'Large scale' },
  { value: '250k_plus', label: '€250k+', description: 'Major productions' },
  { value: 'not_disclosed', label: 'Prefer not to say', description: 'We can discuss later' },
];

const DEPARTMENTS = [
  { value: 'preproduction', label: 'Pre-production', icon: FileTextIcon, description: 'Scripting, planning, casting' },
  { value: 'production', label: 'Production', icon: VideoIcon, description: 'Filming, photography' },
  { value: 'post', label: 'Post Production', icon: Scissors, description: 'Editing, color, finishing' },
  { value: 'sound', label: 'Sound', icon: Headphones, description: 'Sound design and mixing' },
  { value: 'vfx', label: 'VFX', icon: Wand2, description: 'Visual effects' },
  { value: '3d', label: '3D', icon: Box, description: '3D animation and CGI' },
  { value: 'music', label: 'Music', icon: Music, description: 'Original composition' },
  { value: 'web_development', label: 'Web Development', icon: Code, description: 'Marketing websites' },
];

const FUNDING_STAGES = [
  { value: 'development', label: 'Development' },
  { value: 'pre_production', label: 'Pre-Production' },
  { value: 'production_ready', label: 'Production Ready' },
  { value: 'in_production', label: 'In Production' },
  { value: 'post_production', label: 'Post-Production' },
];

const SEEKING_OPTIONS = [
  { value: 'investment', label: 'Investment' },
  { value: 'co_production', label: 'Co-Production Partner' },
  { value: 'executive_producer', label: 'Executive Producer' },
  { value: 'strategic_partner', label: 'Strategic Partner' },
  { value: 'distribution', label: 'Distribution Partner' },
];

const getStepsForProjectType = (projectType) => {
  const baseSteps = [
    { id: 1, name: 'Project Type' },
  ];

  if (projectType === 'funding_coproduction') {
    return [
      ...baseSteps,
      { id: 2, name: 'Funding Details' },
      { id: 3, name: 'Budget' },
      { id: 4, name: 'Timeline' },
      { id: 5, name: 'Location' },
      { id: 6, name: 'Details' },
    ];
  }

  return [
    ...baseSteps,
    { id: 2, name: 'Usage' },
    { id: 3, name: 'Visual Direction' },
    { id: 4, name: 'Location' },
    { id: 5, name: 'Departments' },
    { id: 6, name: 'Timeline' },
    { id: 7, name: 'Budget' },
    { id: 8, name: 'Details' },
  ];
};

export default function ClientPostProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: toastError } = useToast();
  const { user: authUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [STEPS, setSTEPS] = useState(getStepsForProjectType(''));
  const [visualClips, setVisualClips] = useState([]);
  const [loadingClips, setLoadingClips] = useState(false);
  const [hoveredClipId, setHoveredClipId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    project_type: '',
    usage: [],
    visual_direction_clips: [],
    location_country: '',
    location_city: '',
    is_remote: false,
    departments_needed: [],
    timeline_start: '',
    timeline_end: '',
    budget_range: '',
    requirements: '',
    skills_needed: [],
    funding_stage: '',
    seeking_partners: [],
    rights_collaboration_notes: '',
    open_to_backing: false,
    backing_types: [],
    backing_notes: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/SignIn');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Handle editing project from navigation state
  useEffect(() => {
    if (location.state?.editingProject) {
      setEditingProject(location.state.editingProject);
    }
  }, [location.state]);

  useEffect(() => {
    loadVisualClips();
  }, []);

  // Reset form when editing project changes
  useEffect(() => {
    if (editingProject) {
      setIsEditing(true);
      setProjectForm({
        title: editingProject.title || '',
        description: editingProject.description || '',
        project_type: editingProject.project_type || '',
        usage: editingProject.usage || [],
        visual_direction_clips: editingProject.visual_direction_clips || [],
        location_country: editingProject.location_country || '',
        location_city: editingProject.location_city || '',
        is_remote: editingProject.is_remote || false,
        departments_needed: editingProject.departments_needed || [],
        timeline_start: editingProject.timeline_start || '',
        timeline_end: editingProject.timeline_deadline || '',
        budget_range: editingProject.budget_range || '',
        requirements: editingProject.notes || '',
        funding_stage: editingProject.funding_stage || '',
        seeking_partners: editingProject.seeking_partners || [],
        rights_collaboration_notes: editingProject.rights_collaboration_notes || '',
        open_to_backing: editingProject.open_to_backing || false,
        backing_types: editingProject.backing_types || [],
        backing_notes: editingProject.backing_notes || ''
      });
      setSTEPS(getStepsForProjectType(editingProject.project_type || ''));
      setImagePreview(editingProject.image_url || null);
    } else {
      setIsEditing(false);
      setProjectForm({
        title: '',
        description: '',
        project_type: '',
        usage: [],
        visual_direction_clips: [],
        location_country: '',
        location_city: '',
        is_remote: false,
        departments_needed: [],
        timeline_start: '',
        timeline_end: '',
        budget_range: '',
        requirements: '',
        funding_stage: '',
        seeking_partners: [],
        rights_collaboration_notes: '',
        open_to_backing: false,
        backing_types: [],
        backing_notes: ''
      });
      setSTEPS(getStepsForProjectType(''));
      setImagePreview(null);
    }
  }, [editingProject]);

  const loadVisualClips = async () => {
    setLoadingClips(true);
    try {
      const result = await base44.entities.PortfolioClip.filter({
        approved_for_visual_direction: true,
        status: 'approved'
      });
      setVisualClips(result || []);
    } catch (error) {
      console.error('Error loading clips:', error);
    } finally {
      setLoadingClips(false);
    }
  };

  const toggleVisualClip = (clipId) => {
    const current = projectForm.visual_direction_clips || [];
    if (current.includes(clipId)) {
      updateForm('visual_direction_clips', current.filter(id => id !== clipId));
    } else if (current.length < 3) {
      updateForm('visual_direction_clips', [...current, clipId]);
    }
  };

  const fetchLocationSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    setSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      const countries = [...new Set(data.map(item => item.address?.country).filter(Boolean))];
      setLocationSuggestions(countries);
    } catch (err) {
      console.error('Error fetching location suggestions:', err);
    } finally {
      setSearchingLocation(false);
    }
  };

  const fetchCitySuggestions = async (query) => {
    if (!query || query.length < 2 || !projectForm.location_country) {
      setCitySuggestions([]);
      return;
    }
    setSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&country=${encodeURIComponent(projectForm.location_country)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      const cities = [...new Set(data.map(item => item.address?.city || item.address?.town || item.address?.village).filter(Boolean))];
      setCitySuggestions(cities);
    } catch (err) {
      console.error('Error fetching city suggestions:', err);
    } finally {
      setSearchingLocation(false);
    }
  };

  const updateForm = (field, value) => {
    setProjectForm(prev => ({ ...prev, [field]: value }));
    if (field === 'project_type') {
      setSTEPS(getStepsForProjectType(value));
    }
  };

  const toggleUsage = (value) => {
    const current = projectForm.usage || [];
    if (current.includes(value)) {
      updateForm('usage', current.filter(u => u !== value));
    } else {
      updateForm('usage', [...current, value]);
    }
  };

  const toggleDepartment = (value) => {
    const current = projectForm.departments_needed || [];
    if (current.includes(value)) {
      updateForm('departments_needed', current.filter(d => d !== value));
    } else {
      updateForm('departments_needed', [...current, value]);
    }
  };

  const toggleSeekingPartner = (value) => {
    const current = projectForm.seeking_partners || [];
    if (current.includes(value)) {
      updateForm('seeking_partners', current.filter(v => v !== value));
    } else {
      updateForm('seeking_partners', [...current, value]);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    } catch (err) {
      console.error('Error uploading image:', err);
      toastError('Upload Failed', 'Failed to upload image');
    }
  };

  const canProceed = () => {
    const currentStepName = STEPS[currentStep - 1]?.name;
    
    switch (currentStepName) {
      case 'Project Type':
        return projectForm.project_type !== '';
      case 'Funding Details':
        return projectForm.funding_stage !== '' && (projectForm.seeking_partners || []).length > 0;
      case 'Usage':
        return (projectForm.usage || []).length > 0;
      case 'Visual Direction':
        return true;
      case 'Location':
        return projectForm.location_country !== '';
      case 'Departments':
        return (projectForm.departments_needed || []).length > 0;
      case 'Timeline':
        return projectForm.timeline_start !== '';
      case 'Budget':
        return projectForm.budget_range !== '';
      case 'Details':
        return projectForm.title !== '' && projectForm.description !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser) return;

    setLoading(true);
    try {
      const projectData = {
        project_owner_email: authUser.email,
        project_owner_name: authUser.full_name,
        project_owner_company: projectForm.title,
        title: projectForm.title,
        description: projectForm.description,
        project_type: projectForm.project_type,
        usage: projectForm.usage,
        visual_direction_clips: projectForm.visual_direction_clips,
        location_country: projectForm.location_country,
        location_city: projectForm.location_city,
        is_remote: projectForm.is_remote,
        departments_needed: projectForm.departments_needed,
        timeline_start: projectForm.timeline_start || undefined,
        timeline_deadline: projectForm.timeline_end || undefined,
        budget_range: projectForm.budget_range,
        notes: projectForm.requirements,
        funding_stage: projectForm.funding_stage,
        seeking_partners: projectForm.seeking_partners,
        rights_collaboration_notes: projectForm.rights_collaboration_notes,
        open_to_backing: projectForm.open_to_backing,
        backing_types: projectForm.backing_types,
        backing_notes: projectForm.backing_notes,
        image_url: imagePreview,
        status: 'submitted'
      };

      // Get client_id from clients table
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', authUser.id)
        .single();

      if (clientError || !clientData) {
        // Fallback: try project_owners table
        const { data: ownerData, error: ownerError } = await supabase
          .from('project_owners')
          .select('id')
          .eq('user_id', authUser.id)
          .single();

        if (ownerError || !ownerData) {
          throw new Error('Client profile not found. Please complete your profile first.');
        }

        projectData.client_id = ownerData.id;
      } else {
        projectData.client_id = clientData.id;
      }

      if (isEditing && editingProject) {
        await Project.update(editingProject.id, projectData);
        success('Project Updated', 'Your project has been updated successfully');
      } else {
        await Project.create(projectData);
        success('Project Posted', 'Your project has been submitted successfully');
        
        // Trigger confetti celebration
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#000000', '#78716c', '#d97706']
        });
      }

      navigate('/ClientDashboard');
    } catch (err) {
      console.error('Error saving project:', err);
      toastError(isEditing ? 'Update Failed' : 'Posting Failed', err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/ClientDashboard')}
          className="mb-4 sm:mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 sm:px-8 py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{isEditing ? 'Edit Your Project' : 'Post a New Project'}</h1>
            <p className="text-gray-300 text-sm sm:text-base">{isEditing ? 'Update your project details' : 'Share your project details to connect with talented creators'}</p>
          </div>

          <div className="p-4 sm:p-6">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {STEPS.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          step.id < currentStep
                            ? 'bg-amber-600 text-white'
                            : step.id === currentStep
                            ? 'bg-amber-600 text-white ring-4 ring-amber-600/20'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
                      </div>
                      <span className="hidden sm:block text-xs text-gray-600 mt-2 text-center max-w-[80px]">{step.name}</span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                        step.id < currentStep ? 'bg-amber-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-center text-sm text-gray-600">
                Step {currentStep} of {STEPS.length}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 mb-8 border border-gray-200 min-h-[400px]">
              {(() => {
                const currentStepName = STEPS[currentStep - 1]?.name;

                switch (currentStepName) {
                  case 'Project Type':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">What type of project?</h2>
                        <p className="text-gray-600 mb-8">Select the format that best describes your production</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {PROJECT_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isSelected = projectForm.project_type === type.value;
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => updateForm('project_type', type.value)}
                                className={`p-6 rounded-xl border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-amber-600 bg-amber-600/10'
                                    : 'border-gray-300 hover:border-gray-400 bg-white'
                                }`}
                              >
                                <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                                <h3 className="text-lg font-semibold mb-1 text-black">{type.label}</h3>
                                <p className="text-sm text-gray-600">{type.description}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );

                  case 'Funding Details':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Funding & Partnership Details</h2>
                        <p className="text-gray-600 mb-8">Share information about what you're seeking</p>

                        <div className="space-y-8">
                          <div>
                            <label className="text-base font-semibold mb-3 block">Current Production Stage</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {FUNDING_STAGES.map((stage) => {
                                const isSelected = projectForm.funding_stage === stage.value;
                                return (
                                  <button
                                    key={stage.value}
                                    type="button"
                                    onClick={() => updateForm('funding_stage', stage.value)}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                                      isSelected
                                        ? 'border-black bg-black/5'
                                        : 'border-gray-300 hover:border-gray-400 bg-white'
                                    }`}
                                  >
                                    <span className={`font-medium ${isSelected ? 'text-black' : 'text-gray-700'}`}>
                                      {stage.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="text-base font-semibold mb-3 block">What are you seeking?</label>
                            <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
                            <div className="space-y-3">
                              {SEEKING_OPTIONS.map((option) => {
                                const isChecked = (projectForm.seeking_partners || []).includes(option.value);
                                return (
                                  <label
                                    key={option.value}
                                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleSeekingPartner(option.value)}
                                      className="w-4 h-4"
                                    />
                                    <span className="font-medium text-gray-800">{option.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="text-base font-semibold mb-3 block">
                              Rights & Collaboration Structure <span className="text-gray-500 font-normal">(Optional)</span>
                            </label>
                            <p className="text-sm text-gray-600 mb-3">
                              Share any relevant details about rights, equity, collaboration terms, or partnership expectations
                            </p>
                            <textarea
                              value={projectForm.rights_collaboration_notes || ''}
                              onChange={(e) => updateForm('rights_collaboration_notes', e.target.value)}
                              placeholder="Example: Seeking 30% co-production investment in exchange for distribution rights in specific territories..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none min-h-[120px]"
                            />
                          </div>
                        </div>
                      </div>
                    );

                  case 'Usage':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Where will this be used?</h2>
                        <p className="text-gray-600 mb-8">Select all that apply</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {USAGE_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            const isSelected = (projectForm.usage || []).includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleUsage(option.value)}
                                className={`p-6 rounded-xl border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-amber-600 bg-amber-600/10'
                                    : 'border-gray-300 hover:border-gray-400 bg-white'
                                }`}
                              >
                                <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                                <h3 className="text-lg font-semibold mb-1 text-black">{option.label}</h3>
                                <p className="text-sm text-gray-600">{option.description}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );

                  case 'Visual Direction':
                    const selectedCount = (projectForm.visual_direction_clips || []).length;
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Visual Direction</h2>
                        <p className="text-gray-600 mb-2">Select 1-3 examples that match your vision</p>
                        <p className="text-sm text-amber-600 mb-8">{selectedCount}/3 selected</p>

                        {loadingClips ? (
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                              <div key={i} className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
                            ))}
                          </div>
                        ) : visualClips.length === 0 ? (
                          <div className="bg-gray-100 p-8 rounded-xl text-center">
                            <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No approved clips available yet. You can skip this step.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {visualClips.map((clip) => {
                              const selected = (projectForm.visual_direction_clips || []).includes(clip.id);
                              const selectionIndex = (projectForm.visual_direction_clips || []).indexOf(clip.id);

                              return (
                                <button
                                  key={clip.id}
                                  type="button"
                                  onClick={() => toggleVisualClip(clip.id)}
                                  disabled={!selected && selectedCount >= 3}
                                  className={`relative aspect-video rounded-lg overflow-hidden group ${
                                    !selected && selectedCount >= 3 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                  onMouseEnter={() => setHoveredClipId(clip.id)}
                                  onMouseLeave={() => setHoveredClipId(null)}
                                >
                                  <img
                                    src={clip.thumbnail_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400'}
                                    alt={clip.title || 'Visual reference'}
                                    className={`w-full h-full object-cover transition-all duration-300 ${
                                      hoveredClipId === clip.id ? 'scale-110' : 'scale-100'
                                    }`}
                                    loading="lazy"
                                  />

                                  <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent ${
                                    selected ? 'opacity-60' : 'opacity-40 group-hover:opacity-60'
                                  } transition-opacity`} />

                                  {selected && (
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">{selectionIndex + 1}</span>
                                    </div>
                                  )}

                                  <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <p className="text-xs text-white font-medium line-clamp-2">{clip.title || 'Reference clip'}</p>
                                  </div>

                                  {hoveredClipId === clip.id && !selected && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <div className="w-0 h-0 border-t-6 border-t-transparent border-l-10 border-l-white border-b-6 border-b-transparent ml-1"></div>
                                      </div>
                                    </div>
                                  )}

                                  <div className={`absolute inset-0 border-2 rounded-lg transition-all ${
                                    selected ? 'border-amber-600' : 'border-transparent group-hover:border-zinc-600'
                                  }`} />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );

                  case 'Location':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Where is production?</h2>
                        <p className="text-gray-600 mb-8">Help us find teams in your area</p>

                        <div className="space-y-6">
                          <div className="relative">
                            <label className="text-base mb-3 block">Country</label>
                            <Input
                              value={projectForm.location_country}
                              onChange={(e) => {
                                updateForm('location_country', e.target.value);
                                fetchLocationSuggestions(e.target.value);
                                setShowLocationSuggestions(true);
                              }}
                              onFocus={() => setShowLocationSuggestions(true)}
                              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                              placeholder="Search or select a country"
                              className="bg-white border-gray-300 text-black h-12"
                            />
                            {showLocationSuggestions && locationSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {locationSuggestions.map((country, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      updateForm('location_country', country);
                                      setLocationSuggestions([]);
                                      setShowLocationSuggestions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                  >
                                    {country}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="relative">
                            <label className="text-base mb-3 block">City</label>
                            <Input
                              value={projectForm.location_city}
                              onChange={(e) => {
                                updateForm('location_city', e.target.value);
                                fetchCitySuggestions(e.target.value);
                                setShowCitySuggestions(true);
                              }}
                              onFocus={() => setShowCitySuggestions(true)}
                              onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                              placeholder="Search or select a city"
                              disabled={!projectForm.location_country}
                              className="bg-white border-gray-300 text-black h-12"
                            />
                            {showCitySuggestions && citySuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {citySuggestions.map((city, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      updateForm('location_city', city);
                                      setCitySuggestions([]);
                                      setShowCitySuggestions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                  >
                                    {city}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg border border-gray-200">
                            <input
                              type="checkbox"
                              id="remote"
                              checked={projectForm.is_remote}
                              onChange={(e) => updateForm('is_remote', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <label htmlFor="remote" className="text-base cursor-pointer">
                              Remote production possible
                            </label>
                          </div>
                        </div>
                      </div>
                    );

                  case 'Departments':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">What services do you need?</h2>
                        <p className="text-gray-600 mb-8">Select all departments required</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {DEPARTMENTS.map((dept) => {
                            const Icon = dept.icon;
                            const isSelected = (projectForm.departments_needed || []).includes(dept.value);
                            return (
                              <button
                                key={dept.value}
                                type="button"
                                onClick={() => toggleDepartment(dept.value)}
                                className={`p-5 rounded-xl border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-amber-600 bg-amber-600/10'
                                    : 'border-gray-300 hover:border-gray-400 bg-white'
                                }`}
                              >
                                <Icon className={`w-7 h-7 mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                                <h3 className="text-base font-semibold mb-1 text-black">{dept.label}</h3>
                                <p className="text-sm text-gray-600">{dept.description}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );

                  case 'Timeline':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Timeline</h2>
                        <p className="text-gray-600 mb-8">When do you need this project?</p>

                        <div className="space-y-6">
                          <div>
                            <label className="text-base mb-3 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Expected Start Date
                            </label>
                            <Input
                              type="date"
                              value={projectForm.timeline_start}
                              onChange={(e) => updateForm('timeline_start', e.target.value)}
                              className="bg-white border-gray-300 text-black h-12"
                            />
                          </div>

                          <div>
                            <label className="text-base mb-3 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Delivery Deadline
                            </label>
                            <Input
                              type="date"
                              value={projectForm.timeline_end}
                              onChange={(e) => updateForm('timeline_end', e.target.value)}
                              className="bg-white border-gray-300 text-black h-12"
                            />
                          </div>

                          <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">
                              💡 We recommend booking teams at least 4-6 weeks in advance for best availability
                            </p>
                          </div>
                        </div>
                      </div>
                    );

                  case 'Budget':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Budget Range</h2>
                        <p className="text-gray-600 mb-2">This helps us match you with the right teams</p>
                        <p className="text-sm text-gray-500 mb-8">Optional - you can discuss exact numbers later</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {BUDGET_RANGES.map((range) => {
                            const isSelected = projectForm.budget_range === range.value;
                            return (
                              <button
                                key={range.value}
                                type="button"
                                onClick={() => updateForm('budget_range', range.value)}
                                className={`p-5 rounded-xl border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-amber-600 bg-amber-600/10'
                                    : 'border-gray-300 hover:border-gray-400 bg-white'
                                }`}
                              >
                                <DollarSign className={`w-7 h-7 mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                                <h3 className="text-base font-semibold mb-1 text-black">{range.label}</h3>
                                <p className="text-sm text-gray-600">{range.description}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );

                  case 'Details':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Project Details</h2>
                        <p className="text-gray-600 mb-8">Tell us more about your project</p>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              Project Image (Optional)
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

                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Project Title</label>
                            <Input
                              type="text"
                              value={projectForm.title}
                              onChange={(e) => updateForm('title', e.target.value)}
                              placeholder="Enter project title"
                              required
                              className="h-11"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Project Description</label>
                            <textarea
                              value={projectForm.description}
                              onChange={(e) => updateForm('description', e.target.value)}
                              placeholder="Describe your project in detail..."
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Additional Requirements</label>
                            <textarea
                              value={projectForm.requirements}
                              onChange={(e) => updateForm('requirements', e.target.value)}
                              placeholder="Any specific requirements or preferences..."
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    );

                  default:
                    return null;
                }
              })()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="border-gray-300 hover:bg-gray-50 order-2 sm:order-1"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-amber-600 hover:bg-amber-700 text-white order-1 sm:order-2"
                >
                  Next
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-amber-600 hover:bg-amber-700 text-white order-1 sm:order-2"
                >
                  {loading ? 'Submitting...' : 'Post Project'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}