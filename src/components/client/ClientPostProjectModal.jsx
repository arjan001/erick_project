import React, { useState, useEffect } from 'react'
import { Project } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Upload, Image as ImageIcon, MapPin, Calendar, Clock, DollarSign, Briefcase, Users, Search, Loader2, ArrowLeft, Check, Film, Video, Tv, Music, FileText, FileText as FileTextIcon, Sparkles, Globe, Building, Trophy, Wand2, Box, Headphones, Code, Scissors, Video as VideoIcon } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import filmIndustrySkills from '@/data/filmIndustrySkills.json'
import filmIndustryRoles from '@/data/filmIndustryRoles.json'

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
    { id: 5, name: 'Departments' },
    { id: 6, name: 'Timeline' },
    { id: 7, name: 'Budget' },
    { id: 8, name: 'Details' },
  ]
}

// Flatten skills from JSON and deduplicate
const ALL_SKILLS = [...new Set(Object.values(filmIndustrySkills).flat())]
// Flatten roles from JSON
const ALL_ROLES = Object.values(filmIndustryRoles).flat().filter(item => typeof item === 'string')
const ALL_OPTIONS = [...new Set([...ALL_SKILLS, ...ALL_ROLES])]

export default function ClientPostProjectModal({ open, onClose, user, editingProject = null }) {
  const { success, error: toastError } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
    budget_custom: '',
    requirements: '',
    skills_needed: [],
    funding_stage: '',
    seeking_partners: [],
    rights_collaboration_notes: '',
    open_to_backing: false,
    backing_types: [],
    backing_notes: ''
  })

  const [selectedSkills, setSelectedSkills] = useState([])
  const [skillSearch, setSkillSearch] = useState('')
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)

  const [locationSearch, setLocationSearch] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [searchingLocation, setSearchingLocation] = useState(false)

  // Reset form when modal opens or when editing project changes
  useEffect(() => {
    if (open) {
      setCurrentStep(1)
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
          timeline_start: editingProject.timeline_start || '',
          timeline_end: editingProject.timeline_deadline || '',
          budget_range: editingProject.budget_range || '',
          budget_custom: editingProject.budget_custom || '',
          requirements: editingProject.requirements || '',
          skills_needed: [],
          funding_stage: editingProject.funding_stage || '',
          seeking_partners: editingProject.seeking_partners || [],
          rights_collaboration_notes: editingProject.rights_collaboration_notes || '',
          open_to_backing: editingProject.open_to_backing || false,
          backing_types: editingProject.backing_types || [],
          backing_notes: editingProject.backing_notes || ''
        })
        setSelectedSkills(editingProject.departments_needed || [])
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
          timeline_start: '',
          timeline_end: '',
          budget_range: '',
          budget_custom: '',
          requirements: '',
          skills_needed: [],
          funding_stage: '',
          seeking_partners: [],
          rights_collaboration_notes: '',
          open_to_backing: false,
          backing_types: [],
          backing_notes: ''
        })
        setSelectedSkills([])
        setImagePreview(null)
      }
      setSkillSearch('')
      setLocationSearch('')
    }
  }, [open, editingProject])

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

  const STEPS = getStepsForProjectType(projectForm.project_type)

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
        return true; // Optional step
      case 'Location':
        return projectForm.location_country !== ''
      case 'Departments':
        return (projectForm.departments_needed || []).length > 0
      case 'Timeline':
        return projectForm.timeline_start !== ''
      case 'Budget':
        return projectForm.budget_range !== ''
      case 'Details':
        return projectForm.title !== '' && projectForm.description !== ''
      default:
        return false
    }
  }

  const updateForm = (field, value) => {
    setProjectForm(prev => ({ ...prev, [field]: value }))
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
    
    setUploadingImage(true)
    try {
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
    } catch (err) {
      
      toastError('Upload Failed', 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill))
    } else {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  // Filter skills based on search
  const filteredSkills = ALL_OPTIONS.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  ).slice(0, 20)

  // OpenStreetMap location search
  const searchLocation = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([])
      return
    }

    setSearchingLocation(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      )
      const data = await response.json()
      setLocationSuggestions(data.map(item => ({
        display: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village || '',
        country: item.address?.country || '',
        lat: item.lat,
        lon: item.lon
      })))
    } catch (err) {
      
    } finally {
      setSearchingLocation(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (locationSearch) {
        searchLocation(locationSearch)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [locationSearch])

  const selectLocation = (location) => {
    setProjectForm({ ...projectForm, location: location.display })
    setLocationSearch(location.display)
    setShowLocationSuggestions(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const projectData = {
        project_owner_email: user.email,
        project_owner_name: user.full_name,
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
        budget_custom: projectForm.budget_custom,
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

      if (isEditing && editingProject) {
        await Project.update(editingProject.id, projectData)
        success('Project Updated', 'Your project has been updated successfully')
      } else {
        await Project.create(projectData)
        success('Project Posted', 'Your project has been submitted successfully')
      }

      onClose()
      // Refresh the page to show changes
      window.location.reload()
    } catch (err) {
      
      toastError(isEditing ? 'Update Failed' : 'Posting Failed', isEditing ? 'Failed to update project' : 'Failed to post project')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className={`bg-white rounded-2xl shadow-2xl overflow-y-auto ${
          isMobile ? 'w-full max-h-[100vh] h-full' : 'max-w-3xl w-full max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between z-10">
          <div>
            <h2 className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>{isEditing ? 'Edit Project' : 'Post a New Project'}</h2>
            <p className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>{isEditing ? 'Update your project details' : 'Share your project details to connect with talented creators'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className={`w-5 h-5`} />
          </button>
        </div>

        <div className={`p-4 sm:p-6`}>
          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        isMobile ? 'w-7 h-7' : 'w-8 h-10 sm:h-10'
                      } ${
                        step.id < currentStep
                          ? 'bg-amber-600 text-white'
                          : step.id === currentStep
                          ? 'bg-amber-600 text-white ring-4 ring-amber-600/20'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.id < currentStep ? <Check className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} /> : step.id}
                    </div>
                    <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600 mt-2 text-center max-w-[${isMobile ? '50px' : '80px'}]`}>{step.name}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 sm:mx-2 rounded-full transition-all ${
                      step.id < currentStep ? 'bg-amber-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className={`text-center ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
              Step {currentStep} of {STEPS.length}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-200 min-h-[300px] sm:min-h-[400px]">
            {(() => {
              const currentStepName = STEPS[currentStep - 1]?.name

              switch (currentStepName) {
                case 'Project Type':
                  return (
                    <div>
                      <h2 className={`font-bold mb-3 text-black ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>What type of project?</h2>
                      <p className={`text-gray-600 mb-6 sm:mb-8 ${isMobile ? 'text-sm' : ''}`}>Select the format that best describes your production</p>

                      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                        {PROJECT_TYPES.map((type) => {
                          const Icon = type.icon
                          const isSelected = projectForm.project_type === type.value
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => updateForm('project_type', type.value)}
                              className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-amber-600 bg-amber-600/10'
                                  : 'border-gray-300 hover:border-gray-400 bg-white'
                              }`}
                            >
                              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                              <h3 className={`font-semibold mb-1 text-black ${isMobile ? 'text-base' : 'text-lg'}`}>{type.label}</h3>
                              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{type.description}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )

                case 'Funding Details':
                  return (
                    <div>
                      <h2 className={`font-bold mb-3 text-black ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>Funding & Partnership Details</h2>
                      <p className={`text-gray-600 mb-6 sm:mb-8 ${isMobile ? 'text-sm' : ''}`}>Share information about what you're seeking</p>

                      <div className="space-y-6 sm:space-y-8">
                        <div>
                          <label className={`font-semibold mb-3 block ${isMobile ? 'text-sm' : 'text-base'}`}>Current Production Stage</label>
                          <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                            {FUNDING_STAGES.map((stage) => {
                              const isSelected = projectForm.funding_stage === stage.value
                              return (
                                <button
                                  key={stage.value}
                                  type="button"
                                  onClick={() => updateForm('funding_stage', stage.value)}
                                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                                    isSelected
                                      ? 'border-black bg-black/5'
                                      : 'border-gray-300 hover:border-gray-400 bg-white'
                                  }`}
                                >
                                  <span className={`font-medium ${isSelected ? 'text-black' : 'text-gray-700'} ${isMobile ? 'text-sm' : ''}`}>
                                    {stage.label}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div>
                          <label className={`font-semibold mb-3 block ${isMobile ? 'text-sm' : 'text-base'}`}>What are you seeking?</label>
                          <p className={`text-gray-600 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>Select all that apply</p>
                          <div className="space-y-3">
                            {SEEKING_OPTIONS.map((option) => {
                              const isChecked = (projectForm.seeking_partners || []).includes(option.value)
                              return (
                                <label
                                  key={option.value}
                                  className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleSeekingPartner(option.value)}
                                    className={`w-4 h-4`}
                                  />
                                  <span className={`font-medium text-gray-800 ${isMobile ? 'text-sm' : ''}`}>{option.label}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>

                        <div>
                          <label className={`font-semibold mb-3 block ${isMobile ? 'text-sm' : 'text-base'}`}>
                            Rights & Collaboration Structure <span className="text-gray-500 font-normal">(Optional)</span>
                          </label>
                          <p className={`text-gray-600 mb-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            Share any relevant details about rights, equity, collaboration terms, or partnership expectations
                          </p>
                          <textarea
                            value={projectForm.rights_collaboration_notes || ''}
                            onChange={(e) => updateForm('rights_collaboration_notes', e.target.value)}
                            placeholder="Example: Seeking 30% co-production investment in exchange for distribution rights in specific territories..."
                            className={`w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none ${isMobile ? 'min-h-[100px] text-sm' : 'min-h-[120px]'}`}
                          />
                        </div>
                      </div>
                    </div>
                  )

                case 'Usage':
                  return (
                    <div>
                      <h2 className={`font-bold mb-3 text-black ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>Where will this be used?</h2>
                      <p className={`text-gray-600 mb-6 sm:mb-8 ${isMobile ? 'text-sm' : ''}`}>Select all that apply</p>

                      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                        {USAGE_OPTIONS.map((option) => {
                          const Icon = option.icon
                          const isSelected = (projectForm.usage || []).includes(option.value)
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => toggleUsage(option.value)}
                              className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-amber-600 bg-amber-600/10'
                                  : 'border-gray-300 hover:border-gray-400 bg-white'
                              }`}
                            >
                              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                              <h3 className={`font-semibold mb-1 text-black ${isMobile ? 'text-base' : 'text-lg'}`}>{option.label}</h3>
                              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{option.description}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )

                case 'Visual Direction':
                  return (
                    <div>
                      <h2 className={`font-bold mb-3 text-black ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>Visual Direction</h2>
                      <p className={`text-gray-600 mb-2 ${isMobile ? 'text-sm' : ''}`}>Select up to 3 examples that match your vision</p>
                      <p className={`text-gray-500 mb-6 sm:mb-8 ${isMobile ? 'text-xs' : 'text-sm'}`}>This step is optional - you can skip it</p>

                      <div className="bg-gray-100 p-6 sm:p-8 rounded-xl text-center">
                        <Wand2 className={`text-gray-400 mx-auto mb-4 ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`} />
                        <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>Visual direction clips will be loaded from the portfolio library.</p>
                        <p className={`text-gray-500 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>For now, you can skip this step.</p>
                      </div>
                    </div>
                  )

                case 'Location':
                  return (
                    <div>
                      <h2 className={`font-bold mb-3 text-black ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>Where is production?</h2>
                      <p className={`text-gray-600 mb-6 sm:mb-8 ${isMobile ? 'text-sm' : ''}`}>Help us find teams in your area</p>

                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <label className={`mb-3 block ${isMobile ? 'text-sm' : 'text-base'}`}>Country</label>
                          <select
                            value={projectForm.location_country}
                            onChange={(e) => updateForm('location_country', e.target.value)}
                            className={`w-full bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-3 text-black focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 ${isMobile ? 'text-sm' : ''}`}
                          >
                            <option value="">Select a country</option>
                            {['Netherlands', 'Belgium', 'France', 'Spain', 'Germany', 'Italy', 'United Kingdom', 'Austria', 'Luxembourg', 'Portugal', 'Switzerland', 'Other'].map(country => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`mb-3 block ${isMobile ? 'text-sm' : 'text-base'}`}>City</label>
                          <Input
                            value={projectForm.location_city}
                            onChange={(e) => updateForm('location_city', e.target.value)}
                            placeholder="e.g., Amsterdam, Barcelona, Paris"
                            className={`bg-white border-gray-300 text-black ${isMobile ? 'h-10 text-sm' : 'h-12'}`}
                          />
                        </div>

                        <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-100 rounded-lg border border-gray-200">
                          <input
                            type="checkbox"
                            id="remote"
                            checked={projectForm.is_remote}
                            onChange={(e) => updateForm('is_remote', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <label htmlFor="remote" className={`cursor-pointer ${isMobile ? 'text-sm' : 'text-base'}`}>
                            Remote production possible
                          </label>
                        </div>
                      </div>
                    </div>
                  )

                case 'Departments':
                  return (
                    <div>
                      <h2 className={`font-bold mb-3 text-black ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>What services do you need?</h2>
                      <p className={`text-gray-600 mb-6 sm:mb-8 ${isMobile ? 'text-sm' : ''}`}>Select all departments required</p>

                      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                        {DEPARTMENTS.map((dept) => {
                          const Icon = dept.icon
                          const isSelected = (projectForm.departments_needed || []).includes(dept.value)
                          return (
                            <button
                              key={dept.value}
                              type="button"
                              onClick={() => toggleDepartment(dept.value)}
                              className={`p-4 sm:p-5 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-amber-600 bg-amber-600/10'
                                  : 'border-gray-300 hover:border-gray-400 bg-white'
                              }`}
                            >
                              <Icon className={`w-6 h-6 sm:w-7 sm:h-7 mb-2 sm:mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                              <h3 className={`font-semibold mb-1 text-black ${isMobile ? 'text-sm' : 'text-base'}`}>{dept.label}</h3>
                              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{dept.description}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )

                case 'Timeline':
                  return (
                    <div>
                      <h2 className={`font-bold mb-3 text-black ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>Timeline</h2>
                      <p className={`text-gray-600 mb-6 sm:mb-8 ${isMobile ? 'text-sm' : ''}`}>When do you need this project?</p>

                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <label className={`mb-3 flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                            <Calendar className={`w-4 h-4`} />
                            Expected Start Date
                          </label>
                          <Input
                            type="date"
                            value={projectForm.timeline_start}
                            onChange={(e) => updateForm('timeline_start', e.target.value)}
                            className={`bg-white border-gray-300 text-black ${isMobile ? 'h-10 text-sm' : 'h-12'}`}
                          />
                        </div>

                        <div>
                          <label className={`mb-3 flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                            <Calendar className={`w-4 h-4`} />
                            Delivery Deadline
                          </label>
                          <Input
                            type="date"
                            value={projectForm.timeline_end}
                            onChange={(e) => updateForm('timeline_end', e.target.value)}
                            className={`bg-white border-gray-300 text-black ${isMobile ? 'h-10 text-sm' : 'h-12'}`}
                          />
                        </div>

                        <div className={`p-3 sm:p-4 bg-gray-100 rounded-lg border border-gray-200`}>
                          <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            💡 We recommend booking teams at least 4-6 weeks in advance for best availability
                          </p>
                        </div>
                      </div>
                    </div>
                  )

                case 'Budget':
                  return (
                    <div>
                      <h2 className={`font-bold mb-3 text-black ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>Budget Range</h2>
                      <p className={`text-gray-600 mb-2 ${isMobile ? 'text-sm' : ''}`}>This helps us match you with the right teams</p>
                      <p className={`text-gray-500 mb-6 sm:mb-8 ${isMobile ? 'text-xs' : 'text-sm'}`}>Optional - you can discuss exact numbers later</p>

                      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                        {BUDGET_RANGES.map((range) => {
                          const isSelected = projectForm.budget_range === range.value
                          return (
                            <button
                              key={range.value}
                              type="button"
                              onClick={() => updateForm('budget_range', range.value)}
                              className={`p-4 sm:p-5 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-amber-600 bg-amber-600/10'
                                  : 'border-gray-300 hover:border-gray-400 bg-white'
                              }`}
                            >
                              <DollarSign className={`w-6 h-6 sm:w-7 sm:h-7 mb-2 sm:mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                              <h3 className={`font-semibold mb-1 text-black ${isMobile ? 'text-sm' : 'text-base'}`}>{range.label}</h3>
                              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{range.description}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )

                case 'Details':
                  return (
                    <div>
                      <h2 className={`font-bold mb-3 text-black ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>Project Details</h2>
                      <p className={`text-gray-600 mb-6 sm:mb-8 ${isMobile ? 'text-sm' : ''}`}>Tell us more about your project</p>

                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <label className={`block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}>
                            <ImageIcon className={`w-4 h-4`} />
                            Project Image (Optional)
                          </label>
                          <div className="relative">
                            {imagePreview ? (
                              <div className={`relative rounded-xl overflow-hidden ${isMobile ? 'h-32' : 'h-40'}`}>
                                <img src={imagePreview} alt="Project preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => { setImagePreview(null); }}
                                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                >
                                  <X className={`w-4 h-4`} />
                                </button>
                              </div>
                            ) : (
                              <div className={`border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${isMobile ? 'h-32' : 'h-40'}`}>
                                <Upload className={`text-gray-400 mb-2 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`} />
                                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Click to upload project image</p>
                                <p className={`text-gray-400 mt-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>PNG, JPG up to 5MB</p>
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
                          <label className={`block text-sm font-semibold text-gray-900 mb-2 ${isMobile ? 'text-xs' : ''}`}>Project Title</label>
                          <Input
                            type="text"
                            value={projectForm.title}
                            onChange={(e) => updateForm('title', e.target.value)}
                            placeholder="Enter project title"
                            required
                            className={`${isMobile ? 'h-10 text-sm' : 'h-11'}`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold text-gray-900 mb-2 ${isMobile ? 'text-xs' : ''}`}>Project Description</label>
                          <textarea
                            value={projectForm.description}
                            onChange={(e) => updateForm('description', e.target.value)}
                            placeholder="Describe your project in detail..."
                            rows={isMobile ? 3 : 4}
                            className={`w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none ${isMobile ? 'text-sm' : ''}`}
                            required
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold text-gray-900 mb-2 ${isMobile ? 'text-xs' : ''}`}>Additional Requirements</label>
                          <textarea
                            value={projectForm.requirements}
                            onChange={(e) => updateForm('requirements', e.target.value)}
                            placeholder="Any specific requirements or preferences..."
                            rows={isMobile ? 2 : 3}
                            className={`w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none ${isMobile ? 'text-sm' : ''}`}
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
          <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
            <Button
              variant="outline"
              size={isMobile ? 'default' : 'lg'}
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-gray-300 hover:bg-gray-50 order-2 sm:order-1"
            >
              <ArrowLeft className={`mr-2 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                size={isMobile ? 'default' : 'lg'}
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-amber-600 hover:bg-amber-700 text-white order-1 sm:order-2"
              >
                Next
              </Button>
            ) : (
              <Button
                size={isMobile ? 'default' : 'lg'}
                onClick={handleSubmit}
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white order-1 sm:order-2"
              >
                {loading ? 'Submitting...' : (isEditing ? 'Update Project' : 'Post Project')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
