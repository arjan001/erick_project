import { useState, useEffect, useRef } from 'react';
import { generateProductionPlan, regenerateSection } from '../../lib/aiService';
import { analyzeWebsiteUrl } from '../../lib/urlAnalysisService';
import { Film, Music, Video, Clapperboard, Briefcase, Building, Calendar, Package, Share, Sparkles as SparklesIcon, Loader, CheckCircle2 } from 'lucide-react';

/* ─── ICONS ─────────────────────────────────────────────────────────────── */
function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function AlertCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function RefreshIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function EditIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function PencilIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function PackageIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function CalendarIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function CameraIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function LightbulbIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}
function MicIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
function PinIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function UsersIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
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
  );
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
];

/* ─── SHARED UI ─────────────────────────────────────────────────────────── */
function PendingBadge() {
  return (
    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}>
      Pending Review
    </span>
  );
}

function SuggestionBox({ label = 'Suggestions (optional)', placeholder = "e.g., 'Make it more professional', 'Focus on budget-friendly approach', 'Add more detail about locations'" }) {
  return (
    <div style={{ background: '#f0fdf9', border: '1px solid #ccfce7', borderRadius: 10, padding: '18px 20px', marginTop: 24 }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 10 }}>{label}</div>
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
  );
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
  );
}

function Card({ children, highlight = false, style = {} }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ background: highlight ? '#f0fdf9' : '#fff', border: `1px solid ${highlight ? '#6ee7b7' : '#e5e7eb'}`, borderRadius: 12, padding: isMobile ? '16px' : '20px 24px', marginBottom: 16, ...style }}>
      {children}
    </div>
  );
}

/* ─── STEP CONTENT COMPONENTS ───────────────────────────────────────────── */

function StepOverviewBrief({ data, onRegenerate, onCategoryChange }) {
  const [suggestion, setSuggestion] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  ];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      onRegenerate('overviewBrief', suggestion);
      setSuggestion('');
    }
  };

  const handleCategorySelect = (category) => {
    setShowCategoryDropdown(false);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const initialIdea = data?.initialIdea || `Create a high-impact commercial for ${data?.title || 'your brand'} showcasing their bespoke artisanal floral arrangements. Target affluent lifestyle enthusiasts and event planners with key selling points like premium, sustainably sourced blooms and custom design artistry.`;
  const productionBrief = data?.description || 'AI-generated production brief based on your requirements.';
  const category = data?.category || 'commercial';
  const tags = data?.tags || ['bespoke', 'floristry', 'artisanal', 'sustainable', 'luxury', 'floraldesign', 'eventplanning', 'cinematic', 'modern', 'premium'];

  return (
    <>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Production Brief</h1>
        <p style={{ color: '#6b7280', fontSize: isMobile ? 12 : 14 }}>Comprehensive overview of the project</p>
      </div>

      {/* Initial Idea */}
      <Card>
        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: isMobile ? 10 : 14, marginBottom: 12 }}>
          <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 8 }}>INITIAL IDEA</div>
        </div>
        <p style={{ fontSize: isMobile ? 13 : 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>
          {initialIdea}
        </p>
      </Card>

      {/* Production Brief */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, letterSpacing: 1, color: '#374151' }}>PRODUCTION BRIEF</div>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                style={{ background: '#111', color: '#fff', fontSize: isMobile ? 10 : 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {(() => {
                  const selectedCategory = projectCategories.find(cat => cat.value === category);
                  const Icon = selectedCategory?.icon || Film;
                  return <><Icon size={isMobile ? 10 : 12} /><span>{selectedCategory?.label}</span></>;
                })()}
              </button>
              {showCategoryDropdown && (
                <div
                  style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '4px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '150px', zIndex: 100 }}
                >
                  {projectCategories.map((cat) => {
                    const Icon = cat.icon;
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <button style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 10px', fontSize: isMobile ? 11 : 12, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <EditIcon size={isMobile ? 10 : 12} /> Edit
          </button>
        </div>
        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: isMobile ? 10 : 14 }}>
          <p style={{ fontSize: isMobile ? 12.5 : 13.5, color: '#374151', lineHeight: 1.75, margin: 0 }}>
            <strong style={{ color: '#10b981' }}>INTRODUCTION</strong>{' '}
            {productionBrief}
          </p>
        </div>
      </Card>

      {/* Project Type & Tags */}
      <Card>
        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: isMobile ? 10 : 14, marginBottom: 16 }}>
          <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 12 }}>PROJECT TYPE &amp; TAGS</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: isMobile ? 10 : 11, color: '#6b7280', marginBottom: 6 }}>MAIN CATEGORY</div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: isMobile ? '5px 12px' : '6px 14px', fontSize: isMobile ? 12 : 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {category} <span style={{ fontSize: 10 }}>▼</span>
              </button>
              {showCategoryDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: 180, maxHeight: 300, overflowY: 'auto' }}>
                  {projectCategories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategorySelect(cat.value)}
                      style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, color: '#374151', cursor: 'pointer', hover: { background: '#f3f4f6' } }}
                      onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>TAGS (UP TO 10)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.slice(0, 10).map(tag => (
                <span key={tag} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {tag} <XIcon size={10} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #ccfce7', borderRadius: 10, padding: '18px 20px', marginTop: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 10 }}>Suggestions (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g., 'Make it more professional', 'Focus on budget-friendly approach', 'Add more detail about locations'"
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
    </>
  );
}

