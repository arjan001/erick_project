import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Artist } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Plus, X, Sparkles, ThumbsUp, Edit2, Check, Globe, Instagram, Linkedin } from 'lucide-react';

const SKILL_SUGGESTIONS = [
  'After Effects', 'Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'Concept Art', 'Creative Direction', 
  'Editing', 'Color Grading', 'Motion Graphics', 'VFX', '3D Animation', 'Maya', 'Cinema 4D', 'Blender',
  'Sound Design', 'Pro Tools', 'Cinematography', 'Lighting Design', 'Set Design', 'Art Direction',
  'Visual Effects', 'Compositing', 'Storyboarding', 'Photography', 'Directing', 'Production Management',
  'Scriptwriting', 'Animation', 'Character Animation', 'Visual Effects Supervisor', 'DP/Cinematography',
  'Gaffer', 'Grip', 'Production Design', 'Costume Design', 'Makeup', 'Hair Styling', 'Steadicam',
  'Drone Piloting', 'Underwater Cinematography', 'Rotoscoping', 'Tracking', 'Matte Painting',
  'Green Screen', 'Chroma Keying', 'Color Correction', 'Grading', 'Audio Mixing', 'Music Composition'
];

const CLIENT_SUGGESTIONS = [
  'Nike', 'Apple', 'Google', 'Coca-Cola', 'BMW', 'Sony', 'Netflix', 'Amazon', 'Meta',
  'Adidas', 'Spotify', 'Instagram', 'YouTube', 'TikTok', 'Vimeo', 'Paramount', 'Disney',
  'HBO', 'Warner Bros', 'Universal', 'DreamWorks', 'Pixar', 'Marvel', 'DC', 'Fox',
  'Porsche', 'Mercedes', 'Tesla', 'Audi', 'Lamborghini', 'Rolls Royce', 'Rolex', 'Louis Vuitton',
  'Gucci', 'Hermès', 'Chanel', 'Dior', 'Prada', 'Burberry', 'Versace', 'Balenciaga',
  'Givenchy', 'Fendi', 'Celine', 'Saint Laurent', 'Valentino', 'Dolce Gabbana', 'Armani'
];

const PROJECT_TYPE_SUGGESTIONS = [
  'Branded Content', 'Commercials', 'Music Videos', 'Documentaries', 'Feature Films',
  'Corporate Videos', 'Social Media', 'Explainer Videos', 'Campaigns', 'Viral Content',
  'Short Films', 'Editorials', 'Fashion Films', 'Product Photography', 'Fashion Shows',
  'Beauty Campaigns', 'Luxury Goods', 'Automotive', 'Real Estate', 'Travel Films',
  'Event Coverage', 'Weddings', 'Sports', 'Fitness', 'Gaming Content', 'Animation',
  'Motion Graphics', 'Graphic Design', 'Web Design', 'App Design', 'UX/UI', 'Photo Editing',
  'Photo Retouching', 'Podcast Production', 'Video Podcast', 'Live Streaming', 'Virtual Events'
];

const LANGUAGE_SUGGESTIONS = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Swedish',
  'Danish', 'Norwegian', 'Finnish', 'Polish', 'Russian', 'Japanese', 'Mandarin', 'Korean',
  'Hindi', 'Arabic', 'Turkish', 'Greek', 'Hebrew', 'Thai', 'Vietnamese', 'Indonesian'
];

const COUNTRY_SUGGESTIONS = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain',
  'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Poland',
  'Japan', 'South Korea', 'China', 'Hong Kong', 'Singapore', 'India', 'Brazil', 'Mexico',
  'Argentina', 'Chile', 'Colombia', 'Thailand', 'Vietnam', 'Indonesia', 'Philippines',
  'Malaysia', 'UAE', 'Saudi Arabia', 'Turkey', 'Greece', 'Portugal', 'Austria', 'Czech Republic'
];

