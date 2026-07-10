import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Gift, Sparkles, MessageCircle, Briefcase, Star, ArrowRight, Share2, Copy, Check } from 'lucide-react';

const OG_IMAGE = 'https://media.base44.com/images/public/6968a46f6ea94ba83cd1497c/ee5480676_generated_image.png';

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function InviteLanding() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const inviterName = searchParams.get('inviter') || 'Studio22';

  useEffect(() => {
    const url = `${window.location.origin}/invite/${code}`;
    document.title = `${inviterName} invited you — Free Pro Beta Access | Studio22`;
    setMeta('name', 'description', `${inviterName} has invited you to Studio22 Pro Beta Release at no cost. Join the creative network connecting filmmakers, creators, and production teams worldwide.`);
    setMeta('property', 'og:title', `${inviterName} invited you — Free Pro Beta Access`);
    setMeta('property', 'og:description', `${inviterName} invites you to join Studio22 with invite code ${code}. Get the Pro Beta Release plan at no cost — more messages, more projects, priority access.`);
    setMeta('property', 'og:image', OG_IMAGE);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Studio22');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', `${inviterName} invited you — Free Pro Beta Access | Studio22`);
    setMeta('name', 'twitter:description', `${inviterName} invites you to join Studio22 with invite code ${code}. Get Pro Beta Release free.`);
    setMeta('name', 'twitter:image', OG_IMAGE);

    // Schema.org structured data for SEO
    let scriptEl = document.getElementById('invite-jsonld');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'invite-jsonld';
      scriptEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'InviteAction',
      name: 'Studio22 Pro Beta Release Invite',
      description: `Free Pro Beta access to Studio22 creative network, invited by ${inviterName}`,
      url: url,
      agent: {
        '@type': 'Person',
        name: inviterName
      }
    });
  }, [code, inviterName]);

  const inviteUrl = `${window.location.origin}/invite/${code}`;
  const signupUrl = `/SignIn?ref=${code}&mode=signup`;

  const handleShare = (platform) => {
    const text = encodeURIComponent("You're invited to Studio22 — get free Pro Beta access!");
    const url = encodeURIComponent(inviteUrl);
    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const benefits = [
    { icon: MessageCircle, title: 'More Messages', desc: 'Unlimited messaging with clients and collaborators' },
    { icon: Briefcase, title: 'More Projects', desc: 'Priority access to premium project listings' },
    { icon: Star, title: 'Pro Badge', desc: 'Stand out with a Pro creator badge on your profile' },
    { icon: Sparkles, title: 'Priority Support', desc: 'Fast-track support and featured placement' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-yellow-600/5 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium tracking-wide uppercase mb-8">
            <Gift className="w-3.5 h-3.5" />
            Invite Code: {code}
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4">
            {inviterName !== 'Studio22' ? `${inviterName} invited you` : "YOU'RE INVITED"}
          </h1>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-3">
            Pro Beta Release
          </p>
          <p className="text-lg text-gray-400 mb-8">
            At no cost — <span className="text-white font-semibold">free</span> for invited creators
          </p>

          <button
            onClick={() => navigate(signupUrl)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl text-lg hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-500/20"
          >
            Claim Your Free Pro Access
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Invite code <span className="font-mono text-yellow-400">{code}</span> will be auto-applied at registration
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-center text-2xl font-bold mb-8 text-gray-300">What you get with Pro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <b.icon className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{b.title}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share */}
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h2 className="text-xl font-bold mb-2 text-gray-300">Share this invite</h2>
        <p className="text-sm text-gray-500 mb-6">Invite more friends — grow the network together</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={() => handleShare('linkedin')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A66C2] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <span className="font-bold text-base">in</span> LinkedIn
          </button>
          <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Share2 className="w-4 h-4" /> WhatsApp
          </button>
          <button onClick={() => handleShare('facebook')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1877F2] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <span className="font-bold text-base">f</span> Facebook
          </button>
          <button onClick={handleCopyLink} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto px-6 py-12 text-center border-t border-white/5">
        <Link to="/" className="inline-block mb-4 hover:opacity-70 transition-opacity">
          <span className="text-3xl font-black tracking-tighter text-white/80">22.</span>
        </Link>
        <p className="text-xs text-gray-600">Studio22 Creative Network — Connecting filmmakers, creators, and production teams worldwide.</p>
        <p className="text-xs text-gray-700 mt-2">
          Already have an account?{' '}
          <button onClick={() => navigate('/SignIn')} className="text-yellow-500 hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}