function StepBudgetBreakdown({ data, onRegenerate }) {
  const [activePackage, setActivePackage] = useState(1);
  const [suggestion, setSuggestion] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const packages = data?.packages || [
    { 
      name: 'Conservative Package', 
      price: '€5,000', 
      desc: 'Includes a one-man band videographer, basic lighting kit, one day of shooting at the studio, and essential editing.', 
      pre: '€500', 
      preDetails: 'Project planning, basic script outline, location scouting, shot list preparation',
      prod: '€3,500', 
      prodDetails: '1-day shoot with solo videographer, basic lighting kit, essential audio equipment',
      post: '€1,000', 
      postDetails: 'Basic editing, color correction, audio mixing, final export in standard formats',
      team: 'Director/Videographer (1), Editor (1)',
      highlight: false 
    },
    { 
      name: 'Standard Package', 
      price: '€14,000', 
      desc: 'Includes a 5-person professional crew, rental cinema cameras, two days of filming, professional lighting, and color grading.', 
      pre: '€2,000', 
      preDetails: 'Full pre-production planning, detailed script development, location scouting, casting coordination, production schedule',
      prod: '€8,000', 
      prodDetails: '2-day shoot with 5-person crew (Director, DP, Gaffer, Sound, PA), cinema camera package, professional lighting, audio recording',
      post: '€4,000', 
      postDetails: 'Professional editing, color grading, sound design, motion graphics, multi-format delivery',
      team: 'Director (1), Cinematographer (1), Gaffer (1), Sound Mixer (1), Production Assistant (1), Editor (1), Colorist (1)',
      highlight: true 
    },
    { 
      name: 'Premium Package', 
      price: '€40,000', 
      desc: 'Includes a large crew, high-end cinema package, specialized motion control equipment, four days of production, and post-production with advanced VFX and sound design.', 
      pre: '€6,000', 
      preDetails: 'Comprehensive pre-production with creative development, detailed storyboards, full casting, location scouting with permits, production design, equipment testing',
      prod: '€25,000', 
      prodDetails: '4-day shoot with 8-12 person crew, ARRI/RED cinema package, motion control, drone operations, specialized lighting, full audio team, art department',
      post: '€9,000', 
      postDetails: 'Advanced post-production with VFX, 3D animation, professional color grading, Dolby Atmos sound design, multiple deliverable formats',
      team: 'Director (1), Cinematographer (1), 1st AC (1), Gaffer (1), Key Grip (1), Sound Mixer (1), Boom Operator (1), Production Designer (1), Art Director (1), VFX Artist (1), Colorist (1), Sound Designer (1), Editor (1)',
      highlight: false 
    },
  ];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      onRegenerate('budgetBreakdown', suggestion);
      setSuggestion('');
    }
  };

  const handlePackageSelect = (pkgIndex, pkgName) => {
    setActivePackage(pkgIndex);
    const prompt = `I want the ${pkgName} package. ${suggestion || ''}`;
    onRegenerate('budgetBreakdown', prompt);
  };

  const handleEdit = () => {
    // Focus on the suggestion textarea
    const textarea = document.querySelector('textarea[placeholder*="Customize Budget"]');
    if (textarea) {
      textarea.focus();
    }
  };

  return (
    <>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <PendingBadge />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: '#111', margin: '0 0 4px' }}>Budget Breakdown</h1>
            <p style={{ color: '#6b7280', fontSize: isMobile ? 12 : 14, margin: 0 }}>Three package options with clear explanations</p>
          </div>
          <button onClick={handleEdit} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 7, padding: '5px 12px', fontSize: isMobile ? 12 : 13, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <PencilIcon size={isMobile ? 12 : 13} /> Edit
          </button>
        </div>
      </div>

      {packages.map((pkg, i) => (
        <Card 
          key={pkg.name} 
          highlight={pkg.highlight}
          onClick={() => handlePackageSelect(i, pkg.name)}
          style={{ cursor: 'pointer', border: activePackage === i ? '2px solid #10b981' : undefined }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 10 : 14, flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 10, background: pkg.highlight ? '#d1fae5' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PackageIcon size={isMobile ? 16 : 18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, color: '#111', marginBottom: 4 }}>{pkg.name}</div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: pkg.highlight ? '#10b981' : '#111', marginBottom: 6 }}>{pkg.price}</div>
              <p style={{ fontSize: isMobile ? 12 : 13, color: '#6b7280', margin: '0 0 16px', lineHeight: 1.6 }}>{pkg.desc}</p>
              
              {/* Detailed breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? 8 : 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: pkg.highlight ? '#10b981' : '#9ca3af', marginBottom: 4 }}>PRE-PRODUCTION</div>
                  <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 600, color: pkg.highlight ? '#10b981' : '#111', marginBottom: 4 }}>{pkg.pre}</div>
                  <div style={{ fontSize: isMobile ? 10 : 11, color: '#6b7280', lineHeight: 1.4 }}>{pkg.preDetails || 'Planning, script, location scouting'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: pkg.highlight ? '#10b981' : '#9ca3af', marginBottom: 4 }}>PRODUCTION</div>
                  <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 600, color: pkg.highlight ? '#10b981' : '#111', marginBottom: 4 }}>{pkg.prod}</div>
                  <div style={{ fontSize: isMobile ? 10 : 11, color: '#6b7280', lineHeight: 1.4 }}>{pkg.prodDetails || 'Crew, equipment, filming days'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: pkg.highlight ? '#10b981' : '#9ca3af', marginBottom: 4 }}>POST-PRODUCTION</div>
                  <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 600, color: pkg.highlight ? '#10b981' : '#111', marginBottom: 4 }}>{pkg.post}</div>
                  <div style={{ fontSize: isMobile ? 10 : 11, color: '#6b7280', lineHeight: 1.4 }}>{pkg.postDetails || 'Editing, color grading, sound design'}</div>
                </div>
              </div>

              {/* Team/Personnel details */}
              {pkg.team && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: pkg.highlight ? '#10b981' : '#9ca3af', marginBottom: 6 }}>TEAM & PERSONNEL</div>
                  <div style={{ fontSize: isMobile ? 10 : 11, color: '#6b7280', lineHeight: 1.5 }}>{pkg.team}</div>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 8 }}>Budget Reasoning</div>
        <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
          {data?.reasoning || 'Costs are driven primarily by crew size, the quality of rental cinema equipment, the number of shooting days required for high-end floral styling, and the depth of post-production polish (VFX and color) needed for the luxury market.'}
        </p>
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #ccfce7', borderRadius: 10, padding: '18px 20px', marginTop: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 10 }}>Customize Budget (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g., 'Lower the costs', 'Increase premium package', 'Add more detail to explanations'"
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
    </>
  );
}

