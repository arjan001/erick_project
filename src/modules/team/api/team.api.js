import { base44Client } from '@/shared/api/base44.client';
import { mapTeamFromEntity } from '@/shared/types/entities/team.dto';

const base44 = base44Client;

export const teamApi = {
  // Get current team profile
  async getCurrentTeam() {
    const user = await base44.auth.me();
    if (!user) throw new Error('Not authenticated');
    
    const teams = await base44.entities.Team.filter({ user_id: user.id });
    if (!teams || teams.length === 0) return null;
    
    return teams.map(mapTeamFromEntity)[0];
  },

  // Get team by ID
  async getTeamById(teamId) {
    const team = await base44.entities.Team.get(teamId);
    return team ? mapTeamFromEntity(team) : null;
  },

  // List all teams (admin use)
  async listTeams(filters = {}) {
    const teams = await base44.entities.Team.filter(filters);
    return teams.map(mapTeamFromEntity);
  },

  // Create team profile
  async createTeam(teamData) {
    const user = await base44.auth.me();
    if (!user) throw new Error('Not authenticated');
    
    const newTeam = await base44.entities.Team.create({
      ...teamData,
      user_id: user.id,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    
    return mapTeamFromEntity(newTeam);
  },

  // Update team profile
  async updateTeam(teamId, updates) {
    const updated = await base44.entities.Team.update(teamId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return mapTeamFromEntity(updated);
  },

  // Update current team profile
  async updateCurrentTeam(updates) {
    const current = await this.getCurrentTeam();
    if (!current) throw new Error('No team profile found');
    
    return this.updateTeam(current.id, updates);
  },

  // Delete team profile
  async deleteTeam(teamId) {
    await base44.entities.Team.delete(teamId);
  },

  // Approve team (admin)
  async approveTeam(teamId) {
    return this.updateTeam(teamId, { status: 'approved' });
  },

  // Reject team (admin)
  async rejectTeam(teamId) {
    return this.updateTeam(teamId, { status: 'rejected' });
  },

  // Upload team logo
  async uploadTeamLogo(file) {
    const uploadResult = await base44.integrations.Core.UploadFile(file);
    return uploadResult.url;
  },

  // Portfolio clips CRUD
  async addPortfolioClip(teamId, clipData) {
    const clip = await base44.entities.PortfolioClip.create({
      ...clipData,
      team_id: teamId,
      uploaded_by_type: 'team',
      uploaded_by_id: teamId,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    return clip;
  },

  async updatePortfolioClip(clipId, updates) {
    return base44.entities.PortfolioClip.update(clipId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  },

  async deletePortfolioClip(clipId) {
    await base44.entities.PortfolioClip.delete(clipId);
  },

  async getPortfolioClips(teamId) {
    const clips = await base44.entities.PortfolioClip.filter({ 
      uploaded_by_type: 'team',
      uploaded_by_id: teamId 
    });
    return clips;
  },

  // Team Members CRUD
  async addTeamMember(teamId, memberData) {
    const member = await base44.entities.TeamMember.create({
      ...memberData,
      team_id: teamId,
      status: 'active',
      created_at: new Date().toISOString()
    });
    return member;
  },

  async updateTeamMember(memberId, updates) {
    return base44.entities.TeamMember.update(memberId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  },

  async removeTeamMember(memberId) {
    await base44.entities.TeamMember.delete(memberId);
  },

  async getTeamMembers(teamId) {
    const members = await base44.entities.TeamMember.filter({ team_id: teamId });
    return members;
  },

  // Team Invitations CRUD
  async createInvitation(teamId, invitationData) {
    const invitation = await base44.entities.TeamInvitation.create({
      ...invitationData,
      team_id: teamId,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    return invitation;
  },

  async updateInvitation(invitationId, updates) {
    return base44.entities.TeamInvitation.update(invitationId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  },

  async cancelInvitation(invitationId) {
    await base44.entities.TeamInvitation.delete(invitationId);
  },

  async getInvitations(teamId) {
    const invitations = await base44.entities.TeamInvitation.filter({ team_id: teamId });
    return invitations;
  },

  // Tasks CRUD
  async createTask(teamId, taskData) {
    const task = await base44.entities.Task.create({
      ...taskData,
      team_id: teamId,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    return task;
  },

  async updateTask(taskId, updates) {
    return base44.entities.Task.update(taskId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  },

  async deleteTask(taskId) {
    await base44.entities.Task.delete(taskId);
  },

  async getTasks(teamId) {
    const tasks = await base44.entities.Task.filter({ team_id: teamId });
    return tasks;
  },

  // Projects CRUD
  async createProject(projectData) {
    const project = await base44.entities.Project.create({
      ...projectData,
      status: 'submitted',
      created_at: new Date().toISOString()
    });
    return project;
  },

  async updateProject(projectId, updates) {
    return base44.entities.Project.update(projectId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  },

  async deleteProject(projectId) {
    await base44.entities.Project.delete(projectId);
  },

  async getProjects(filters = {}) {
    const projects = await base44.entities.Project.filter(filters);
    return projects;
  },

  // Payments CRUD
  async createPayment(paymentData) {
    const payment = await base44.entities.Payment.create({
      ...paymentData,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    return payment;
  },

  async updatePayment(paymentId, updates) {
    return base44.entities.Payment.update(paymentId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  },

  async deletePayment(paymentId) {
    await base44.entities.Payment.delete(paymentId);
  },

  async getPayments(teamId) {
    const payments = await base44.entities.Payment.filter({ team_id: teamId });
    return payments;
  }
};
