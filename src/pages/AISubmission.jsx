import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateProductionPlan, regenerateSection } from '../lib/aiService'
import { Film, Music, Clapperboard, Video, Briefcase, Building, Calendar, Package, Share, Sparkles as SparklesIcon, CheckCircle2, Loader } from 'lucide-react'

/* ─── ICONS ─────────────────────────────────────────────────────────────── */
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function AlertCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
function RefreshIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}
function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function EditIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
function PencilIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}
function PackageIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}
function CalendarIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function CameraIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
function LightbulbIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  )
}
function MicIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}
function PinIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function UsersIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function FileTextIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

/* ─── CONSTANTS ─────────────────────────────────────────────────────────── */
const STEPS = [
  'Overview & Brief',
  'Budget Breakdown',
  'Roles & Team',
  'Screening Questions',
  'Locations & Places',
  'Technical Requirements',
  'Production Schedule',
  'Creative Direction',
  'Deliverables',
]

/* ─── SHARED UI ─────────────────────────────────────────────────────────── */
function PendingBadge({ isApproved = false }) {
  return (
    <span style={{ background: isApproved ? '#d1fae5' : '#fef3c7', color: isApproved ? '#065f46' : '#92400e', fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}>
      {isApproved ? 'Approved' : 'Pending Review'}
    </span>
  )
}

function SuggestionBox({ label = 'Suggestions (optional)', placeholder = "e.g., 'Make it more professional', 'Focus on budget-friendly approach', 'Add more detail about locations'", onRegenerate }) {
  const [suggestion, setSuggestion] = useState('')

  const handleRegenerate = () => {
    if (onRegenerate && suggestion.trim()) {
      onRegenerate(suggestion)
      setSuggestion('')
    }
  }

  return (
    <div style={{ background: '#f0fdf9', border: '1px solid #ccfce7', borderRadius: 10, padding: '18px 20px', marginTop: 24 }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 10 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <textarea
          placeholder={placeholder}
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          style={{ width: '100%', minHeight: 80, border: '1px solid #d1fae5', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#444', resize: 'vertical', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        <button 
          onClick={handleRegenerate}
          disabled={!suggestion.trim()}
          style={{ position: 'absolute', bottom: 10, right: 10, background: '#111', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: suggestion.trim() ? 'pointer' : 'not-allowed', opacity: suggestion.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshIcon size={12} /> Regenerate
        </button>
      </div>
    </div>
  )
}

function RequestModBox({ placeholder }) {
  return (
    <div style={{ background: '#f0fdf9', border: '1px solid #ccfce7', borderRadius: 10, padding: '18px 20px', marginTop: 24 }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 10 }}>Request Modifications</div>
      <div style={{ position: 'relative' }}>
        <textarea
          placeholder={placeholder}
          style={{ width: '100%', minHeight: 80, border: '1px solid #d1fae5', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#444', resize: 'vertical', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        <button style={{ position: 'absolute', bottom: 10, right: 10, background: '#111', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshIcon size={12} /> Regenerate
        </button>
      </div>
    </div>
  )
}

function Card({ children, highlight = false }) {
  return (
    <div style={{ background: highlight ? '#f0fdf9' : '#fff', border: `1px solid ${highlight ? '#6ee7b7' : '#e5e7eb'}`, borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
      {children}
    </div>
  )
}

/* ─── STEP CONTENT COMPONENTS ───────────────────────────────────────────── */

function StepOverviewBrief({ data, projectCategory, onRegenerate, loading, isApproved, onCategoryChange }) {
  if (!data) return null
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(data.introduction || '')
  
  const projectCategories = [
    { value: 'commercial', label: 'Commercial', icon: Film },
    { value: 'music_video', label: 'Music Video', icon: Music },
    { value: 'short_film', label: 'Short Film', icon: Clapperboard },
    { value: 'documentary', label: 'Documentary', icon: Video },
    { value: 'branded_content', label: 'Branded Content', icon: Briefcase },
    { value: 'corporate_video', label: 'Corporate Video', icon: Building },
    { value: 'event_coverage', label: 'Event Coverage', icon: Calendar },
    { value: 'product_demo', label: 'Product Demo', icon: Package },
    { value: 'social_media', label: 'Social Media', icon: Share },
    { value: 'animation', label: 'Animation', icon: SparklesIcon }
  ]

  const handleCategorySelect = (categoryValue) => {
    setShowCategoryDropdown(false)
    if (onCategoryChange) {
      onCategoryChange(categoryValue)
    }
  }
  
  const handleSaveEdit = () => {
    setIsEditing(false)
    // Trigger regeneration with the edited content
    onRegenerate && onRegenerate(editedContent)
  }
  
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(data.introduction || '')
  }
  
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge isApproved={isApproved} />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Production Brief</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Comprehensive overview of the project</p>
      </div>

      {loading && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Generating Production Brief...</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>AI is analyzing your project requirements</div>
            </div>
          </div>
        </Card>
      )}

      {/* Initial Idea */}
      <Card>
        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 8 }}>INITIAL IDEA</div>
        </div>
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
          {data.initialIdea || 'Action-oriented creative directive will be generated by AI...'}
        </p>
      </Card>

      {/* Production Brief */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151' }}>PRODUCTION BRIEF</div>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                style={{ background: '#111', color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {(() => {
                  const selectedCategory = projectCategories.find(cat => cat.value === projectCategory)
                  const Icon = selectedCategory?.icon || Film
                  return <><Icon className="w-3 h-3" /><span>{selectedCategory?.label}</span></>
                })()}
              </button>
              {showCategoryDropdown && (
                <div
                  className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded shadow-lg z-[100] min-w-[150px]"
                  style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '4px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '150px', zIndex: 100 }}
                >
                  {projectCategories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleCategorySelect(cat.value)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <Icon size={12} />
                        <span>{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <EditIcon size={12} /> {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 14 }}>
          {isEditing ? (
            <div>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                style={{ width: '100%', minHeight: 120, border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px', fontSize: 13.5, color: '#374151', lineHeight: 1.75, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button 
                  onClick={handleSaveEdit}
                  style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
                <button 
                  onClick={handleCancelEdit}
                  style={{ padding: '8px 16px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.75 }}>
              <strong style={{ color: '#10b981' }}>INTRODUCTION</strong>{' '}
              {data.introduction || 'Strategic production brief will be generated by AI...'}
            </p>
          )}
        </div>
      </Card>

      {/* Project Type & Tags */}
      <Card>
        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 12 }}>PROJECT TYPE &amp; TAGS</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>MAIN CATEGORY</div>
            <button style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{projectCategory}</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>TAGS (UP TO 10)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(data.tags || []).length > 0 ? (data.tags || []).map(tag => (
                <span key={tag} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {tag} <XIcon size={10} />
                </span>
              )) : (
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Tags will be generated by AI...</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <SuggestionBox onRegenerate={onRegenerate} />
    </>
  )
}

function StepBudgetBreakdown({ data, projectCategory, onRegenerate, loading, isApproved }) {
  if (!data) return null
  const packages = data.packages || []

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge isApproved={isApproved} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '0 0 4px' }}>Budget Breakdown</h1>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Three package options with clear explanations</p>
          </div>
          <button style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 7, padding: '5px 12px', fontSize: 13, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <PencilIcon /> Edit
          </button>
        </div>
      </div>

      {loading && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Generating Budget Breakdown...</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>AI is calculating package options</div>
            </div>
          </div>
        </Card>
      )}

      {packages.length > 0 ? packages.map((pkg, idx) => (
        <Card key={idx} highlight={pkg.highlight}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: pkg.highlight ? '#d1fae5' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PackageIcon size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 4 }}>{pkg.name}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: pkg.highlight ? '#10b981' : '#111', marginBottom: 6 }}>{pkg.price}</div>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px', lineHeight: 1.6 }}>{pkg.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {pkg.breakdown && Object.entries(pkg.breakdown).map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: pkg.highlight ? '#10b981' : '#9ca3af', marginBottom: 2 }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: pkg.highlight ? '#10b981' : '#111' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )) : (
        <Card>
          <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            Budget packages will be generated by AI...
          </div>
        </Card>
      )}

      {data.reasoning && (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 8 }}>Budget Reasoning</div>
          <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
            {data.reasoning}
          </p>
        </Card>
      )}

      <SuggestionBox placeholder="e.g., 'Lower the costs', 'Increase premium package', 'Add more detail to explanations'" onRegenerate={onRegenerate} />
    </>
  )
}

