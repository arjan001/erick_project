import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

/* ─── ICONS ─────────────────────────────────────────────────────────────── */
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
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
function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
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

function StepOverviewBrief() {
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
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
          "Create a high-impact commercial for <strong>Bloom &amp; Vine</strong> showcasing their <strong>bespoke artisanal floral arrangements</strong>. Target <strong>affluent lifestyle enthusiasts and event planners</strong> with <strong>key selling points</strong> like premium, sustainably sourced blooms and custom design artistry. Use <strong>modern, cinematic visuals</strong> featuring <strong>slow-motion macro product shots</strong> of petals unfurling alongside elegant, high-end lifestyle scenes. Include <strong>signature brand colors and prominent logo placement</strong> throughout the edit, ending with a <strong>strong CTA</strong> to visit the website for same-day delivery. Designed for <strong>Instagram, TikTok, and premium digital platform</strong> distribution."
        </p>
      </Card>

      {/* Production Brief */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151' }}>PRODUCTION BRIEF</div>
            <span style={{ background: '#111', color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>commercial</span>
          </div>
          <button style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <EditIcon size={12} /> Edit
          </button>
        </div>
        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 14 }}>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.75 }}>
            <strong style={{ color: '#10b981' }}>INTRODUCTION</strong>{' '}
            Bloom &amp; Vine requires a high-impact commercial video to elevate their brand presence in the luxury floral market. The project will feature their bespoke artisanal floral arrangements, targeting affluent lifestyle enthusiasts and event planners who value exclusivity. By leveraging cinematic visuals and a sophisticated narrative, we aim to showcase their commitment to sustainability and custom design artistry. The final output will serve as a powerful tool to drive conversions through their digital platforms.
          </p>
        </div>
      </Card>

      {/* Project Type & Tags */}
      <Card>
        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 12 }}>PROJECT TYPE &amp; TAGS</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>MAIN CATEGORY</div>
            <button style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>commercial</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>TAGS (UP TO 10)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['bespoke', 'floristry', 'artisanal', 'sustainable', 'luxury', 'floraldesign', 'eventplanning', 'cinematic', 'modern', 'premium'].map(tag => (
                <span key={tag} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {tag} <XIcon size={10} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <SuggestionBox />
    </>
  );
}

