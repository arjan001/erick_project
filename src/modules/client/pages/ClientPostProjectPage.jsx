import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Project } from '@/lib/supabaseEntities'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Upload, Image as ImageIcon, MapPin, Calendar, DollarSign, ArrowLeft, Check, Film, Video, Tv, Music, FileText, FileText as FileTextIcon, Sparkles, Globe, Building, Trophy, Wand2, Box, Headphones, Code, Scissors, Video as VideoIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import filmIndustrySkills from '@/data/filmIndustrySkills.json'
import filmIndustryRoles from '@/data/filmIndustryRoles.json'
import { useAuth } from '@/lib/AuthContext'
import { base44 } from '@/api/base44Client'
import confetti from 'canvas-confetti'
import SkillsExperienceTagInput from '@/components/SkillsExperienceTagInput'

const PROJECT_TYPES = [
  { value: 'commercial', label: 'Commercial', icon: Tv, description: 'Brand campaigns and advertising' },
  { value: 'short_film', label: 'Short Film', icon: Film, description: 'Narrative short form content' },
  { value: 'film', label: 'Feature Film', icon: Video, description: 'Long-form cinema production' },
  { value: 'music_video', label: 'Music Video', icon: Music, description: 'Music and performance videos' },
  { value: 'documentary', label: 'Documentary', icon: FileText, description: 'Non-fiction storytelling' },
  { value: 'funding_coproduction', label: 'Funding / Co-Production', icon: Sparkles, description: 'Seeking investment or production partners' },
  { value: 'other', label: 'Other', icon: Sparkles, description: 'Other creative projects' },
]

const USAGE_OPTIONS = [
  { value: 'online', label: 'Online', icon: Globe, description: 'Social media, websites, digital' },
  { value: 'cinema', label: 'Cinema', icon: Film, description: 'Theatrical release' },
  { value: 'broadcast', label: 'Broadcast', icon: Tv, description: 'TV and streaming platforms' },
  { value: 'festival', label: 'Festival', icon: Trophy, description: 'Film festival submissions' },
  { value: 'internal', label: 'Internal', icon: Building, description: 'Corporate and internal use' },
]

const BUDGET_RANGES = [
  { value: 'under_10k', label: 'Under €10k', description: 'Small projects' },
  { value: '10k_25k', label: '€10k - €25k', description: 'Medium projects' },
  { value: '25k_50k', label: '€25k - €50k', description: 'Standard commercials' },
  { value: '50k_100k', label: '€50k - €100k', description: 'Premium productions' },
  { value: '100k_250k', label: '€100k - €250k', description: 'Large scale' },
  { value: '250k_plus', label: '€250k+', description: 'Major productions' },
  { value: 'not_disclosed', label: 'Prefer not to say', description: 'We can discuss later' },
]

const DEPARTMENTS = [
  { value: 'preproduction', label: 'Pre-production', icon: FileTextIcon, description: 'Scripting, planning, casting' },
  { value: 'production', label: 'Production', icon: VideoIcon, description: 'Filming, photography' },
  { value: 'post', label: 'Post Production', icon: Scissors, description: 'Editing, color, finishing' },
  { value: 'sound', label: 'Sound', icon: Headphones, description: 'Sound design and mixing' },
  { value: 'vfx', label: 'VFX', icon: Wand2, description: 'Visual effects' },
  { value: '3d', label: '3D', icon: Box, description: '3D animation and CGI' },
  { value: 'music', label: 'Music', icon: Music, description: 'Original composition' },
  { value: 'web_development', label: 'Web Development', icon: Code, description: 'Marketing websites' },
]

const FUNDING_STAGES = [
  { value: 'development', label: 'Development' },
  { value: 'pre_production', label: 'Pre-Production' },
  { value: 'production_ready', label: 'Production Ready' },
  { value: 'in_production', label: 'In Production' },
  { value: 'post_production', label: 'Post-Production' },
]

const SEEKING_OPTIONS = [
  { value: 'investment', label: 'Investment' },
  { value: 'co_production', label: 'Co-Production Partner' },
  { value: 'executive_producer', label: 'Executive Producer' },
  { value: 'strategic_partner', label: 'Strategic Partner' },
  { value: 'distribution', label: 'Distribution Partner' },
]

