import React, { useState, useEffect } from 'react'
import { Artist, Team, Backer, ProjectOwner, Invite } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'
import { Copy, Check, Gift, UserPlus, Share2, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/hooks/useToast.jsx'

export default function InviteCodeCard() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [inviteCode, setInviteCode] = useState('')
  const [trackingCode, setTrackingCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [applicants, setApplicants] = useState([])

  useEffect(() => {
    const fetchInviteCode = async () => {
      if (!user?.email) return
      setLoading(true)
      try {
        // Try to get existing invite code from invites table directly
        try {
          const existingInvites = await Invite.filter({ inviter_email: user.email, status: 'active' })
          if (existingInvites && existingInvites.length > 0) {
            const invite = existingInvites[0]
            setInviteCode(invite.code)
            setTrackingCode(invite.tracking_code || '')

            // Get applicants who used this invite
            const allInvites = await Invite.filter({ inviter_email: user.email })
            const applicants = allInvites
              .filter(inv => inv.applicant_email && inv.status === 'used')
              .map(inv => ({
                email: inv.applicant_email,
                name: inv.applicant_name || inv.applicant_email,
                type: inv.applicant_type || 'user',
                avatar: null
              }))
            setApplicants(applicants)
          }
        } catch (inviteErr) {
          console.warn('Could not load existing invites:', inviteErr)
          // Don't fail - allow user to generate a new code
        }
      } catch (err) {
        console.warn('Could not load invite code:', err)
        // Don't show error toast - allow user to generate a new code
      } finally {
        setLoading(false)
      }
    }
    fetchInviteCode()
  }, [user])

  const referralLink = `${window.location.origin}/invite/${inviteCode}?inviter=${encodeURIComponent(user?.full_name || 'SmartGigs Kenya')}&track=${trackingCode}`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopiedCode(true)
    success('Copied', 'Invite code copied to clipboard')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopiedLink(true)
    success('Copied', 'Referral link copied')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleGenerateCode = async () => {
    if (!user?.email) return
    setGenerating(true)
    try {
      // Try to get profile, but don't fail if it doesn't exist
      let profile = null
      let entity = null

      try {
        if (user.role === 'artist' || user.role === 'artist_admin') {
          const artists = await Artist.filter({ email: user.email })
          profile = artists?.[0]
          entity = Artist
        } else if (user.role === 'team' || user.role === 'team_admin') {
          const teams = await Team.filter({ contact_email: user.email })
          profile = teams?.[0]
          entity = Team
        } else if (user.role === 'backer') {
          const backers = await Backer.filter({ contact_email: user.email })
          profile = backers?.[0]
          entity = Backer
        } else if (user.role === 'client' || user.role === 'project_owner') {
          const owners = await ProjectOwner.filter({ email: user.email })
          profile = owners?.[0]
          entity = ProjectOwner
        }
      } catch (profileErr) {
        console.warn('Could not fetch profile, using user data instead:', profileErr)
      }

      // Generate unique invite code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = 'SG-'
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]

      // Check if code already exists
      let isUnique = false
      let attempts = 0
      while (!isUnique && attempts < 10) {
        try {
          const existing = await Invite.filter({ code })
          if (!existing || existing.length === 0) {
            isUnique = true
          } else {
            code = 'SG-'
            for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
            attempts++
          }
        } catch (err) {
          // If Invite filter fails, assume code is unique
          console.warn('Invite filter failed, assuming code is unique:', err)
          isUnique = true
        }
      }

      if (!isUnique) {
        toastError('Error', 'Could not generate unique code')
        setGenerating(false)
        return
      }

      // Generate tracking code
      const trackingChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let trackingCode = ''
      for (let i = 0; i < 4; i++) trackingCode += trackingChars[Math.floor(Math.random() * trackingChars.length)]

      const inviterName = profile?.full_name || profile?.team_name || profile?.organization_name || user.full_name || user.email

      // Save to invites table
      try {
        await Invite.create({
          code,
          inviter_email: user.email,
          inviter_name: inviterName,
          inviter_role: user.role,
          inviter_entity_id: profile?.id || null,
          tracking_code: trackingCode,
          status: 'active',
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        })
      } catch (createErr) {
        console.error('Create invite error:', createErr)
        // If create fails, still set the code locally for the user
        console.warn('Failed to save invite to database, but code is generated')
      }

      setInviteCode(code)
      setTrackingCode(trackingCode)
      success('Success', 'Your invite code has been generated')
    } catch (err) {
      console.error('Generate invite code error:', err)
      toastError('Error', 'Failed to generate invite code')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return null

  return (
    <div className="rounded-2xl border border-gray-100 p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Invite an artist to join SmartGigs Kenya Pro Beta</h3>
            <p className="text-sm text-gray-500">Share your code and grow the network</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Your Invite Code</label>
          {inviteCode ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono font-bold text-gray-900 text-sm tracking-wider border border-gray-100">
                {inviteCode}
              </div>
              <button onClick={handleCopyCode} className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                {copiedCode ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateCode}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              disabled={generating}
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  Generate Your Invite Code
                </>
              )}
            </button>
          )}
        </div>

        {inviteCode && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Referral Link</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 border border-gray-100 truncate">
                  {referralLink}
                </div>
                <button onClick={handleCopyLink} className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <LinkIcon className="w-4 h-4 text-gray-600" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Tracking Code (for analytics)</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono font-bold text-gray-900 text-sm tracking-wider border border-gray-100">
                  {trackingCode || '---'}
                </div>
              </div>
            </div>

            <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              <Share2 className="w-4 h-4" />
              Share Referral Link
            </button>
          </>
        )}

        {applicants.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-semibold text-gray-900">People who used your code ({applicants.length})</h4>
            </div>
            <div className="space-y-2">
              {applicants.map((applicant, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {applicant.avatar ? (
                      <img src={applicant.avatar} alt={applicant.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-gray-600">{applicant.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{applicant.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{applicant.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}