function StepRolesTeam({ data, projectCategory, onRegenerate, loading, isApproved }) {
  const [activePackage, setActivePackage] = useState(0)
  const packages = data?.packages || []
  const roles = data?.roles || []

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge isApproved={isApproved} />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Roles &amp; Team</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Required talent and experience levels</p>
      </div>

      {loading && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Generating Team Structure...</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>AI is determining required roles</div>
            </div>
          </div>
        </Card>
      )}

      {/* Package tabs */}
      {packages.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${packages.length}, 1fr)`, gap: 12, marginBottom: 20 }}>
          {packages.map((pkg, i) => (
            <button key={i} onClick={() => setActivePackage(i)}
              style={{ padding: '14px', border: `2px solid ${activePackage === i ? '#10b981' : '#e5e7eb'}`, borderRadius: 10, background: '#fff', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{pkg.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{pkg.price}</div>
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            Team packages will be generated by AI...
          </div>
        </Card>
      )}

      {/* Team section */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UsersIcon size={16} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: '#374151' }}>
              {packages[activePackage]?.name || 'TEAM COMPOSITION'}
            </span>
          </div>
          <span style={{ background: '#111', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5 }}>
            {roles.length} professionals
          </span>
        </div>

        <div style={{ background: '#f0fdf9', border: '1px solid #d1fae5', borderRadius: 9, padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111' }}>Team Composition</div>
              <div style={{ fontSize: 12, color: '#10b981', marginTop: 3 }}>
                This package requires {roles.length} specialized professionals
              </div>
            </div>
            <span style={{ background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5 }}>
              {roles.length} professionals
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <UsersIcon size={14} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: '#9ca3af' }}>REQUIRED ROLES</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {roles.length > 0 ? roles.map((role, i) => (
            <div key={i} style={{ background: '#f0fdf9', border: '1px solid #d1fae5', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, color: '#111', fontWeight: 500 }}>
              {typeof role === 'string' ? role : role.name}
            </div>
          )) : (
            <div style={{ gridColumn: '1/-1', fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
              Roles will be generated by AI...
            </div>
          )}
        </div>
      </Card>

      <SuggestionBox placeholder="e.g., 'Need less experienced team', 'Add sound designer', 'Change to solo producer'" onRegenerate={onRegenerate} />
    </>
  )
}

function StepScreeningQuestions({ data, projectCategory, onRegenerate, loading, isApproved }) {
  const questions = data?.questions || []

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge isApproved={isApproved} />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Screening Questions</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Talent evaluation questionnaire</p>
      </div>

      {loading && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Generating Screening Questions...</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>AI is creating evaluation criteria</div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: '#374151' }}>QUESTIONS</span>
        </div>
        {questions.length > 0 ? questions.map((item, qi) => (
          <div key={qi} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: qi < questions.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111', flex: 1, paddingRight: 12 }}>
                Question {qi + 1} &nbsp; {item.question || item.q}
              </div>
              <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>Weight {item.weight || 4}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {(item.options || []).map((opt, oi) => (
                <div key={oi} style={{
                  padding: '9px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  border: `1px solid ${oi === item.preferred ? '#6ee7b7' : 'transparent'}`,
                  background: oi === item.preferred ? '#f0fdf9' : '#f9fafb',
                  color: '#374151',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  {opt}
                  {oi === item.preferred && (
                    <span style={{ background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, marginLeft: 10, flexShrink: 0 }}>Preferred</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            Screening questions will be generated by AI...
          </div>
        )}
      </Card>

      <SuggestionBox placeholder="e.g., 'Add question about equipment', 'Make questions simpler', 'Focus more on creativity'" onRegenerate={onRegenerate} />
    </>
  )
}

function StepLocations({ data, projectCategory, onRegenerate, loading, isApproved }) {
  const locations = data?.locations || []

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge isApproved={isApproved} />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Locations &amp; Shooting Places</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>AI-suggested filming locations based on your production brief</p>
      </div>

      {loading && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Generating Location Suggestions...</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>AI is finding optimal filming locations</div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {locations.length > 0 ? locations.map((loc, i) => (
          <div key={i} style={{ paddingBottom: i < locations.length - 1 ? 24 : 0, marginBottom: i < locations.length - 1 ? 24 : 0, borderBottom: i < locations.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div style={{ marginTop: 2, color: '#10b981' }}><PinIcon size={16} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: '#111' }}>{loc.name}</span>
                  <span style={{ background: loc.typeColor || '#dbeafe', color: loc.typeText || '#1d4ed8', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{loc.type}</span>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, margin: '0 0 12px' }}>{loc.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <PinIcon size={12} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: '#9ca3af' }}>REQUIREMENTS</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {(loc.requirements || []).map(req => (
                    <span key={req} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#374151' }}>{req}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            Location suggestions will be generated by AI...
          </div>
        )}
      </Card>

      <RequestModBox placeholder="e.g., 'Add indoor backup location', 'Need more urban locations', 'Focus on natural settings'" />
    </>
  )
}

function StepTechnicalRequirements({ data, projectCategory, onRegenerate, loading, isApproved }) {
  const cameraRows = data?.camera || []
  const lightingItems = data?.lighting || []
  const audioItems = data?.audio || []

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge isApproved={isApproved} />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Technical Requirements</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Camera, lighting, and audio specifications</p>
      </div>

      {loading && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Generating Technical Requirements...</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>AI is determining equipment needs</div>
            </div>
          </div>
        </Card>
      )}

      {cameraRows.length > 0 ? (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <CameraIcon size={16} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: '#374151' }}>CAMERA EQUIPMENT</span>
          </div>
          {cameraRows.map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < cameraRows.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{row.label}</span>
              <span style={{ fontSize: 12, color: '#111', fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
        </Card>
      ) : (
        <Card>
          <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            Camera equipment will be generated by AI...
          </div>
        </Card>
      )}

      {lightingItems.length > 0 ? (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <LightbulbIcon size={16} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: '#374151' }}>LIGHTING EQUIPMENT</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {lightingItems.map((item, i) => (
              <span key={i} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#374151' }}>{item}</span>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            Lighting equipment will be generated by AI...
          </div>
        </Card>
      )}

      {audioItems.length > 0 ? (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <MicIcon size={16} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: '#374151' }}>AUDIO EQUIPMENT</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {audioItems.map((item, i) => (
              <span key={i} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#374151' }}>{item}</span>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            Audio equipment will be generated by AI...
          </div>
        </Card>
      )}

      <SuggestionBox placeholder="e.g., 'Add drone shots', 'Change camera model', 'Add more lighting options'" onRegenerate={onRegenerate} />
    </>
  )
}

function StepProductionSchedule({ data, projectCategory, onRegenerate, loading, isApproved }) {
  const phases = data?.phases || []

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge isApproved={isApproved} />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Production Schedule</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Timeline and key milestones</p>
      </div>

      {loading && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Generating Production Schedule...</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>AI is creating timeline and milestones</div>
            </div>
          </div>
        </Card>
      )}

      {phases.length > 0 ? phases.map((phase, i) => (
        <Card key={i} highlight={phase.highlight}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: phase.highlight ? '#d1fae5' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CalendarIcon size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 4 }}>{phase.name}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: phase.highlight ? '#10b981' : '#111', marginBottom: 6 }}>{phase.duration}</div>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px', lineHeight: 1.6 }}>{phase.description}</p>
              {phase.tasks && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {phase.tasks.map((task, ti) => (
                    <span key={ti} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#374151' }}>{task}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )) : (
        <Card>
          <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            Production schedule will be generated by AI...
          </div>
        </Card>
      )}

      <SuggestionBox placeholder="e.g., 'Shorten timeline', 'Add more phases', 'Adjust milestone dates'" onRegenerate={onRegenerate} />
    </>
  )
}

function StepCreativeDirection({ data, productionBrief, projectCategory, onRegenerate, loading, isApproved }) {
  const [imageLoading, setImageLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(data?.image || null)
  const moodTags = data?.moodTags || []

  const handleRegenerateImage = async () => {
    setImageLoading(true)
    try {
      const result = await onRegenerate()
      if (result && result.image) {
        setGeneratedImage(result.image)
      }
    } catch (err) {
      //
    } finally {
      setImageLoading(false)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge isApproved={isApproved} />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Creative Direction</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Visual style and creative approach</p>
      </div>

      {loading && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Generating Creative Direction...</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>AI is developing visual style and mood</div>
            </div>
          </div>
        </Card>
      )}

      {generatedImage && (
        <Card>
          <div style={{ position: 'relative', width: '100%', height: 300, background: '#f3f4f6', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
            <img src={generatedImage} alt="Creative direction reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {imageLoading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            )}
          </div>
          <button
            onClick={handleRegenerateImage}
            disabled={imageLoading}
            style={{ width: '100%', padding: '10px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: imageLoading ? 'not-allowed' : 'pointer', opacity: imageLoading ? 0.5 : 1 }}
          >
            {imageLoading ? 'Generating...' : 'Regenerate Style & Image'}
          </button>
        </Card>
      )}

      <Card>
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 10 }}>VISUAL STYLE</div>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>
            {data.visualStyle || 'Visual style will be generated by AI...'}
          </p>
        </div>
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 10 }}>CINEMATOGRAPHY NOTES</div>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>
            {data.cinematography || 'Cinematography notes will be generated by AI...'}
          </p>
        </div>
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 12 }}>TONE &amp; MOOD</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {moodTags.length > 0 ? moodTags.map(tag => (
              <span key={tag} style={{ border: '1px solid #d1d5db', borderRadius: 20, padding: '5px 14px', fontSize: 13, color: '#374151' }}>{tag}</span>
            )) : (
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Mood tags will be generated by AI...</span>
            )}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 10 }}>REFERENCE STYLE</div>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>
            {data.referenceStyle || 'Reference style will be generated by AI...'}
          </p>
        </div>
      </Card>
    </>
  )
}

function StepDeliverables({ data, projectCategory, productionBrief, onRegenerate, loading, isApproved }) {
  const deliverables = data?.deliverables || []
  const formats = data?.formats || []

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge isApproved={isApproved} />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Deliverables</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Complete production specifications and outputs</p>
      </div>

      {loading && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Generating Deliverables...</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>AI is creating output specifications</div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PackageIcon size={20} />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Primary Deliverables</span>
        </div>
        <div style={{ marginTop: 16 }}>
          {deliverables.length > 0 ? deliverables.map((del, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < deliverables.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, color: '#374151' }}>{del}</span>
            </div>
          )) : (
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Deliverables will be generated by AI...</span>
          )}
        </div>
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #6ee7b7', borderRadius: 12, padding: '18px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileTextIcon size={18} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Video Formats</span>
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {formats.length > 0 ? formats.map((fmt, i) => (
            <span key={i} style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#374151' }}>{fmt}</span>
          )) : (
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Formats will be generated by AI...</span>
          )}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Modify Deliverables (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            placeholder="e.g., 'Add vertical formats', 'Include podcast audio versions', 'Add Spanish subtitles'"
            style={{ width: '100%', minHeight: 80, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#444', resize: 'vertical', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
          <button 
            onClick={() => onRegenerate && onRegenerate('Modify deliverables')}
            style={{ position: 'absolute', bottom: 10, right: 10, background: '#111', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshIcon size={12} /> Regenerate
          </button>
        </div>
      </div>
    </>
  )
}

/* ─── BOTTOM ACTION BAR ─────────────────────────────────────────────────── */
function BottomBar({ step, onApprove }) {
  const isLast = step === 8

  if (isLast) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <RefreshIcon size={14} /> Regenerate
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: '1px solid #fecaca', borderRadius: 8, background: '#fff', color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <XIcon size={14} /> Reject
        </button>
        <button onClick={onApprove} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', border: 'none', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <CheckIcon size={14} /> Approve Section
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
      <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
        <PencilIcon size={13} /> Edit
      </button>
      <button onClick={onApprove} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', border: 'none', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        <CheckIcon size={14} /> Approve Section
      </button>
    </div>
  )
}

/* ─── MAIN APP ──────────────────────────────────────────────────────────── */
export default function AISubmission() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [approved, setApproved] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [aiData, setAIData] = useState(null)
  const [error, setError] = useState(null)
  const [projectUrl, setProjectUrl] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectCategory, setProjectCategory] = useState('commercial')
  const [analyzing, setAnalyzing] = useState(false)
  const [extractProgress, setExtractProgress] = useState(null)
  const [regenerating, setRegenerating] = useState(false)
  const [hasAnalyzedProject, setHasAnalyzedProject] = useState(false)
  const previousCategoryRef = useRef(projectCategory)

  const progressSteps = [
    'Fetching site content',
    'Analyzing brand and tone',
    'Identifying visual language',
    'Translating into a film concept'
  ]

  const projectCategories = [
    { value: 'commercial', label: 'Commercial', icon: Film },
    { value: 'music_video', label: 'Music Video', icon: Music },
    { value: 'short_film', label: 'Short Film', icon: Clapperboard },
    { value: 'documentary', label: 'Documentary', icon: Video },
    { value: 'branded_content', label: 'Branded Content', icon: Briefcase },
    { value: 'corporate_video', label: 'Corporate Video', icon: Building },
    { value: 'event_coverage', label: 'Event Coverage', icon: Calendar },
    { value: 'product_demo', label: 'Product Demo', icon: Package },
    { value: 'social_media', label: 'Social Media', icon: Share },
    { value: 'animation', label: 'Animation', icon: SparklesIcon }
  ]

  // Load saved context from localStorage on mount
  useEffect(() => {
    const savedContext = localStorage.getItem('ericrabar_ai_modal_context')
    if (savedContext) {
      try {
        const context = JSON.parse(savedContext)
        const contextAge = Date.now() - new Date(context.timestamp).getTime()
        if (contextAge < 3600000) {
          setProjectUrl(context.url || '')
          setProjectCategory(context.category || 'commercial')
          setProjectDescription(context.description || '')
        }
      } catch (err) {
        //
      }
    }
  }, [])

  // Load analyzed project from Home page and auto-generate
  useEffect(() => {
    const analyzedProject = JSON.parse(localStorage.getItem('ericrabar_analyzed_project') || 'null')
    if (analyzedProject) {
      setHasAnalyzedProject(true)
      setProjectUrl(analyzedProject.url || '')
      setProjectCategory(analyzedProject.projectType || 'commercial')
      setProjectDescription(analyzedProject.additionalNotes || analyzedProject.analysis?.rawAnalysis || '')
      
      // Auto-trigger production plan generation immediately
      const contextData = {
        url: analyzedProject.url || '',
        category: analyzedProject.projectType || 'commercial',
        description: analyzedProject.additionalNotes || analyzedProject.analysis?.rawAnalysis || '',
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('ericrabar_ai_modal_context', JSON.stringify(contextData))
      
      setCurrentStep(0)
      setApproved(new Set())
      
      setLoading(true)
      setError(null)
      
      // If brief was already generated, use it; otherwise generate full plan
      if (analyzedProject.brief && analyzedProject.brief.description) {
        // Initialize with pre-generated brief and generate remaining sections
        const partialData = {
          overviewBrief: analyzedProject.brief,
          budgetBreakdown: null,
          roles: null,
          questions: null,
          locations: null,
          technical: null,
          schedule: null,
          creativeDirection: null,
          deliverables: null
        }
        setAIData(partialData)
        
        // Generate remaining sections
        generateProductionPlan({
          url: contextData.url,
          category: contextData.category,
          description: contextData.description
        }).then(result => {
          if (result.success) {
            // Merge with existing brief
            setAIData(prev => ({
              ...result.data,
              overviewBrief: prev.overviewBrief
            }))
          } else {
            setError(result.error)
          }
        }).catch(err => {
          setError(err.message)
        }).finally(() => {
          setLoading(false)
        })
      } else {
        // Generate full production plan
        generateProductionPlan({
          url: contextData.url,
          category: contextData.category,
          description: contextData.description
        }).then(result => {
          if (result.success) {
            setAIData(result.data)
          } else {
            setError(result.error)
          }
        }).catch(err => {
          setError(err.message)
        }).finally(() => {
          setLoading(false)
        })
      }
    }
  }, [])

  // No authentication check - users can use analyze tool without logging in

  // Save AI-generated data to localStorage whenever it changes
  useEffect(() => {
    if (aiData && aiData.overviewBrief && aiData.overviewBrief.description && aiData.overviewBrief.description.length > 100) {
      const draftData = {
        aiData,
        currentStep,
        approved: Array.from(approved),
        projectUrl,
        projectCategory,
        projectDescription,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('ericrabar_ai_submission_draft', JSON.stringify(draftData))
    }
  }, [aiData, currentStep, approved, projectUrl, projectCategory, projectDescription])

  // Load saved draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('ericrabar_ai_submission_draft')
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        const draftAge = Date.now() - new Date(draft.timestamp).getTime()
        // Restore draft if it's less than 24 hours old AND has real AI data (not just empty structure)
        if (draftAge < 86400000 && draft.aiData && draft.aiData.overviewBrief && draft.aiData.overviewBrief.description && draft.aiData.overviewBrief.description.length > 100) {
          setAIData(draft.aiData)
          setCurrentStep(draft.currentStep || 0)
          setApproved(new Set(draft.approved || []))
          setProjectUrl(draft.projectUrl || '')
          setProjectCategory(draft.projectCategory || 'commercial')
          setProjectDescription(draft.projectDescription || '')
          //.toLocaleString())
        } else {
          // Draft is too old or doesn't have real data, clear it
          localStorage.removeItem('ericrabar_ai_submission_draft')
          //
        }
      } catch (err) {
        //
        localStorage.removeItem('ericrabar_ai_submission_draft')
      }
    }
  }, [])

  const normalizeUrl = (url) => {
    if (!url || url.trim() === '') return url
    let normalized = url.trim()
    if (normalized.startsWith('http://')) {
      normalized = normalized.substring(7)
    } else if (normalized.startsWith('https://')) {
      normalized = normalized.substring(8)
    }
    if (normalized.startsWith('www.')) {
      normalized = normalized.substring(4)
    }
    return 'https://' + normalized
  }

  const handleUrlChange = (e) => {
    const rawValue = e.target.value
    if (rawValue.includes('.') && !rawValue.includes(' ')) {
      setProjectUrl(normalizeUrl(rawValue))
    } else {
      setProjectUrl(rawValue)
    }
  }

  const handleAnalyzeUrl = async () => {
    if (!projectUrl) return
    setAnalyzing(true)
    setExtractProgress(0)
    const progressInterval = setInterval(() => {
      setExtractProgress(prev => {
        if (prev === null) return 0
        if (prev < progressSteps.length - 1) return prev + 1
        return prev
      })
    }, 800)

    try {
      const { analyzeWebsiteUrl } = await import('../lib/urlAnalysisService')
      const analysisResult = await analyzeWebsiteUrl(projectUrl, projectCategory)
      clearInterval(progressInterval)
      if (analysisResult.success && analysisResult.rawAnalysis) {
        setProjectDescription(analysisResult.rawAnalysis)
        setExtractProgress(progressSteps.length - 1)
        setTimeout(() => setExtractProgress(null), 600)
      } else {
        setError(analysisResult.error)
        setExtractProgress(null)
      }
    } catch (error) {
      //
      setExtractProgress(null)
      setError(error.message)
      clearInterval(progressInterval)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleGenerateProductionPlan = async () => {
    // Clear any existing draft when starting fresh
    localStorage.removeItem('ericrabar_ai_submission_draft')
    
    const contextData = {
      url: projectUrl,
      category: projectCategory,
      description: projectDescription,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('ericrabar_ai_modal_context', JSON.stringify(contextData))
    
    // Initialize with empty data structure to show steps immediately
    setAIData({
      overviewBrief: { initialIdea: projectDescription, description: projectDescription, tags: [], introduction: '', category: projectCategory, title: '' },
      budgetBreakdown: { packages: [], reasoning: '' },
      roles: { packages: [], team: [] },
      questions: { questions: [] },
      locations: { locations: [] },
      technicalRequirements: { camera: [], lighting: [], audio: [] },
      productionSchedule: { phases: [] },
      creativeDirection: { visualStyle: '', cinematographyNotes: '', moodTags: [], toneMood: '', referenceStyle: '' },
      deliverables: { primary: [], formats: [], additional: [], timeline: '' }
    })
    setCurrentStep(0)
    setApproved(new Set())
    
    setLoading(true)
    setError(null)
    try {
      const result = await generateProductionPlan({
        url: projectUrl,
        category: projectCategory,
        description: projectDescription
      })
      if (result.success) {
        setAIData(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = async (newCategory) => {
    setProjectCategory(newCategory)
    setLoading(true)
    
    // Update context in localStorage
    const contextData = {
      url: projectUrl,
      category: newCategory,
      description: projectDescription,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('ericrabar_ai_modal_context', JSON.stringify(contextData))
    
    // Regenerate production plan with new category
    try {
      const result = await generateProductionPlan({
        url: projectUrl,
        category: newCategory,
        description: projectDescription
      })
      if (result.success) {
        setAIData(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async (section, suggestion) => {
    if (!aiData) return
    setLoading(true)
    try {
      const result = await regenerateSection(section, aiData, suggestion)
      if (result.success) {
        setAIData(prev => ({
          ...prev,
          [section]: result.data
        }))
      }
    } catch (err) {
      //
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = () => {
    setApproved(prev => new Set([...prev, currentStep]))
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit the production plan
      navigate('/ClientDashboard')
    }
  }

  // Dynamic step components based on AI data
  const stepComponents = aiData ? [
    <StepOverviewBrief data={aiData.overviewBrief} projectCategory={projectCategory} onRegenerate={(s) => handleRegenerate('overviewBrief', s)} loading={loading} isApproved={approved.has(0)} onCategoryChange={handleCategoryChange} />,
    <StepBudgetBreakdown data={aiData.budgetBreakdown} projectCategory={projectCategory} onRegenerate={(s) => handleRegenerate('budgetBreakdown', s)} loading={loading} isApproved={approved.has(1)} />,
    <StepRolesTeam data={aiData.roles} projectCategory={projectCategory} onRegenerate={(s) => handleRegenerate('roles', s)} loading={loading} isApproved={approved.has(2)} />,
    <StepScreeningQuestions data={aiData.questions} projectCategory={projectCategory} onRegenerate={(s) => handleRegenerate('questions', s)} loading={loading} isApproved={approved.has(3)} />,
    <StepLocations data={aiData.locations} projectCategory={projectCategory} onRegenerate={(s) => handleRegenerate('locations', s)} loading={loading} isApproved={approved.has(4)} />,
    <StepTechnicalRequirements data={aiData.technical} projectCategory={projectCategory} onRegenerate={(s) => handleRegenerate('technical', s)} loading={loading} isApproved={approved.has(5)} />,
    <StepProductionSchedule data={aiData.schedule} projectCategory={projectCategory} onRegenerate={(s) => handleRegenerate('schedule', s)} loading={loading} isApproved={approved.has(6)} />,
    <StepCreativeDirection data={aiData.creativeDirection} productionBrief={aiData.overviewBrief?.description} projectCategory={projectCategory} onRegenerate={() => handleRegenerate('creativeDirection', 'regenerate style')} loading={loading} isApproved={approved.has(7)} />,
    <StepDeliverables data={aiData.deliverables} projectCategory={projectCategory} productionBrief={aiData.overviewBrief?.description} onRegenerate={(s) => handleRegenerate('deliverables', s)} loading={loading} isApproved={approved.has(8)} />
  ] : []

  const progressPct = Math.round(((approved.size) / STEPS.length) * 100)

  // No authentication loading check - users can use analyze tool without logging in

  // Show input form if no AI data yet AND no analyzed project from Home page
  if (!aiData && !hasAnalyzedProject) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, maxWidth: '500px', width: '100%', padding: 32, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 12, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: '#111', margin: '0 0 8px' }}>AI Production Plan</h2>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Describe your project and let AI generate a complete production plan</p>
            </div>
          </div>
          
          {/* URL Input */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                value={projectUrl}
                onChange={handleUrlChange}
                placeholder="Paste your website or project URL (optional)"
                style={{ width: '100%', padding: '12px 16px', paddingRight: 100, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#000', outline: 'none' }}
              />
              <button
                onClick={handleAnalyzeUrl}
                disabled={!projectUrl || analyzing}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: '6px 12px', background: '#000', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: !projectUrl || analyzing ? 'not-allowed' : 'pointer', opacity: !projectUrl || analyzing ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <SparklesIcon size={12} />
                {analyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          {extractProgress !== null && (
            <div style={{ padding: 12, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {progressSteps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    {idx < extractProgress && (
                      <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                    )}
                    {idx === extractProgress && (
                      <Loader size={16} style={{ color: '#2563eb', flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                    )}
                    {idx > extractProgress && (
                      <div style={{ width: 16, height: 16, border: '2px solid #d1d5db', borderRadius: '50%', flexShrink: 0 }} />
                    )}
                    <span style={{ color: idx <= extractProgress ? '#1f2937' : '#6b7280' }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description with Category Selector */}
          <div style={{ position: 'relative', border: '1px solid #d1d5db', borderRadius: 8, marginBottom: 16 }}>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe your project in one sentence..."
              rows={3}
              style={{ width: '100%', padding: '16px', paddingBottom: 48, color: '#000', fontSize: 14, outline: 'none', resize: 'none', border: 'none', borderRadius: 8 }}
            />
            
            {/* Category Selector */}
            <div style={{ position: 'absolute', bottom: 8, left: 12 }}>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => {
                    const dropdown = document.getElementById('category-dropdown')
                    dropdown.classList.toggle('hidden')
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4b5563', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
                >
                  {(() => {
                    const selectedCategory = projectCategories.find(cat => cat.value === projectCategory)
                    const Icon = selectedCategory?.icon || Film
                    return <><Icon className="w-3 h-3" /><span>{selectedCategory?.label}</span></>
                  })()}
                </button>
                <div
                  id="category-dropdown"
                  className="hidden absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded shadow-lg z-[100] min-w-[150px]"
                >
                  {projectCategories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          setProjectCategory(cat.value)
                          document.getElementById('category-dropdown').classList.add('hidden')
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Icon className="w-3 h-3" />
                        <span>{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateProductionPlan}
            disabled={!projectDescription.trim()}
            style={{ width: '100%', padding: '12px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: !projectDescription.trim() ? 'not-allowed' : 'pointer', opacity: !projectDescription.trim() ? 0.5 : 1 }}
          >
            Generate Production Plan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', color: '#111', background: '#fff' }}>

      {/* Header with back button */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 12, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>AI Production Plan</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Review and approve each section</p>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          Progress: {progressPct}%
        </div>
      </div>

      {/* Loading indicator overlay */}
      {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Generating Production Plan...</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>AI is analyzing your project requirements</div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 40, maxWidth: 400, textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 8 }}>AI Generation Failed</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>{error}</div>
            <button onClick={() => setError(null)} style={{ padding: '10px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginRight: 8 }}>
              Try Again
            </button>
            <button onClick={() => { setError(null); setAIData(null); }} style={{ padding: '10px 20px', background: '#fff', color: '#111', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 224, borderRight: '1px solid #e5e7eb', background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ padding: '18px 18px 14px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 3 }}>Production Plan</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Review and approve each section</div>
          </div>

          <div style={{ padding: '0 10px' }}>
            {STEPS.map((label, i) => {
              const isActive = i === currentStep
              const isDone = approved.has(i)
              const isPending = !isActive && !isDone

              return (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '11px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: isActive ? '#111' : 'transparent',
                    color: isActive ? '#fff' : '#374151',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: 2,
                    transition: 'background-color 0.2s',
                  }}
                >
                  <span>{label}</span>
                  {isDone && !isActive && (
                    <span style={{ color: '#10b981' }}><CheckIcon size={15} /></span>
                  )}
                  {isPending && (
                    <span style={{ color: '#f59e0b' }}><AlertCircleIcon /></span>
                  )}
                  {isActive && isDone && (
                    <span style={{ color: '#34d399' }}><CheckIcon size={15} /></span>
                  )}
                  {isActive && !isDone && (
                    <span style={{ color: '#f59e0b' }}><AlertCircleIcon /></span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Progress */}
          <div style={{ marginTop: 'auto', padding: '18px 18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: '#9ca3af', marginBottom: 8 }}>PROGRESS</div>
            <div style={{ height: 6, background: '#e5e7eb', borderRadius: 8, marginBottom: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#10b981', borderRadius: 8, transition: 'width 0.4s', width: `${progressPct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{approved.size}/{STEPS.length}</span>
            </div>
            {approved.size === STEPS.length && (
              <button style={{ width: '100%', marginTop: 12, padding: '10px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Save &amp; Continue to Dashboard
              </button>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>
            {stepComponents[currentStep]}
          </div>

          {/* Sticky bottom action bar */}
          <BottomBar step={currentStep} onApprove={handleApprove} />
        </main>
      </div>
    </div>
  )
}









