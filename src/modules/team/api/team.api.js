import { Team, PortfolioClip, TeamMember, TeamInvitation, Task, Project, TeamPayment } from '@/lib/supabaseEntities'
import { supabase } from '@/lib/supabase'
import { mapTeamFromEntity } from '@/shared/types/entities/team.dto'

export const teamApi = {
  // Get current team profile
  async getCurrentTeam() {
    const teams = await Team.filter({ user_id: '' })
    if (!teams || teams.length === 0) return null
    return teams.map(mapTeamFromEntity)[0]
  },

  // Get team by ID
  async getTeamById(teamId) {
    const team = await Team.get(teamId)
    return team ? mapTeamFromEntity(team) : null
  },

  // List all teams (admin use)
  async listTeams(filters = {}) {
    const teams = await Team.filter(filters)
    return teams.map(mapTeamFromEntity)
  },

  // Create team profile
  async createTeam(teamData) {
    const newTeam = await Team.create({
      ...teamData,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    return mapTeamFromEntity(newTeam)
  },

  // Update team profile
  async updateTeam(teamId, updates) {
    const updated = await Team.update(teamId, {
      ...updates,
      updated_at: new Date().toISOString()
    })
    return mapTeamFromEntity(updated)
  },

  // Update current team profile
  async updateCurrentTeam(updates) {
    const current = await this.getCurrentTeam()
    if (!current) throw new Error('No team profile found')

    return this.updateTeam(current.id, updates)
  },

  // Delete team profile
  async deleteTeam(teamId) {
    await Team.delete(teamId)
  },

  // Approve team (admin)
  async approveTeam(teamId) {
    return this.updateTeam(teamId, { status: 'approved' })
  },

  // Reject team (admin)
  async rejectTeam(teamId) {
    return this.updateTeam(teamId, { status: 'rejected' })
  },

  // Upload team logo
  async uploadTeamLogo(file) {
    const { data, error } = await supabase.storage.from('team-logos').upload(`${Date.now()}-${file.name}`, file)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('team-logos').getPublicUrl(data.path)
    return publicUrl
  },

  // Portfolio clips CRUD
  async addPortfolioClip(teamId, clipData) {
    const clip = await PortfolioClip.create({
      ...clipData,
      team_id: teamId,
      uploaded_by_type: 'team',
      uploaded_by_id: teamId,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    return clip
  },

  async updatePortfolioClip(clipId, updates) {
    return PortfolioClip.update(clipId, {
      ...updates,
      updated_at: new Date().toISOString()
    })
  },

  async deletePortfolioClip(clipId) {
    await PortfolioClip.delete(clipId)
  },

  async getPortfolioClips(teamId) {
    const clips = await PortfolioClip.filter({
      uploaded_by_type: 'team',
      uploaded_by_id: teamId
    })
    return clips
  },

  // Team Members CRUD
  async addTeamMember(teamId, memberData) {
    const member = await TeamMember.create({
      ...memberData,
      team_id: teamId,
      status: 'active',
      created_at: new Date().toISOString()
    })
    return member
  },

  async updateTeamMember(memberId, updates) {
    return TeamMember.update(memberId, {
      ...updates,
      updated_at: new Date().toISOString()
    })
  },

  async removeTeamMember(memberId) {
    await TeamMember.delete(memberId)
  },

  async getTeamMembers(teamId) {
    const members = await TeamMember.filter({ team_id: teamId })
    return members
  },

  // Team Invitations CRUD
  async createInvitation(teamId, invitationData) {
    const invitation = await TeamInvitation.create({
      ...invitationData,
      team_id: teamId,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    return invitation
  },

  async updateInvitation(invitationId, updates) {
    return TeamInvitation.update(invitationId, {
      ...updates,
      updated_at: new Date().toISOString()
    })
  },

  async cancelInvitation(invitationId) {
    await TeamInvitation.delete(invitationId)
  },

  async getInvitations(teamId) {
    const invitations = await TeamInvitation.filter({ team_id: teamId })
    return invitations
  },

  // Tasks CRUD
  async createTask(teamId, taskData) {
    const task = await Task.create({
      ...taskData,
      team_id: teamId,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    return task
  },

  async updateTask(taskId, updates) {
    return Task.update(taskId, {
      ...updates,
      updated_at: new Date().toISOString()
    })
  },

  async deleteTask(taskId) {
    await Task.delete(taskId)
  },

  async getTasks(teamId) {
    const tasks = await Task.filter({ team_id: teamId })
    return tasks
  },

  // Projects CRUD
  async createProject(projectData) {
    const project = await Project.create({
      ...projectData,
      status: 'submitted',
      created_at: new Date().toISOString()
    })
    return project
  },

  async updateProject(projectId, updates) {
    return Project.update(projectId, {
      ...updates,
      updated_at: new Date().toISOString()
    })
  },

  async deleteProject(projectId) {
    await Project.delete(projectId)
  },

  async getProjects(filters = {}) {
    const projects = await Project.filter(filters)
    return projects
  },

  // Payments CRUD
  async createPayment(paymentData) {
    const payment = await TeamPayment.create({
      ...paymentData,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    return payment
  },

  async updatePayment(paymentId, updates) {
    return TeamPayment.update(paymentId, {
      ...updates,
      updated_at: new Date().toISOString()
    })
  },

  async deletePayment(paymentId) {
    await TeamPayment.delete(paymentId)
  },

  async getPayments(teamId) {
    const payments = await TeamPayment.filter({ team_id: teamId })
    return payments
  }
}
