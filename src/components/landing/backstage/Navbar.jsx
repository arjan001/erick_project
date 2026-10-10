import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MoreVertical, ShoppingBag, Heart, ChevronDown } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '@/lib/AuthContext'
import { getCart, getWishlist } from '@/services/shopService'

const NewBadge = ({ className = '' }) => (
  <span className={`inline-flex items-center rounded-full bg-[#B2F5EA] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a3b32] ${className}`}>
    New
  </span>
)

export default function Navbar() {
  const { isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const joinRef = useRef(null)

  // Load cart and wishlist items
  useEffect(() => {
    const loadItems = () => {
      setCartItems(getCart())
      setWishlistItems(getWishlist())
    }
    loadItems()

    // Listen for storage changes
    const handleStorageChange = () => loadItems()
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cart-updated', handleStorageChange)
    window.addEventListener('wishlist-updated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cart-updated', handleStorageChange)
      window.removeEventListener('wishlist-updated', handleStorageChange)
    }
  }, [])

  // Close dropdown when clicking outside
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
          {/* Join dropdown */}
          <div className="relative" ref={joinRef}>
            <button
              onClick={() => setJoinOpen(!joinOpen)}
              className="flex items-center gap-2 bg-[#4F46E5] px-6 py-3 text-sm font-bold text-white hover:bg-[#4338CA]"
            >
              Join
              <ChevronDown className="h-4 w-4" />
            </button>
            {joinOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setJoinOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-64 border border-gray-300 bg-white shadow-lg">
                  <div className="p-2">
                    <Link
                      to="/SignUp?role=artist"
                      onClick={() => setJoinOpen(false)}
                      className="block px-4 py-3 text-sm font-bold text-black hover:bg-gray-50"
                    >
                      I'm Talent
                    </Link>
                    <Link
                      to="/SignUp?role=client"
                      onClick={() => setJoinOpen(false)}
                      className="block px-4 py-3 text-sm font-bold text-black hover:bg-gray-50"
                    >
                      I'm Hiring
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
          <Link to={isAuthenticated ? "/SubmitProject" : "/SignIn"} className="rounded-full bg-[#4F46E5] px-6 py-3 text-sm font-bold text-white hover:bg-[#4338CA]">
            Post a Gig
          </Link>
          <Link to="/SignIn" className="text-sm font-bold text-black hover:underline">
            Sign in
          </Link>

          {/* Cart and Wishlist icons - only show when items exist */}
          {cartItems.length > 0 && (
            <Link to="/Cart" className="relative rounded-full p-2 hover:bg-black/[0.05]">
              <ShoppingBag className="h-5 w-5 text-black" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#4F46E5] text-[10px] font-bold text-white">
                {cartItems.length}
              </span>
            </Link>
          )}

          {wishlistItems.length > 0 && (
            <Link to="/Wishlist" className="relative rounded-full p-2 hover:bg-black/[0.05]">
              <Heart className="h-5 w-5 text-black" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
                {wishlistItems.length}
              </span>
            </Link>
          )}

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
            <div className="mt-2 flex flex-col gap-2">
              <Link to="/SignUp?role=artist" className="rounded-full bg-[#4F46E5] px-5 py-2 text-center text-sm font-bold text-white">I'm Talent</Link>
              <Link to="/SignUp?role=client" className="rounded-full bg-[#4F46E5] px-5 py-2 text-center text-sm font-bold text-white">I'm Hiring</Link>
              <Link to={isAuthenticated ? "/SubmitProject" : "/SignIn"} className="rounded-full bg-[#4F46E5] px-5 py-2 text-center text-sm font-bold text-white">Post a Gig</Link>
              <Link to="/SignIn" className="text-center text-sm font-bold text-black">Sign in</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
