import { supabase } from './supabase';
import { AuditLog } from './supabaseEntities';

/**
 * Audit Logger - Captures all system activities
 * 
 * This utility provides a centralized way to log audit events across the application.
 * It captures login, logout, registration, and all CRUD operations across all modules.
 */

export const auditLogger = {
  /**
   * Log an audit event
   * @param {Object} params - Audit event parameters
   * @param {string} params.action - The action performed (create, update, delete, login, logout, etc.)
   * @param {string} params.module - The module where the action occurred (auth, users, artists, teams, etc.)
   * @param {string} params.entity_type - The type of entity affected (user, artist, project, etc.)
   * @param {string} params.entity_id - The ID of the entity affected
   * @param {string} params.details - Human-readable description of the action
   * @param {Object} params.metadata - Additional metadata about the action
   */
  log: async ({ action, module, entity_type, entity_id, details, metadata = {} }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const actor_email = user?.email || 'system';
      const actor_role = user?.user_metadata?.role || 'system';
      
      // Get IP address from client (if available)
      const ip_address = metadata.ip_address || 'unknown';
      const user_agent = metadata.user_agent || typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown';

      await AuditLog.create({
        actor_email,
        actor_role,
        action,
        module,
        entity_type,
        entity_id,
        details,
        ip_address,
        user_agent,
        metadata
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging failures shouldn't break the app
    }
  },

  /**
   * Log authentication events
   */
  auth: {
    login: async (userEmail, metadata = {}) => {
      await auditLogger.log({
        action: 'login',
        module: 'auth',
        entity_type: 'user',
        entity_id: null,
        details: `User ${userEmail} logged in`,
        metadata
      });
    },

    logout: async (userEmail, metadata = {}) => {
      await auditLogger.log({
        action: 'logout',
        module: 'auth',
        entity_type: 'user',
        entity_id: null,
        details: `User ${userEmail} logged out`,
        metadata
      });
    },

    register: async (userEmail, metadata = {}) => {
      await auditLogger.log({
        action: 'register',
        module: 'auth',
        entity_type: 'user',
        entity_id: null,
        details: `New user registered: ${userEmail}`,
        metadata
      });
    },

    failedLogin: async (userEmail, reason, metadata = {}) => {
      await auditLogger.log({
        action: 'failed_login',
        module: 'auth',
        entity_type: 'user',
        entity_id: null,
        details: `Failed login attempt for ${userEmail}: ${reason}`,
        metadata
      });
    }
  },

  /**
   * Log user management events
   */
  users: {
    create: async (userId, userEmail, metadata = {}) => {
      await auditLogger.log({
        action: 'create',
        module: 'users',
        entity_type: 'user',
        entity_id: userId,
        details: `Created system user: ${userEmail}`,
        metadata
      });
    },

    update: async (userId, userEmail, changes, metadata = {}) => {
      await auditLogger.log({
        action: 'update',
        module: 'users',
        entity_type: 'user',
        entity_id: userId,
        details: `Updated user ${userEmail}: ${Object.keys(changes).join(', ')}`,
        metadata
      });
    },

    delete: async (userId, userEmail, metadata = {}) => {
      await auditLogger.log({
        action: 'delete',
        module: 'users',
        entity_type: 'user',
        entity_id: userId,
        details: `Deleted system user: ${userEmail}`,
        metadata
      });
    },

    suspend: async (userId, userEmail, metadata = {}) => {
      await auditLogger.log({
        action: 'suspend',
        module: 'users',
        entity_type: 'user',
        entity_id: userId,
        details: `Suspended user: ${userEmail}`,
        metadata
      });
    },

    activate: async (userId, userEmail, metadata = {}) => {
      await auditLogger.log({
        action: 'activate',
        module: 'users',
        entity_type: 'user',
        entity_id: userId,
        details: `Activated user: ${userEmail}`,
        metadata
      });
    }
  },

  /**
   * Log role management events
   */
  roles: {
    assign: async (userId, userEmail, roleKey, metadata = {}) => {
      await auditLogger.log({
        action: 'assign_role',
        module: 'roles',
        entity_type: 'user_role',
        entity_id: userId,
        details: `Assigned role ${roleKey} to user ${userEmail}`,
        metadata
      });
    },

    revoke: async (userId, userEmail, roleKey, metadata = {}) => {
      await auditLogger.log({
        action: 'revoke_role',
        module: 'roles',
        entity_type: 'user_role',
        entity_id: userId,
        details: `Revoked role ${roleKey} from user ${userEmail}`,
        metadata
      });
    }
  },

  /**
   * Log artist management events
   */
  artists: {
    create: async (artistId, artistName, metadata = {}) => {
      await auditLogger.log({
        action: 'create',
        module: 'artists',
        entity_type: 'artist',
        entity_id: artistId,
        details: `Created artist: ${artistName}`,
        metadata
      });
    },

    update: async (artistId, artistName, changes, metadata = {}) => {
      await auditLogger.log({
        action: 'update',
        module: 'artists',
        entity_type: 'artist',
        entity_id: artistId,
        details: `Updated artist ${artistName}: ${Object.keys(changes).join(', ')}`,
        metadata
      });
    },

    delete: async (artistId, artistName, metadata = {}) => {
      await auditLogger.log({
        action: 'delete',
        module: 'artists',
        entity_type: 'artist',
        entity_id: artistId,
        details: `Deleted artist: ${artistName}`,
        metadata
      });
    }
  },

  /**
   * Log team management events
   */
  teams: {
    create: async (teamId, teamName, metadata = {}) => {
      await auditLogger.log({
        action: 'create',
        module: 'teams',
        entity_type: 'team',
        entity_id: teamId,
        details: `Created team: ${teamName}`,
        metadata
      });
    },

    update: async (teamId, teamName, changes, metadata = {}) => {
      await auditLogger.log({
        action: 'update',
        module: 'teams',
        entity_type: 'team',
        entity_id: teamId,
        details: `Updated team ${teamName}: ${Object.keys(changes).join(', ')}`,
        metadata
      });
    },

    delete: async (teamId, teamName, metadata = {}) => {
      await auditLogger.log({
        action: 'delete',
        module: 'teams',
        entity_type: 'team',
        entity_id: teamId,
        details: `Deleted team: ${teamName}`,
        metadata
      });
    }
  },

  /**
   * Log project management events
   */
  projects: {
    create: async (projectId, projectName, metadata = {}) => {
      await auditLogger.log({
        action: 'create',
        module: 'projects',
        entity_type: 'project',
        entity_id: projectId,
        details: `Created project: ${projectName}`,
        metadata
      });
    },

    update: async (projectId, projectName, changes, metadata = {}) => {
      await auditLogger.log({
        action: 'update',
        module: 'projects',
        entity_type: 'project',
        entity_id: projectId,
        details: `Updated project ${projectName}: ${Object.keys(changes).join(', ')}`,
        metadata
      });
    },

    delete: async (projectId, projectName, metadata = {}) => {
      await auditLogger.log({
        action: 'delete',
        module: 'projects',
        entity_type: 'project',
        entity_id: projectId,
        details: `Deleted project: ${projectName}`,
        metadata
      });
    }
  },

  /**
   * Log job management events
   */
  jobs: {
    create: async (jobId, jobTitle, metadata = {}) => {
      await auditLogger.log({
        action: 'create',
        module: 'jobs',
        entity_type: 'job',
        entity_id: jobId,
        details: `Created job: ${jobTitle}`,
        metadata
      });
    },

    update: async (jobId, jobTitle, changes, metadata = {}) => {
      await auditLogger.log({
        action: 'update',
        module: 'jobs',
        entity_type: 'job',
        entity_id: jobId,
        details: `Updated job ${jobTitle}: ${Object.keys(changes).join(', ')}`,
        metadata
      });
    },

    delete: async (jobId, jobTitle, metadata = {}) => {
      await auditLogger.log({
        action: 'delete',
        module: 'jobs',
        entity_type: 'job',
        entity_id: jobId,
        details: `Deleted job: ${jobTitle}`,
        metadata
      });
    }
  },

  /**
   * Log featured work events
   */
  featured: {
    add: async (featuredId, projectName, metadata = {}) => {
      await auditLogger.log({
        action: 'add',
        module: 'featured',
        entity_type: 'featured_work',
        entity_id: featuredId,
        details: `Added featured work: ${projectName}`,
        metadata
      });
    },

    remove: async (featuredId, projectName, metadata = {}) => {
      await auditLogger.log({
        action: 'remove',
        module: 'featured',
        entity_type: 'featured_work',
        entity_id: featuredId,
        details: `Removed featured work: ${projectName}`,
        metadata
      });
    }
  },

  /**
   * Log settings events
   */
  settings: {
    update: async (settingKey, oldValue, newValue, metadata = {}) => {
      await auditLogger.log({
        action: 'update',
        module: 'settings',
        entity_type: 'setting',
        entity_id: settingKey,
        details: `Updated setting ${settingKey}`,
        metadata: { ...metadata, old_value: oldValue, new_value: newValue }
      });
    }
  },

  /**
   * Log generic events
   */
  generic: {
    view: async (module, entityType, entityId, details, metadata = {}) => {
      await auditLogger.log({
        action: 'view',
        module,
        entity_type: entityType,
        entity_id: entityId,
        details,
        metadata
      });
    },

    export: async (module, entityType, metadata = {}) => {
      await auditLogger.log({
        action: 'export',
        module,
        entity_type: entityType,
        entity_id: null,
        details: `Exported ${entityType} data from ${module}`,
        metadata
      });
    },

    import: async (module, entityType, count, metadata = {}) => {
      await auditLogger.log({
        action: 'import',
        module,
        entity_type: entityType,
        entity_id: null,
        details: `Imported ${count} ${entityType} records to ${module}`,
        metadata
      });
    }
  }
};

export default auditLogger;
