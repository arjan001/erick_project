import { base44Client } from '@/shared/api/base44.client';
import { mapProjectFromEntity } from '@/shared/types/entities/project.dto';

const base44 = base44Client;

export const clientApi = {
  // Get current client profile
  async getCurrentClient() {
    const user = await base44.auth.me();
    if (!user) throw new Error('Not authenticated');
    
    const clients = await base44.entities.ProjectOwner.filter({ user_id: user.id });
    if (!clients || clients.length === 0) return null;
    
    return clients[0];
  },

  // Get client by ID
  async getClientById(clientId) {
    const client = await base44.entities.ProjectOwner.get(clientId);
    return client;
  },

  // Create client profile
  async createClient(clientData) {
    const user = await base44.auth.me();
    if (!user) throw new Error('Not authenticated');
    
    const newClient = await base44.entities.ProjectOwner.create({
      ...clientData,
      user_id: user.id,
      created_at: new Date().toISOString()
    });
    
    return newClient;
  },

  // Update client profile
  async updateClient(clientId, updates) {
    const updated = await base44.entities.ProjectOwner.update(clientId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return updated;
  },

  // Update current client profile
  async updateCurrentClient(updates) {
    const current = await this.getCurrentClient();
    if (!current) throw new Error('No client profile found');
    
    return this.updateClient(current.id, updates);
  },

  // Delete client profile
  async deleteClient(clientId) {
    await base44.entities.ProjectOwner.delete(clientId);
  },

  // Projects CRUD for clients
  async getProjects(clientId) {
    const projects = await base44.entities.Project.filter({ project_owner_id: clientId });
    return projects.map(mapProjectFromEntity);
  },

  async getCurrentProjects() {
    const client = await this.getCurrentClient();
    if (!client) return [];
    return this.getProjects(client.id);
  },

  async createProject(projectData) {
    const client = await this.getCurrentClient();
    if (!client) throw new Error('No client profile found');
    
    const newProject = await base44.entities.Project.create({
      ...projectData,
      project_owner_id: client.id,
      status: 'draft',
      created_at: new Date().toISOString()
    });
    
    return mapProjectFromEntity(newProject);
  },

  async updateProject(projectId, updates) {
    const updated = await base44.entities.Project.update(projectId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return mapProjectFromEntity(updated);
  },

  async deleteProject(projectId) {
    await base44.entities.Project.delete(projectId);
  }
};
