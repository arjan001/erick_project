import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/supabaseEntities'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.69-.93.95 0 2.58.4 3.36 1.56-2.91 1.51-2.45 5.45.48 6.88-.57 1.36-1.28 2.66-2.61 3.72zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
)

export default function Erick() {
  const { login, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user from public.users table to check role
      const user = data.user
      const userRecords = await User.filter({ id: user.id })
      const userRole = userRecords?.[0]?.role || user?.user_metadata?.role

      // Check if user is admin
      if (userRole !== 'admin') {
        await supabase.auth.signOut()
        setError('Access denied. Admin access only.')
        return
      }

      // Navigate to admin panel
      setTimeout(() => {
        navigate('/Admin')
      }, 500)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* LEFT PANEL */}
        <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16 bg-black">
          <div className="relative max-w-lg">
            <div className="mb-10">
              <p className="text-2xl font-bold leading-snug text-white md:text-3xl">
                "SmartGigs Kenya Admin Portal"
              </p>
            </div>
            <div className="mt-12">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                Secure Administration
              </p>
              <div className="mt-4">
                <p className="text-sm text-white/70">
                  You are currently logged in as an administrator.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-1 items-center justify-center bg-white px-8 py-12 lg:px-16">
          <div className="w-full max-w-sm">
            <Link to="/" className="mb-8 inline-block">
              <span className="text-xl font-extrabold uppercase tracking-tight text-black">SmartGigs Kenya</span>
            </Link>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-black">Already Logged In</h1>
              <p className="mt-1 text-sm text-black/50">You are currently logged in as an administrator.</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Logout
            </button>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-black/50 hover:text-black">
                ← Back to main site
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* LEFT PANEL - Dark with branding */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16 bg-black">
        <div className="relative max-w-lg">
          <div className="mb-10">
            <p className="text-2xl font-bold leading-snug text-white md:text-3xl">
              "Secure access to SmartGigs Kenya administration panel."
            </p>
          </div>
          <div className="mt-12">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">
              Restricted Access
            </p>
            <div className="mt-4">
              <p className="text-sm text-white/70">
                This area is monitored and logged. Only authorized administrators may access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Auth form */}
      <div className="flex flex-1 items-center justify-center bg-white px-8 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link to="/" className="mb-8 inline-block">
            <span className="text-xl font-extrabold uppercase tracking-tight text-black">SmartGigs Kenya</span>
          </Link>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black">Admin Access</h1>
            <p className="mt-1 text-sm text-black/50">Sign in to access the administration panel</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-black/70">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartgigskenya.com"
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-black/70">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-black/50 hover:text-black">
              ← Back to main site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
