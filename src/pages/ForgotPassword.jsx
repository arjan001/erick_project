import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, ArrowLeft, CheckCircle, Shield, Lock, KeyRound } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export default function ForgotPassword() {
  const { success, error: toastError } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toastError('Error', 'Please enter your email address')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/ResetPassword`,
      })

      if (error) throw error

      setEmailSent(true)
      success('Email Sent', 'Check your email for the password reset link')
    } catch (err) {
      console.error('Password reset error:', err)
      toastError('Error', 'Failed to send password reset email')
    } finally {
      setLoading(false)
    }
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

          {!emailSent ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">Forgot Password?</h2>
                <p className="text-sm text-black/50">Enter your email to receive a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-black/70">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-black/50">
                Remember your password?{' '}
                <Link to="/SignIn" className="text-black font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-black mb-2">Check Your Email</h2>
              <p className="text-black/70 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-black/50 mb-6">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-black font-medium hover:underline"
                >
                  try again
                </button>
              </p>
              <Link to="/SignIn" className="inline-block text-sm text-black/50 hover:text-black">
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