function StepRolesTeam({ data, onRegenerate, selectedBudgetPackage }) {
  const [activePackage, setActivePackage] = useState(selectedBudgetPackage || 1);
  const [suggestion, setSuggestion] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const pkgs = data?.packages || [
    { label: 'Conservative', price: '€5,000' },
    { label: 'Standard', price: '€14,000' },
    { label: 'Premium', price: '€40,000' },
  ];
  const roles = data?.team || ['Director', 'Cinematographer', 'Gaffer', 'Sound Mixer', 'Editor', 'Colorist', 'Production Assistant'];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      const prompt = `${suggestion}. Current package: ${pkgs[activePackage].label}. Adjust team composition and pricing accordingly.`;
      onRegenerate('roles', prompt);
      setSuggestion('');
    }
  };

  const handlePackageSelect = (pkgIndex, pkgLabel) => {
    setActivePackage(pkgIndex);
    const prompt = `Change to ${pkgLabel} package. Adjust team composition and pricing for ${pkgLabel} tier. ${suggestion || ''}`;
    onRegenerate('roles', prompt);
  };

  return (
    <>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Roles &amp; Team</h1>
        <p style={{ color: '#6b7280', fontSize: isMobile ? 12 : 14, margin: 0 }}>Required talent and experience levels</p>
      </div>

      {/* Package tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? 8 : 12, marginBottom: 20 }}>
        {pkgs.map((pkg, i) => (
          <button key={pkg.label} onClick={() => handlePackageSelect(i, pkg.label)}
            style={{ padding: isMobile ? '10px' : '14px', border: `2px solid ${activePackage === i ? '#10b981' : '#e5e7eb'}`, borderRadius: 10, background: '#fff', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#111' }}>{pkg.label}</div>
            <div style={{ fontSize: isMobile ? 12 : 13, color: '#6b7280', marginTop: 2 }}>{pkg.price}</div>
          </button>
        ))}
      </div>

      {/* Team section */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0, alignItems: isMobile ? 'flex-start' : 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UsersIcon size={isMobile ? 14 : 16} />
            <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 700, letterSpacing: 0.8, color: '#374151' }}>{pkgs[activePackage].label.toUpperCase()} PACKAGE TEAM</span>
          </div>
          <span style={{ background: '#111', color: '#fff', fontSize: isMobile ? 10 : 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5 }}>{roles.length} professionals</span>
        </div>

        <div style={{ background: '#f0fdf9', border: '1px solid #d1fae5', borderRadius: 9, padding: isMobile ? '12px 14px' : '14px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0, alignItems: isMobile ? 'flex-start' : 'center' }}>
            <div>
              <div style={{ fontSize: isMobile ? 12.5 : 13.5, fontWeight: 600, color: '#111' }}>Team Composition</div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: '#10b981', marginTop: 3 }}>This package requires {roles.length} specialized professionals</div>
            </div>
            <span style={{ background: '#10b981', color: '#fff', fontSize: isMobile ? 10 : 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5 }}>{roles.length} professionals</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <UsersIcon size={isMobile ? 12 : 14} />
          <span style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, letterSpacing: 0.8, color: '#9ca3af' }}>REQUIRED ROLES</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? 8 : 10 }}>
          {roles.map(role => (
            <div key={role} style={{ background: '#f0fdf9', border: '1px solid #d1fae5', borderRadius: 8, padding: isMobile ? '8px 12px' : '10px 14px', fontSize: isMobile ? 12.5 : 13.5, color: '#111', fontWeight: 500 }}>
              {role}
            </div>
          ))}
        </div>
      </Card>

      <SuggestionBox placeholder="e.g., 'Need less experienced team', 'Add sound designer', 'Change to solo producer'" />
    </>
  );
}

