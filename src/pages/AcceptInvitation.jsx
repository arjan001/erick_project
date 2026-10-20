import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { TeamInvitation, TeamMember } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle, Users, Building2, Mail, Lock, User as UserIcon } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/lib/AuthContext'

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState(null)
  const [client, setClient] = useState(null)
  const [status, setStatus] = useState('loading') // loading, valid, expired, accepted, error
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setLoading(false)
      return
    }
    loadInvitation()
  }, [token])

  const loadInvitation = async () => {
    try {
      const invitations = await TeamInvitation.filter({ token })
      if (!invitations || invitations.length === 0) {
        setStatus('error')
        setLoading(false)
        return
      }

      const inv = invitations[0]

      // Check if expired
      if (new Date(inv.expires_at) < new Date()) {
        await TeamInvitation.update(inv.id, { status: 'expired' })
        setStatus('expired')
        setLoading(false)
        return
      }

      // Check if already accepted
      if (inv.status === 'accepted') {
        setStatus('accepted')
        setLoading(false)
        return
      }

      // Load inviter info
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', inv.invited_by)
        .single()

      setClient({ company_name: userData?.full_name || 'SmartGigs Kenya' })
      setInvitation(inv)
      setStatus('valid')
      setLoading(false)
    } catch (err) {
      console.error('Error loading invitation:', err)
      setStatus('error')
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    setSubmitting(true)
    try {
      if (!isAuthenticated) {
        // Redirect to sign in with invitation token
        navigate(`/SignIn?invitation_token=${token}`)
        return
      }

      // Create team member record using user_id
      await TeamMember.create({
        user_id: authUser.id,
        email: authUser.email,
        role: invitation.role,
        status: 'active'
      })

      // Update invitation status
      await TeamInvitation.update(invitation.id, {
        status: 'accepted',
        accepted_by: authUser.id,
        accepted_at: new Date().toISOString()
      })

      success('Invitation Accepted', 'You have successfully joined the team!')
      navigate('/ClientDashboard')
    } catch (err) {
      console.error('Error accepting invitation:', err)
      toastError('Accept Failed', err.message || 'Failed to accept invitation')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterAndAccept = async () => {
    if (password !== confirmPassword) {
      toastError('Passwords Don\'t Match', 'Please make sure your passwords match')
      return
    }

    if (password.length < 6) {
      toastError('Password Too Short', 'Password must be at least 6 characters')
      return
    }

    setSubmitting(true)
    try {
      // Sign up user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password
      })

      if (signUpError) throw signUpError

      if (signUpData.user) {
        // Create team member record using user_id
        await TeamMember.create({
          user_id: signUpData.user.id,
          email: invitation.email,
          role: invitation.role,
          status: 'active'
        })

        // Update invitation status
        await TeamInvitation.update(invitation.id, {
          status: 'accepted',
          accepted_by: signUpData.user.id,
          accepted_at: new Date().toISOString()
        })

        success('Account Created', 'Your account has been created and you have joined the team!')
        navigate('/SignIn')
      }
    } catch (err) {
      console.error('Error registering:', err)
      toastError('Registration Failed', err.message || 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">This invitation link is invalid or has been removed.</p>
          <Button onClick={() => navigate('/')} className="w-full">
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">This invitation has expired. Please contact the team admin for a new invitation.</p>
          <Button onClick={() => navigate('/')} className="w-full">
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Accepted</h1>
          <p className="text-gray-600 mb-6">You have already accepted this invitation.</p>
          <Button onClick={() => navigate('/ClientDashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Invitation</h1>
          <p className="text-gray-600">You've been invited to join a team</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-medium text-gray-900">{client?.company_name || 'SmartGigs Kenya'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Invited Email</p>
              <p className="font-medium text-gray-900">{invitation?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900 capitalize">{invitation?.role}</p>
            </div>
          </div>
        </div>

        {isAuthenticated ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              You're signed in as <strong>{authUser?.email}</strong>
            </p>
            <Button
              onClick={handleAccept}
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? 'Accepting...' : 'Accept Invitation'}
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Create an account to accept this invitation
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 6 characters)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>
              <Button
                onClick={handleRegisterAndAccept}
                disabled={submitting}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {submitting ? 'Creating Account...' : 'Create Account & Accept'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Already have an account? <button onClick={() => navigate(`/SignIn?invitation_token=${token}`)} className="text-purple-600 hover:underline">Sign in</button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
