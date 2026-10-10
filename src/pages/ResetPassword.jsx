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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <Link to="/SignIn" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Enter your new password below.
            </p>
          </div>

          {!resetSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Password Reset Successful</h2>
              <p className="text-gray-600 mb-6">
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