function StepBudgetBreakdown() {
  const packages = [
    { name: 'Conservative Package', price: '€5,000', desc: 'Includes a one-man band videographer, basic lighting kit, one day of shooting at the studio, and essential editing.', pre: '€500', prod: '€3,500', post: '€1,000', highlight: false },
    { name: 'Standard Package', price: '€14,000', desc: 'Includes a 5-person professional crew, rental cinema cameras, two days of filming, professional lighting, and color grading.', pre: '€2,000', prod: '€8,000', post: '€4,000', highlight: true },
    { name: 'Premium Package', price: '€40,000', desc: 'Includes a large crew, high-end cinema package, specialized motion control equipment, four days of production, and post-production with advanced VFX and sound design.', pre: '€6,000', prod: '€25,000', post: '€9,000', highlight: false },
  ];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
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

      {packages.map(pkg => (
        <Card key={pkg.name} highlight={pkg.highlight}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
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
          Costs are driven primarily by crew size, the quality of rental cinema equipment, the number of shooting days required for high-end floral styling, and the depth of post-production polish (VFX and color) needed for the luxury market.
        </p>
      </Card>

      <SuggestionBox placeholder="e.g., 'Lower the costs', 'Increase premium package', 'Add more detail to explanations'" />
    </>
  );
}

function StepRolesTeam() {
  const [activePackage, setActivePackage] = useState(1);
  const pkgs = [
    { label: 'Conservative', price: '€5,000' },
    { label: 'Standard', price: '€14,000' },
    { label: 'Premium', price: '€40,000' },
  ];
  const roles = ['Director', 'Cinematographer', 'Gaffer', 'Sound Mixer', 'Editor', 'Colorist', 'Production Assistant'];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Roles &amp; Team</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Required talent and experience levels</p>
      </div>

      {/* Package tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        {pkgs.map((pkg, i) => (
          <button key={pkg.label} onClick={() => setActivePackage(i)}
            style={{ padding: '14px', border: `2px solid ${activePackage === i ? '#10b981' : '#e5e7eb'}`, borderRadius: 10, background: '#fff', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{pkg.label}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{pkg.price}</div>
          </button>
        ))}
      </div>

      {/* Team section */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UsersIcon size={16} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: '#374151' }}>STANDARD PACKAGE TEAM</span>
          </div>
          <span style={{ background: '#111', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5 }}>7 professionals</span>
        </div>

        <div style={{ background: '#f0fdf9', border: '1px solid #d1fae5', borderRadius: 9, padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111' }}>Team Composition</div>
              <div style={{ fontSize: 12, color: '#10b981', marginTop: 3 }}>This package requires 7 specialized professionals</div>
            </div>
            <span style={{ background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5 }}>7 professionals</span>
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

      <SuggestionBox placeholder="e.g., 'Need less experienced team', 'Add sound designer', 'Change to solo producer'" />
    </>
  );
}

function StepScreeningQuestions() {
  const questions = [
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
        'Ignore the feedback and finish the project the way I wanted to.',
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

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Screening Questions</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Talent evaluation questionnaire</p>
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

      <SuggestionBox placeholder="e.g., 'Add question about equipment', 'Make questions simpler', 'Focus more on creativity'" />
    </>
  );
}

function StepLocations() {
  const locations = [
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

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Locations &amp; Shooting Places</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>AI-suggested filming locations based on your production brief</p>
      </div>

      <Card>
        {locations.map((loc, i) => (
          <div key={i} style={{ paddingBottom: i < locations.length - 1 ? 24 : 0, marginBottom: i < locations.length - 1 ? 24 : 0, borderBottom: i < locations.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div style={{ marginTop: 2, color: '#10b981' }}><PinIcon size={16} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: '#111' }}>{loc.name}</span>
                  <span style={{ background: loc.typeColor, color: loc.typeText, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{loc.type}</span>
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

      <RequestModBox placeholder="e.g., 'Add indoor backup location', 'Need more urban locations', 'Focus on natural settings'" />
    </>
  );
}

function StepTechnicalRequirements() {
  const cameraRows = [
    ['Camera Type', 'Sony FX6 Cinema Line'],
    ['Resolution', '4K DCI 10-bit 4:2:2 XAVC-I'],
    ['Frame Rate', '24fps for cinematic narrative, 120fps for high-speed macro floral movement'],
    ['Lenses', 'Sony FE 35mm f/1.4 GM, 50mm f/1.2 GM, and 90mm f/2.8 Macro G OSS'],
    ['Camera Support', 'DJI RS3 Pro Gimbal and Sachtler Ace XL Fluid Head Tripod'],
  ];
  const lightingItems = [
    'Aputure LS 600d Pro for high-output daylight balanced key light',
    'Aputure Light Dome II for soft, wrap-around portrait lighting',
    '2x Aputure Amaran 200x Bi-Color for adjustable rim and background texture lighting',
    'Aputure MC RGBWW lights for subtle accent color highlights on petals',
    '4x4 Scrim Jim Cine Kit for diffusing harsh sunlight in outdoor locations',
  ];
  const audioItems = [
    'Sennheiser MKH 416 shotgun microphone for crisp ambient floral shots',
    'Rode Wireless PRO lavalier system for clean interview recording',
    'Zoom F6 MultiTrack Field Recorder for high-fidelity audio capture',
    'Rycote Softie Windshield for suppressing movement artifacts',
  ];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Technical Requirements</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>AI-generated equipment and technical specifications</p>
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

      <RequestModBox placeholder="e.g., 'Need ARRI camera package', 'Add more LED lighting', 'Budget-friendly options'" />
    </>
  );
}

function StepProductionSchedule() {
  const phases = [
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

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Production Schedule</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>AI-generated comprehensive timeline and milestones</p>
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

      <RequestModBox placeholder="e.g., 'Extend pre-production to 4 weeks', 'Add more production days', 'Faster turnaround needed'" />
    </>
  );
}

function StepCreativeDirection() {
  const moodTags = ['Energetic', 'Aspirational', 'Modern', 'Dynamic', 'Confident'];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Creative Direction</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Visual style, tone, and artistic approach</p>
      </div>

      {/* Hero image */}
      <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, height: 260, background: 'linear-gradient(135deg, #1a0a0a 0%, #3d1a0a 30%, #2d4a1a 70%, #1a2a0a 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {/* Floral decorative elements */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', background: 'linear-gradient(135deg, #8b2252 0%, #c0392b 30%, #e8a0b0 50%, #f5e0d0 70%, #d4e8a0 90%)', opacity: 0.85 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '30px 40px', textAlign: 'right' }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: -0.5, textTransform: 'uppercase' }}>
            ARTISTRY<br />IN BLOOM
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 14, lineHeight: 1.7, textTransform: 'uppercase', letterSpacing: 1 }}>
            LUXURIOUS.<br />SUSTAINABLE.<br />CUSTOM DESIGN.
          </div>
        </div>
      </div>

      <Card>
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 10 }}>VISUAL STYLE</div>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>
            Clean, modern aesthetic with high contrast. Focus on product detail with shallow depth of field. Dynamic camera movements to match athletic energy.
          </p>
        </div>
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#374151', marginBottom: 10 }}>CINEMATOGRAPHY NOTES</div>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>
            Strategic camera movements that serve the story. Motivated lighting that creates depth and dimension. Intentional framing that guides the viewer's eye. Color temperature choices that enhance the emotional tone. Shot composition that balances negative space with subject matter.
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
            Nike commercial aesthetic. Apple product launch feel. Quick cuts with impact. Slow motion for key moments. Close-ups that reveal texture and craftsmanship.
          </p>
        </div>
      </Card>
    </>
  );
}

