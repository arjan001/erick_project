import React, { useState } from 'react'
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
      {/* LEFT PANEL — Content */}
      <div className="flex flex-1 items-center justify-center bg-[#F5F3EF] px-8 py-12 lg:px-16">
        <div className="max-w-lg">
          <Link to="/SignIn" className="inline-flex items-center text-black/60 hover:text-black mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>

          <h1 className="text-3xl font-bold leading-tight text-black md:text-4xl mb-4">
            Reset your password
          </h1>
          <p className="text-lg text-black/70 mb-12">
            We'll send you a secure link to reset your password and get you back into your account.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/[0.06]">
                <Shield className="h-5 w-5 text-black/70" />
              </div>
              <div>
                <h3 className="font-semibold text-black">Secure recovery</h3>
                <p className="pt-1 text-sm text-black/70">Password reset links are sent securely and expire after 1 hour.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/[0.06]">
                <Lock className="h-5 w-5 text-black/70" />
              </div>
              <div>
                <h3 className="font-semibold text-black">Keep your account safe</h3>
                <p className="pt-1 text-sm text-black/70">Choose a strong password with letters, numbers, and symbols.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/[0.06]">
                <KeyRound className="h-5 w-5 text-black/70" />
              </div>
              <div>
                <h3 className="font-semibold text-black">Quick access</h3>
                <p className="pt-1 text-sm text-black/70">Once reset, you'll be able to log in immediately with your new password.</p>
              </div>
            </div>
          </div>
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
