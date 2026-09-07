import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ericrabar_cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ericrabar_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('ericrabar_cookie_consent', 'rejected');
    setVisible(false);
  };

  const handleManage = () => {
    localStorage.setItem('ericrabar_cookie_consent', 'managed');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-[1400px] px-4 py-4 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: logo + text */}
          <div className="flex items-start gap-3 lg:max-w-2xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black">
              <span className="text-sm font-black text-white">B</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-600 lg:text-sm">
              We use cookies to provide the best possible experience. Cookies are used to streamline
              your log-in experience, collect statistics to improve site functionality, personalize
              ad content, and enhance security. Click "Accept" to allow this, "Reject" to reject, or
              "Manage Preferences" to make more choices. To change your choices at any time, click the
              cookie settings at the bottom of the website. For more information, see our{' '}
              <Link to="/legal/cookies" className="font-bold text-black underline">
                Cookie Policy
              </Link>
              .
            </p>
          </div>

          {/* Right: buttons */}
          <div className="flex shrink-0 items-center gap-2 lg:gap-3">
            <button
              onClick={handleManage}
              className="rounded-lg border border-black bg-white px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-gray-50 lg:text-sm"
            >
              Manage Preferences
            </button>
            <button
              onClick={handleReject}
              className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800 lg:text-sm"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800 lg:text-sm"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
