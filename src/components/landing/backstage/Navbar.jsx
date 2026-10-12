import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, MoreVertical, Star, Handshake, ShoppingBag, Heart } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '@/lib/AuthContext'
import { useShop } from '@/contexts/ShopContext'

const NewBadge = ({ className = '' }) => (
  <span className={`inline-flex items-center rounded-full bg-[#B2F5EA] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a3b32] ${className}`}>
    New
  </span>
)

export default function Navbar() {
  const { isAuthenticated, user } = useAuth()
  const { cart, wishlist } = useShop()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const joinRef = useRef(null)

  const getDashboardUrl = () => {
    if (!user) return '/SignIn'
    const role = user.role
    if (role === 'artist' || role === 'artist_admin') return '/artistdashboard'
    if (role === 'team' || role === 'team_admin') return '/teamdashboard'
    if (role === 'client' || role === 'project_owner') return '/clientdashboard'
    if (role === 'backer') return '/backerdashboard'
    return '/SignIn'
  }

  useEffect(() => {
    const handler = (e) => {
      if (joinRef.current && !joinRef.current.contains(e.target)) setJoinOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
          <Link to="/FindGigs" className="text-sm font-bold text-black/80 hover:text-black">
            Find Gigs
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
          {/* Join with dropdown - only show when not authenticated */}
          {!isAuthenticated && (
            <div className="relative" ref={joinRef}>
              <button
                onClick={() => setJoinOpen(!joinOpen)}
                className="flex items-center gap-2 rounded-full bg-[#10B981] px-6 py-3 text-sm font-bold text-white hover:bg-[#059669]"
              >
                Join
              </button>
              {joinOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
                  <Link to="/SignUp?role=artist" onClick={() => setJoinOpen(false)} className="flex items-start gap-3 px-4 py-4 hover:bg-black/[0.03]">
                    <Star className="mt-0.5 h-5 w-5 shrink-0 text-[#5842D3]" />
                    <div>
                      <p className="text-sm font-bold text-black">I'm Talent</p>
                      <p className="text-xs text-black/50">Build your profile and start submitting today</p>
                    </div>
                  </Link>
                  <div className="h-px bg-black/5" />
                  <Link to="/SignUp?role=client" onClick={() => setJoinOpen(false)} className="flex items-start gap-3 px-4 py-4 hover:bg-black/[0.03]">
                    <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-[#5842D3]" />
                    <div>
                      <p className="text-sm font-bold text-black">I'm Hiring</p>
                      <p className="text-xs text-black/50">Find top talent for your next project</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link to={isAuthenticated ? getDashboardUrl() : "/SignIn"} className="rounded-full border-2 border-black bg-white px-6 py-3 text-sm font-bold text-black hover:bg-black/[0.03]">
            {isAuthenticated ? 'Dashboard' : 'Post a Gig'}
          </Link>

          {!isAuthenticated && (
            <Link to="/SignIn" className="text-sm font-bold text-black hover:underline">
              Sign in
            </Link>
          )}

          {/* Cart icon - always show */}
          <Link to="/Cart" className="relative rounded-full p-2 hover:bg-black/[0.05]">
            <ShoppingBag className="h-5 w-5 text-black" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#4F46E5] text-[10px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Wishlist icon - always show */}
          <Link to="/Wishlist" className="relative rounded-full p-2 hover:bg-black/[0.05]">
            <Heart className="h-5 w-5 text-black" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
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
            <Link to="/FindGigs" className="text-sm font-bold text-black">Find Gigs</Link>
            <Link to="/talent" className="text-sm font-bold text-black">Find Talent</Link>
            <Link to="/Shop" className="text-sm font-bold text-black">Shop</Link>
            <Link to="/About" className="text-sm font-bold text-black">About</Link>
            {!isAuthenticated && (
              <div className="mt-2 flex flex-col gap-2">
                <Link to="/SignUp?role=artist" className="rounded-full bg-[#10B981] px-5 py-2 text-center text-sm font-semibold text-white">Join as Talent</Link>
                <Link to="/SignUp?role=client" className="rounded-full bg-[#10B981] px-5 py-2 text-center text-sm font-semibold text-white">Join as Producer</Link>
                <Link to="/SignIn" className="text-center text-sm font-semibold text-black">Sign in</Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="mt-2">
                <Link to={getDashboardUrl()} className="rounded-full bg-black text-white px-5 py-2 text-center text-sm font-semibold w-full">Dashboard</Link>
              </div>
            )}
            {/* Cart and Wishlist on mobile */}
            <div className="flex gap-3 mt-2">
              <Link to="/Cart" className="flex items-center gap-2 text-sm font-bold text-black">
                <ShoppingBag className="h-4 w-4" />
                Cart {cart.length > 0 && `(${cart.length})`}
              </Link>
              <Link to="/Wishlist" className="flex items-center gap-2 text-sm font-bold text-black">
                <Heart className="h-4 w-4" />
                Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
