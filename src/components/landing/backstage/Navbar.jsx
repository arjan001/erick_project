import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MoreVertical } from 'lucide-react';

const NewBadge = ({ className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full bg-[#B2F5EA] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a3b32] ${className}`}
  >
    New
  </span>
);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 lg:px-8">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-7">
          <Link to="/" className="select-none">
            <span className="text-xl font-extrabold uppercase tracking-tight text-black">
              Backstage
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link to="/Jobs" className="text-sm font-medium text-black/80 hover:text-black">
              Find Jobs
            </Link>
            <button className="flex items-center gap-1 text-sm font-medium text-black/80 hover:text-black">
              Find Talent <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button className="flex items-center gap-1 text-sm font-medium text-black/80 hover:text-black">
              Resources <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <Link to="/ApplyArtist" className="text-sm font-medium text-black/80 hover:text-black">
              Agents
            </Link>
            <Link to="/Network" className="flex items-center gap-1.5 text-sm font-medium text-black/80 hover:text-black">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-black text-[9px] font-bold text-white">B</span>
              Community
              <NewBadge />
            </Link>
          </nav>
        </div>

        {/* Right: actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <button className="flex items-center gap-2 rounded-full border border-black/80 px-4 py-2 text-sm font-semibold text-black hover:bg-black/[0.03]">
            <NewBadge />
            Grow with UGC
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <Link
            to="/SignIn"
            className="rounded-full bg-[#4F46E5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4338CA]"
          >
            Join
          </Link>
          <button className="rounded-full border border-black/80 bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-black/[0.03]">
            Post a Job
          </button>
          <Link to="/SignIn" className="text-sm font-semibold text-black hover:underline">
            Sign in
          </Link>
          <button className="rounded-full p-1.5 hover:bg-black/[0.05]">
            <MoreVertical className="h-5 w-5 text-black" />
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-label="Menu"
        >
          <span className="block h-0.5 w-5 bg-black" />
          <span className="block h-0.5 w-5 bg-black" />
          <span className="block h-0.5 w-5 bg-black" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-black/5 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/Jobs" className="text-sm font-medium text-black">Find Jobs</Link>
            <span className="text-sm font-medium text-black">Find Talent</span>
            <span className="text-sm font-medium text-black">Resources</span>
            <Link to="/ApplyArtist" className="text-sm font-medium text-black">Agents</Link>
            <Link to="/Network" className="flex items-center gap-1.5 text-sm font-medium text-black">
              Community <NewBadge />
            </Link>
            <div className="mt-2 flex flex-col gap-2">
              <Link to="/SignIn" className="rounded-full bg-[#4F46E5] px-5 py-2 text-center text-sm font-semibold text-white">Join</Link>
              <button className="rounded-full border border-black/80 px-5 py-2 text-sm font-semibold text-black">Post a Job</button>
              <Link to="/SignIn" className="text-center text-sm font-semibold text-black">Sign in</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
