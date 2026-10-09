// Team Invitation Service
// Handles team member invitations, acceptance, and registration

import { TeamInvitation, TeamMember } from '@/lib/supabaseEntities'
import { sendTeamInvitationEmail } from '@/shared/services/emailService'

export const createTeamInvitation = async (teamId, email, role, inviterName, metadata = {}) => {
  try {
    const token = generateInviteToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await TeamInvitation.create({
      team_id: teamId,
      email: email,
      role: role,
      token: token,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      roles: metadata.roles || [],
      skills: metadata.skills || [],
      profile_image: metadata.profile_image || null
    })

    const inviteUrl = `${window.location.origin}/accept-invite`
    const emailResult = await sendTeamInvitationEmail(
      email,
      'SmartGigs Kenya Team',
      inviterName,
      'Team Name',
      inviteUrl
    )

    if (!emailResult.success) {
    }

    return { success: true, invitation, emailSent: emailResult.success }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const validateInvitationToken = async (token) => {
  try {
    const invitations = await TeamInvitation.filter({ token: token })

    if (!invitations || invitations.length === 0) {
      return { valid: false, error: 'Invalid invitation token' }
    }

    const invitation = invitations[0]

    if (invitation.status === 'accepted') {
      return { valid: false, error: 'Invitation already accepted' }
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return { valid: false, error: 'Invitation has expired' }
    }

    if (invitation.status === 'revoked') {
      return { valid: false, error: 'Invitation has been revoked' }
    }

    return { valid: true, invitation }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

export const acceptInvitation = async (token, userData) => {
  try {
    const validation = await validateInvitationToken(token)

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const invitation = validation.invitation

    const teamMember = await TeamMember.create({
      team_id: invitation.team_id,
      name: `${userData.first_name} ${userData.last_name}`,
      role: invitation.role,
      skills: invitation.skills || userData.skills || [],
      roles: invitation.roles || [],
      avatar_url: invitation.profile_image || userData.avatar_url || null,
      created_at: new Date().toISOString()
    })

    await TeamInvitation.update(invitation.id, {
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })

    return {
      success: true,
      teamMember,
      teamId: invitation.team_id
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const revokeInvitation = async (invitationId) => {
  try {
    await TeamInvitation.update(invitationId, {
      status: 'revoked'
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const resendInvitation = async (invitationId, teamName, inviterName) => {
  try {
    const invitation = await TeamInvitation.get(invitationId)

    if (!invitation) {
      return { success: false, error: 'Invitation not found' }
    }

    if (invitation.status !== 'pending') {
      return { success: false, error: 'Can only resend pending invitations' }
    }

    const newToken = generateInviteToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await TeamInvitation.update(invitationId, {
      token: newToken,
      expires_at: expiresAt.toISOString()
    })

    const inviteUrl = `${window.location.origin}/accept-invite`
    const emailResult = await sendTeamInvitationEmail(
      invitation.email,
      teamName,
      inviterName,
      newToken,
      inviteUrl
    )

    if (!emailResult.success) {
      return { success: false, error: emailResult.error }
    }

    return { success: true, newToken }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getPendingInvitations = async (teamId) => {
  try {
    const invitations = await TeamInvitation.filter({
      team_id: teamId,
      status: 'pending'
    })

    const validInvitations = invitations.filter(
      inv => new Date(inv.expires_at) > new Date()
    )

    return { success: true, invitations: validInvitations }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Helper function to generate random token
const generateInviteToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
