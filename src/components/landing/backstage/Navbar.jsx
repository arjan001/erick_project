import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MoreVertical, Star, Handshake } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/lib/AuthContext';

const NewBadge = ({ className = '' }) => (
  <span className={`inline-flex items-center rounded-full bg-[#B2F5EA] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a3b32] ${className}`}>
    New
  </span>
);

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const joinRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (joinRef.current && !joinRef.current.contains(e.target)) setJoinOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white">
      <div className="mx-auto flex h-24 max-w-[1400px] items-center justify-between px-4 lg:px-8">
        {/* Left: logo */}
        <div className="flex items-center">
          <Link to="/" className="select-none">
            <Logo />
          </Link>
        </div>

        {/* Center: nav links - evenly spaced and centered */}
        <nav className="hidden flex-1 items-center justify-center gap-12 lg:flex">
          <Link to="/FindJobs" className="text-sm font-bold text-black/80 hover:text-black">
            Find Jobs
          </Link>
          <Link to="/talent" className="text-sm font-bold text-black/80 hover:text-black">
            Find Talent
          </Link>
          <Link to="/Shop" className="text-sm font-bold text-black/80 hover:text-black">
            Shop
          </Link>
          <Link to="/About" className="text-sm font-bold text-black/80 hover:text-black">
            About
          </Link>
        </nav>

        {/* Right: actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Join with dropdown */}
          <div className="relative" ref={joinRef}>
            <button
              onClick={() => setJoinOpen(!joinOpen)}
              className="flex items-center gap-2 rounded-full bg-[#10B981] px-6 py-3 text-sm font-bold text-white hover:bg-[#059669]"
            >
              Join
            </button>
            {joinOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
                <Link to="/SignIn?role=creator" onClick={() => setJoinOpen(false)} className="flex items-start gap-3 px-4 py-4 hover:bg-black/[0.03]">
                  <Star className="mt-0.5 h-5 w-5 shrink-0 text-[#5842D3]" />
                  <div>
                    <p className="text-sm font-bold text-black">I'm Talent</p>
                    <p className="text-xs text-black/50">Build your profile and start submitting today</p>
                  </div>
                </Link>
                <div className="h-px bg-black/5" />
                <Link to="/SignIn?role=client" onClick={() => setJoinOpen(false)} className="flex items-start gap-3 px-4 py-4 hover:bg-black/[0.03]">
                  <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-[#5842D3]" />
                  <div>
                    <p className="text-sm font-bold text-black">I'm Hiring</p>
                    <p className="text-xs text-black/50">Find top talent for your next project</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link to={isAuthenticated ? "/SubmitProject" : "/SignIn"} className="rounded-full border-2 border-black bg-white px-6 py-3 text-sm font-bold text-black hover:bg-black/[0.03]">
            Post a Job
          </Link>
          <Link to="/SignIn" className="text-sm font-bold text-black hover:underline">
            Sign in
          </Link>
          <button className="rounded-full p-1.5 hover:bg-black/[0.05]">
            <MoreVertical className="h-5 w-5 text-black" />
          </button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden" aria-label="Menu">
          <span className="block h-0.5 w-5 bg-black" />
          <span className="block h-0.5 w-5 bg-black" />
          <span className="block h-0.5 w-5 bg-black" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-black/5 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/FindJobs" className="text-sm font-bold text-black">Find Jobs</Link>
            <Link to="/talent" className="text-sm font-bold text-black">Find Talent</Link>
            <Link to="/Shop" className="text-sm font-bold text-black">Shop</Link>
            <Link to="/About" className="text-sm font-bold text-black">About</Link>
            <div className="mt-2 flex flex-col gap-2">
              <Link to="/SignIn?role=creator" className="rounded-full bg-[#10B981] px-5 py-2 text-center text-sm font-semibold text-white">Join as Talent</Link>
              <Link to="/SignIn?role=client" className="rounded-full bg-[#10B981] px-5 py-2 text-center text-sm font-semibold text-white">Join as Client</Link>
              <Link to={isAuthenticated ? "/SubmitProject" : "/SignIn"} className="rounded-full border-2 border-black bg-white px-5 py-2 text-center text-sm font-semibold text-black">Post a Job</Link>
              <Link to="/SignIn" className="text-center text-sm font-semibold text-black">Sign in</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