function StepScreeningQuestions({ data, onRegenerate }) {
  const [suggestion, setSuggestion] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const questions = data?.questions || [
    {
      q: 'If a key floral element for a shoot is suddenly unavailable on the day, how do you handle it?',
      options: [
        'Cancel the shoot immediately until everything is perfect.',
        'Assess the situation and brainstorm creative alternatives that still match the luxury idea.',
        'Tell the client it is not my problem and proceed with whatever is left.',
        'Wait for the client to arrive and let them decide what to do.',
      ],
      preferred: 1,
    },
    {
      q: "What is your process for creating a video that feels 'exclusive' and 'high-end' for a luxury brand?",
      options: [
        'Use as many bright colours and fast transitions as possible.',
        'Focus on capturing slow, intentional details and elegant, refined moments.',
        "Copy a popular video style I see on social media yesterday.",
        'Make the video as long as possible to ensure the client feels they got their money\'s worth.',
      ],
      preferred: 1,
    },
    {
      q: 'How do you handle receiving feedback that you disagree with during the creative process?',
      options: [
        'Tell the client their idea is wrong and explain why my way is better.',
        'Ignore the feedback and finish the project the way I wanted.',
        'Listen to understand the core concern, then offer a collaborative solution that addresses their goal.',
        'Immediately quit the project as it is no longer my vision.',
      ],
      preferred: 2,
    },
    {
      q: 'When working as part of a larger team, how do you ensure everyone stays on the same page?',
      options: [
        'I let everyone work independently and hope for the best at the end.',
        'I provide clear instructions and check in regularly to make sure we are all moving in the same direction.',
        'I only talk to the lead person and let the rest handle the rest of the team.',
        'I would talk to team members so I can focus entirely on my own tasks.',
      ],
      preferred: 1,
    },
    {
      q: 'If a client has a limited budget, how do you decide where to spend the money?',
      options: [
        'Spread the money equally across all parts of the project, even if it makes everything look average.',
        "Identify the 'must-haves' that directly support the core message and invest most of the budget there.",
        'Spend as much as possible on the most expensive equipment available.',
        'Cut the budget for the creative concept and focus entirely on extras.',
      ],
      preferred: 1,
    },
    {
      q: 'You realise a specific shot will take twice as long to complete as planned, putting the whole day behind. What do you do?',
      options: [
        'Panic and rush the rest of the work.',
        'Work overtime without informing anyone and hope no one notices.',
        'Communicate the delay to the client, explain the impact, and present options to adjust the plan.',
        'Keep working on the shot until it is perfect, regardless of the deadline.',
      ],
      preferred: 2,
    },
    {
      q: "How do you manage client expectations when they have a vision that might not fit their current budget?",
      options: [
        'Tell them I can do it for free just to keep them happy.',
        "Actively explain the limitations and offer alternative creative options that fit the budget while maintaining the brand's quality.",
        "Take their money and then tell them I can't deliver the result after the work has started.",
        'Ignore everything and complain about the budget later.',
      ],
      preferred: 1,
    },
    {
      q: 'When starting a new project for a brand, what is the first thing you look for?',
      options: [
        'A list of the newest gadgets I can use.',
        "The brand's identity, their target audience, and what makes them unique in their market.",
        'The fastest way to finish the work so I can move to the next project.',
        'Which of my friends can help me with the work.',
      ],
      preferred: 1,
    },
  ];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      onRegenerate('questions', suggestion);
      setSuggestion('');
    }
  };

  return (
    <>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Screening Questions</h1>
        <p style={{ color: '#6b7280', fontSize: isMobile ? 12 : 14, margin: 0 }}>Talent evaluation questionnaire</p>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, letterSpacing: 0.8, color: '#374151' }}>QUESTIONS</span>
        </div>
        {questions.map((item, qi) => (
          <div key={qi} style={{ marginBottom: isMobile ? 20 : 24, paddingBottom: isMobile ? 20 : 24, borderBottom: qi < questions.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 4 : 0 }}>
              <div style={{ fontSize: isMobile ? 12.5 : 13.5, fontWeight: 600, color: '#111', flex: 1, paddingRight: isMobile ? 0 : 12 }}>
                Question {qi + 1} &nbsp; {item.q}
              </div>
              <span style={{ fontSize: isMobile ? 10 : 11, color: '#9ca3af', flexShrink: 0 }}>Weight {item.weight || 4}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 7 }}>
              {item.options.map((opt, oi) => (
                <div key={oi} style={{
                  padding: isMobile ? '8px 12px' : '9px 14px',
                  borderRadius: 8,
                  fontSize: isMobile ? 12 : 13,
                  border: `1px solid ${oi === item.preferred ? '#6ee7b7' : 'transparent'}`,
                  background: oi === item.preferred ? '#f0fdf9' : '#f9fafb',
                  color: '#374151',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  {opt}
                  {oi === item.preferred && (
                    <span style={{ background: '#10b981', color: '#fff', fontSize: isMobile ? 9 : 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, marginLeft: 10, flexShrink: 0 }}>Preferred</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <SuggestionBox placeholder="e.g., 'Add question about equipment', 'Make questions simpler', 'Focus more on creativity'" />
    </>
  );
}

function StepLocations({ data, onRegenerate }) {
  const [suggestion, setSuggestion] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const locations = data?.locations || [
    {
      name: 'Minimalist Art Gallery with Floor-to-Ceiling Windows',
      type: 'Indoor',
      typeColor: '#dbeafe',
      typeText: '#1d4ed8',
      desc: 'The stark white walls and clean architectural lines provide a premium, gallery-like canvas that makes the colors of the floral arrangements pop. This environment emphasizes the \'bespoke artistry\' aspect of the brand, appealing to an affluent demographic.',
      reqs: ['Controlled climate for delicate flowers', 'Permission for lighting rig setup', 'Minimalist furniture removal'],
    },
    {
      name: 'Botanical Conservatory or Glasshouse',
      type: 'Hybrid',
      typeColor: '#fef3c7',
      typeText: '#92400e',
      desc: 'This location offers a lush, organic backdrop that reinforces the brand\'s commitment to sustainability and nature. The natural diffused light filtered through glass creates a dreamlike, high-end cinematic aesthetic perfect for close-ups of floral textures.',
      reqs: ['Temperature regulation for floral freshness', 'Reflector panels for lighting balance', 'Permit for professional filming'],
    },
    {
      name: 'Luxury Penthouse Terrace with Skyline View',
      type: 'Outdoor',
      typeColor: '#dcfce7',
      typeText: '#166534',
      desc: 'A high-end urban terrace suggests an exclusive lifestyle and provides a dramatic juxtaposition between delicate blooms and the concrete city. It captures the \'sophisticated narrative\' by positioning the product in the center of a wealthy, aspirational urban environment.',
      reqs: ['Weather backup plan', 'Portable power stations', 'Access for heavy equipment loading'],
    },
    {
      name: 'High-End Cyclorama Photography Studio',
      type: 'Studio',
      typeColor: '#ede9fe',
      typeText: '#5b21b6',
      desc: 'A clean, infinity-wall studio allows for total control over lighting and composition, essential for isolating the floral arrangements as the hero of the frame. This is the most practical choice for achieving a \'polished, commercial\' look that aligns with high-end luxury advertising.',
      reqs: ['High-output lighting kit', 'Macro lenses for detailed texture capture', 'Multiple colored backdrops'],
    },
  ];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      onRegenerate('locations', suggestion);
      setSuggestion('');
    }
  };

  return (
    <>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Locations &amp; Shooting Places</h1>
        <p style={{ color: '#6b7280', fontSize: isMobile ? 12 : 14, margin: 0 }}>AI-suggested filming locations based on your production brief</p>
      </div>

      <Card>
        {locations.map((loc, i) => (
          <div key={i} style={{ paddingBottom: i < locations.length - 1 ? isMobile ? 20 : 24 : 0, marginBottom: i < locations.length - 1 ? isMobile ? 20 : 24 : 0, borderBottom: i < locations.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 10 : 12, marginBottom: 8, flexDirection: isMobile ? 'column' : 'row' }}>
              <div style={{ marginTop: isMobile ? 0 : 2, color: '#10b981' }}><PinIcon size={isMobile ? 14 : 16} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: isMobile ? 13.5 : 14.5, fontWeight: 600, color: '#111' }}>{loc.name}</span>
                  <span style={{ background: loc.typeColor, color: loc.typeText, fontSize: isMobile ? 10 : 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{loc.type}</span>
                </div>
                <p style={{ fontSize: isMobile ? 12 : 13, color: '#6b7280', lineHeight: 1.65, margin: '0 0 12px' }}>{loc.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <PinIcon size={isMobile ? 10 : 12} />
                  <span style={{ fontSize: isMobile ? 9 : 10, fontWeight: 700, letterSpacing: 0.8, color: '#9ca3af' }}>REQUIREMENTS</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 6 : 7 }}>
                  {loc.reqs.map(req => (
                    <span key={req} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: isMobile ? '3px 8px' : '4px 10px', fontSize: isMobile ? 11 : 12, color: '#374151' }}>{req}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Card>

      <RequestModBox placeholder="e.g., 'Add indoor backup location', 'Need more urban locations', 'Focus on natural settings'" />
    </>
  );
}

function StepTechnicalRequirements({ data, onRegenerate, projectCategory }) {
  const [suggestion, setSuggestion] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cameraRows = data?.camera || [
    ['Camera Type', 'Sony FX6 Cinema Line'],
    ['Resolution', '4K DCI 10-bit 4:2:2 XAVC-I'],
    ['Frame Rate', '24fps for cinematic narrative, 120fps for high-speed macro floral movement'],
    ['Lenses', 'Sony FE 35mm f/1.4 GM, 50mm f/1.2 GM, and 90mm f/2.8 Macro G OSS'],
    ['Camera Support', 'DJI RS3 Pro Gimbal and Sachtler Ace XL Fluid Head Tripod'],
  ];
  const lightingItems = data?.lighting || [
    'Aputure LS 600d Pro for high-output daylight balanced key light',
    'Aputure Light Dome II for soft, wrap-around portrait lighting',
    '2x Aputure Amaran 200x Bi-Color for adjustable rim and background texture lighting',
    'Aputure MC RGBWW lights for subtle accent color highlights on petals',
    '4x4 Scrim Jim Cine Kit for diffusing harsh sunlight in outdoor locations',
  ];
  const audioItems = data?.audio || [
    'Sennheiser MKH 416 shotgun microphone for crisp ambient floral shots',
    'Rode Wireless PRO lavalier system for clean interview recording',
    'Zoom F6 MultiTrack Field Recorder for high-fidelity audio capture',
    'Rycote Softie Windshield for suppressing movement artifacts',
  ];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      onRegenerate('technicalRequirements', suggestion);
      setSuggestion('');
    }
  };

  return (
    <>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Technical Requirements</h1>
        <p style={{ color: '#6b7280', fontSize: isMobile ? 12 : 14, margin: 0 }}>AI-generated equipment and technical specifications</p>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10, marginBottom: isMobile ? 14 : 18 }}>
          <div style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CameraIcon size={isMobile ? 16 : 18} />
          </div>
          <span style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, color: '#111' }}>Camera &amp; Format</span>
        </div>
        <div>
          {cameraRows.map(([label, val], i) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: isMobile ? '10px 0' : '12px 0', borderTop: i > 0 ? '1px solid #f3f4f6' : 'none', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 4 : 0 }}>
              <span style={{ fontSize: isMobile ? 12.5 : 13.5, color: '#6b7280' }}>{label}</span>
              <span style={{ fontSize: isMobile ? 12.5 : 13.5, color: '#111', fontWeight: 500, textAlign: isMobile ? 'left' : 'right', maxWidth: isMobile ? '100%' : '60%' }}>{val}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10, marginBottom: isMobile ? 14 : 16 }}>
          <div style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 9, background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LightbulbIcon size={isMobile ? 16 : 18} />
          </div>
          <span style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, color: '#111' }}>Lighting Setup</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 9 }}>
          {lightingItems.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 8 : 10, fontSize: isMobile ? 12.5 : 13.5, color: '#374151', lineHeight: 1.5 }}>
              <div style={{ width: isMobile ? 6 : 8, height: isMobile ? 6 : 8, borderRadius: '50%', background: '#f59e0b', marginTop: isMobile ? 4 : 5, flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10, marginBottom: isMobile ? 14 : 16 }}>
          <div style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 9, background: '#f0fdf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MicIcon size={isMobile ? 16 : 18} />
          </div>
          <span style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, color: '#111' }}>Audio Requirements</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 9 }}>
          {audioItems.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 8 : 10, fontSize: isMobile ? 12.5 : 13.5, color: '#374151', lineHeight: 1.5 }}>
              <div style={{ width: isMobile ? 6 : 8, height: isMobile ? 6 : 8, borderRadius: '50%', background: '#10b981', marginTop: isMobile ? 4 : 5, flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </Card>

      <RequestModBox placeholder="e.g., 'Need ARRI camera package', 'Add more LED lighting', 'Budget-friendly options'" />
    </>
  );
}

