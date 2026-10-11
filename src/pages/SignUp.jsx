import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Mail, Lock, Newspaper, ShieldCheck, Target, Check } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { Artist, Team, Backer, ProjectOwner, Invite, Connection } from '@/lib/supabaseEntities'
import MultiSelectAutocomplete from '@/components/MultiSelectAutocomplete'
import { ALL_FILM_ROLES, TALENT_ROLES, CLIENT_ROLES } from '@/lib/filmRoles'
import skillsAndRoles from '@/lib/skillsAndRoles.json'
import Logo from '@/components/landing/backstage/Logo'
import { listPartnerLogos } from '@/services/partnerLogoService'
import { useToast } from '@/hooks/useToast'

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

const ROLE_REDIRECTS = {
  artist: '/artistdashboard',
  team: '/teamdashboard',
  client: '/clientdashboard',
  backer: '/backerdashboard',
  admin: '/admin',
}

const talentBenefits = [
  { icon: Newspaper, text: 'Thousands of fresh gigs every week.' },
  { icon: ShieldCheck, text: 'Gigs vetted to meet our community guidelines.' },
  { icon: Target, text: 'Visibility in the #1 Visited Database for Talent.' },
]

export default function SignUp() {
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [userType, setUserType] = useState(searchParams.get('role') === 'client' ? 'employer' : 'talent')
  const [partnerLogos, setPartnerLogos] = useState([])

  useEffect(() => {
    listPartnerLogos().then(setPartnerLogos).catch(() => setPartnerLogos([]))
  }, [])

  const [formData, setFormData] = useState(() => {
    const roleParam = searchParams.get('role')
    return {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ['artist', 'client'].includes(roleParam) ? roleParam : 'artist',
      inviteCode: '',
      selectedRoles: [],
      selectedSkills: [],
      companyName: '',
    }
  })

  // Load skills based on user type
  const ALL_SKILLS = userType === 'talent'
    ? Object.values(skillsAndRoles.talent_skills_by_category || {}).flat()
    : Object.values(skillsAndRoles.client_skills_by_category || {}).flat()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteCodeValid, setInviteCodeValid] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState('idle') // idle, checking, available, taken
  const { success, error: toastError } = useToast()

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'client') {
      setUserType('employer')
      setFormData(prev => ({ ...prev, role: 'client' }))
    } else if (roleParam === 'artist') {
      setUserType('talent')
      setFormData(prev => ({ ...prev, role: 'artist' }))
    }
  }, [searchParams])

  // Check for invite code in URL query params or from invite landing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('ref') || urlParams.get('code')
    if (code) {
      setFormData(prev => ({ ...prev, inviteCode: code }))
      validateInviteCode(code)
    }
  }, [])

  const validateInviteCode = async (code) => {
    if (!code) {
      setInviteCodeValid(null)
      return
    }
    try {
      const invites = await Invite.filter({ code: code })
      const validInvite = invites?.find(i =>
        i.status === 'active' &&
        (i.max_uses === null || i.uses_count < i.max_uses)
      )
      setInviteCodeValid(!!validInvite)
    } catch (err) {
      //
      setInviteCodeValid(null)
    }
  }

  const handleInviteCodeChange = (e) => {
    const code = e.target.value.toUpperCase()
    setFormData(prev => ({ ...prev, inviteCode: code }))
    if (code) {
      validateInviteCode(code)
    } else {
      setInviteCodeValid(null)
    }
  }

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')
    try {
      // Check in artists table
      const artists = await Artist.filter({ username })
      if (artists && artists.length > 0) {
        setUsernameStatus('taken')
        return
      }

      // Check in teams table
      const teams = await Team.filter({ username })
      if (teams && teams.length > 0) {
        setUsernameStatus('taken')
        return
      }

      // Check in clients table
      const clients = await ProjectOwner.filter({ username })
      if (clients && clients.length > 0) {
        setUsernameStatus('taken')
        return
      }

      setUsernameStatus('available')
    } catch (err) {
      setUsernameStatus('idle')
    }
  }

  const handleUsernameChange = (e) => {
    const username = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setFormData(prev => ({ ...prev, username }))

    // Debounce availability check
    if (username.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(username)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setUsernameStatus('idle')
    }
  }

  const handleGoogleSignUp = () => {
    setError('')
    const role = userType === 'employer' ? 'client' : 'artist'
    sessionStorage.setItem('oauth_role_intent', role)
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/SignIn`
      }
    })
  }

  const handleAppleSignUp = () => {
    setError('')
    const role = userType === 'employer' ? 'client' : 'artist'
    sessionStorage.setItem('oauth_role_intent', role)
    supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/SignIn`
      }
    })
  }

  // Step 1: register the account with Supabase (no OTP - redirect to login)
  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            username: formData.username
          },
          emailRedirectTo: `${window.location.origin}/SignIn`
        }
      })
      if (error) throw error

      // Redirect to login page after successful registration
      setMessage('Registration successful! Please sign in to continue.')
      setTimeout(() => {
        navigate('/SignIn')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      setMessage('')
    } finally {
      setLoading(false)
    }
  }

  // OTP verification removed - redirecting to login instead

  const handleInviteModalClose = () => {
    setShowInviteModal(false)
    window.location.href = ROLE_REDIRECTS[formData.role] || '/'
  }

  const isEmployer = userType === 'employer'

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* LEFT PANEL */}
      <div className={`flex flex-1 flex-col justify-center px-8 py-12 lg:px-16 ${isEmployer ? 'bg-black' : 'bg-[#F7F5F0]'}`}>
        {isEmployer ? (
          /* Employer: black panel with testimonial */
          <div className="relative max-w-lg">
            <div className="mb-10">
              <p className="text-2xl font-bold leading-snug text-white md:text-3xl">
                "Each project is different, Backstage helps us cast with that flexibility in mind."
              </p>
            </div>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=80&h=80&fit=crop"
                alt="Dan Cangelosi"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-white">Dan Cangelosi</p>
                <p className="text-xs text-white/60">Senior Creative Producer at Jerry</p>
              </div>
            </div>
          </div>
        ) : (
          /* Talent: beige panel with value props */
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold leading-tight text-black md:text-4xl">
              Join for free.
            </h2>
            <h2 className="text-3xl font-bold leading-tight text-black md:text-4xl">
              Upgrade anytime.
            </h2>
            <div className="mt-8 space-y-4">
              {talentBenefits.map((b) => {
                const Icon = b.icon
                return (
                  <div key={b.text} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon className="w-5 h-5 text-black" />
                    </div>
                    <p className="text-sm text-gray-700">{b.text}</p>
                  </div>
                )
              })}
            </div>

            {partnerLogos.length > 0 && (
              <div className="mt-12">
                <p className="text-xs font-bold uppercase tracking-wider text-black/50">
                  Trusted by top studios and brands
                </p>
                <div className="mt-4 flex flex-wrap gap-6 items-center">
                  {partnerLogos.map((l) => (
                    <img
                      key={l.id}
                      src={l.logo_url}
                      alt={l.name}
                      className="h-8 w-auto max-w-[120px] object-contain opacity-40 grayscale"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Link to="/" className="inline-block">
              <Logo />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isEmployer ? 'Create employer account' : 'Create talent account'}
          </h1>
          <p className="text-gray-600 mb-6">
            {isEmployer
              ? 'Post gigs and find the perfect talent for your productions.'
              : 'Get discovered and land your next gig.'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Social Sign Up */}
            <button
              type="button"
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-md flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              onClick={handleGoogleSignUp}
            >
              <GoogleIcon />
              <span>Sign up with Google</span>
            </button>

            <button
              type="button"
              className="w-full bg-black text-white hover:bg-gray-800 font-medium py-3 px-4 rounded-md flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              onClick={handleAppleSignUp}
            >
              <AppleIcon />
              <span>Sign up with Apple</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black pr-12"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                disabled={loading}
                required
              />
            </div>

            {!isEmployer && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Username <span className="text-gray-500">(for profile sharing)</span></label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  placeholder="johndoe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={loading}
                  required
                />
                <div className="mt-1">
                  {usernameStatus === 'checking' && (
                    <p className="text-xs text-gray-500">Checking availability...</p>
                  )}
                  {usernameStatus === 'available' && (
                    <p className="text-xs text-green-600">✓ Username available</p>
                  )}
                  {usernameStatus === 'taken' && (
                    <p className="text-xs text-red-600">✗ Username already taken</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Your profile will be accessible at smartgigskenya.com/username</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Invite Code (optional)</label>
              <input
                type="text"
                value={formData.inviteCode}
                onChange={handleInviteCodeChange}
                placeholder="e.g., SG-ABC123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black uppercase"
                disabled={loading}
                maxLength={10}
              />
              {inviteCodeValid === true && (
                <p className="text-xs text-green-600 mt-1">✓ Valid invite code - you'll get a free Pro subscription!</p>
              )}
              {inviteCodeValid === false && (
                <p className="text-xs text-red-600 mt-1">✗ Invalid invite code</p>
              )}
            </div>

            {!isEmployer && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Select Your Roles <span className="text-gray-500">(multi-select)</span></label>
                  <MultiSelectAutocomplete
                    options={TALENT_ROLES}
                    selected={formData.selectedRoles}
                    onChange={(selected) => setFormData({ ...formData, selectedRoles: selected })}
                    placeholder="Search and select your roles (Acting, Voiceover, UGC, Lip Sync, etc.)..."
                    searchable={true}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Select Your Skills <span className="text-gray-500">(multi-select)</span></label>
                  <MultiSelectAutocomplete
                    options={ALL_SKILLS}
                    selected={formData.selectedSkills}
                    onChange={(selected) => setFormData({ ...formData, selectedSkills: selected })}
                    placeholder="Search and select your skills..."
                    searchable={true}
                  />
                </div>
              </>
            )}

            {isEmployer && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Your Role/Title <span className="text-gray-500">(multi-select)</span></label>
                  <MultiSelectAutocomplete
                    options={CLIENT_ROLES}
                    selected={formData.selectedRoles}
                    onChange={(selected) => setFormData({ ...formData, selectedRoles: selected })}
                    placeholder="Search and select your role (Casting Director, Producer, Director, etc.)..."
                    searchable={true}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Company/Organization Name</label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter your company or organization name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 font-medium py-3 rounded-lg"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/SignIn" className="font-semibold text-black hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to SmartGigs Kenya!</h3>
            <p className="text-gray-600 mb-4">
              Your invite code was successfully applied. You now have access to Pro features!
            </p>
            <button
              onClick={handleInviteModalClose}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
