import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { PRODUCTION_POSITIONS } from './positions';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const PROJECT_TYPES = [
  'Commercial',
  'E-Commerce Shoot',
  'Music Video',
  'Documentary',
  'Short Film',
  'Feature Film',
  'Corporate Video',
  'Social Media Content',
  'Branded Content',
  'Web Series',
  'TV Series',
  'Pilot Episode',
  'Reality TV',
  'Live Event Coverage',
  'Concert Film',
  'Fashion Film',
  'Behind The Scenes',
  'Product Photography',
  'Editorial Photography',
  'Wedding Film',
  'Animation',
  '3D Animation',
  'Motion Graphics',
  'VFX Heavy Project',
  'Green Screen Shoot',
  'Studio Shoot',
  'Location Shoot',
  'Drone Footage',
  'Underwater Shoot',
  'Time-Lapse',
  'Stop Motion',
  'Experimental Film',
  'Art Installation',
  'Theater Recording',
  'Podcast Video',
  'Educational Content',
  'Training Video',
  'Explainer Video',
  'Testimonial Video',
  'Interview',
  'Q&A Session',
];

const SKILLS_DATABASE = [
  // Camera Equipment
  'ARRI Alexa', 'ARRI Alexa Mini', 'ARRI Alexa LF', 'RED Komodo', 'RED Monstro', 'RED Raptor',
  'Sony FX6', 'Sony FX9', 'Sony Venice', 'Canon C300', 'Canon C500', 'Canon Cinema EOS',
  'Blackmagic URSA', 'Blackmagic Pocket', 'Panasonic Varicam', 'Panasonic Lumix',
  'DJI Ronin', 'DJI Ronin 4D', 'Steadicam', 'Drone Operation', 'DJI Inspire', 'GoPro',
  
  // Lenses
  'Zeiss Master Prime', 'Zeiss Supreme', 'Cooke S4', 'Cooke Anamorphic', 'Sigma Cine',
  'Canon CN-E', 'Canon L Series', 'Anamorphic Lenses', 'Vintage Lenses', 'Prime Lenses',
  
  // Lighting Equipment
  'ARRI SkyPanel', 'ARRI M-Series', 'Aputure 600d', 'Aputure Nova', 'Kino Flo',
  'LED Panels', 'HMI Lighting', 'Tungsten Lighting', 'Natural Light', 'Studio Lighting',
  'Practical Lighting', 'RGB Lighting', 'Lighting Design', 'Gaffer Experience',
  
  // Grip Equipment
  'Dolly', 'Technocrane', 'Jib', 'Slider', 'Track & Dolly', 'C-Stand', 'Flags & Diffusion',
  
  // Post-Production Software
  'Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'Avid Media Composer',
  'After Effects', 'Photoshop', 'Lightroom', 'Illustrator', 'InDesign',
  
  // 3D & VFX Software
  'Cinema 4D', 'Blender', 'Maya', 'Houdini', '3ds Max', 'Nuke', 'Flame', 'Fusion',
  'Unreal Engine', 'Unity', 'Substance Painter', 'ZBrush', 'Redshift', 'Octane',
  
  // Audio Software & Equipment
  'Pro Tools', 'Logic Pro', 'Ableton Live', 'Cubase', 'FL Studio', 'Reaper',
  'Sound Design', 'Audio Mixing', 'Audio Mastering', 'Foley Recording',
  'Boom Operation', 'Location Sound', 'ADR', 'Dialogue Editing',
  
  // Production Skills
  'Directing', 'Cinematography', 'Script Breakdown', 'Storyboarding', 'Shot Listing',
  'Casting', 'Location Scouting', 'Production Management', 'Line Producing',
  'Unit Production Manager', 'Production Coordination', 'AD Experience',
  
  // Camera Department
  '1st AC', '2nd AC', 'Camera Operator', 'DIT', 'Data Management', 'Focus Pulling',
  
  // Art Department
  'Production Design', 'Set Design', 'Art Direction', 'Set Decoration',
  'Costume Design', 'Wardrobe Styling', 'Makeup Artist', 'Hair Styling',
  'Prop Making', 'Prop Master', 'Scenic Painting',
  
  // Editorial
  'Editing', 'Color Grading', 'Color Correction', 'Conform', 'Online Editing',
  'Offline Editing', 'Assembly', 'Rough Cut', 'Fine Cut',
  
  // VFX & Motion Graphics
  'VFX Supervision', 'Compositing', 'Rotoscoping', 'Tracking', 'Match Moving',
  'Green Screen', 'Chroma Key', 'Motion Graphics', 'Title Design', 'Animation',
  '2D Animation', '3D Animation', 'Character Animation', 'Motion Capture',
  
  // Technical Skills
  '4K', '6K', '8K', 'HDR', 'Log Profiles', 'LUTs', 'RAW Recording', 'ProRes',
  'H.264', 'H.265', 'Multicam', 'Timecode Sync', 'Live Streaming', 'Broadcast',
  
  // Shooting Styles
  'Cinematic', 'Documentary Style', 'Handheld', 'Gimbal Work', 'Aerial Photography',
  'Product Photography', 'Portrait Photography', 'Fashion Photography', 'Lifestyle',
  'Time-Lapse', 'Slow Motion', 'Hyperlapse', 'Stop Motion',
  
  // Production Types
  'Commercial Production', 'Music Video', 'Documentary', 'Feature Film', 'Short Film',
  'Corporate Video', 'Event Coverage', 'Wedding Videography', 'Social Media Content',
  'Branded Content', 'Web Series', 'TV Production',
];