function StepDeliverables() {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <PendingBadge />
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#111', margin: '12px 0 4px' }}>Deliverables</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Complete production specifications and outputs</p>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PackageIcon size={20} />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Primary Deliverables</span>
        </div>
      </Card>

      <div style={{ background: '#f0fdf9', border: '1px solid #6ee7b7', borderRadius: 12, padding: '18px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileTextIcon size={18} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Delivery Timeline</span>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Modify Deliverables (optional)</div>
        <div style={{ position: 'relative' }}>
          <textarea
            placeholder="e.g., 'Add vertical formats', 'Include podcast audio versions', 'Add Spanish subtitles'"
            style={{ width: '100%', minHeight: 80, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#444', resize: 'vertical', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
          <button style={{ position: 'absolute', bottom: 10, right: 10, background: '#111', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshIcon size={12} /> Regenerate
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── BOTTOM ACTION BAR ─────────────────────────────────────────────────── */
function BottomBar({ step, onApprove }) {
  const isLast = step === 8;

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
    );
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
  );
}

/* ─── MAIN APP ──────────────────────────────────────────────────────────── */
export default function AISubmission() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [approved, setApproved] = useState(new Set());

  // Check authentication on page load
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', '/AIsubmission');
      navigate('/SignIn');
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const handleApprove = () => {
    setApproved(prev => new Set([...prev, currentStep]));
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const stepComponents = [
    <StepOverviewBrief />,
    <StepBudgetBreakdown />,
    <StepRolesTeam />,
    <StepScreeningQuestions />,
    <StepLocations />,
    <StepTechnicalRequirements />,
    <StepProductionSchedule />,
    <StepCreativeDirection />,
    <StepDeliverables />,
  ];

  const progressPct = Math.round(((approved.size) / STEPS.length) * 100);

  if (isLoadingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '4px solid #e2e8f0', borderTopColor: '#1e293b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', color: '#111', background: '#fff' }}>

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
  );
}









