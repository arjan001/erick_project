import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, User, Lock, Mail } from 'lucide-react'
import { validateInvitationToken, acceptInvitation } from '@/lib/teamInvitationService'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast.jsx'
import { hashData } from '@/lib/dataEncryption'
import SEOMetaTags from '@/components/SEOMetaTags'

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { success, error: toastError } = useToast()

  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState(null)
  const [validationError, setValidationError] = useState(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    skills: ''
  })

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setValidationError('No invitation token provided')
      setValidating(false)
      setLoading(false)
      return
    }

    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      const result = await validateInvitationToken(token)

      if (result.valid) {
        setInvitation(result.invitation)
        // Pre-fill email from invitation
        setFormData(prev => ({
          ...prev,
          email: result.invitation.email
        }))
      } else {
        setValidationError(result.error)
      }
    } catch (error) {
      setValidationError('Failed to validate invitation')
    } finally {
      setValidating(false)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    // Validate form
    if (!formData.first_name || !formData.last_name) {
      toastError('Validation Error', 'Please fill in your name')
      setSubmitting(false)
      return
    }

    if (!formData.password || formData.password.length < 8) {
      toastError('Validation Error', 'Password must be at least 8 characters')
      setSubmitting(false)
      return
    }

    if (formData.password !== formData.confirm_password) {
      toastError('Validation Error', 'Passwords do not match')
      setSubmitting(false)
      return
    }

    try {
      // Hash the password before sending
      const passwordHash = await hashData(formData.password)

      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        password_hash: passwordHash,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
      }

      const result = await acceptInvitation(token, userData)

      if (result.success) {
        // Auto-login the user
        await login(invitation.email, formData.password)

        success('Welcome!', 'You have successfully joined the team')
        navigate('/teamdashboard')
      } else {
        toastError('Error', result.error || 'Failed to accept invitation')
      }
    } catch (error) {
      toastError('Error', 'An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <SEOMetaTags
          title="Accept Invitation — SmartGigs Kenya"
          description="Validating your team invitation..."
          keywords="invitation, team, smartgigs kenya"
          ogImage="https://smartgigs.co.ke/og-invite.jpg"
          ogType="website"
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">Validating invitation...</p>
          </div>
        </div>
      </>
    )
  }

  if (validationError) {
    return (
      <>
        <SEOMetaTags
          title="Invalid Invitation — SmartGigs Kenya"
          description="This invitation link is invalid or has expired."
          keywords="invalid invitation, team, smartgigs kenya"
          ogImage="https://smartgigs.co.ke/og-error.jpg"
          ogType="website"
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
              <p className="text-gray-600 mb-6">{validationError}</p>
              <Button onClick={() => navigate('/')}>
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <SEOMetaTags
        title="Join Team — SmartGigs Kenya"
        description="Accept your team invitation and join SmartGigs Kenya."
        keywords="join team, invitation, smartgigs kenya"
        ogImage="https://smartgigs.co.ke/og-invite.jpg"
        ogType="website"
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Join the Team</CardTitle>
            <CardDescription>
              You've been invited to join SmartGigs Kenya as a team member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-2" />
                  <Input
                    type="email"
                    value={invitation?.email || ''}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Invitation sent to this email</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    <Input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="flex items-center">
                  <Lock className="w-5 h-5 text-gray-400 mr-2" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g., Video Editing, Sound Design, Directing"
                />
                <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Accept Invitation & Join Team'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>By accepting, you agree to SmartGigs Kenya's Terms of Service</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