export default function JobPostingModal({ isOpen, onClose, onSubmit, user }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    position: '',
    location: '',
    dates: '',
    date_from: '',
    date_till: '',
    project_type: '',
    title: '',
    description: '',
    job_type: 'paid_gig',
    pay_type: 'fixed',
    rate: '',
    frequency: 'flat_fee',
    skills: [],
    image_url: ''
  });
  const [positionSearch, setPositionSearch] = useState('');
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProjectTypeDropdown, setShowProjectTypeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showExtractInput, setShowExtractInput] = useState(false);
  const [extractUrl, setExtractUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  if (!isOpen) return null;

  const filteredPositions = PRODUCTION_POSITIONS.filter(pos =>
    pos.label.toLowerCase().includes(positionSearch.toLowerCase())
  ).slice(0, 10);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const jobData = {
      title: `${formData.position} needed for a ${formData.project_type} in ${formData.location} starting ${formData.dates}`,
      description: formData.description || 'I want to have ...',
      short_description: formData.description?.substring(0, 100) || '',
      client_name: user?.full_name || 'Client',
      client_email: user?.email || '',
      client_avatar_url: '',
      location: formData.location,
      budget_min: parseFloat(formData.rate) || 0,
      budget_max: parseFloat(formData.rate) || 0,
      budget_type: formData.pay_type,
      roles_needed: [formData.position],
      skills_required: formData.skills,
      project_types: [formData.project_type],
      status: 'open',
      posted_at: new Date().toISOString()
    };
    onSubmit(jobData);
    setShowSuccessNotification(true);
    setTimeout(() => {
      setShowSuccessNotification(false);
      onClose();
    }, 3000);
  };

  const handleSaveDraft = () => {
    console.log('Draft saved:', formData);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ]
  };

  return (
    <>
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slideDown">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-green-500 px-6 py-4 flex items-center gap-4 min-w-[400px]">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Job posted successfully!</h3>
              <p className="text-sm text-gray-600">Your job is now live and visible to creators</p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {step === 1 && 'Step 1 of 3: Create a job post'}
              {step === 2 && 'Step 2 of 3: Provide job details'}
              {step === 3 && 'Step 3/3: Review your job'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-sm">
                <p className="mb-6">I'm looking to hire:</p>
                
                {/* Position field with autocomplete */}
                <div className="mb-6 relative">
                  <div className="text-2xl font-normal flex items-center gap-3">
                    a 
                    <input
                      type="text"
                      value={positionSearch}
                      onChange={(e) => {
                        setPositionSearch(e.target.value);
                        setShowPositionDropdown(true);
                      }}
                      onFocus={() => setShowPositionDropdown(true)}
                      placeholder="Position"
                      className="flex-1 px-3 py-1 border-b-2 border-gray-400 font-semibold text-gray-700 focus:border-gray-600 outline-none bg-transparent"
                    />
                  </div>
                  {showPositionDropdown && filteredPositions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {filteredPositions.map((pos) => (
                        <button
                          key={pos.value}
                          onClick={() => {
                            setFormData({ ...formData, position: pos.label });
                            setPositionSearch(pos.label);
                            setShowPositionDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-sm"
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location field */}
                <div className="mb-6 relative">
                  <div className="text-2xl font-normal flex items-center gap-3">
                    in 
                    <input
                      type="text"
                      value={formData.location}
                      onChange={async (e) => {
                        const query = e.target.value;
                        setFormData({ ...formData, location: query });
                        if (query.length > 2) {
                          try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${query}&format=json&limit=5`);
                            const data = await response.json();
                            setLocationSuggestions(data.filter(item => item.type === 'city' || item.type === 'administrative'));
                          } catch (err) {
                            console.error('Location search error:', err);
                          }
                        }
                      }}
                      onFocus={() => setShowLocationDropdown(true)}
                      placeholder="Location"
                      className="flex-1 px-3 py-1 border-b-2 border-gray-400 font-semibold text-gray-700 focus:border-gray-600 outline-none bg-transparent"
                    />
                  </div>
                  {showLocationDropdown && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {locationSuggestions.map((loc, idx) => {
                        const addressParts = loc.display_name.split(', ');
                        const city = loc.name || addressParts[0];
                        const country = addressParts[addressParts.length - 1];
                        const displayText = `${city}, ${country}`;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setFormData({ ...formData, location: displayText });
                              setShowLocationDropdown(false);
                              setLocationSuggestions([]);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-sm"
                          >
                            {displayText}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Dates field */}
                <div className="mb-6 relative">
                  <div className="text-2xl font-normal flex items-center gap-3">
                    on 
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={formData.dates}
                        onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        placeholder="Dates"
                        className="w-full px-3 py-1 border-b-2 border-gray-400 font-semibold text-gray-700 focus:border-gray-600 outline-none cursor-pointer bg-transparent"
                        readOnly
                      />
                      <CalendarIcon className="absolute right-0 top-1 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  {showDatePicker && (
                    <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-96">
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">From</label>
                        <input
                          type="date"
                          value={formData.date_from}
                          onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Till</label>
                        <input
                          type="date"
                          value={formData.date_till}
                          onChange={(e) => setFormData({ ...formData, date_till: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setFormData({ ...formData, dates: 'Dates are flexible', date_from: '', date_till: '' });
                            setShowDatePicker(false);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        >
                          Dates are flexible
                        </button>
                        <button
                          onClick={() => {
                            if (formData.date_from && formData.date_till) {
                              setFormData({ ...formData, dates: `${formData.date_from} - ${formData.date_till}` });
                            }
                            setShowDatePicker(false);
                          }}
                          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Project type field */}
                <div className="mb-6 relative">
                  <div className="text-2xl font-normal flex items-center gap-3">
                    for 
                    <input
                      type="text"
                      value={formData.project_type}
                      onChange={(e) => {
                        setFormData({ ...formData, project_type: e.target.value });
                        setShowProjectTypeDropdown(true);
                      }}
                      onFocus={() => setShowProjectTypeDropdown(true)}
                      placeholder="Project type"
                      className="flex-1 px-3 py-1 border-b-2 border-gray-400 font-semibold text-gray-700 focus:border-gray-600 outline-none bg-transparent"
                    />
                  </div>
                  {showProjectTypeDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {PROJECT_TYPES.filter(type => type.toLowerCase().includes(formData.project_type.toLowerCase())).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setFormData({ ...formData, project_type: type });
                          setShowProjectTypeDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-sm"
                      >
                        {type}
                      </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Describe this job (optional):</label>
                    {!showExtractInput ? (
                      <button
                        type="button"
                        onClick={() => setShowExtractInput(true)}
                        className="text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-full text-blue-700 border border-blue-200"
                      >
                        ✨ Extract from URL
                      </button>
                    ) : null}
                  </div>
                  
                  {showExtractInput && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <label className="block text-xs font-medium text-blue-900 mb-2">
                        Paste a website URL to extract project info from:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={extractUrl}
                          onChange={(e) => setExtractUrl(e.target.value)}
                          placeholder="https://example.com/project-details"
                          className="flex-1 px-4 py-2 border border-blue-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!extractUrl) {
                              alert('Please enter a URL');
                              return;
                            }
                            if (!formData.position || !formData.location || !formData.project_type) {
                              alert('Please fill in position, location, and project type first');
                              return;
                            }
                            setIsExtracting(true);
                            try {
                              const response = await base44.integrations.Core.InvokeLLM({
                                prompt: `Analyze this website: ${extractUrl}

Based on the website content, create a professional job description for hiring a ${formData.position} in ${formData.location} for a ${formData.project_type} project.

Include:
• Project Overview (brief description of what the project is about based on website)
• Key Responsibilities for the ${formData.position}
• Required Skills & Experience
• Deliverables Expected

Format using HTML for better readability:
- Use <strong>text</strong> for bold headings
- Use bullet points with •
- Keep paragraphs clear and concise
- DO NOT use ** or markdown, use actual HTML tags

Write in a professional, direct tone.`,
                                add_context_from_internet: true
                              });
                              setFormData({ ...formData, description: response });
                              setShowExtractInput(false);
                              setExtractUrl('');
                            } catch (err) {
                              console.error('Extract error:', err);
                              alert('Failed to extract from URL: ' + err.message);
                            } finally {
                              setIsExtracting(false);
                            }
                          }}
                          disabled={isExtracting}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {isExtracting ? 'Extracting...' : 'Extract'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowExtractInput(false);
                            setExtractUrl('');
                          }}
                          className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!showExtractInput && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.position || !formData.location || !formData.project_type) {
                          alert('Please fill in position, location, and project type first');
                          return;
                        }
                        setIsExtracting(true);
                        try {
                          const response = await base44.integrations.Core.InvokeLLM({
                            prompt: `Create a professional job description for hiring a ${formData.position} in ${formData.location} for a ${formData.project_type} project. The dates are: ${formData.dates || 'flexible'}.

Include:
• Project Overview
• Key Responsibilities for the ${formData.position}
• Required Skills & Experience
• Deliverables Expected

Format using HTML for better readability:
- Use <strong>text</strong> for bold headings
- Use bullet points with •
- Keep paragraphs clear and concise
- DO NOT use ** or markdown, use actual HTML tags

Write in a professional, direct tone.`
                          });
                          setFormData({ ...formData, description: response });
                        } catch (err) {
                          console.error('Generate error:', err);
                          alert('Failed to generate description: ' + err.message);
                        } finally {
                          setIsExtracting(false);
                        }
                      }}
                      disabled={isExtracting}
                      className="w-full mb-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm hover:from-purple-600 hover:to-blue-600 disabled:bg-gray-400"
                    >
                      {isExtracting ? '✨ Generating...' : '✨ Generate with AI (no URL)'}
                    </button>
                  )}
                  
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-purple-400">
                    <ReactQuill
                      theme="snow"
                      value={formData.description}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      modules={quillModules}
                      placeholder="Use 'Extract from URL' for website-based projects, or 'Generate with AI' for custom descriptions"
                      className="bg-white"
                      style={{ minHeight: '200px' }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {(formData.description?.replace(/<[^>]*>/g, '') || '').length} / 5000
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Job Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Job title</label>
                <input
                  type="text"
                  value={`${formData.position} needed for a ${formData.project_type} in ${formData.location} starting ${formData.dates}`}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const result = await base44.integrations.Core.UploadFile({ file });
                        setFormData({ ...formData, image_url: result.file_url });
                      } catch (err) {
                        console.error('Upload error:', err);
                        alert('Failed to upload image');
                      }
                    }
                  }}
                  className="hidden"
                  id="job-image-upload"
                />
                <label
                  htmlFor="job-image-upload"
                  className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 cursor-pointer overflow-hidden bg-gray-50"
                >
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Job" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">+</span>
                      <span className="text-sm">Upload image</span>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Job type</label>
                <div className="flex gap-3">
                  {[
                    { value: 'paid_gig', label: 'Paid gig' },
                    { value: 'full_time', label: 'Full-time' },
                    { value: 'part_time', label: 'Part-time' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, job_type: type.value })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.job_type === type.value
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Pay type</label>
                <div className="flex gap-3">
                  {[
                    { value: 'fixed', label: 'Fixed' },
                    { value: 'range', label: 'Range' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, pay_type: type.value })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.pay_type === type.value
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rate</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">€</span>
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      placeholder="Add rate"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:border-purple-400 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:border-purple-400 outline-none"
                  >
                    <option value="flat_fee">Flat fee</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-2">Skills (optional)</label>
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Type to search skills (e.g., Blender, ARRI Alexa, After Effects)..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:border-gray-400 outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      setFormData({ ...formData, skills: [...formData.skills, e.target.value] });
                      setSkillSearch('');
                    }
                  }}
                />
                {skillSearch && SKILLS_DATABASE.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {SKILLS_DATABASE.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).slice(0, 10).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => {
                          if (!formData.skills.includes(skill)) {
                            setFormData({ ...formData, skills: [...formData.skills, skill] });
                          }
                          setSkillSearch('');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-sm"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {skill}
                        <button
                          onClick={() => setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== idx) })}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4">
                  {formData.position} needed for a {formData.project_type} in {formData.location} starting {formData.dates}
                </h3>
                
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Job description</h4>
                  <div className="text-sm text-gray-800 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formData.description || 'I want to have ...' }} />
                  </div>

                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Job type</h4>
                  <p className="text-sm text-gray-800 capitalize">{formData.job_type.replace('_', ' ')}</p>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Pay type</h4>
                  <p className="text-lg font-bold text-black">€{formData.rate} EUR</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <Button
            onClick={step === 1 ? onClose : handleBack}
            variant="ghost"
            className="text-gray-600"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="border-gray-300"
            >
              Save draft
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!formData.position || !formData.location || !formData.dates || !formData.project_type}
                className="bg-black text-white hover:bg-gray-800"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-black text-white hover:bg-gray-800"
              >
                Post job
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}