function StepProductionSchedule({ data, onRegenerate }) {
  const [suggestion, setSuggestion] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const phases = data?.phases || [
    {
      name: 'Pre-Production',
      days: '14 days',
      items: [
        'Finalize creative concept and script breakdown for brand narrative',
        'Scout luxury greenhouse and studio locations for floral setups',
        'Secure talent for lifestyle segments and sign release forms',
        'Confirm cinema camera and specialized macro lens rental packages',
        'Draft detailed shot list and 2D storyboard panels',
        'Conduct production meetings with key crew and client lead',
        'Apply for location permits and secure comprehensive production insurance',
        'Contract lead cinematographer, gaffer, and floral stylist',
        'Coordinate transport for floral assets and catering logistics',
      ],
    },
    {
      name: 'Production',
      days: '3 days',
      items: [
        'Day 1: Setup and shoot intricate floral composition shots at main studio',
        'Day 2: Lifestyle location shoot for client interaction sequences',
        'Day 3: Macro-cinematography for brand texture and detail shots',
        'Establish 06:00 call times and 19:00 wrap times daily',
        'Manage one-hour crew lunch breaks and scheduled rest periods',
        'Implement contingency plan for indoor studio lighting for weather shifts',
        'Conduct end-of-day review of footage to ensure all story beats met',
        'Document behind-the-scenes content for social media teaser usage',
        'Perform daily equipment check-in and inventory reconciliation',
      ],
    },
    {
      name: 'Post-Production',
      days: '21 days',
      items: [
        'Transfer raw footage to server and verify redundant file backups',
        'Assemble rough cut focusing on pacing and brand narrative',
        'Submit first edit for initial client review and feedback',
        'Implement editorial notes and finalize picture lock',
        'Conduct professional color grading sessions for high-end look',
        'Apply motion graphics for Bloom & Vine logo and CTA overlays',
        'Perform sound design, mixing, and audio level balancing',
        'Secure music licensing and integrate final score',
        'Conduct final review session and obtain client sign-off',
        'Export master files in 4K and optimized social formats',
        'Archive final project files and raw footage on long-term storage',
      ],
    },
  ];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      onRegenerate('productionSchedule', suggestion);
      setSuggestion('');
    }
  };

  return (
    <>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Production Schedule</h1>
        <p style={{ color: '#6b7280', fontSize: isMobile ? 12 : 14, margin: 0 }}>AI-generated comprehensive timeline and milestones</p>
      </div>

      <Card>
        {phases.map((phase, pi) => (
          <div key={phase.name} style={{ marginBottom: pi < phases.length - 1 ? isMobile ? 24 : 28 : 0, paddingBottom: pi < phases.length - 1 ? isMobile ? 24 : 28 : 0, borderBottom: pi < phases.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? 12 : 14, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0, alignItems: isMobile ? 'flex-start' : 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
                <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 8, background: '#f0fdf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarIcon size={isMobile ? 14 : 16} />
                </div>
                <span style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: '#111' }}>{phase.name}</span>
              </div>
              <span style={{ background: '#f0fdf9', color: '#10b981', border: '1px solid #d1fae5', fontSize: isMobile ? 11 : 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{phase.days}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 7 : 8 }}>
              {phase.items.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 8 : 10, fontSize: isMobile ? 12.5 : 13, color: '#374151', lineHeight: 1.55 }}>
                  <div style={{ width: isMobile ? 6 : 7, height: isMobile ? 6 : 7, borderRadius: '50%', background: '#10b981', marginTop: isMobile ? 4 : 5, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <RequestModBox placeholder="e.g., 'Extend pre-production to 4 weeks', 'Add more production days', 'Faster turnaround needed'" />
    </>
  );
}

function StepCreativeDirection({ data, onRegenerate }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const moodTags = data?.moodTags || ['Energetic', 'Aspirational', 'Modern', 'Dynamic', 'Confident'];

  return (
    <>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Creative Direction</h1>
        <p style={{ color: '#6b7280', fontSize: isMobile ? 12 : 14, margin: 0 }}>Visual style, tone, and artistic approach</p>
      </div>

      {/* Hero image */}
      <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: isMobile ? 12 : 16, height: isMobile ? 180 : 260, background: 'linear-gradient(135deg, #1a0a0a 0%, #3d1a0a 30%, #2d4a1a 70%, #1a2a0a 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {/* Floral decorative elements */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', background: 'linear-gradient(135deg, #8b2252 0%, #c0392b 30%, #e8a0b0 50%, #f5e0d0 70%, #d4e8a0 90%)', opacity: 0.85 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: isMobile ? '20px 24px' : '30px 40px', textAlign: 'right' }}>
          <div style={{ fontSize: isMobile ? 24 : 34, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: -0.5, textTransform: 'uppercase' }}>
            ARTISTRY<br />IN BLOOM
          </div>
          <div style={{ fontSize: isMobile ? 12 : 16, fontWeight: 700, color: '#fff', marginTop: isMobile ? 10 : 14, lineHeight: 1.7, textTransform: 'uppercase', letterSpacing: 1 }}>
            LUXURIOUS.<br />SUSTAINABLE.<br />CUSTOM DESIGN.
          </div>
        </div>
      </div>

      <Card>
        <div style={{ marginBottom: isMobile ? 20 : 24, paddingBottom: isMobile ? 20 : 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: isMobile ? 8 : 10 }}>VISUAL STYLE</div>
          <p style={{ fontSize: isMobile ? 12.5 : 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>
            Clean, modern aesthetic with high contrast. Focus on product detail with shallow depth of field. Dynamic camera movements to match athletic energy.
          </p>
        </div>
        <div style={{ marginBottom: isMobile ? 20 : 24, paddingBottom: isMobile ? 20 : 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: isMobile ? 8 : 10 }}>CINEMATOGRAPHY NOTES</div>
          <p style={{ fontSize: isMobile ? 12.5 : 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>
            Strategic camera movements that serve the story. Motivated lighting that creates depth and dimension. Intentional framing that guides the viewer's eye. Color temperature choices that enhance the emotional tone. Shot composition that balances negative space with subject matter.
          </p>
        </div>
        <div style={{ marginBottom: isMobile ? 20 : 24, paddingBottom: isMobile ? 20 : 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: isMobile ? 10 : 12 }}>TONE &amp; MOOD</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 6 : 8 }}>
            {moodTags.map(tag => (
              <span key={tag} style={{ border: '1px solid #d1d5db', borderRadius: 20, padding: isMobile ? '4px 12px' : '5px 14px', fontSize: isMobile ? 12 : 13, color: '#374151' }}>{tag}</span>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: isMobile ? 8 : 10 }}>REFERENCE STYLE</div>
          <p style={{ fontSize: isMobile ? 12.5 : 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>
            Nike commercial aesthetic. Apple product launch feel. Quick cuts with impact. Slow motion for key moments. Close-ups that reveal texture and craftsmanship.
          </p>
        </div>
      </Card>
    </>
  );
}

function StepDeliverables({ data, onRegenerate }) {
  const [suggestion, setSuggestion] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      onRegenerate('deliverables', suggestion);
      setSuggestion('');
    }
  };

  return (
    <>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Deliverables</h1>
        <p style={{ color: '#6b7280', fontSize: isMobile ? 12 : 14, margin: 0 }}>Complete production specifications and outputs</p>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
          <PackageIcon size={isMobile ? 18 : 20} />
          <span style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, color: '#111' }}>Primary Deliverables</span>
        </div>
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #6ee7b7', borderRadius: 12, padding: isMobile ? '14px 20px' : '18px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
          <FileTextIcon size={isMobile ? 16 : 18} />
          <span style={{ fontSize: isMobile ? 14 : 15, fontWeight: 600, color: '#111' }}>Delivery Timeline</span>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: isMobile ? '14px 20px' : '18px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#111', marginBottom: isMobile ? 10 : 12 }}>Modify Deliverables (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g., 'Add vertical formats', 'Include podcast audio versions', 'Add Spanish subtitles'"
            style={{ width: '100%', minHeight: isMobile ? 70 : 80, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: isMobile ? 12 : 13, color: '#444', resize: 'vertical', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
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
    </>
  );
}

/* ─── BOTTOM ACTION BAR ─────────────────────────────────────────────────── */
function BottomBar({ step, onApprove, isMobile = false }) {
  const isLast = step === 8;

  if (isLast) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10, padding: isMobile ? '12px 16px' : '14px 32px', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: isMobile ? '8px 14px' : '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: isMobile ? 12 : 13.5, fontWeight: 500, cursor: 'pointer', flex: isMobile ? 1 : 'auto' }}>
          <RefreshIcon size={isMobile ? 12 : 14} /> Regenerate
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: isMobile ? '8px 14px' : '9px 18px', border: '1px solid #fca5a5', borderRadius: 8, background: '#fff', color: '#ef4444', fontSize: isMobile ? 12 : 13.5, fontWeight: 500, cursor: 'pointer', flex: isMobile ? 1 : 'auto' }}>
          <XIcon size={isMobile ? 12 : 14} /> Reject
        </button>
        <button onClick={onApprove} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: isMobile ? '8px 16px' : '9px 22px', border: 'none', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: isMobile ? 12 : 13.5, fontWeight: 600, cursor: 'pointer', flex: isMobile ? 1 : 'auto' }}>
          <CheckIcon size={isMobile ? 12 : 14} /> Approve Section
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10, padding: isMobile ? '12px 16px' : '14px 32px', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
      <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: isMobile ? '8px 14px' : '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: isMobile ? 12 : 13.5, fontWeight: 500, cursor: 'pointer', flex: isMobile ? 1 : 'auto' }}>
        <PencilIcon size={isMobile ? 12 : 13} /> Edit
      </button>
      <button onClick={onApprove} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: isMobile ? '8px 16px' : '9px 22px', border: 'none', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: isMobile ? 12 : 13.5, fontWeight: 600, cursor: 'pointer', flex: isMobile ? 1 : 'auto' }}>
        <CheckIcon size={isMobile ? 12 : 14} /> Approve Section
      </button>
    </div>
  );
}

