import { base44Client } from '@/shared/api/base44.client';

const base44 = base44Client;

export const backerApi = {
  // Get current backer profile
  async getCurrentBacker() {
    const user = await base44.auth.me();
    if (!user) throw new Error('Not authenticated');
    
    const backers = await base44.entities.Backer.filter({ email: user.email });
    if (!backers || backers.length === 0) return null;
    
    return backers[0];
  },

  // Get backer by ID
  async getBackerById(backerId) {
    const backer = await base44.entities.Backer.get(backerId);
    return backer || null;
  },

  // Create backer profile
  async createBacker(backerData) {
    const user = await base44.auth.me();
    if (!user) throw new Error('Not authenticated');
    
    const newBacker = await base44.entities.Backer.create({
      ...backerData,
      email: user.email,
      total_invested: 0,
      investment_count: 0,
      created_at: new Date().toISOString()
    });
    
    return newBacker;
  },

  // Update backer profile
  async updateBacker(backerId, updates) {
    const updated = await base44.entities.Backer.update(backerId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return updated;
  },

  // Update current backer profile
  async updateCurrentBacker(updates) {
    const current = await this.getCurrentBacker();
    if (!current) throw new Error('No backer profile found');
    
    return this.updateBacker(current.id, updates);
  },

  // Delete backer profile
  async deleteBacker(backerId) {
    await base44.entities.Backer.delete(backerId);
  },

  // Backed Projects CRUD
  async createBackedProject(projectData) {
    const backer = await this.getCurrentBacker();
    if (!backer) throw new Error('No backer profile found');
    
    const project = await base44.entities.BackedProject.create({
      ...projectData,
      backer_email: backer.email,
      backer_id: backer.id,
      status: 'active',
      investment_date: new Date().toISOString(),
      expected_roi: (projectData.investment_amount || 0) * 1.15 // 15% expected ROI
    });
    
    // Update backer totals
    await this.updateBacker(backer.id, {
      total_invested: (backer.total_invested || 0) + (projectData.investment_amount || 0),
      investment_count: (backer.investment_count || 0) + 1
    });
    
    return project;
  },

  async updateBackedProject(projectId, updates) {
    return base44.entities.BackedProject.update(projectId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  },

  async deleteBackedProject(projectId) {
    const project = await base44.entities.BackedProject.get(projectId);
    await base44.entities.BackedProject.delete(projectId);
    
    // Update backer totals
    const backer = await this.getCurrentBacker();
    if (backer && project) {
      await this.updateBacker(backer.id, {
        total_invested: Math.max(0, (backer.total_invested || 0) - (project.investment_amount || 0)),
        investment_count: Math.max(0, (backer.investment_count || 0) - 1)
      });
    }
  },

  async getBackedProjects() {
    const backer = await this.getCurrentBacker();
    if (!backer) return [];
    
    const projects = await base44.entities.BackedProject.filter({ backer_email: backer.email });
    return projects;
  },

  // Deals CRUD
  async createDeal(dealData) {
    const backer = await this.getCurrentBacker();
    if (!backer) throw new Error('No backer profile found');
    
    const deal = await base44.entities.Deal.create({
      ...dealData,
      backer_email: backer.email,
      backer_id: backer.id,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    
    return deal;
  },

  async updateDeal(dealId, updates) {
    return base44.entities.Deal.update(dealId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  },

  async deleteDeal(dealId) {
    await base44.entities.Deal.delete(dealId);
  },

  async getDeals() {
    const backer = await this.getCurrentBacker();
    if (!backer) return [];
    
    const deals = await base44.entities.Deal.filter({ backer_email: backer.email });
    return deals;
  },

  // Projects for browsing
  async getAllProjects(filters = {}) {
    const projects = await base44.entities.Project.filter(filters);
    return projects;
  },

  async getProjectById(projectId) {
    const project = await base44.entities.Project.get(projectId);
    return project || null;
  },

  // Back a project (one-click)
  async backProject(projectId, investmentAmount) {
    const backer = await this.getCurrentBacker();
    if (!backer) throw new Error('No backer profile found');
    
    const project = await base44.entities.Project.get(projectId);
    if (!project) throw new Error('Project not found');
    
    // Create backed project record
    const backedProject = await this.createBackedProject({
      project_id: projectId,
      project_title: project.title,
      investment_amount: investmentAmount
    });
    
    // Update project funding
    await base44.entities.Project.update(projectId, {
      current_funding: (project.current_funding || 0) + investmentAmount,
      backers_count: (project.backers_count || 0) + 1
    });
    
    return backedProject;
  },

  // Analytics data
  async getInvestmentStats() {
    const projects = await this.getBackedProjects();
    
    const totalInvested = projects.reduce((sum, p) => sum + (p.investment_amount || 0), 0);
    const totalExpectedROI = projects.reduce((sum, p) => sum + (p.expected_roi || 0), 0);
    const totalROI = totalExpectedROI - totalInvested;
    const roiPercentage = totalInvested > 0 ? ((totalROI / totalInvested) * 100) : 0;
    
    const activeInvestments = projects.filter(p => p.status === 'active').length;
    const completedInvestments = projects.filter(p => p.status === 'completed').length;
    
    return {
      totalInvested,
      totalExpectedROI,
      totalROI,
      roiPercentage,
      activeInvestments,
      completedInvestments,
      totalInvestments: projects.length
    };
  }
};
