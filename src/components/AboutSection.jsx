import React, { useState } from 'react'
import { Artist } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Plus, X, Sparkles, ThumbsUp, Edit2, Check, Globe, Instagram, Linkedin, MapPin, Languages, Award, Briefcase, Users as UsersIcon, Facebook, Youtube, Twitter, Film, GraduationCap, Video, Mail, AlertCircle } from 'lucide-react'
import SkillsExperienceTagInput from '@/components/SkillsExperienceTagInput'
import worldLanguages from '@/data/languages.json'
import { TALENT_ROLES, TALENT_ROLES_BY_CATEGORY } from '@/lib/filmRoles'

const SKILL_SUGGESTIONS = TALENT_ROLES

const CLIENT_SUGGESTIONS = [
  'Nike', 'Apple', 'Google', 'Coca-Cola', 'BMW', 'Sony', 'Netflix', 'Amazon', 'Meta',
  'Adidas', 'Spotify', 'Instagram', 'YouTube', 'TikTok', 'Vimeo', 'Paramount', 'Disney',
  'HBO', 'Warner Bros', 'Universal', 'DreamWorks', 'Pixar', 'Marvel', 'DC', 'Fox',
  'Porsche', 'Mercedes', 'Tesla', 'Audi', 'Lamborghini', 'Rolls Royce', 'Rolex', 'Louis Vuitton',
  'Gucci', 'Hermès', 'Chanel', 'Dior', 'Prada', 'Burberry', 'Versace', 'Balenciaga',
  'Givenchy', 'Fendi', 'Celine', 'Saint Laurent', 'Valentino', 'Dolce Gabbana', 'Armani'
]

const PROJECT_TYPE_SUGGESTIONS = [
  'Branded Content', 'Commercials', 'Music Videos', 'Documentaries', 'Feature Films',
  'Corporate Videos', 'Social Media', 'Explainer Videos', 'Campaigns', 'Viral Content',
  'Short Films', 'Editorials', 'Fashion Films', 'Product Photography', 'Fashion Shows',
  'Beauty Campaigns', 'Luxury Goods', 'Automotive', 'Real Estate', 'Travel Films',
  'Event Coverage', 'Weddings', 'Sports', 'Fitness', 'Gaming Content', 'Animation',
  'Motion Graphics', 'Graphic Design', 'Web Design', 'App Design', 'UX/UI', 'Photo Editing',
  'Photo Retouching', 'Podcast Production', 'Video Podcast', 'Live Streaming', 'Virtual Events'
]

const LANGUAGE_SUGGESTIONS = worldLanguages

const COUNTRY_SUGGESTIONS = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China',
  'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
  'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe'
]