/* ─── MAIN MODAL COMPONENT ──────────────────────────────────────────────────── */
export default function AISubmissionModal({ open, onClose, onSubmit, projectData }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [approved, setApproved] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [aiData, setAIData] = useState(null);
  const [error, setError] = useState(null);
  const [projectUrl, setProjectUrl] = useState(projectData?.url || '');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectCategory, setProjectCategory] = useState(projectData?.category || 'commercial');
  const [analyzing, setAnalyzing] = useState(false);
  const [extractProgress, setExtractProgress] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [activePackage, setActivePackage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const previousCategoryRef = useRef(projectCategory);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const progressSteps = [
    'Fetching site content',
    'Analyzing brand and tone',
    'Identifying visual language',
    'Translating into a film concept'
  ];

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
  ];

  const normalizeUrl = (url) => {
    if (!url || url.trim() === '') return url;
    let normalized = url.trim();
    
    if (normalized.startsWith('http://')) {
      normalized = normalized.substring(7);
    } else if (normalized.startsWith('https://')) {
      normalized = normalized.substring(8);
    }
    
    if (normalized.startsWith('www.')) {
      normalized = normalized.substring(4);
    }
    
    return 'https://' + normalized;
  };

  const handleUrlChange = (e) => {
    const rawValue = e.target.value;
    if (rawValue.includes('.') && !rawValue.includes(' ')) {
      setProjectUrl(normalizeUrl(rawValue));
    } else {
      setProjectUrl(rawValue);
    }
  };

  // Auto-regenerate analysis when category changes (if URL exists)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (previousCategoryRef.current !== projectCategory && projectUrl && projectUrl.trim() !== '') {
        try {
          setRegenerating(true);
          
          const analysisResult = await analyzeWebsiteUrl(projectUrl, projectCategory);
          
          if (analysisResult.success && analysisResult.rawAnalysis) {
            setProjectDescription(analysisResult.rawAnalysis);
          }
        } catch (err) {
          console.error('Regeneration error:', err);
        } finally {
          setRegenerating(false);
        }
      }
      
      previousCategoryRef.current = projectCategory;
    }, 500);

    return () => clearTimeout(timer);
  }, [projectCategory, projectUrl]);

  const handleAnalyzeUrl = async () => {
    if (!projectUrl) return;

    setAnalyzing(true);
    setExtractProgress(0);

    const progressInterval = setInterval(() => {
      setExtractProgress(prev => {
        if (prev === null) return 0;
        if (prev < progressSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    try {
      const analysisResult = await analyzeWebsiteUrl(projectUrl, projectCategory);
      clearInterval(progressInterval);

      if (analysisResult.success && analysisResult.rawAnalysis) {
        setProjectDescription(analysisResult.rawAnalysis);
        setExtractProgress(progressSteps.length - 1);
        
        setTimeout(() => {
          setExtractProgress(null);
        }, 600);
      } else {
        console.error('Extract error:', analysisResult.error);
        setExtractProgress(null);
        setError(analysisResult.error);
      }
    } catch (error) {
      console.error('Extract failed:', error);
      setExtractProgress(null);
      setError(error.message);
      clearInterval(progressInterval);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateProductionPlan = async () => {
    // Save context to localStorage before generating
    const contextData = {
      url: projectUrl,
      category: projectCategory,
      description: projectDescription,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('ericrabar_ai_modal_context', JSON.stringify(contextData));
    
    const updatedProjectData = {
      ...projectData,
      url: projectUrl,
      category: projectCategory,
      description: projectDescription
    };
    
    // Load AI production plan and transition to main modal
    await loadAIProductionPlan(updatedProjectData);
    setCurrentStep(0);
    setApproved(new Set());
  };

  const loadAIProductionPlan = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateProductionPlan(data);
      if (result.success) {
        setAIData(result.data);
      } else {
        setError(result.error || 'Failed to generate production plan');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      setError(err.message || 'Failed to generate production plan');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (newCategory) => {
    setProjectCategory(newCategory);
    setLoading(true);
    
    // Update context in localStorage
    const contextData = {
      url: projectUrl,
      category: newCategory,
      description: projectDescription,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('ericrabar_ai_modal_context', JSON.stringify(contextData));
    
    // Regenerate production plan with new category
    try {
      const result = await generateProductionPlan({
        url: projectUrl,
        category: newCategory,
        description: projectDescription
      });
      if (result.success) {
        setAIData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (section, suggestion) => {
    if (!aiData) return;
    
    setLoading(true);
    try {
      const result = await regenerateSection(section, aiData, suggestion);
      if (result.success) {
        setAIData(prev => ({
          ...prev,
          [section]: result.data
        }));
      }
    } catch (err) {
      console.error('Regeneration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setApproved(prev => new Set([...prev, currentStep]));
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        await onSubmit(aiData);
        // Modal will be closed by parent's handleAIComplete
      } catch (err) {
        console.error('Error submitting AI data:', err);
        setError('Failed to submit AI-generated data');
      }
    }
  };

  // Initialize modal with proper loading state
  useEffect(() => {
    if (!open) {
      // Modal closed, reset state
      setAIData(null);
      setCurrentStep(0);
      setApproved(new Set());
      setLoading(false);
      setError(null);
    }
  }, [open]);

  // When aiData is an object (not the initial data), load the actual production plan

  if (!open) return null;

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Generating Production Plan...</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>AI is analyzing your project requirements</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 40, maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 8 }}>AI Generation Failed</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>{error}</div>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  // Show URL input if no AI data yet
  if (!aiData || (typeof aiData === 'object' && !aiData.overviewBrief && !aiData.budgetBreakdown)) {
    // Only show input form if modal is explicitly open and we have no AI data
    if (!open) return null;
    
    // Don't show input form if we just have empty initial data from parent
    if (aiData && aiData.url === '' && aiData.category === 'commercial' && aiData.description === '') {
      return null;
    }
    
    // Show input form
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, maxWidth: '500px', width: '100%', padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>AI Production Plan</h2>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', cursor: 'pointer', padding: 8, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <XIcon size={20} />
            </button>
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
            <div style={{ position: 'absolute', top: 8, right: 12, zIndex: 10 }}>
              {regenerating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4b5563', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 4 }}>
                  <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Reanalyzing...</span>
                </div>
              )}
            </div>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe your project in one sentence..."
              rows={3}
              style={{ width: '100%', padding: '16px', paddingBottom: 48, color: '#000', fontSize: 14, outline: 'none', resize: 'none', border: 'none', borderRadius: 8 }}
            />
            
            {/* Bottom Bar with Category Selector */}
            <div style={{ position: 'absolute', bottom: 8, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => {
                    const dropdown = document.getElementById('category-dropdown');
                    dropdown.classList.toggle('hidden');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4b5563', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
                >
                  {(() => {
                    const selectedCategory = projectCategories.find(cat => cat.value === projectCategory);
                    const Icon = selectedCategory?.icon || Film;
                    return <Icon size={12} style={{ color: '#6b7280' }} />;
                  })()}
                  <span>{projectCategories.find(cat => cat.value === projectCategory)?.label}</span>
                </button>
                <div
                  id="category-dropdown"
                  className="hidden"
                  style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, minWidth: 150 }}
                >
                  {projectCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          setProjectCategory(cat.value);
                          document.getElementById('category-dropdown').classList.add('hidden');
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#374151', textAlign: 'left' }}
                      >
                        <Icon size={12} style={{ color: '#6b7280' }} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Generate Production Plan Button */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: '12px 24px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateProductionPlan}
              style={{ flex: 1, padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Generate Production Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepComponents = [
    <StepOverviewBrief data={aiData?.overviewBrief} projectCategory={projectCategory} onRegenerate={handleRegenerate} onCategoryChange={handleCategoryChange} />,
    <StepBudgetBreakdown data={aiData?.budgetBreakdown} onRegenerate={handleRegenerate} />,
    <StepRolesTeam data={aiData?.roles} onRegenerate={handleRegenerate} selectedBudgetPackage={activePackage} />,
    <StepScreeningQuestions data={aiData?.questions} onRegenerate={handleRegenerate} />,
    <StepLocations data={aiData?.locations} onRegenerate={handleRegenerate} />,
    <StepTechnicalRequirements data={aiData?.technicalRequirements} onRegenerate={handleRegenerate} projectCategory={projectCategory} />,
    <StepProductionSchedule data={aiData?.productionSchedule} onRegenerate={handleRegenerate} projectCategory={projectCategory} />,
    <StepCreativeDirection data={aiData?.creativeDirection} onRegenerate={handleRegenerate} productionBrief={aiData?.overviewBrief?.description} />,
    <StepDeliverables data={aiData?.deliverables} onRegenerate={handleRegenerate} projectCategory={projectCategory} productionBrief={aiData?.overviewBrief?.description} />,
  ];

  const progressPct = Math.round(((approved.size) / STEPS.length) * 100);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: isMobile ? 0 : 20 }}>
      <div style={{ background: '#fff', borderRadius: isMobile ? 0 : 12, maxWidth: isMobile ? '100vw' : '98vw', width: isMobile ? '100vw' : '1400px', maxHeight: isMobile ? '100vh' : '98vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '12px 16px' : '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 0 }}>
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1={3} y1={12} x2={21} y2={12} />
                  <line x1={3} y1={6} x2={21} y2={6} />
                  <line x1={3} y1={18} x2={21} y2={18} />
                </svg>
              </button>
            )}
            <div>
              <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 600, color: '#111', margin: 0 }}>AI Production Plan</h2>
              <p style={{ fontSize: isMobile ? 11 : 13, color: '#6b7280', margin: '4px 0 0' }}>Review and approve AI-generated production details</p>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{ 
              background: '#f3f4f6', 
              border: '1px solid #e5e7eb', 
              cursor: 'pointer', 
              padding: isMobile ? 6 : 8, 
              borderRadius: 6, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f3f4f6';
            }}
          >
            <XIcon size={isMobile ? 18 : 20} />
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60 }}
          />
        )}

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

          {/* Sidebar */}
          <aside style={{ 
            width: isMobile ? 280 : 224, 
            borderRight: '1px solid #e5e7eb', 
            background: '#fff', 
            display: 'flex', 
            flexDirection: 'column', 
            flexShrink: 0, 
            overflowY: 'auto',
            position: isMobile ? 'fixed' : 'relative',
            left: isMobile ? (sidebarOpen ? 0 : -280) : 0,
            top: isMobile ? 0 : 'auto',
            bottom: isMobile ? 0 : 'auto',
            zIndex: isMobile ? 70 : 1,
            transition: 'left 0.3s ease'
          }}>
            <div style={{ padding: '18px 18px 14px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 3 }}>Production Plan</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Review and approve each section</div>
            </div>

            <div style={{ padding: '0 10px' }}>
              {STEPS.map((label, i) => {
                const isActive = i === currentStep;
                const isDone = approved.has(i);
                const isPending = !isActive && !isDone;

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
                );
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
            </div>
          </aside>

          {/* Main Content */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '28px 28px' }}>
              {stepComponents[currentStep]}
            </div>

            <BottomBar step={currentStep} onApprove={handleApprove} onClose={onClose} isMobile={isMobile} />
          </main>
        </div>
      </div>
    </div>
  );
}
