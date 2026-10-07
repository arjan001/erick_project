import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, MapPin, Clock, DollarSign, Share2, Heart, Building2, BadgeCheck, Briefcase, ChevronDown, ChevronUp, Crown, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { canApplyForJobs, canContactJobPoster } from '@/services/subscriptionService';

export default function GigDetailSlideOut({ job, onClose }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [expandedRoles, setExpandedRoles] = useState(false);
  const [requiresSubscription, setRequiresSubscription] = useState(false);

  if (!job) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: job.title, text: job.description || job.body || '', url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  const handleApply = async (role) => {
    if (!isAuthenticated) {
      navigate('/SignIn', { state: { returnTo: window.location.pathname, job: job.title } });
      return;
    }

    // Check if user has active subscription
    const canApply = await canApplyForJobs(user?.id);
    if (!canApply) {
      setRequiresSubscription(true);
      return;
    }

    // Handle application logic here
    console.log('Applying for role:', role);
  };

  const handleContactPoster = async () => {
    if (!isAuthenticated) {
      navigate('/SignIn', { state: { returnTo: window.location.pathname, job: job.title } });
      return;
    }

    // Check if user has active subscription
    const canContact = await canContactJobPoster(user?.id);
    if (!canContact) {
      setRequiresSubscription(true);
      return;
    }

    // Handle contact logic here
    console.log('Contacting job poster');
  };

  const toggleRoles = () => {
    setExpandedRoles(!expandedRoles);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 transition-opacity"
        onClick={onClose}
      />
      {/* Panel — slides in from right */}
      <div className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-4xl flex-col overflow-y-auto bg-white shadow-2xl md:max-w-5xl">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 md:px-6">
          <div className="flex items-center gap-2">
            {job.featured && (
              <span className="flex items-center gap-1 rounded-full bg-[#e11d48] px-3 py-1 text-xs font-bold text-white">
                <BadgeCheck className="h-3.5 w-3.5" /> Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="rounded-full p-2 hover:bg-gray-100" aria-label="Share">
              <Share2 className="h-4 w-4 text-black/60" />
            </button>
            <button className="rounded-full p-2 hover:bg-gray-100" aria-label="Save">
              <Heart className="h-4 w-4 text-black/60" />
            </button>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close">
              <X className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-6 md:px-6">
          {/* Title */}
          <h1 className="text-xl font-bold text-black md:text-2xl">{job.title}</h1>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-black/60">
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" /> {job.pay || 'Pay not specified'}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Posted {job.posted || 'Recently'}
            </span>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {job.tags.map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-black/70">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="my-6 border-t border-gray-100" />

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-black/50">Description</h3>
            <p className="mt-2 text-sm leading-relaxed text-black/80">{job.description || job.body || 'No description available.'}</p>
          </div>

          {/* Roles */}
          {job.roles && job.roles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-black/50">
                  Available Roles ({job.roles.length})
                </h3>
                {job.roles.length > 3 && (
                  <button
                    onClick={toggleRoles}
                    className="flex items-center gap-1 text-xs font-semibold text-[#8B5CF6] hover:text-[#7C3AED]"
                  >
                    {expandedRoles ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show All
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-3">
                {(expandedRoles ? job.roles : job.roles.slice(0, 3)).map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-[#8B5CF6]/30 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-black">{r.title}</p>
                      {r.pay && <p className="mt-0.5 text-xs text-black/50">{r.pay}</p>}
                      {r.details && <p className="mt-0.5 text-xs text-black/40">{r.details}</p>}
                    </div>
                    <button
                      onClick={() => handleApply(r)}
                      className="ml-4 shrink-0 rounded-full bg-[#8B5CF6] px-5 py-2 text-xs font-semibold text-white hover:bg-[#7C3AED]"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company info with link to producer profile */}
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F46E5]/10">
                <Building2 className="h-5 w-5 text-[#4F46E5]" />
              </div>
              <div className="flex-1">
                <Link
                  to={`/ClientPublicProfile/${job.posted_by || job.company_id || 'default'}`}
                  className="text-sm font-bold text-black hover:text-[#4F46E5] flex items-center gap-1"
                >
                  {job.project || job.company || 'Production Company'}
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <p className="text-xs text-black/50">View producer profile</p>
              </div>
              <button
                onClick={handleContactPoster}
                className="shrink-0 rounded-full bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4338CA]"
              >
                Contact
              </button>
            </div>
          </div>
        </div>

        {/* Subscription required banner */}
        {requiresSubscription && (
          <div className="mx-5 mb-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] p-4 md:mx-6">
            <div className="flex items-start gap-3">
              <Crown className="mt-0.5 h-5 w-5 text-white" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Subscription Required</p>
                <p className="mt-1 text-xs text-white/90">
                  Contacting job posters and applying for roles requires an active subscription.
                </p>
                <button
                  onClick={() => navigate('/Subscribe')}
                  className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#8B5CF6] hover:bg-gray-100"
                >
                  View Subscription Plans
                </button>
              </div>
              <button
                onClick={() => setRequiresSubscription(false)}
                className="rounded-full p-1 hover:bg-white/20"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Footer CTA — sticky at bottom */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white px-5 py-4 md:px-6">
          <button
            onClick={() => handleApply({ title: job.title })}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8B5CF6] py-3 text-sm font-semibold text-white hover:bg-[#7C3AED]"
          >
            <Briefcase className="h-4 w-4" />
            Apply to This Production
          </button>
        </div>
      </div>
    </>
  );
}
