import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Gift, MessageCircle, Briefcase, Star, ArrowRight, Share2, Copy, Check, CheckCircle } from 'lucide-react';

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
    document.title = `${inviterName} invited you to join Studio22 Pro Beta`;
    setMeta('name', 'description', `${inviterName} has invited you to join Studio22 as a Pro Beta user. Connect with top film & creative talent, post projects, and grow your creative career.`);
    setMeta('property', 'og:title', `${inviterName} invited you to join Studio22 Pro Beta`);
    setMeta('property', 'og:description', `${inviterName} invites you to join Studio22 with invite code ${code}. Get Pro Beta access — more messages, more projects, priority features.`);
    setMeta('property', 'og:image', OG_IMAGE);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Studio22');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', `${inviterName} invited you to join Studio22 Pro Beta`);
    setMeta('name', 'twitter:description', `${inviterName} invites you to join Studio22 with invite code ${code}. Get Pro Beta access free.`);
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
      name: 'Studio22 Pro Beta Invite',
      description: `${inviterName} invited you to join Studio22 as a Pro Beta user`,
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
    { icon: CheckCircle, title: 'Priority Support', desc: 'Fast-track support and featured placement' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-black tracking-tighter text-gray-900">22.</span>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-300 text-gray-700 text-sm font-medium mb-8">
            <Gift className="w-4 h-4" />
            Invite Code: {code}
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 mb-4 tracking-tight">
            {inviterName !== 'Studio22' ? `${inviterName} invited you` : "YOU'RE INVITED"}
          </h1>
          <p className="text-2xl font-bold text-gray-900 mb-3">
            Pro Beta Release
          </p>
          <p className="text-lg text-gray-600 mb-8">
            At no cost — <span className="font-semibold text-gray-900">free</span> for invited creators
          </p>

          <button
            onClick={() => navigate(signupUrl)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-lg text-lg hover:bg-gray-800 transition-colors"
          >
            Claim Your Free Pro Access
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Invite code <span className="font-mono text-gray-700">{code}</span> will be auto-applied at registration
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">What you get with Pro</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{b.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Share this invite</h2>
          <p className="text-sm text-gray-600 mb-6">Invite more friends — grow the network together</p>
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
            <button onClick={handleCopyLink} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center border-t border-gray-200">
        <p className="text-xs text-gray-500">Studio22 Creative Network — Connecting filmmakers, creators, and production teams worldwide.</p>
        <p className="text-xs text-gray-500 mt-2">
          Already have an account?{' '}
          <button onClick={() => navigate('/SignIn')} className="text-gray-900 font-semibold hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}