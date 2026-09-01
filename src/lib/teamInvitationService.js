// Team Invitation Service
// Handles team member invitations, acceptance, and registration

import { base44 } from '@/api/base44Client';
import { sendTeamInvitationEmail } from '@/lib/brevoClient';

export const createTeamInvitation = async (teamId, email, role, inviterName, metadata = {}) => {
  try {
    // Generate a unique token
    const token = generateInviteToken();
    
    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create invitation record with metadata
    const invitation = await base44.entities.TeamInvitation.create({
      team_id: teamId,
      email: email,
      role: role,
      token: token,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      // Store additional metadata (roles, skills, profile_image)
      roles: metadata.roles || [],
      skills: metadata.skills || [],
      profile_image: metadata.profile_image || null
    });
    
    // Send email invitation
    const inviteUrl = `${window.location.origin}/accept-invite`;
    const emailResult = await sendTeamInvitationEmail(
      email,
      'Eric Rabar Team', // Will be updated with actual team name
      inviterName,
      token,
      inviteUrl
    );
    
    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error);
      // Still return success for the invitation creation, but log the email error
    }
    
    return { success: true, invitation, emailSent: emailResult.success };
  } catch (error) {
    console.error('Error creating team invitation:', error);
    return { success: false, error: error.message };
  }
};

export const validateInvitationToken = async (token) => {
  try {
    const invitations = await base44.entities.TeamInvitation.filter({ token: token });
    
    if (!invitations || invitations.length === 0) {
      return { valid: false, error: 'Invalid invitation token' };
    }
    
    const invitation = invitations[0];
    
    // Check if invitation is already accepted
    if (invitation.status === 'accepted') {
      return { valid: false, error: 'Invitation already accepted' };
    }
    
    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return { valid: false, error: 'Invitation has expired' };
    }
    
    // Check if invitation is revoked
    if (invitation.status === 'revoked') {
      return { valid: false, error: 'Invitation has been revoked' };
    }
    
    return { valid: true, invitation };
  } catch (error) {
    console.error('Error validating invitation token:', error);
    return { valid: false, error: error.message };
  }
};

export const acceptInvitation = async (token, userData) => {
  try {
    // Validate the invitation first
    const validation = await validateInvitationToken(token);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    const invitation = validation.invitation;
    
    // Check if user already exists with this email
    const existingUsers = await base44.entities.User.filter({ email: invitation.email });
    
    let userId;
    
    if (existingUsers && existingUsers.length > 0) {
      // User exists, update their role and team association
      userId = existingUsers[0].id;
      
      await base44.entities.User.update(userId, {
        role: 'team',
        team_id: invitation.team_id
      });
    } else {
      // Create new user
      const newUser = await base44.entities.User.create({
        email: invitation.email,
        password_hash: userData.password_hash, // Should be hashed before sending
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: 'team',
        team_id: invitation.team_id,
        is_verified: true,
        is_active: true
      });
      
      userId = newUser.id;
    }
    
    // Add user to team members with invitation metadata
    const teamMember = await base44.entities.TeamMember.create({
      team_id: invitation.team_id,
      user_id: userId,
      name: `${userData.first_name} ${userData.last_name}`,
      role: invitation.role,
      skills: invitation.skills || userData.skills || [],
      roles: invitation.roles || [],
      avatar_url: invitation.profile_image || userData.avatar_url || null,
      created_at: new Date().toISOString()
    });
    
    // Update invitation status
    await base44.entities.TeamInvitation.update(invitation.id, {
      status: 'accepted',
      accepted_at: new Date().toISOString()
    });
    
    return { 
      success: true, 
      userId, 
      teamMember,
      teamId: invitation.team_id 
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, error: error.message };
  }
};

export const revokeInvitation = async (invitationId) => {
  try {
    await base44.entities.TeamInvitation.update(invitationId, {
      status: 'revoked'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error revoking invitation:', error);
    return { success: false, error: error.message };
  }
};

export const resendInvitation = async (invitationId, teamName, inviterName) => {
  try {
    const invitation = await base44.entities.TeamInvitation.get(invitationId);
    
    if (!invitation) {
      return { success: false, error: 'Invitation not found' };
    }
    
    if (invitation.status !== 'pending') {
      return { success: false, error: 'Can only resend pending invitations' };
    }
    
    // Generate new token
    const newToken = generateInviteToken();
    
    // Update expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Update invitation
    await base44.entities.TeamInvitation.update(invitationId, {
      token: newToken,
      expires_at: expiresAt.toISOString()
    });
    
    // Resend email
    const inviteUrl = `${window.location.origin}/accept-invite`;
    const emailResult = await sendTeamInvitationEmail(
      invitation.email,
      teamName,
      inviterName,
      newToken,
      inviteUrl
    );
    
    if (!emailResult.success) {
      return { success: false, error: emailResult.error };
    }
    
    return { success: true, newToken };
  } catch (error) {
    console.error('Error resending invitation:', error);
    return { success: false, error: error.message };
  }
};

export const getPendingInvitations = async (teamId) => {
  try {
    const invitations = await base44.entities.TeamInvitation.filter({
      team_id: teamId,
      status: 'pending'
    });
    
    // Filter out expired invitations
    const validInvitations = invitations.filter(
      inv => new Date(inv.expires_at) > new Date()
    );
    
    return { success: true, invitations: validInvitations };
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to generate random token
const generateInviteToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};