export default function AboutSection({ artist, endorsements, onUpdate }) {
  const [bio, setBio] = useState(artist?.bio || '')
  const [editingBio, setEditingBio] = useState(false)
  const [bioLoading, setBioLoading] = useState(false)

  const [skills, setSkills] = useState(artist?.skills || [])
  const [editingSkills, setEditingSkills] = useState(false)

  const [clients, setClients] = useState(artist?.past_clients || [])
  const [newClient, setNewClient] = useState('')
  const [showClientSuggestions, setShowClientSuggestions] = useState(false)
  const [editingClients, setEditingClients] = useState(false)

  const [projectTypes, setProjectTypes] = useState(artist?.project_specialties || [])
  const [newProjectType, setNewProjectType] = useState('')
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false)
  const [editingProjects, setEditingProjects] = useState(false)

  const [languages, setLanguages] = useState(artist?.languages_spoken || [])
  const [newLanguage, setNewLanguage] = useState('')
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false)
  const [editingLanguages, setEditingLanguages] = useState(false)

  // Physical appearance fields
  const [ethnicity, setEthnicity] = useState(artist?.ethnicity || '')
  const [height, setHeight] = useState(artist?.height_cms || '')
  const [weight, setWeight] = useState(artist?.weight_kg || '')
  const [eyeColor, setEyeColor] = useState(artist?.eye_color || '')
  const [hairColor, setHairColor] = useState(artist?.hair_color || '')
  const [skinTone, setSkinTone] = useState(artist?.skin_tone || '')
  const [build, setBuild] = useState(artist?.build || '')
  const [ageRange, setAgeRange] = useState(artist?.age_range || '')
  const [dateOfBirth, setDateOfBirth] = useState(artist?.date_of_birth || '')
  const [editingAppearance, setEditingAppearance] = useState(false)

  // Contact & Social Media fields (using correct column names)
  const [websiteUrl, setWebsiteUrl] = useState(artist?.website_url || '')
  const [socialMediaUrl, setSocialMediaUrl] = useState(artist?.social_media_url || '')
  const [editingContact, setEditingContact] = useState(false)

  // Education fields
  const [education, setEducation] = useState(artist?.education || [])
  const [newEducation, setNewEducation] = useState({ year: '', institution: '', description: '' })
  const [editingEducation, setEditingEducation] = useState(false)

  // Credits & Experience fields (using new columns added in migration)
  const [filmCredits, setFilmCredits] = useState(artist?.film_credits || [])
  const [commercialCredits, setCommercialCredits] = useState(artist?.commercial_credits || [])
  const [newCredit, setNewCredit] = useState({ year: '', project: '', role: '', name: '' })
  const [editingCredits, setEditingCredits] = useState(false)

  // Countries worked in
  const [countries, setCountries] = useState(artist?.countries_worked || [])
  const [newCountry, setNewCountry] = useState('')
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false)
  const [editingCountries, setEditingCountries] = useState(false)

  // Performing Samples fields
  const [performingSamples, setPerformingSamples] = useState(artist?.portfolio_urls || [])
  const [newSample, setNewSample] = useState({ title: '', url: '', type: 'video' })
  const [editingSamples, setEditingSamples] = useState(false)

  // Self Recording fields
  const [selfRecording, setSelfRecording] = useState(artist?.self_recording_description || '')
  const [editingSelfRecording, setEditingSelfRecording] = useState(false)

  // Helper function for safe saves with error handling
  const safeSave = async (updateFn, sectionName) => {
    if (!artist) {
      alert(`Error: Artist profile not found. Please refresh the page.`)
      return false
    }
    try {
      const updated = await Artist.update(artist.id, updateFn)
      if (onUpdate) onUpdate(updated)
      return true
    } catch (err) {
      console.error(`Error saving ${sectionName}:`, err)
      alert(`Failed to save ${sectionName}: ${err.message || 'Unknown error'}`)
      return false
    }
  }

  const groupedEndorsements = endorsements.reduce((acc, e) => {
    if (!acc[e.skill]) acc[e.skill] = []
    acc[e.skill].push(e)
    return acc
  }, {})

  const generateBioWithAI = async () => {
    setBioLoading(true)
    try {
      const skillsList = skills.join(', ')
      const clientsList = clients.join(', ')
      const specialties = projectTypes.join(', ')

      // TODO: Replace with Supabase Edge Function or OpenAI for AI bio generation
      const mockBio = `A creative professional specializing in ${specialties || 'various creative disciplines'}. Expert in ${skillsList || 'multiple creative skills'}, with experience working with clients like ${clientsList || 'industry leaders'}. Passionate about delivering high-quality creative work that tells compelling stories.`
      setBio(mockBio)
    } catch (err) {
    } finally {
      setBioLoading(false)
    }
  }

  const addClient = (client) => {
    if (client && !clients.includes(client)) {
      setClients([...clients, client])
      setNewClient('')
    }
  }

  const removeClient = (client) => {
    setClients(clients.filter(c => c !== client))
  }

  const addProjectType = (type) => {
    if (type && !projectTypes.includes(type)) {
      setProjectTypes([...projectTypes, type])
      setNewProjectType('')
    }
  }

  const removeProjectType = (type) => {
    setProjectTypes(projectTypes.filter(t => t !== type))
  }

  const filteredClientSuggestions = CLIENT_SUGGESTIONS.filter(c =>
    c.toLowerCase().includes(newClient.toLowerCase()) && !clients.includes(c)
  )

  const filteredProjectSuggestions = PROJECT_TYPE_SUGGESTIONS.filter(p =>
    p.toLowerCase().includes(newProjectType.toLowerCase()) && !projectTypes.includes(p)
  )

  const filteredLanguageSuggestions = LANGUAGE_SUGGESTIONS.filter(l =>
    l.toLowerCase().includes(newLanguage.toLowerCase()) && !languages.includes(l)
  )


  const addLanguage = (lang) => {
    if (lang && !languages.includes(lang)) {
      setLanguages([...languages, lang])
      setNewLanguage('')
    }
  }

  const removeLanguage = (lang) => {
    setLanguages(languages.filter(l => l !== lang))
  }

  const filteredCountrySuggestions = COUNTRY_SUGGESTIONS.filter(country =>
    country.toLowerCase().includes(newCountry.toLowerCase()) && !countries.includes(country)
  )


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Left Column - Main Info */}
      <div className="col-span-1 space-y-6">
        {/* Bio Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-700" />
              About
            </h3>
            {!editingBio && (
              <button
                onClick={() => setEditingBio(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingBio ? (
            <div className="space-y-3">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write your professional bio..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none h-24 bg-white"
              />
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    const success = await safeSave({ bio }, 'bio')
                    if (success) setEditingBio(false)
                  }}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Save Bio
                </Button>
                <Button
                  onClick={generateBioWithAI}
                  disabled={bioLoading}
                  variant="outline"
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {bioLoading ? 'Generating...' : 'AI Generate'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 leading-relaxed text-sm">
              {bio || 'Add a professional bio to tell others about your work and expertise.'}
            </p>
          )}
        </div>

        {/* Skills & Experience */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-700" />
              Skills & Experience
            </h3>
            {!editingSkills && (
              <button
                onClick={() => setEditingSkills(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingSkills ? (
            <div className="space-y-4">
              <SkillsExperienceTagInput
                selected={skills}
                onChange={setSkills}
                placeholder="Search skills... (e.g. Lead Actor, Voiceover, UGC Creator)"
                suggestions={SKILL_SUGGESTIONS}
              />
              <Button
                onClick={async () => {
                  const success = await safeSave({ skills: skills }, 'skills')
                  if (success) setEditingSkills(false)
                }}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? skills.map((skill) => {
                const endorsementCount = groupedEndorsements[skill]?.length || 0
                return (
                  <button
                    key={skill}
                    className="px-3 py-1.5 bg-white border border-blue-200 rounded-full text-sm text-gray-800 hover:border-blue-400 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {skill}
                    {endorsementCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                        <ThumbsUp className="w-3 h-3" />
                        {endorsementCount}
                      </span>
                    )}
                  </button>
                )
              }) : (
                <p className="text-gray-600 text-sm">No skills added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>

        {/* Past Clients */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-purple-700" />
              Past Clients
            </h3>
            {!editingClients && (
              <button
                onClick={() => setEditingClients(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingClients ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3 mb-3">
                {clients.map((client) => (
                  <div key={client} className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 relative group shadow-md">
                      {client.slice(0, 2).toUpperCase()}
                      <button
                        onClick={() => removeClient(client)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-center text-gray-600 mt-1 w-16 truncate">{client}</p>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    onFocus={() => setShowClientSuggestions(true)}
                    placeholder="Add a client..."
                    className="flex-1 px-4 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Button
                    onClick={() => addClient(newClient)}
                    size="sm"
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showClientSuggestions && filteredClientSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-purple-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredClientSuggestions.map((client) => (
                      <button
                        key={client}
                        onClick={() => {
                          addClient(client)
                          setShowClientSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm border-b border-purple-100 last:border-0"
                      >
                        {client}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={async () => {
                  const success = await safeSave({ past_clients: clients }, 'clients')
                  if (success) setEditingClients(false)
                }}
                className="w-full bg-purple-600 text-white hover:bg-purple-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {clients.length > 0 ? clients.map((client) => (
                <div key={client} className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md" title={client}>
                  {client.slice(0, 2).toUpperCase()}
                </div>
              )) : (
                <p className="text-gray-600 text-sm">No clients added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>

        {/* Project Types */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-700" />
              Project Types
            </h3>
            {!editingProjects && (
              <button
                onClick={() => setEditingProjects(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingProjects ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {projectTypes.map((type) => (
                  <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-full text-sm shadow-sm">
                    {type}
                    <button onClick={() => removeProjectType(type)} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProjectType}
                    onChange={(e) => setNewProjectType(e.target.value)}
                    onFocus={() => setShowProjectSuggestions(true)}
                    placeholder="Add project type..."
                    className="flex-1 px-4 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Button
                    onClick={() => addProjectType(newProjectType)}
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showProjectSuggestions && filteredProjectSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-green-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredProjectSuggestions.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          addProjectType(type)
                          setShowProjectSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm border-b border-green-100 last:border-0"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={async () => {
                  const success = await safeSave({ project_specialties: projectTypes }, 'project types')
                  if (success) setEditingProjects(false)
                }}
                className="w-full bg-green-600 text-white hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {projectTypes.length > 0 ? projectTypes.map((type) => (
                <span key={type} className="px-3 py-1.5 bg-white border border-green-200 rounded-full text-sm text-gray-800 shadow-sm">
                  {type}
                </span>
              )) : (
                <p className="text-gray-600 text-sm">No project types added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Languages, Contact, Education */}
      <div className="col-span-1 space-y-6">
        {/* Languages */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Languages className="w-5 h-5 text-orange-700" />
              Languages
            </h3>
            {!editingLanguages && (
              <button
                onClick={() => setEditingLanguages(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingLanguages ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {languages.map((lang) => (
                  <div key={lang} className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-full text-sm shadow-sm">
                    {lang}
                    <button onClick={() => removeLanguage(lang)} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onFocus={() => setShowLanguageSuggestions(true)}
                    placeholder="Add a language..."
                    className="flex-1 px-4 py-2 border border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <Button onClick={() => addLanguage(newLanguage)} size="sm" className="bg-orange-600 text-white hover:bg-orange-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showLanguageSuggestions && filteredLanguageSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-orange-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredLanguageSuggestions.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          addLanguage(lang)
                          setShowLanguageSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-orange-50 text-sm border-b border-orange-100 last:border-0"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={async () => {
                const success = await safeSave({ languages_spoken: languages }, 'languages')
                if (success) setEditingLanguages(false)
              }} className="w-full bg-orange-600 text-white hover:bg-orange-700">
                <Check className="w-4 h-4 mr-1" /> Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {languages.length > 0 ? languages.map((lang) => (
                <span key={lang} className="px-3 py-1.5 bg-white border border-orange-200 rounded-full text-sm text-gray-800 shadow-sm">
                  {lang}
                </span>
              )) : <p className="text-gray-600 text-sm">No languages added yet</p>}
            </div>
          )}
        </div>

        {/* Physical Appearance */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-rose-700" />
              Physical Appearance
            </h3>
            {!editingAppearance && (
              <button
                onClick={() => setEditingAppearance(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingAppearance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ethnicity</label>
                  <select
                    value={ethnicity}
                    onChange={(e) => setEthnicity(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select</option>
                    <option value="African">African</option>
                    <option value="Caucasian">Caucasian</option>
                    <option value="Asian">Asian</option>
                    <option value="Hispanic/Latino">Hispanic/Latino</option>
                    <option value="Middle Eastern">Middle Eastern</option>
                    <option value="Indian">Indian</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Eye Color</label>
                  <select
                    value={eyeColor}
                    onChange={(e) => setEyeColor(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select</option>
                    <option value="Brown">Brown</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                    <option value="Hazel">Hazel</option>
                    <option value="Gray">Gray</option>
                    <option value="Amber">Amber</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hair Color</label>
                  <select
                    value={hairColor}
                    onChange={(e) => setHairColor(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select</option>
                    <option value="Black">Black</option>
                    <option value="Brown">Brown</option>
                    <option value="Blonde">Blonde</option>
                    <option value="Red">Red</option>
                    <option value="Gray">Gray</option>
                    <option value="White">White</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Skin Tone</label>
                  <select
                    value={skinTone}
                    onChange={(e) => setSkinTone(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select</option>
                    <option value="Fair">Fair</option>
                    <option value="Light">Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Olive">Olive</option>
                    <option value="Dark">Dark</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Build</label>
                  <select
                    value={build}
                    onChange={(e) => setBuild(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select</option>
                    <option value="Slim">Slim</option>
                    <option value="Athletic">Athletic</option>
                    <option value="Average">Average</option>
                    <option value="Muscular">Muscular</option>
                    <option value="Heavy">Heavy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Age Range</label>
                  <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select</option>
                    <option value="18-25">18-25</option>
                    <option value="25-35">25-35</option>
                    <option value="35-45">35-45</option>
                    <option value="45-55">45-55</option>
                    <option value="55+">55+</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              <Button
                onClick={async () => {
                  if (artist) {
                    const updated = await Artist.update(artist.id, {
                      ethnicity,
                      height_cms: height ? parseInt(height) : null,
                      weight_kg: weight ? parseInt(weight) : null,
                      eye_color: eyeColor,
                      hair_color: hairColor,
                      skin_tone: skinTone,
                      build,
                      age_range: ageRange,
                      date_of_birth: dateOfBirth || null
                    })
                    if (onUpdate) onUpdate(updated)
                  }
                  setEditingAppearance(false)
                }}
                className="w-full bg-rose-600 text-white hover:bg-rose-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {ethnicity && <div><span className="text-gray-600">Ethnicity:</span> <span className="font-medium">{ethnicity}</span></div>}
                {height && <div><span className="text-gray-600">Height:</span> <span className="font-medium">{height} cm</span></div>}
                {weight && <div><span className="text-gray-600">Weight:</span> <span className="font-medium">{weight} kg</span></div>}
                {eyeColor && <div><span className="text-gray-600">Eye Color:</span> <span className="font-medium">{eyeColor}</span></div>}
                {hairColor && <div><span className="text-gray-600">Hair Color:</span> <span className="font-medium">{hairColor}</span></div>}
                {skinTone && <div><span className="text-gray-600">Skin Tone:</span> <span className="font-medium">{skinTone}</span></div>}
                {build && <div><span className="text-gray-600">Build:</span> <span className="font-medium">{build}</span></div>}
                {ageRange && <div><span className="text-gray-600">Age Range:</span> <span className="font-medium">{ageRange}</span></div>}
                {dateOfBirth && <div className="col-span-2"><span className="text-gray-600">Date of Birth:</span> <span className="font-medium">{dateOfBirth}</span></div>}
              </div>
              {!ethnicity && !height && !weight && !eyeColor && !hairColor && !skinTone && !build && !ageRange && !dateOfBirth && (
                <p className="text-gray-600 text-sm">No appearance details added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-700" />
              Contact
            </h3>
            {!editingContact && (
              <button
                onClick={() => setEditingContact(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingContact ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Social Media URL</label>
                <input
                  type="url"
                  value={socialMediaUrl}
                  onChange={(e) => setSocialMediaUrl(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <Button
                onClick={async () => {
                  if (artist) {
                    const updated = await Artist.update(artist.id, {
                      website_url: websiteUrl,
                      social_media_url: socialMediaUrl
                    })
                    if (onUpdate) onUpdate(updated)
                  }
                  setEditingContact(false)
                }}
                className="w-full bg-gray-800 text-white hover:bg-gray-900"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {websiteUrl && <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-black transition-colors block"><Globe className="w-4 h-4 inline mr-2" />{websiteUrl}</a>}
              {socialMediaUrl && <a href={socialMediaUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-black transition-colors block"><Globe className="w-4 h-4 inline mr-2" />Social Media</a>}
              {!websiteUrl && !socialMediaUrl && (
                <p className="text-gray-600 text-sm">No contact details added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>

        {/* Education Section */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-700" />
              Education & Training
            </h3>
            {!editingEducation && (
              <button
                onClick={() => setEditingEducation(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingEducation ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {education.map((edu, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-amber-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{edu.year}</span>
                      <button onClick={() => setEducation(education.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm font-medium">{edu.institution}</p>
                    {edu.description && <p className="text-xs text-gray-600 mt-1">{edu.description}</p>}
                  </div>
                ))}
              </div>
              <div className="space-y-2 bg-white p-3 rounded-lg border border-amber-200">
                <input
                  type="text"
                  value={newEducation.year}
                  onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                  placeholder="Year (e.g., 2020)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                />
                <input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                  placeholder="Institution (e.g., NYU Tisch)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                />
                <input
                  type="text"
                  value={newEducation.description}
                  onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                  placeholder="Description (e.g., Acting BA)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <Button
                  onClick={() => {
                    if (newEducation.year && newEducation.institution) {
                      setEducation([...education, newEducation])
                      setNewEducation({ year: '', institution: '', description: '' })
                    }
                  }}
                  size="sm"
                  className="w-full mt-2 bg-amber-600 text-white hover:bg-amber-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Education
                </Button>
              </div>
              <Button
                onClick={async () => {
                  if (artist) {
                    const updated = await Artist.update(artist.id, { education })
                    if (onUpdate) onUpdate(updated)
                  }
                  setEditingEducation(false)
                }}
                className="w-full bg-amber-600 text-white hover:bg-amber-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {education.length > 0 ? education.map((edu, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{edu.year}:</span> {edu.institution}
                  {edu.description && <span className="text-gray-600"> - {edu.description}</span>}
                </div>
              )) : (
                <p className="text-gray-600 text-sm">No education added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Left Column - Credits & Countries */}
      <div className="col-span-1 space-y-6">
        {/* Credits Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-indigo-700" />
              Credits
            </h3>
            {!editingCredits && (
              <button
                onClick={() => setEditingCredits(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingCredits ? (
            <div className="space-y-4">
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Film Credits</h4>
                <div className="space-y-2">
                  {filmCredits.map((credit, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-indigo-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{credit.year}</span>
                        <button onClick={() => setFilmCredits(filmCredits.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-medium">{credit.project}</p>
                      <p className="text-xs text-gray-600">{credit.role}</p>
                      {credit.name && <p className="text-xs text-gray-500">{credit.name}</p>}
                    </div>
                  ))}
                </div>
                <div className="space-y-2 bg-white p-3 rounded-lg border border-indigo-200 mt-2">
                  <input
                    type="text"
                    value={newCredit.year}
                    onChange={(e) => setNewCredit({ ...newCredit, year: e.target.value })}
                    placeholder="Year"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                  />
                  <input
                    type="text"
                    value={newCredit.project}
                    onChange={(e) => setNewCredit({ ...newCredit, project: e.target.value })}
                    placeholder="Project Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                  />
                  <input
                    type="text"
                    value={newCredit.role}
                    onChange={(e) => setNewCredit({ ...newCredit, role: e.target.value })}
                    placeholder="Role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                  />
                  <input
                    type="text"
                    value={newCredit.name}
                    onChange={(e) => setNewCredit({ ...newCredit, name: e.target.value })}
                    placeholder="Name/Character (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <Button
                    onClick={() => {
                      if (newCredit.year && newCredit.project && newCredit.role) {
                        setFilmCredits([...filmCredits, newCredit])
                        setNewCredit({ year: '', project: '', role: '', name: '' })
                      }
                    }}
                    size="sm"
                    className="w-full mt-2 bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Film Credit
                  </Button>
                </div>
              </div>
              <Button
                onClick={async () => {
                  if (artist) {
                    const updated = await Artist.update(artist.id, { film_credits: filmCredits, commercial_credits: commercialCredits })
                    if (onUpdate) onUpdate(updated)
                  }
                  setEditingCredits(false)
                }}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filmCredits.length > 0 ? filmCredits.map((credit, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{credit.year}:</span> {credit.project} - {credit.role}
                  {credit.name && <span className="text-gray-600"> ({credit.name})</span>}
                </div>
              )) : (
                <p className="text-gray-600 text-sm">No credits added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>

        {/* Countries Worked Section */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-700" />
              Countries Worked
            </h3>
            {!editingCountries && (
              <button
                onClick={() => setEditingCountries(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingCountries ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {countries.map((country) => (
                  <div key={country} className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-full text-sm shadow-sm">
                    {country}
                    <button onClick={() => setCountries(countries.filter(c => c !== country))} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    onFocus={() => setShowCountrySuggestions(true)}
                    placeholder="Add country..."
                    className="flex-1 px-4 py-2 border border-teal-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <Button
                    onClick={() => {
                      if (newCountry && !countries.includes(newCountry)) {
                        setCountries([...countries, newCountry])
                        setNewCountry('')
                      }
                    }}
                    size="sm"
                    className="bg-teal-600 text-white hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showCountrySuggestions && filteredCountrySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-teal-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredCountrySuggestions.map((country) => (
                      <button
                        key={country}
                        onClick={() => {
                          if (!countries.includes(country)) {
                            setCountries([...countries, country])
                            setNewCountry('')
                          }
                          setShowCountrySuggestions(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-teal-50 text-sm border-b border-teal-100 last:border-0"
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={async () => {
                  const success = await safeSave({ countries_worked: countries }, 'countries')
                  if (success) setEditingCountries(false)
                }}
                className="w-full bg-teal-600 text-white hover:bg-teal-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {countries.length > 0 ? countries.map((country) => (
                <span key={country} className="px-3 py-1.5 bg-white border border-teal-200 rounded-full text-sm text-gray-800 shadow-sm">
                  {country}
                </span>
              )) : (
                <p className="text-gray-600 text-sm">No countries added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Performing Samples & Self Recording */}
      <div className="col-span-1 space-y-6">
        {/* Performing Samples Section */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-700" />
              Countries Worked
            </h3>
            {!editingCountries && (
              <button
                onClick={() => setEditingCountries(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingCountries ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {countries.map((country) => (
                  <div key={country} className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-full text-sm shadow-sm">
                    {country}
                    <button onClick={() => setCountries(countries.filter(c => c !== country))} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    onFocus={() => setShowCountrySuggestions(true)}
                    placeholder="Add country..."
                    className="flex-1 px-4 py-2 border border-teal-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <Button
                    onClick={() => {
                      if (newCountry && !countries.includes(newCountry)) {
                        setCountries([...countries, newCountry])
                        setNewCountry('')
                      }
                    }}
                    size="sm"
                    className="bg-teal-600 text-white hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showCountrySuggestions && filteredCountrySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-teal-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredCountrySuggestions.map((country) => (
                      <button
                        key={country}
                        onClick={() => {
                          if (!countries.includes(country)) {
                            setCountries([...countries, country])
                            setNewCountry('')
                          }
                          setShowCountrySuggestions(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-teal-50 text-sm border-b border-teal-100 last:border-0"
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={async () => {
                  const success = await safeSave({ countries_worked: countries }, 'countries')
                  if (success) setEditingCountries(false)
                }}
                className="w-full bg-teal-600 text-white hover:bg-teal-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {countries.length > 0 ? countries.map((country) => (
                <span key={country} className="px-3 py-1.5 bg-white border border-teal-200 rounded-full text-sm text-gray-800 shadow-sm">
                  {country}
                </span>
              )) : (
                <p className="text-gray-600 text-sm">No countries added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Performing Samples & Self Recording */}
      <div className="col-span-1 space-y-6">
        {/* Performing Samples Section */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-700" />
              Performing Samples
            </h3>
            {!editingSamples && (
              <button
                onClick={() => setEditingSamples(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingSamples ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {performingSamples.map((sample, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{sample.title}</span>
                      <button onClick={() => setPerformingSamples(performingSamples.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <a href={sample.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{sample.url}</a>
                    <span className="text-xs text-gray-500 ml-2">({sample.type})</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 bg-white p-3 rounded-lg border border-purple-200">
                <input
                  type="text"
                  value={newSample.title}
                  onChange={(e) => setNewSample({ ...newSample, title: e.target.value })}
                  placeholder="Sample Title (e.g., Drama Reel)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                />
                <input
                  type="url"
                  value={newSample.url}
                  onChange={(e) => setNewSample({ ...newSample, url: e.target.value })}
                  placeholder="Video/Reel URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                />
                <select
                  value={newSample.type}
                  onChange={(e) => setNewSample({ ...newSample, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="video">Video</option>
                  <option value="reel">Reel</option>
                  <option value="audio">Audio</option>
                  <option value="link">Link</option>
                </select>
                <Button
                  onClick={() => {
                    if (newSample.title && newSample.url) {
                      setPerformingSamples([...performingSamples, newSample])
                      setNewSample({ title: '', url: '', type: 'video' })
                    }
                  }}
                  size="sm"
                  className="w-full mt-2 bg-purple-600 text-white hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Sample
                </Button>
              </div>
              <Button
                onClick={async () => {
                  if (artist) {
                    const updated = await Artist.update(artist.id, { portfolio_urls: performingSamples })
                    if (onUpdate) onUpdate(updated)
                  }
                  setEditingSamples(false)
                }}
                className="w-full bg-purple-600 text-white hover:bg-purple-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {performingSamples.length > 0 ? performingSamples.map((sample, index) => (
                <div key={index} className="text-sm">
                  <a href={sample.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{sample.title}</a>
                  <span className="text-gray-500 ml-2">({sample.type})</span>
                </div>
              )) : (
                <p className="text-gray-600 text-sm">No performing samples added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>

        {/* Self Recording Section */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-700" />
              Self Recording / Demo Reel
            </h3>
            {!editingSelfRecording && (
              <button
                onClick={() => setEditingSelfRecording(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingSelfRecording ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Self Recording / Demo Reel (TEXT, not link)</label>
                <textarea
                  value={selfRecording}
                  onChange={(e) => setSelfRecording(e.target.value)}
                  placeholder="Describe how you record yourself (e.g., I use a DSLR camera with 4K resolution, good lighting, and professional audio setup)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none h-24"
                />
              </div>
              <Button
                onClick={async () => {
                  const success = await safeSave({ self_recording_description: selfRecording }, 'self recording')
                  if (success) setEditingSelfRecording(false)
                }}
                className="w-full bg-cyan-600 text-white hover:bg-cyan-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div>
              {selfRecording ? (
                <p className="text-sm text-gray-800">{selfRecording}</p>
              ) : (
                <p className="text-gray-600 text-sm">No self-recording description added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>
      </div >
    </div >
  )
}