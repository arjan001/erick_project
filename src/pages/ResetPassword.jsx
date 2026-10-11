import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export default function ResetPassword() {
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  // Film-related background images
  const bgImages = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ80BIneprBn303gn_nFSMY4CASRK0N6vKrGbQpQm8frNwgOvOpJaoje1Q&s=10',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS140ZRIPcOyHbT0V0I8DQMLPeHnWf03cBs8KX4Rio3F1uN0HpGvZjnUNU&s=10'
  ]
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgImages.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check if we have the access token from the reset link
    const accessToken = searchParams.get('access_token')
    const hash = window.location.hash
    const hashToken = hash.includes('access_token')
    if (!accessToken && !hashToken) {
      toastError('Invalid Link', 'This password reset link is invalid or has expired')
      navigate('/ForgotPassword')
    }
  }, [searchParams, navigate, toastError])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password || password.length < 6) {
      toastError('Error', 'Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      toastError('Error', 'Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setResetSuccess(true)
      success('Password Reset', 'Your password has been successfully reset')
    } catch (err) {
      console.error('Password reset error:', err)
      toastError('Error', 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    navigate('/SignIn')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT PANEL — Film Image Background */}
      <div className="flex-1 relative bg-black overflow-hidden hidden lg:flex">
        <img
          src={bgImages[currentBgIndex]}
          alt="Film production"
          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-12 text-white">
          <h1 className="text-4xl font-bold mb-4">SmartGigs Kenya</h1>
          <p className="text-xl text-white/80 text-center max-w-md">
            Connecting Kenya's film industry with top talent and opportunities
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="flex flex-1 items-center justify-center bg-white px-8 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link to="/" className="mb-8 inline-block">
            <span className="text-xl font-extrabold uppercase tracking-tight text-black">SmartGigs Kenya</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-2">Reset Password</h2>
            <p className="text-sm text-black/50">Enter your new password below</p>
          </div>

          {!resetSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black/70 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black/70 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-black mb-2">Password Reset Successful</h2>
              <p className="text-black/70 mb-6">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <Button
                onClick={handleContinue}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                Continue to Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
