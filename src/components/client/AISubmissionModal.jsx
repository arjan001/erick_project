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

function Card({ children, highlight = false }) {
  return (
    <div style={{ background: highlight ? '#f0fdf9' : '#fff', border: `1px solid ${highlight ? '#6ee7b7' : '#e5e7eb'}`, borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
      {children}
    </div>
  );
}

/* ─── STEP CONTENT COMPONENTS ───────────────────────────────────────────── */

function StepOverviewBrief({ data, onRegenerate, onCategoryChange }) {
  const [suggestion, setSuggestion] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Production Brief</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Comprehensive overview of the project</p>
      </div>

      {/* Initial Idea */}
      <Card>
        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 8 }}>INITIAL IDEA</div>
        </div>
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>
          {initialIdea}
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
                  const selectedCategory = projectCategories.find(cat => cat.value === category);
                  const Icon = selectedCategory?.icon || Film;
                  return <><Icon size={12} /><span>{selectedCategory?.label}</span></>;
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
          <button style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <EditIcon size={12} /> Edit
          </button>
        </div>
        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 14 }}>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.75, margin: 0 }}>
            <strong style={{ color: '#10b981' }}>INTRODUCTION</strong>{' '}
            {productionBrief}
          </p>
        </div>
      </Card>

      {/* Project Type & Tags */}
      <Card>
        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 12 }}>PROJECT TYPE &amp; TAGS</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>MAIN CATEGORY</div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
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

  const pkgs = data || [
    { name: 'Conservative', price: '€5,000', desc: 'Essential coverage with single-camera setup and basic post-production.', pre: '€2,000', prod: '€2,000', post: '€1,000', highlight: false },
    { name: 'Standard', price: '€14,000', desc: 'Professional multi-camera production with enhanced lighting and color grading.', pre: '€4,000', prod: '€6,000', post: '€4,000', highlight: true },
    { name: 'Premium', price: '€40,000', desc: 'Full-scale production with cinema equipment, aerial shots, and premium post-production.', pre: '€10,000', prod: '€20,000', post: '€10,000', highlight: false },
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

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Budget Breakdown</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>AI-estimated costs across production phases</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        {pkgs.map((pkg, i) => (
          <div key={pkg.name} onClick={() => handlePackageSelect(i, pkg.name)} style={{ padding: '16px', border: `2px solid ${activePackage === i ? '#10b981' : '#e5e7eb'}`, borderRadius: 12, background: '#fff', cursor: 'pointer' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>{pkg.name}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: pkg.highlight ? '#10b981' : '#111' }}>{pkg.price}</div>
          </div>
        ))}
      </div>

      {pkgs.map((pkg, i) => (
        <Card key={pkg.name} highlight={activePackage === i}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: pkg.highlight ? '#d1fae5' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PackageIcon size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 4 }}>{pkg.name}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: pkg.highlight ? '#10b981' : '#111', marginBottom: 6 }}>{pkg.price}</div>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px', lineHeight: 1.6 }}>{pkg.desc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[['PRE-PRODUCTION', pkg.pre], ['PRODUCTION', pkg.prod], ['POST-PRODUCTION', pkg.post]].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: pkg.highlight ? '#10b981' : '#9ca3af', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: pkg.highlight ? '#10b981' : '#111' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 8 }}>Budget Reasoning</div>
        <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
          Costs are driven primarily by crew size, the quality of rental cinema equipment, the number of shooting days required, and the depth of post-production polish needed for the project.
        </p>
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #ccfce7', borderRadius: 10, padding: '18px 20px', marginTop: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 10 }}>Customize Budget (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g., 'I want Premium package with solo director', 'Budget around €20,000', 'Need 5-day shoot with full crew', 'Focus on post-production quality', 'Reduce costs with smaller team'"
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

  const pkgs = [
    { label: 'Conservative', price: '€5,000', teamSize: '3-4' },
    { label: 'Standard', price: '€14,000', teamSize: '5-7' },
    { label: 'Premium', price: '€40,000', teamSize: '8-12' },
  ];
  const roles = data?.team || ['Director', 'Cinematographer', 'Gaffer', 'Sound Mixer', 'Editor', 'Colorist', 'Production Assistant'];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      const prompt = `${suggestion}. Current package: ${pkgs[activePackage].label}. Adjust team composition and pricing accordingly.`;
      onRegenerate('rolesTeam', prompt);
      setSuggestion('');
    }
  };

  const handlePackageSelect = (pkgIndex, pkgLabel) => {
    setActivePackage(pkgIndex);
    const prompt = `Change to ${pkgLabel} package. Adjust team composition and pricing for ${pkgLabel} tier (${pkgLabel === 'Conservative' ? '3-4 team members' : pkgLabel === 'Standard' ? '5-7 team members' : '8-12 team members'}). ${suggestion || ''}`;
    onRegenerate('rolesTeam', prompt);
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Roles &amp; Team</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Required talent and experience levels</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        {pkgs.map((pkg, i) => (
          <button key={pkg.label} onClick={() => handlePackageSelect(i, pkg.label)}
            style={{ padding: '14px', border: `2px solid ${activePackage === i ? '#10b981' : '#e5e7eb'}`, borderRadius: 10, background: '#fff', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{pkg.label}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{pkg.price}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{pkg.teamSize} team</div>
          </button>
        ))}
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UsersIcon size={16} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: '#374151' }}>{pkgs[activePackage].label.toUpperCase()} PACKAGE TEAM</span>
          </div>
          <span style={{ background: '#111', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5 }}>{roles.length} professionals</span>
        </div>

        <div style={{ background: '#f0fdf9', border: '1px solid #d1fae5', borderRadius: 9, padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111' }}>Team Composition</div>
              <div style={{ fontSize: 12, color: '#10b981', marginTop: 3 }}>This package requires {roles.length} specialized professionals</div>
            </div>
            <span style={{ background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5 }}>{roles.length} professionals</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <UsersIcon size={14} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: '#9ca3af' }}>REQUIRED ROLES</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {roles.map(role => (
            <div key={role} style={{ background: '#f0fdf9', border: '1px solid #d1fae5', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, color: '#111', fontWeight: 500 }}>
              {role}
            </div>
          ))}
        </div>
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #ccfce7', borderRadius: 10, padding: '18px 20px', marginTop: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 10 }}>Customize Team (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g., 'I want two extra boom arm mic operators', 'Need 1 less gaffer', 'Add drone operator', 'Solo director only', 'Full crew of 10 people', 'Remove production assistant'"
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

function StepScreeningQuestions({ data, onRegenerate }) {
  const [suggestion, setSuggestion] = useState('');

  const questions = data || [
    {
      q: 'If a key element for a shoot is suddenly unavailable on the day, how do you handle it?',
      options: [
        'Cancel the shoot immediately until everything is perfect.',
        'Assess the situation and brainstorm creative alternatives that still match the vision.',
        'Tell the client it is not my problem and proceed with whatever is left.',
        'Wait for the client to arrive and let them decide what to do.',
      ],
      preferred: 1,
    },
    {
      q: "What is your process for creating a video that feels 'exclusive' and 'high-end'?",
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
        'Ignore the feedback and finish the project the way I wanted to.',
        'Listen to understand the core concern, then offer a collaborative solution that addresses their goal.',
        'Immediately quit the project as it is no longer my vision.',
      ],
      preferred: 2,
    },
  ];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      onRegenerate('screeningQuestions', suggestion);
      setSuggestion('');
    }
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Screening Questions</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>AI-generated talent evaluation based on production requirements</p>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: '#374151' }}>QUESTIONS</span>
        </div>
        {questions.map((item, qi) => (
          <div key={qi} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: qi < questions.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111', flex: 1, paddingRight: 12 }}>
                Question {qi + 1} &nbsp; {item.q}
              </div>
              <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>Weight 4</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {item.options.map((opt, oi) => (
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
        ))}
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #ccfce7', borderRadius: 10, padding: '18px 20px', marginTop: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 10 }}>Customize Questions (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g., 'Add question about equipment experience', 'Focus more on creativity', 'Include questions about availability', 'Add technical skill assessment', 'Make questions more specific to commercial work'"
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

function StepLocations({ data, onRegenerate }) {
  const [suggestion, setSuggestion] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const locations = data || [
    {
      name: 'Minimalist Art Gallery with Floor-to-Ceiling Windows',
      type: 'Indoor',
      typeColor: '#dbeafe',
      typeText: '#1d4ed8',
      desc: 'The stark white walls and clean architectural lines provide a premium, gallery-like canvas that makes the colors of the floral arrangements pop.',
      reqs: ['Controlled climate for delicate flowers', 'Permission for lighting rig setup', 'Minimalist furniture removal'],
    },
    {
      name: 'Botanical Conservatory or Glasshouse',
      type: 'Hybrid',
      typeColor: '#fef3c7',
      typeText: '#92400e',
      desc: 'This location offers a lush, organic backdrop that reinforces the brand\'s commitment to sustainability and nature.',
      reqs: ['Temperature regulation for floral freshness', 'Reflector panels for lighting balance', 'Permit for professional filming'],
    },
    {
      name: 'Luxury Penthouse Terrace with Skyline View',
      type: 'Outdoor',
      typeColor: '#dcfce7',
      typeText: '#166534',
      desc: 'A high-end urban terrace suggests an exclusive lifestyle and provides a dramatic juxtaposition between delicate blooms and the concrete city.',
      reqs: ['Weather backup plan', 'Portable power stations', 'Access for heavy equipment loading'],
    },
  ];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      onRegenerate('locations', suggestion);
      setSuggestion('');
    }
  };

  const handleLocationSelect = (locationIndex, locationName) => {
    setSelectedLocation(locationIndex);
    const prompt = `I want to shoot at ${locationName}. ${suggestion || 'Use this as the primary location and adjust other suggestions accordingly.'}`;
    onRegenerate('locations', prompt);
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Locations &amp; Shooting Places</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>AI-suggested filming locations based on your production brief</p>
      </div>

      <Card>
        {locations.map((loc, i) => (
          <div 
            key={i} 
            onClick={() => handleLocationSelect(i, loc.name)}
            style={{ 
              paddingBottom: i < locations.length - 1 ? 24 : 0, 
              marginBottom: i < locations.length - 1 ? 24 : 0, 
              borderBottom: i < locations.length - 1 ? '1px solid #f3f4f6' : 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: 8,
              background: selectedLocation === i ? '#f0fdf9' : 'transparent',
              border: selectedLocation === i ? '2px solid #10b981' : 'transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div style={{ marginTop: 2, color: selectedLocation === i ? '#10b981' : '#6b7280' }}><PinIcon size={16} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: '#111' }}>{loc.name}</span>
                  <span style={{ background: loc.typeColor, color: loc.typeText, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{loc.type}</span>
                  {selectedLocation === i && (
                    <span style={{ background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>Selected</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, margin: '0 0 12px' }}>{loc.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <PinIcon size={12} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: '#9ca3af' }}>REQUIREMENTS</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {loc.reqs.map(req => (
                    <span key={req} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#374151' }}>{req}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #ccfce7', borderRadius: 10, padding: '18px 20px', marginTop: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 10 }}>Suggest Locations (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g., 'I want to shoot in a warehouse in Brooklyn', 'Need a beach location in California', 'Suggest rooftop locations in downtown', 'Add indoor studio backup', 'Focus on natural outdoor settings', 'Need vintage cafe interior'"
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

function StepTechnicalRequirements({ data, onRegenerate, projectCategory }) {
  const [suggestion, setSuggestion] = useState('');

  const cameraRows = data?.camera || [
    ['Camera Type', 'Sony FX6 Cinema Line'],
    ['Resolution', '4K DCI 10-bit 4:2:2 XAVC-I'],
    ['Frame Rate', '24fps for cinematic narrative, 120fps for high-speed'],
    ['Lenses', 'Sony FE 35mm f/1.4 GM, 50mm f/1.2 GM, and 90mm f/2.8 Macro G OSS'],
    ['Camera Support', 'DJI RS3 Pro Gimbal and Sachtler Ace XL Fluid Head Tripod'],
  ];
  const lightingItems = data?.lighting || [
    'Aputure LS 600d Pro for high-output daylight balanced key light',
    'Aputure Light Dome II for soft, wrap-around portrait lighting',
    '2x Aputure Amaran 200x Bi-Color for adjustable rim and background texture lighting',
    'Aputure MC RGBWW lights for subtle accent color highlights',
    '4x4 Scrim Jim Cine Kit for diffusing harsh sunlight in outdoor locations',
  ];
  const audioItems = data?.audio || [
    'Sennheiser MKH 416 shotgun microphone for crisp ambient shots',
    'Rode Wireless PRO lavalier system for clean interview recording',
    'Zoom F6 MultiTrack Field Recorder for high-fidelity audio capture',
    'Rycote Softie Windshield for suppressing movement artifacts',
  ];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      const prompt = `${suggestion}. Current project category: ${projectCategory || 'commercial'}. Adjust equipment accordingly.`;
      onRegenerate('technicalRequirements', prompt);
      setSuggestion('');
    }
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Technical Requirements</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>AI-generated equipment based on {projectCategory || 'production'} category and team needs</p>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CameraIcon size={18} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Camera &amp; Format</span>
        </div>
        <div>
          {cameraRows.map(([label, val], i) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
              <span style={{ fontSize: 13.5, color: '#6b7280' }}>{label}</span>
              <span style={{ fontSize: 13.5, color: '#111', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LightbulbIcon size={18} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Lighting Setup</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {lightingItems.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: '#374151', lineHeight: 1.5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', marginTop: 5, flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0fdf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MicIcon size={18} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Audio Requirements</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {audioItems.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: '#374151', lineHeight: 1.5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginTop: 5, flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #ccfce7', borderRadius: 10, padding: '18px 20px', marginTop: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 10 }}>Customize Equipment (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g., 'Need ARRI Alexa Mini instead', 'Reduce lighting to budget-friendly LEDs', 'Add drone with gimbal', 'Need extra boom mics for larger team', 'Remove gimbal for static shots', 'Add cinema lenses package'"
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

function StepProductionSchedule({ data, onRegenerate, projectCategory }) {
  const [suggestion, setSuggestion] = useState('');
  const [selectedTimeline, setSelectedTimeline] = useState('standard');

  const timelineOptions = [
    { id: 'quick', name: 'Quick', days: '1-2 days', desc: 'Social media or simple ads', color: '#dbeafe' },
    { id: 'standard', name: 'Standard', days: '3-5 days', desc: 'Commercial production', color: '#fef3c7' },
    { id: 'extended', name: 'Extended', days: '2-4 weeks', desc: 'Movie or complex projects', color: '#dcfce7' }
  ];

  const phases = data || [
    {
      name: 'Pre-Production',
      days: '14 days',
      items: [
        'Finalize creative concept and script breakdown',
        'Scout locations for production',
        'Secure talent and sign release forms',
        'Confirm camera and equipment rental packages',
        'Draft detailed shot list and storyboard panels',
        'Conduct production meetings with key crew',
        'Apply for location permits and insurance',
        'Contract lead cinematographer and crew',
        'Coordinate logistics and catering',
      ],
    },
    {
      name: 'Production',
      days: '3 days',
      items: [
        'Day 1: Setup and shoot main studio scenes',
        'Day 2: Lifestyle location shoot',
        'Day 3: Detail shots and coverage',
        'Establish call times and wrap times daily',
        'Manage crew breaks and rest periods',
        'Implement contingency plans for weather',
        'Conduct end-of-day footage review',
        'Document behind-the-scenes content',
        'Daily equipment check-in',
      ],
    },
    {
      name: 'Post-Production',
      days: '21 days',
      items: [
        'Transfer footage and verify backups',
        'Assemble rough cut focusing on pacing',
        'Submit first edit for client review',
        'Implement editorial notes and finalize picture lock',
        'Conduct professional color grading sessions',
        'Apply motion graphics and overlays',
        'Perform sound design and mixing',
        'Secure music licensing and integrate score',
        'Conduct final review and client sign-off',
        'Export master files in multiple formats',
        'Archive project files and footage',
      ],
    },
  ];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      const prompt = `${suggestion}. Current project category: ${projectCategory || 'commercial'}. Selected timeline: ${selectedTimeline}. Adjust schedule accordingly.`;
      onRegenerate('productionSchedule', prompt);
      setSuggestion('');
    }
  };

  const handleTimelineSelect = (timelineId, timelineName) => {
    setSelectedTimeline(timelineId);
    const prompt = `Change to ${timelineName} timeline (${timelineName === 'Quick' ? '1-2 days for social media/simple ads' : timelineName === 'Standard' ? '3-5 days for commercial production' : '2-4 weeks for movie/complex projects'}). ${suggestion || 'Adjust the production schedule phases and tasks accordingly.'}`;
    onRegenerate('productionSchedule', prompt);
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Production Schedule</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>AI-generated timeline options based on {projectCategory || 'production'} complexity</p>
      </div>

      {/* Timeline Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        {timelineOptions.map(option => (
          <button
            key={option.id}
            onClick={() => handleTimelineSelect(option.id, option.name)}
            style={{
              padding: '14px',
              border: `2px solid ${selectedTimeline === option.id ? '#10b981' : '#e5e7eb'}`,
              borderRadius: 10,
              background: selectedTimeline === option.id ? option.color : '#fff',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{option.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{option.days}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{option.desc}</div>
          </button>
        ))}
      </div>

      <Card>
        {phases.map((phase, pi) => (
          <div key={phase.name} style={{ marginBottom: pi < phases.length - 1 ? 28 : 0, paddingBottom: pi < phases.length - 1 ? 28 : 0, borderBottom: pi < phases.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarIcon size={16} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{phase.name}</span>
              </div>
              <span style={{ background: '#f0fdf9', color: '#10b981', border: '1px solid #d1fae5', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{phase.days}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {phase.items.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#374151', lineHeight: 1.55 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', marginTop: 5, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #ccfce7', borderRadius: 10, padding: '18px 20px', marginTop: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 10 }}>Customize Schedule (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g., 'Move location scouting before script breakdown', 'Add casting day before production', 'Reduce pre-production to 7 days', 'Extend post-production for more color grading', 'Swap day 1 and day 2 shooting order', 'Add client review milestone'"
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

function StepCreativeDirection({ data, onRegenerate, productionBrief }) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(data?.generatedImage || null);

  const moodTags = data?.moodTags || ['Energetic', 'Aspirational', 'Modern', 'Dynamic', 'Confident'];
  const visualStyle = data?.visualStyle || 'Clean, modern aesthetic with high contrast. Focus on product detail with shallow depth of field.';
  const cinematographyNotes = data?.cinematographyNotes || 'Strategic camera movements that serve the story. Motivated lighting that creates depth and dimension.';
  const toneMood = data?.toneMood || 'Aspirational yet authentic, avoiding overt luxury clichés in favor of genuine artistry.';
  const referenceStyle = data?.referenceStyle || 'Nike commercial aesthetic. Apple product launch feel. Quick cuts with impact.';

  const handleRegenerate = async () => {
    setIsGeneratingImage(true);
    try {
      // Regenerate both content and image with different style
      await onRegenerate('creativeDirection', 'Regenerate with different visual style and mood');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Creative Direction</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>AI-generated visual style, mood, and artistic approach based on production brief</p>
      </div>

      {/* AI-Generated Mood Board Image */}
      <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, height: 260, background: isGeneratingImage ? '#f3f4f6' : (generatedImage ? `url(${generatedImage})` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 70%, #1a1a2e 100%)'), backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isGeneratingImage ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>Generating creative direction...</div>
          </div>
        ) : !generatedImage ? (
          <div style={{ position: 'relative', zIndex: 2, padding: '30px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: -0.5 }}>
              CREATIVE DIRECTION
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#e0e0e0', marginTop: 12, lineHeight: 1.6 }}>
              AI-generated mood board will appear here
            </div>
          </div>
        ) : null}
      </div>

      <Card>
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 10 }}>VISUAL STYLE</div>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>
            {visualStyle}
          </p>
        </div>
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 10 }}>CINEMATOGRAPHY NOTES</div>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>
            {cinematographyNotes}
          </p>
        </div>
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 12 }}>TONE &amp; MOOD</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {moodTags.map(tag => (
              <span key={tag} style={{ border: '1px solid #d1d5db', borderRadius: 20, padding: '5px 14px', fontSize: 13, color: '#374151' }}>{tag}</span>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 10 }}>REFERENCE STYLE</div>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>
            {referenceStyle}
          </p>
        </div>
      </Card>

      <button
        onClick={handleRegenerate}
        disabled={isGeneratingImage}
        style={{ width: '100%', marginTop: 24, padding: '14px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: isGeneratingImage ? 'not-allowed' : 'pointer', opacity: isGeneratingImage ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <RefreshIcon size={14} /> {isGeneratingImage ? 'Regenerating...' : 'Regenerate Style & Image'}
      </button>
    </>
  );
}

function StepDeliverables({ data, onRegenerate, projectCategory, productionBrief }) {
  const [suggestion, setSuggestion] = useState('');

  const primaryDeliverables = data?.primary || ['4K video files', 'Social media versions', 'Raw footage'];
  const deliveryTimeline = data?.timeline || '3-4 weeks from final approval';
  const formats = data?.formats || ['16:9 (YouTube/TV)', '9:16 (TikTok/Reels)', '1:1 (Instagram)', '4:5 (Facebook)'];
  const additionalItems = data?.additional || ['Project files', 'Color grades', 'Audio stems', 'Motion graphics'];

  const handleRegenerate = () => {
    if (suggestion.trim()) {
      const prompt = `${suggestion}. Current project category: ${projectCategory || 'commercial'}. Adjust deliverables accordingly.`;
      onRegenerate('deliverables', prompt);
      setSuggestion('');
    }
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Deliverables</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>AI-generated complete production specifications and outputs based on {projectCategory || 'production'} requirements</p>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <PackageIcon size={20} />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Primary Deliverables</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {primaryDeliverables.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#374151' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>▢</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Video Formats</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {formats.map((format, i) => (
            <span key={i} style={{ background: '#f0fdf9', border: '1px solid #d1fae5', borderRadius: 20, padding: '6px 12px', fontSize: 12.5, color: '#374151', fontWeight: 500 }}>
              {format}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <FileTextIcon size={20} />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Additional Items</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {additionalItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#374151' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6b7280', flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #6ee7b7', borderRadius: 12, padding: '18px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CalendarIcon size={18} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Delivery Timeline: {deliveryTimeline}</span>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Customize Deliverables (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="e.g., 'Add vertical formats for TikTok', 'Include podcast audio versions', 'Add Spanish subtitles', 'Remove raw footage', 'Add 8K resolution', 'Include behind-the-scenes footage', 'Add animated logo versions'"
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

/* ─── BOTTOM ACTION BAR ─────────────────────────────────────────────────── */
function BottomBar({ step, onApprove, onClose }) {
  const isLast = step === 8;

  if (isLast) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <RefreshIcon size={14} /> Regenerate
        </button>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: '1px solid #fecaca', borderRadius: 8, background: '#fff', color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <XIcon size={14} /> Cancel
        </button>
        <button onClick={onApprove} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', border: 'none', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <CheckIcon size={14} /> Approve &amp; Create Job
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
      <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
        <PencilIcon size={13} /> Edit
      </button>
      <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
        <XIcon size={14} /> Cancel
      </button>
      <button onClick={onApprove} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', border: 'none', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        <CheckIcon size={14} /> Approve Section
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
  const previousCategoryRef = useRef(projectCategory);

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
    localStorage.setItem('studio22_ai_modal_context', JSON.stringify(contextData));
    
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
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
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
    localStorage.setItem('studio22_ai_modal_context', JSON.stringify(contextData));
    
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

  const handleApprove = () => {
    setApproved(prev => new Set([...prev, currentStep]));
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(aiData);
    }
  };

  // Initialize modal with proper loading state
  useEffect(() => {
    if (open && !aiData) {
      // Modal just opened, initialize with empty state to show input form
      setAIData({ url: '', category: 'commercial', description: '' });
    }
    if (!open) {
      // Modal closed, reset state
      setAIData(null);
      setCurrentStep(0);
      setApproved(new Set());
      setLoading(false);
      setError(null);
    }
  }, [open]);

  // Load saved context from localStorage on mount
  useEffect(() => {
    const savedContext = localStorage.getItem('studio22_ai_modal_context');
    if (savedContext) {
      try {
        const context = JSON.parse(savedContext);
        // Only restore if it's recent (within 1 hour)
        const contextAge = Date.now() - new Date(context.timestamp).getTime();
        if (contextAge < 3600000) {
          setProjectUrl(context.url || '');
          setProjectCategory(context.category || 'commercial');
          setProjectDescription(context.description || '');
        }
      } catch (err) {
        console.error('Error loading saved context:', err);
      }
    }
  }, []);

  // Save AI-generated data to localStorage whenever it changes
  useEffect(() => {
    if (aiData && aiData.overviewBrief) {
      const draftData = {
        aiData,
        currentStep,
        approved: Array.from(approved),
        projectUrl,
        projectCategory,
        projectDescription,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('studio22_ai_modal_draft', JSON.stringify(draftData));
    }
  }, [aiData, currentStep, approved, projectUrl, projectCategory, projectDescription]);

  // Load saved draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('studio22_ai_modal_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const draftAge = Date.now() - new Date(draft.timestamp).getTime();
        // Restore draft if it's less than 24 hours old
        if (draftAge < 86400000 && draft.aiData && draft.aiData.overviewBrief) {
          setAIData(draft.aiData);
          setCurrentStep(draft.currentStep || 0);
          setApproved(new Set(draft.approved || []));
          setProjectUrl(draft.projectUrl || '');
          setProjectCategory(draft.projectCategory || 'commercial');
          setProjectDescription(draft.projectDescription || '');
          console.log('Modal: Restored draft from', new Date(draft.timestamp).toLocaleString());
        }
      } catch (err) {
        console.error('Error loading saved draft:', err);
      }
    }
  }, []);

  // Clear draft when modal closes
  useEffect(() => {
    if (!open) {
      localStorage.removeItem('studio22_ai_modal_draft');
    }
  }, [open]);

  // When aiData is an object (not the initial data), load the actual production plan
  useEffect(() => {
    // Only auto-generate if we have actual project data with a URL or description
    if (aiData && typeof aiData === 'object' && !aiData.url && !aiData.description && aiData.overviewBrief) {
      // This is actual AI data, no need to regenerate
      return;
    }
    if (aiData && typeof aiData === 'object' && (aiData.url || aiData.description) && !aiData.overviewBrief) {
      // This is the initial data with actual content, generate the production plan
      loadAIProductionPlan(aiData);
    }
  }, [aiData]);

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
  if (!aiData || (typeof aiData === 'object' && (aiData.url || aiData.category === 'commercial'))) {
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
          <button
            onClick={handleGenerateProductionPlan}
            style={{ width: '100%', padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Generate Production Plan
          </button>
        </div>
      </div>
    );
  }

  const stepComponents = [
    <StepOverviewBrief data={aiData?.overviewBrief} onRegenerate={handleRegenerate} onCategoryChange={handleCategoryChange} />,
    <StepBudgetBreakdown data={aiData?.budgetBreakdown} onRegenerate={handleRegenerate} />,
    <StepRolesTeam data={aiData?.rolesTeam} onRegenerate={handleRegenerate} selectedBudgetPackage={activePackage} />,
    <StepScreeningQuestions data={aiData?.screeningQuestions} onRegenerate={handleRegenerate} />,
    <StepLocations data={aiData?.locations} onRegenerate={handleRegenerate} />,
    <StepTechnicalRequirements data={aiData?.technicalRequirements} onRegenerate={handleRegenerate} projectCategory={projectCategory} />,
    <StepProductionSchedule data={aiData?.productionSchedule} onRegenerate={handleRegenerate} projectCategory={projectCategory} />,
    <StepCreativeDirection data={aiData?.creativeDirection} onRegenerate={handleRegenerate} productionBrief={aiData?.overviewBrief?.description} />,
    <StepDeliverables data={aiData?.deliverables} onRegenerate={handleRegenerate} projectCategory={projectCategory} productionBrief={aiData?.overviewBrief?.description} />,
  ];

  const progressPct = Math.round(((approved.size) / STEPS.length) * 100);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, maxWidth: '98vw', width: '1400px', maxHeight: '98vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>AI Production Plan</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Review and approve AI-generated production details</p>
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
              padding: 8, 
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
            <XIcon size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Sidebar */}
          <aside style={{ width: 224, borderRight: '1px solid #e5e7eb', background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>
              {stepComponents[currentStep]}
            </div>

            <BottomBar step={currentStep} onApprove={handleApprove} onClose={onClose} />
          </main>
        </div>
      </div>
    </div>
  );
}