const getStepsForProjectType = (projectType) => {
  const baseSteps = [
    { id: 1, name: 'Project Type' },
  ]

  if (projectType === 'funding_coproduction') {
    return [
      ...baseSteps,
      { id: 2, name: 'Funding Details' },
      { id: 3, name: 'Budget' },
      { id: 4, name: 'Timeline' },
      { id: 5, name: 'Location' },
      { id: 6, name: 'Details' },
    ]
  }

  return [
    ...baseSteps,
    { id: 2, name: 'Usage' },
    { id: 3, name: 'Visual Direction' },
    { id: 4, name: 'Location' },
    { id: 5, name: 'Roles Needed' },
    { id: 6, name: 'Skills Required' },
    { id: 7, name: 'Team Type' },
    { id: 8, name: 'Timeline' },
    { id: 9, name: 'Budget' },
    { id: 10, name: 'Details' },
  ]
}

export default function ClientPostProject() {
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [STEPS, setSTEPS] = useState(getStepsForProjectType(''))
  const [visualClips, setVisualClips] = useState([])
  const [loadingClips, setLoadingClips] = useState(false)
  const [hoveredClipId, setHoveredClipId] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [searchingLocation, setSearchingLocation] = useState(false)

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
    roles_needed: [],
    skills_needed: [],
    team_type: '',
    timeline_start: '',
    timeline_end: '',
    budget_range: '',
    custom_budget: '',
    payment_type: '',
    hourly_rate: '',
    daily_rate: '',
    fixed_budget: '',
    requirements: '',
    funding_stage: '',
    seeking_partners: [],
    rights_collaboration_notes: '',
    open_to_backing: false,
    backing_types: [],
    backing_notes: ''
  })

  const [roleSearchQuery, setRoleSearchQuery] = useState('')
  const [skillSearchQuery, setSkillSearchQuery] = useState('')
  const [hasDraft, setHasDraft] = useState(false)

  // Flatten filmIndustrySkills into a single array for the skills input
  const allSkills = Object.values(filmIndustrySkills).flat()

  // Auto-save form to localStorage
  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem('projectDraft', JSON.stringify({
        ...projectForm,
        currentStep
      }))
    }
  }, [projectForm, currentStep, isEditing])

  // Load draft from localStorage on mount (if not editing)
  useEffect(() => {
    if (!isEditing) {
      const savedDraft = localStorage.getItem('projectDraft')
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft)
          // Only load draft if it has some content
          if (draft.title || draft.description || draft.project_type) {
            setProjectForm(draft)
            setCurrentStep(draft.currentStep || 1)
            setHasDraft(true)
          }
        } catch (e) {
          //
        }
      }
    }
  }, [isEditing])

  // Clear draft on successful submission
  const clearDraft = () => {
    localStorage.removeItem('projectDraft')
    setHasDraft(false)
  }

  // Manually clear draft (for user to start fresh)
  const handleClearDraft = () => {
    if (confirm('Are you sure you want to clear your draft? This cannot be undone.')) {
      clearDraft()
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
        roles_needed: [],
        skills_needed: [],
        team_type: '',
        timeline_start: '',
        timeline_end: '',
        budget_range: '',
        custom_budget: '',
        payment_type: '',
        hourly_rate: '',
        daily_rate: '',
        fixed_budget: '',
        requirements: '',
        funding_stage: '',
        seeking_partners: [],
        rights_collaboration_notes: '',
        open_to_backing: false,
        backing_types: [],
        backing_notes: ''
      })
      setCurrentStep(1)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/SignIn')
      return
    }
  }, [isAuthenticated, navigate])

  // Handle editing project from navigation state
  useEffect(() => {
    if (location.state?.editingProject) {
      setEditingProject(location.state.editingProject)
    }
  }, [location.state])

  useEffect(() => {
    loadVisualClips()
  }, [])

  // Reset form when editing project changes
  useEffect(() => {
    if (editingProject) {
      setIsEditing(true)
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
        roles_needed: editingProject.roles_needed || [],
        skills_needed: editingProject.skills_needed || [],
        team_type: editingProject.team_type || '',
        timeline_start: editingProject.timeline_start || '',
        timeline_end: editingProject.timeline_deadline || '',
        budget_range: editingProject.budget_range || '',
        custom_budget: editingProject.custom_budget || '',
        requirements: editingProject.notes || '',
        funding_stage: editingProject.funding_stage || '',
        seeking_partners: editingProject.seeking_partners || [],
        rights_collaboration_notes: editingProject.rights_collaboration_notes || '',
        open_to_backing: editingProject.open_to_backing || false,
        backing_types: editingProject.backing_types || [],
        backing_notes: editingProject.backing_notes || ''
      })
      setSTEPS(getStepsForProjectType(editingProject.project_type || ''))
      setImagePreview(editingProject.image_url || null)
    } else {
      setIsEditing(false)
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
        roles_needed: [],
        skills_needed: [],
        team_type: '',
        timeline_start: '',
        timeline_end: '',
        budget_range: '',
        custom_budget: '',
        requirements: '',
        funding_stage: '',
        seeking_partners: [],
        rights_collaboration_notes: '',
        open_to_backing: false,
        backing_types: [],
        backing_notes: ''
      })
      setSTEPS(getStepsForProjectType(''))
      setImagePreview(null)
    }
  }, [editingProject])

  const loadVisualClips = async () => {
    setLoadingClips(true)
    try {
      const result = await base44.entities.PortfolioClip.filter({
        approved_for_visual_direction: true,
        status: 'approved'
      })
      setVisualClips(result || [])
    } catch (error) {
      //
    } finally {
      setLoadingClips(false)
    }
  }

  const toggleVisualClip = (clipId) => {
    const current = projectForm.visual_direction_clips || []
    if (current.includes(clipId)) {
      updateForm('visual_direction_clips', current.filter(id => id !== clipId))
    } else if (current.length < 3) {
      updateForm('visual_direction_clips', [...current, clipId])
    }
  }

  const toggleRole = (role) => {
    const current = projectForm.roles_needed || []
    if (current.includes(role)) {
      updateForm('roles_needed', current.filter(r => r !== role))
    } else {
      updateForm('roles_needed', [...current, role])
    }
  }

  const toggleSkill = (skill) => {
    const current = projectForm.skills_needed || []
    if (current.includes(skill)) {
      updateForm('skills_needed', current.filter(s => s !== skill))
    } else {
      updateForm('skills_needed', [...current, skill])
    }
  }

  const fetchLocationSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([])
      return
    }
    setSearchingLocation(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      const countries = [...new Set(data.map(item => item.address?.country).filter(Boolean))]
      setLocationSuggestions(countries)
    } catch (err) {
      //
    } finally {
      setSearchingLocation(false)
    }
  }

  const fetchCitySuggestions = async (query) => {
    if (!query || query.length < 2 || !projectForm.location_country) {
      setCitySuggestions([])
      return
    }
    setSearchingLocation(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&country=${encodeURIComponent(projectForm.location_country)}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      const cities = [...new Set(data.map(item => item.address?.city || item.address?.town || item.address?.village).filter(Boolean))]
      setCitySuggestions(cities)
    } catch (err) {
      //
    } finally {
      setSearchingLocation(false)
    }
  }

  const updateForm = (field, value) => {
    setProjectForm(prev => ({ ...prev, [field]: value }))
    if (field === 'project_type') {
      setSTEPS(getStepsForProjectType(value))
    }
  }

  const toggleUsage = (value) => {
    const current = projectForm.usage || []
    if (current.includes(value)) {
      updateForm('usage', current.filter(u => u !== value))
    } else {
      updateForm('usage', [...current, value])
    }
  }

  const toggleDepartment = (value) => {
    const current = projectForm.departments_needed || []
    if (current.includes(value)) {
      updateForm('departments_needed', current.filter(d => d !== value))
    } else {
      updateForm('departments_needed', [...current, value])
    }
  }

  const toggleSeekingPartner = (value) => {
    const current = projectForm.seeking_partners || []
    if (current.includes(value)) {
      updateForm('seeking_partners', current.filter(v => v !== value))
    } else {
      updateForm('seeking_partners', [...current, value])
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
    } catch (err) {
      //
      toastError('Upload Failed', 'Failed to upload image')
    }
  }

  const canProceed = () => {
    const currentStepName = STEPS[currentStep - 1]?.name
    
    switch (currentStepName) {
      case 'Project Type':
        return projectForm.project_type !== ''
      case 'Funding Details':
        return projectForm.funding_stage !== '' && (projectForm.seeking_partners || []).length > 0
      case 'Usage':
        return (projectForm.usage || []).length > 0
      case 'Visual Direction':
        return true
      case 'Location':
        return projectForm.location_country !== ''
      case 'Roles Needed':
        return (projectForm.roles_needed || []).length > 0
      case 'Skills Required':
        return (projectForm.skills_needed || []).length > 0
      case 'Team Type':
        return projectForm.team_type !== ''
      case 'Timeline':
        return projectForm.timeline_start !== ''
      case 'Budget':
        return projectForm.budget_range !== '' || projectForm.custom_budget !== '' || projectForm.payment_type !== ''
      case 'Details':
        return projectForm.title !== '' && projectForm.description !== ''
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!authUser) return

    setLoading(true)
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
        roles_needed: projectForm.roles_needed,
        skills_needed: projectForm.skills_needed,
        team_type: projectForm.team_type,
        timeline_start: projectForm.timeline_start || undefined,
        timeline_deadline: projectForm.timeline_end || undefined,
        budget_range: projectForm.budget_range,
        budget_custom: projectForm.custom_budget,
        payment_type: projectForm.payment_type,
        hourly_rate: projectForm.hourly_rate || undefined,
        daily_rate: projectForm.daily_rate || undefined,
        fixed_budget: projectForm.fixed_budget || undefined,
        notes: projectForm.requirements,
        funding_stage: projectForm.funding_stage,
        seeking_partners: projectForm.seeking_partners,
        rights_collaboration_notes: projectForm.rights_collaboration_notes,
        open_to_backing: projectForm.open_to_backing,
        backing_types: projectForm.backing_types,
        backing_notes: projectForm.backing_notes,
        image_url: imagePreview,
        status: 'submitted'
      }

      // Get client_id from clients table
      let clientId = null
      
      // Try to get existing client profile
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle()

      if (!clientError && clientData) {
        clientId = clientData.id
      } else {
        // Try project_owners table as fallback
        const { data: ownerData, error: ownerError } = await supabase
          .from('project_owners')
          .select('id')
          .eq('user_id', authUser.id)
          .maybeSingle()

        if (!ownerError && ownerData) {
          clientId = ownerData.id
        } else {
          // Create client profile if it doesn't exist
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({
              user_id: authUser.id,
              email: authUser.email,
              company_name: authUser.full_name || 'Individual'
            })
            .select('id')
            .single()

          if (createError) {
            //
            throw new Error('Could not create client profile. Please contact support.')
          }

          clientId = newClient.id
        }
      }

      projectData.client_id = clientId

      if (isEditing && editingProject) {
        await Project.update(editingProject.id, projectData)
        success('Project Updated', 'Your project has been updated successfully')
      } else {
        await Project.create(projectData)
        success('Project Posted', 'Your project has been submitted successfully')
        
        // Clear draft after successful submission
        clearDraft()
        
        // Trigger confetti celebration
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#000000', '#78716c', '#d97706']
        })
      }

      navigate('/ClientDashboard')
    } catch (err) {
      //
      toastError(isEditing ? 'Update Failed' : 'Posting Failed', err.message || 'Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <Button
          variant="ghost"
          onClick={() => navigate('/ClientDashboard')}
          className="mb-8 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{isEditing ? 'Edit Your Project' : 'Post a New Project'}</h1>
              <p className="text-gray-500 text-base">{isEditing ? 'Update your project details' : 'Share your project details to connect with talented creators'}</p>
            </div>
            {hasDraft && !isEditing && (
              <button
                onClick={handleClearDraft}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Draft
              </button>
            )}
          </div>
          {hasDraft && !isEditing && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Draft restored:</span> Your previous progress has been automatically saved. You can continue where you left off or clear the draft to start fresh.
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-12 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max mb-6">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step.id < currentStep
                        ? 'bg-gray-900 text-white'
                        : step.id === currentStep
                        ? 'bg-gray-900 text-white ring-4 ring-gray-900/10'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className="hidden sm:block text-xs text-gray-600 mt-3 text-center max-w-[100px] font-medium">{step.name}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all min-w-[40px] ${
                    step.id < currentStep ? 'bg-gray-900' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center text-sm text-gray-500">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-12">
          {(() => {
            const currentStepName = STEPS[currentStep - 1]?.name

                switch (currentStepName) {
                  case 'Project Type':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900">What type of project?</h2>
                        <p className="text-gray-500 mb-6">Select the format that best describes your production</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {PROJECT_TYPES.map((type) => {
                            const Icon = type.icon
                            const isSelected = projectForm.project_type === type.value
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => updateForm('project_type', type.value)}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-gray-900 bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                              >
                                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-gray-900' : 'text-gray-500'}`} />
                                <h3 className="text-base font-semibold mb-1 text-gray-900">{type.label}</h3>
                                <p className="text-xs text-gray-500">{type.description}</p>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )

                  case 'Funding Details':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900">Funding & Partnership Details</h2>
                        <p className="text-gray-500 mb-10">Share information about what you're seeking</p>

                        <div className="space-y-8">
                          <div>
                            <label className="text-base font-semibold mb-3 block">Current Production Stage</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {FUNDING_STAGES.map((stage) => {
                                const isSelected = projectForm.funding_stage === stage.value
                                return (
                                  <button
                                    key={stage.value}
                                    type="button"
                                    onClick={() => updateForm('funding_stage', stage.value)}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                                      isSelected
                                        ? 'border-black bg-black/5'
                                        : 'border-gray-300 hover:border-gray-400 bg-white'
                                    }`}
                                  >
                                    <span className={`font-medium text-sm ${isSelected ? 'text-black' : 'text-gray-700'}`}>
                                      {stage.label}
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="text-base font-semibold mb-3 block">What are you seeking?</label>
                            <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
                            <div className="space-y-3">
                              {SEEKING_OPTIONS.map((option) => {
                                const isChecked = (projectForm.seeking_partners || []).includes(option.value)
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
                                )
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
                    )

                  case 'Usage':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Where will this be used?</h2>
                        <p className="text-gray-600 mb-8">Select all that apply</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {USAGE_OPTIONS.map((option) => {
                            const Icon = option.icon
                            const isSelected = (projectForm.usage || []).includes(option.value)
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleUsage(option.value)}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-gray-900 bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                              >
                                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-gray-900' : 'text-gray-500'}`} />
                                <h3 className="text-base font-semibold mb-1 text-gray-900">{option.label}</h3>
                                <p className="text-xs text-gray-500">{option.description}</p>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )

                  case 'Visual Direction':
                    const selectedCount = (projectForm.visual_direction_clips || []).length
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900">Visual Direction</h2>
                        <p className="text-gray-500 mb-2">Select 1-3 examples that match your vision</p>
                        <p className="text-sm text-gray-900 mb-8">{selectedCount}/3 selected</p>

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
                              const selected = (projectForm.visual_direction_clips || []).includes(clip.id)
                              const selectionIndex = (projectForm.visual_direction_clips || []).indexOf(clip.id)

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
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
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
                                    selected ? 'border-gray-900' : 'border-transparent group-hover:border-gray-600'
                                  }`} />
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )

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
                                updateForm('location_country', e.target.value)
                                fetchLocationSuggestions(e.target.value)
                                setShowLocationSuggestions(true)
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
                                      updateForm('location_country', country)
                                      setLocationSuggestions([])
                                      setShowLocationSuggestions(false)
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
                                updateForm('location_city', e.target.value)
                                fetchCitySuggestions(e.target.value)
                                setShowCitySuggestions(true)
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
                                      updateForm('location_city', city)
                                      setCitySuggestions([])
                                      setShowCitySuggestions(false)
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
                    )

                  case 'Roles Needed':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">What roles do you need?</h2>
                        <p className="text-gray-600 mb-8">Select the specific roles required for your project</p>

                        <div className="mb-6">
                          <input
                            type="text"
                            placeholder="Search roles..."
                            value={roleSearchQuery}
                            onChange={(e) => setRoleSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>

                        <div className="space-y-6 max-h-96 overflow-y-auto">
                          {Object.entries(filmIndustryRoles).map(([category, roles]) => {
                            if (category === 'equipment' || category === 'software' || category === 'delivery_types') return null
                            if (!Array.isArray(roles)) return null
                            
                            const filteredRoles = roleSearchQuery 
                              ? roles.filter(role => role.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                              : roles
                            
                            if (filteredRoles.length === 0) return null
                            
                            return (
                              <div key={category}>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 capitalize">{category.replace(/_/g, ' ')}</h3>
                                <div className="flex flex-wrap gap-2">
                                  {filteredRoles.map((role) => {
                                    const isSelected = (projectForm.roles_needed || []).includes(role)
                                    return (
                                      <button
                                        key={role}
                                        type="button"
                                        onClick={() => toggleRole(role)}
                                        className={`px-3 py-2 rounded-full text-sm border transition-all ${
                                          isSelected
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                        }`}
                                      >
                                        {role}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {(projectForm.roles_needed || []).length > 0 && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Selected roles:</span> {(projectForm.roles_needed || []).length}
                            </p>
                          </div>
                        )}
                      </div>
                    )

                  case 'Skills Required':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">What skills are required?</h2>
                        <p className="text-gray-600 mb-8">Select the specific skills needed for this project</p>

                        <div className="mb-6">
                          <input
                            type="text"
                            placeholder="Search skills..."
                            value={skillSearchQuery}
                            onChange={(e) => setSkillSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>

                        <div className="space-y-6 max-h-96 overflow-y-auto">
                          {Object.entries(filmIndustrySkills).map(([category, skills]) => {
                            if (!Array.isArray(skills)) return null
                            
                            const filteredSkills = skillSearchQuery 
                              ? skills.filter(skill => skill.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                              : skills
                            
                            if (filteredSkills.length === 0) return null
                            
                            return (
                              <div key={category}>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 capitalize">{category.replace(/_/g, ' ')}</h3>
                                <div className="flex flex-wrap gap-2">
                                  {filteredSkills.map((skill) => {
                                    const isSelected = (projectForm.skills_needed || []).includes(skill)
                                    return (
                                      <button
                                        key={skill}
                                        type="button"
                                        onClick={() => toggleSkill(skill)}
                                        className={`px-3 py-2 rounded-full text-sm border transition-all ${
                                          isSelected
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                        }`}
                                      >
                                        {skill}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {(projectForm.skills_needed || []).length > 0 && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Selected skills:</span> {(projectForm.skills_needed || []).length}
                            </p>
                          </div>
                        )}
                      </div>
                    )

                  case 'Team Type':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Team or Solo?</h2>
                        <p className="text-gray-600 mb-8">Do you need a full team or individual freelancers?</p>

                        <div className="space-y-3">
                          <button
                            type="button"
                            onClick={() => updateForm('team_type', 'team')}
                            className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                              projectForm.team_type === 'team'
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-semibold text-gray-900">Full Team / Studio</div>
                            <div className="text-xs text-gray-500 mt-1">A complete team or production company to handle the project</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateForm('team_type', 'solo')}
                            className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                              projectForm.team_type === 'solo'
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-semibold text-gray-900">Individual Freelancers</div>
                            <div className="text-xs text-gray-500 mt-1">Hire individual artists for specific roles</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateForm('team_type', 'flexible')}
                            className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                              projectForm.team_type === 'flexible'
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-semibold text-gray-900">Flexible</div>
                            <div className="text-xs text-gray-500 mt-1">Open to both teams and individual freelancers</div>
                          </button>
                        </div>
                      </div>
                    )

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
                    )

                  case 'Budget':
                    return (
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Budget & Payment</h2>
                        <p className="text-gray-600 mb-2">Set your budget and payment structure</p>
                        <p className="text-sm text-gray-500 mb-8">Optional - you can discuss exact numbers later</p>

                        {/* Payment Type Selection */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-900 mb-3">Payment Type</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { value: 'hourly', label: 'Hourly', description: 'Pay per hour' },
                              { value: 'daily', label: 'Daily', description: 'Pay per day' },
                              { value: 'fixed', label: 'Fixed Price', description: 'One-time payment' },
                              { value: 'negotiable', label: 'Negotiable', description: 'Discuss later' }
                            ].map((type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => {
                                  updateForm('payment_type', type.value)
                                  if (type.value !== 'fixed') {
                                    updateForm('fixed_budget', '')
                                  }
                                  if (type.value !== 'hourly') {
                                    updateForm('hourly_rate', '')
                                  }
                                  if (type.value !== 'daily') {
                                    updateForm('daily_rate', '')
                                  }
                                }}
                                className={`p-3 border-2 rounded-lg text-center transition-all ${
                                  projectForm.payment_type === type.value
                                    ? 'border-gray-900 bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                              >
                                <div className="font-semibold text-sm text-gray-900">{type.label}</div>
                                <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Payment Amount Fields */}
                        {projectForm.payment_type === 'hourly' && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Hourly Rate</label>
                            <div className="flex items-center gap-3">
                              <DollarSign className="w-5 h-5 text-gray-500" />
                              <Input
                                type="number"
                                placeholder="Enter hourly rate"
                                value={projectForm.hourly_rate}
                                onChange={(e) => updateForm('hourly_rate', e.target.value)}
                                className="flex-1"
                              />
                              <span className="text-sm text-gray-500">/ hour</span>
                            </div>
                          </div>
                        )}

                        {projectForm.payment_type === 'daily' && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Daily Rate</label>
                            <div className="flex items-center gap-3">
                              <DollarSign className="w-5 h-5 text-gray-500" />
                              <Input
                                type="number"
                                placeholder="Enter daily rate"
                                value={projectForm.daily_rate}
                                onChange={(e) => updateForm('daily_rate', e.target.value)}
                                className="flex-1"
                              />
                              <span className="text-sm text-gray-500">/ day</span>
                            </div>
                          </div>
                        )}

                        {projectForm.payment_type === 'fixed' && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Fixed Budget</label>
                            <div className="flex items-center gap-3">
                              <DollarSign className="w-5 h-5 text-gray-500" />
                              <Input
                                type="number"
                                placeholder="Enter fixed budget"
                                value={projectForm.fixed_budget}
                                onChange={(e) => updateForm('fixed_budget', e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        )}

                        {/* Budget Range Presets */}
                        <div className="border-t border-gray-200 pt-6">
                          <label className="block text-sm font-semibold text-gray-900 mb-3">Or select budget range</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {BUDGET_RANGES.map((range) => {
                              const isSelected = projectForm.budget_range === range.value
                              return (
                                <button
                                  key={range.value}
                                  type="button"
                                  onClick={() => {
                                    updateForm('budget_range', range.value)
                                    updateForm('custom_budget', '')
                                  }}
                                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                                    isSelected
                                      ? 'border-gray-900 bg-gray-50'
                                      : 'border-gray-200 hover:border-gray-300 bg-white'
                                  }`}
                                >
                                  <DollarSign className={`w-6 h-6 mb-2 ${isSelected ? 'text-gray-900' : 'text-gray-500'}`} />
                                  <h3 className="text-base font-semibold mb-1 text-gray-900">{range.label}</h3>
                                  <p className="text-xs text-gray-500">{range.description}</p>
                                </button>
                              )
                            })}
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Or specify custom budget</label>
                            <div className="flex items-center gap-3">
                              <DollarSign className="w-5 h-5 text-gray-500" />
                              <Input
                                type="number"
                                placeholder="Enter custom amount"
                                value={projectForm.custom_budget}
                                onChange={(e) => {
                                  updateForm('custom_budget', e.target.value)
                                  updateForm('budget_range', 'custom')
                                }}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )

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
                    )

                  default:
                    return null
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
              className="bg-gray-900 hover:bg-gray-800 text-white order-1 sm:order-2"
            >
              Next
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 text-white order-1 sm:order-2"
            >
              {loading ? 'Submitting...' : 'Post Project'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}