export default function AboutSection({ artist, endorsements, onUpdate }) {
  const [bio, setBio] = useState(artist?.bio || '');
  const [editingBio, setEditingBio] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  
  const [skills, setSkills] = useState(artist?.skills_experience?.map(s => s.skill) || []);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  
  const [clients, setClients] = useState(artist?.past_clients || []);
  const [newClient, setNewClient] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [editingClients, setEditingClients] = useState(false);
  
  const [projectTypes, setProjectTypes] = useState(artist?.project_specialties || []);
  const [newProjectType, setNewProjectType] = useState('');
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
  const [editingProjects, setEditingProjects] = useState(false);

  const [languages, setLanguages] = useState(artist?.languages_spoken || []);
  const [newLanguage, setNewLanguage] = useState('');
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);
  const [editingLanguages, setEditingLanguages] = useState(false);

  const [countries, setCountries] = useState(artist?.countries_worked || []);
  const [newCountry, setNewCountry] = useState('');
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [editingCountries, setEditingCountries] = useState(false);

  const [visitedCountries, setVisitedCountries] = useState(artist?.visited_countries || []);
  const [newVisitedCountry, setNewVisitedCountry] = useState('');
  const [showVisitedSuggestions, setShowVisitedSuggestions] = useState(false);
  const [editingVisited, setEditingVisited] = useState(false);

  const groupedEndorsements = endorsements.reduce((acc, e) => {
    if (!acc[e.skill]) acc[e.skill] = [];
    acc[e.skill].push(e);
    return acc;
  }, {});

  const generateBioWithAI = async () => {
    setBioLoading(true);
    try {
      const skillsList = skills.join(', ');
      const clientsList = clients.join(', ');
      const specialties = projectTypes.join(', ');
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a professional, compelling bio for a creative professional with the following:
- Skills: ${skillsList || 'Not specified'}
- Past clients: ${clientsList || 'Not specified'}
- Specialties: ${specialties || 'Not specified'}

Make it concise (2-3 sentences), engaging, and professional. It should highlight their expertise and unique value.`,
        response_json_schema: {
          type: 'object',
          properties: {
            bio: { type: 'string' }
          }
        }
      });
      
      setBio(result.bio);
    } catch (err) {
      console.error('Error generating bio:', err);
    } finally {
      setBioLoading(false);
    }
  };

  const addSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addClient = (client) => {
    if (client && !clients.includes(client)) {
      setClients([...clients, client]);
      setNewClient('');
    }
  };

  const removeClient = (client) => {
    setClients(clients.filter(c => c !== client));
  };

  const addProjectType = (type) => {
    if (type && !projectTypes.includes(type)) {
      setProjectTypes([...projectTypes, type]);
      setNewProjectType('');
    }
  };

  const removeProjectType = (type) => {
    setProjectTypes(projectTypes.filter(t => t !== type));
  };

  const filteredSkillSuggestions = SKILL_SUGGESTIONS.filter(s => 
    s.toLowerCase().includes(newSkill.toLowerCase()) && !skills.includes(s)
  );

  const filteredClientSuggestions = CLIENT_SUGGESTIONS.filter(c =>
    c.toLowerCase().includes(newClient.toLowerCase()) && !clients.includes(c)
  );

  const filteredProjectSuggestions = PROJECT_TYPE_SUGGESTIONS.filter(p =>
    p.toLowerCase().includes(newProjectType.toLowerCase()) && !projectTypes.includes(p)
  );

  const filteredLanguageSuggestions = LANGUAGE_SUGGESTIONS.filter(l =>
    l.toLowerCase().includes(newLanguage.toLowerCase()) && !languages.includes(l)
  );

  const filteredCountrySuggestions = COUNTRY_SUGGESTIONS.filter(c =>
    c.toLowerCase().includes(newCountry.toLowerCase()) && !countries.includes(c)
  );

  const filteredVisitedSuggestions = COUNTRY_SUGGESTIONS.filter(c =>
    c.toLowerCase().includes(newVisitedCountry.toLowerCase()) && !visitedCountries.includes(c)
  );

  const addLanguage = (lang) => {
    if (lang && !languages.includes(lang)) {
      setLanguages([...languages, lang]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const addCountry = (country) => {
    if (country && !countries.includes(country)) {
      setCountries([...countries, country]);
      setNewCountry('');
    }
  };

  const removeCountry = (country) => {
    setCountries(countries.filter(c => c !== country));
  };

  const addVisitedCountry = (country) => {
    if (country && !visitedCountries.includes(country)) {
      setVisitedCountries([...visitedCountries, country]);
      setNewVisitedCountry('');
    }
  };

  const removeVisitedCountry = (country) => {
    setVisitedCountries(visitedCountries.filter(c => c !== country));
  };

  return (
    <div className="grid grid-cols-3 gap-12">
      {/* Left Column - Main Info */}
      <div className="col-span-2 space-y-8">
        {/* Bio Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">About</h3>
            {!editingBio && (
              <button
                onClick={() => setEditingBio(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none h-24"
              />
              <div className="flex gap-2">
                <Button
                    onClick={async () => {
                      if (artist) {
                        await Artist.update(artist.id, { bio });
                      }
                      setEditingBio(false);
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
            <p className="text-gray-800 leading-relaxed">
              {bio || 'Add a professional bio to tell others about your work and expertise.'}
            </p>
          )}
        </div>

        {/* Skills with Endorsements - Editable */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Skills</h3>
            {!editingSkills && (
              <button
                onClick={() => setEditingSkills(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingSkills ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill) => (
                  <div key={skill} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full text-sm">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onFocus={() => setShowSkillSuggestions(true)}
                    placeholder="Add a skill..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  />
                  <Button
                    onClick={() => addSkill(newSkill)}
                    size="sm"
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showSkillSuggestions && filteredSkillSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredSkillSuggestions.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => {
                          addSkill(skill);
                          setShowSkillSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={async () => {
                  if (artist) {
                    const skillsData = skills.map(s => ({ skill: s, years: 0 }));
                    await Artist.update(artist.id, { skills_experience: skillsData });
                  }
                  setEditingSkills(false);
                }}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? skills.map((skill) => {
                const endorsementCount = groupedEndorsements[skill]?.length || 0;
                return (
                  <button
                    key={skill}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-800 hover:border-gray-300 transition-colors flex items-center gap-2"
                  >
                    {skill}
                    {endorsementCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <ThumbsUp className="w-3 h-3" />
                        {endorsementCount}
                      </span>
                    )}
                  </button>
                );
              }) : (
                <p className="text-gray-500 text-sm">No skills added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>

        {/* Past Clients - Editable */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Past Clients</h3>
            {!editingClients && (
              <button
                onClick={() => setEditingClients(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
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
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 relative group">
                      {client.slice(0, 2).toUpperCase()}
                      <button
                        onClick={() => removeClient(client)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  />
                  <Button
                    onClick={() => addClient(newClient)}
                    size="sm"
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showClientSuggestions && filteredClientSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredClientSuggestions.map((client) => (
                      <button
                        key={client}
                        onClick={() => {
                          addClient(client);
                          setShowClientSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                      >
                        {client}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={async () => {
                  if (artist) {
                    await Artist.update(artist.id, { past_clients: clients });
                  }
                  setEditingClients(false);
                }}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
              </div>
              ) : (
              <div className="flex flex-wrap gap-3">
              {clients.length > 0 ? clients.map((client) => (
                <div key={client} className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" title={client}>
                  {client.slice(0, 2).toUpperCase()}
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No clients added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>

        {/* Project Types - Editable */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Project Types</h3>
            {!editingProjects && (
              <button
                onClick={() => setEditingProjects(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
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
                  <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full text-sm">
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  />
                  <Button
                    onClick={() => addProjectType(newProjectType)}
                    size="sm"
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showProjectSuggestions && filteredProjectSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredProjectSuggestions.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          addProjectType(type);
                          setShowProjectSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={async () => {
                  if (artist) {
                    await Artist.update(artist.id, { project_specialties: projectTypes });
                  }
                  setEditingProjects(false);
                }}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
              </div>
              ) : (
              <div className="flex flex-wrap gap-2">
              {projectTypes.length > 0 ? projectTypes.map((type) => (
                <span key={type} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-800">
                  {type}
                </span>
              )) : (
                <p className="text-gray-500 text-sm">No project types added yet. Click Edit to get started.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Contact & Languages */}
      <div className="space-y-8">
        {/* Languages - Editable */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Languages</h3>
            {!editingLanguages && (
              <button
                onClick={() => setEditingLanguages(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
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
                  <div key={lang} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full text-sm">
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  />
                  <Button onClick={() => addLanguage(newLanguage)} size="sm" className="bg-black text-white hover:bg-gray-800">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showLanguageSuggestions && filteredLanguageSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredLanguageSuggestions.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          addLanguage(lang);
                          setShowLanguageSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={async () => {
                if (artist) {
                  await Artist.update(artist.id, { languages_spoken: languages });
                }
                setEditingLanguages(false);
              }} className="w-full bg-black text-white hover:bg-gray-800">
                <Check className="w-4 h-4 mr-1" /> Done
              </Button>
              </div>
              ) : (
              <div className="flex flex-wrap gap-2">
              {languages.length > 0 ? languages.map((lang) => (
                <span key={lang} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-800">
                  {lang}
                </span>
              )) : <p className="text-gray-500 text-sm">No languages added yet</p>}
            </div>
          )}
        </div>

        {/* Countries Worked - Editable */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Countries Worked In</h3>
            {!editingCountries && (
              <button
                onClick={() => setEditingCountries(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingCountries ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {countries.map((c) => (
                  <div key={c} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full text-sm">
                    {c}
                    <button onClick={() => removeCountry(c)} className="hover:opacity-70">
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
                    placeholder="Add a country..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  />
                  <Button onClick={() => addCountry(newCountry)} size="sm" className="bg-black text-white hover:bg-gray-800">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showCountrySuggestions && filteredCountrySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredCountrySuggestions.map((country) => (
                      <button
                        key={country}
                        onClick={() => {
                          addCountry(country);
                          setShowCountrySuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={async () => {
                if (artist) {
                  await Artist.update(artist.id, { countries_worked: countries });
                }
                setEditingCountries(false);
              }} className="w-full bg-black text-white hover:bg-gray-800">
                <Check className="w-4 h-4 mr-1" /> Done
              </Button>
              </div>
              ) : (
              <div className="flex flex-wrap gap-2">
              {countries.length > 0 ? countries.map((c) => (
                <span key={c} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-800">
                  {c}
                </span>
              )) : <p className="text-gray-500 text-sm">No countries added yet</p>}
            </div>
          )}
        </div>

        {/* Visited Countries - Editable */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Visited Countries</h3>
            {!editingVisited && (
              <button
                onClick={() => setEditingVisited(true)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {editingVisited ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {visitedCountries.map((c) => (
                  <div key={c} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full text-sm">
                    {c}
                    <button onClick={() => removeVisitedCountry(c)} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVisitedCountry}
                    onChange={(e) => setNewVisitedCountry(e.target.value)}
                    onFocus={() => setShowVisitedSuggestions(true)}
                    placeholder="Add a country..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  />
                  <Button onClick={() => addVisitedCountry(newVisitedCountry)} size="sm" className="bg-black text-white hover:bg-gray-800">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showVisitedSuggestions && filteredVisitedSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredVisitedSuggestions.map((country) => (
                      <button
                        key={country}
                        onClick={() => {
                          addVisitedCountry(country);
                          setShowVisitedSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={async () => {
                if (artist) {
                  await Artist.update(artist.id, { visited_countries: visitedCountries });
                }
                setEditingVisited(false);
              }} className="w-full bg-black text-white hover:bg-gray-800">
                <Check className="w-4 h-4 mr-1" /> Done
              </Button>
              </div>
              ) : (
              <div className="flex flex-wrap gap-2">
              {visitedCountries.length > 0 ? visitedCountries.map((c) => (
                <span key={c} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-800">
                  {c}
                </span>
              )) : <p className="text-gray-500 text-sm">No countries added yet</p>}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Contact Info (Editable) */}
      <div className="space-y-8">
        {/* Contact Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Contact</h3>
            <p className="text-xs text-gray-500">Edit in Settings</p>
          </div>
          <div className="space-y-3">
            {artist?.email && <p className="text-sm text-gray-800"><strong>Email:</strong> <a href={`mailto:${artist.email}`} className="text-gray-600 hover:text-gray-900">{artist.email}</a></p>}
            {artist?.phone && <p className="text-sm text-gray-800"><strong>Phone:</strong> {artist.phone}</p>}
            {artist?.website && <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-gray-600 block"><Globe className="w-4 h-4 inline mr-2" />{artist.website}</a>}
          </div>
        </div>

        {/* Social Media */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Socials</h3>
            <p className="text-xs text-gray-500">Edit in Settings</p>
          </div>
          <div className="space-y-2">
            {artist?.instagram && <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-gray-600 block"><Instagram className="w-4 h-4 inline mr-2" />@{artist.instagram.split('/').pop()}</a>}
            {artist?.linkedin && <a href={artist.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-gray-600 block"><Linkedin className="w-4 h-4 inline mr-2" />{artist.linkedin.split('/').pop()}</a>}
            {artist?.vimeo && <a href={artist.vimeo} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-gray-600 block">🎬 Vimeo</a>}
            {artist?.imdb && <a href={artist.imdb} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-gray-600 block">🎭 IMDb</a>}
          </div>
        </div>
      </div>
    </div>
  );
}