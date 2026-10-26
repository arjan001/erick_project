import { supabase } from '@/lib/supabase'

/**
 * Audit Logging Service
 * Tracks all CRUD operations across the system for security and compliance
 */
export const auditService = {
  /**
   * Log an audit event
   * @param {Object} params - Audit parameters
   * @param {string} params.action - Action performed (create, read, update, delete, login, logout, etc.)
   * @param {string} params.entity_type - Type of entity (user, job, project, etc.)
   * @param {string} params.entity_id - ID of the entity affected
   * @param {string} params.module_name - Module where action occurred (admin, artist, client, etc.)
   * @param {Object} params.metadata - Additional metadata about the action
   * @param {string} params.ip_address - IP address of the user
   * @param {string} params.user_agent - User agent string
   * @param {string} params.page_path - Current page path
   * @param {string} params.severity - Severity level (info, warning, error, critical)
   * @param {boolean} params.is_suspicious - Whether the action is suspicious
   */
  log: async ({
    action,
    entity_type,
    entity_id = null,
    module_name = 'general',
    metadata = {},
    ip_address = null,
    user_agent = null,
    page_path = null,
    severity = 'info',
    is_suspicious = false
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const auditData = {
        action,
        entity_type,
        entity_id,
        module_name,
        actor_id: user?.id || null,
        actor_email: user?.email || null,
        actor_role: user?.user_metadata?.role || null,
        metadata: {
          ...metadata,
          first_name: user?.user_metadata?.first_name,
          last_name: user?.user_metadata?.last_name
        },
        ip_address: ip_address || await auditService.getClientIP(),
        user_agent: user_agent || navigator.userAgent,
        page_path: page_path || window.location.pathname,
        severity,
        is_suspicious
      }

      const { error } = await supabase.from('audit_logs').insert(auditData)
      
      if (error) {
        console.error('Audit log failed:', error)
      }
    } catch (error) {
      console.error('Audit log service error:', error)
    }
  },

  /**
   * Log a user login
   */
  logLogin: async (user, ip_address = null) => {
    return auditService.log({
      action: 'login',
      entity_type: 'user',
      entity_id: user.id,
      module_name: 'auth',
      metadata: {
        email: user.email,
        role: user.user_metadata?.role
      },
      ip_address,
      severity: 'info'
    })
  },

  /**
   * Log a user logout
   */
  logLogout: async (userId) => {
    return auditService.log({
      action: 'logout',
      entity_type: 'user',
      entity_id: userId,
      module_name: 'auth',
      severity: 'info'
    })
  },

  /**
   * Log a create operation
   */
  logCreate: async (entity_type, entity_id, module_name, metadata = {}) => {
    return auditService.log({
      action: 'create',
      entity_type,
      entity_id,
      module_name,
      metadata,
      severity: 'info'
    })
  },

  /**
   * Log an update operation
   */
  logUpdate: async (entity_type, entity_id, module_name, metadata = {}) => {
    return auditService.log({
      action: 'update',
      entity_type,
      entity_id,
      module_name,
      metadata,
      severity: 'info'
    })
  },

  /**
   * Log a delete operation
   */
  logDelete: async (entity_type, entity_id, module_name, metadata = {}) => {
    return auditService.log({
      action: 'delete',
      entity_type,
      entity_id,
      module_name,
      metadata,
      severity: 'warning'
    })
  },

  /**
   * Log suspicious activity
   */
  logSuspicious: async (entity_type, entity_id, module_name, metadata = {}) => {
    return auditService.log({
      action: 'suspicious_activity',
      entity_type,
      entity_id,
      module_name,
      metadata,
      severity: 'critical',
      is_suspicious: true
    })
  },

  /**
   * Log an error
   */
  logError: async (error, module_name, metadata = {}) => {
    return auditService.log({
      action: 'error',
      entity_type: 'system',
      module_name,
      metadata: {
        error_message: error.message,
        error_stack: error.stack,
        ...metadata
      },
      severity: 'error'
    })
  },

  /**
   * Get client IP address (simplified - in production, use server-side detection)
   */
  getClientIP: async () => {
    try {
      // In production, this should be done server-side
      // For now, return null or use a third-party IP detection service
      return null
    } catch {
      return null
    }
  },

  /**
   * Check for suspicious activity patterns
   */
  checkSuspiciousActivity: async (userId) => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('ip_address, count')
        .eq('actor_id', userId)
        .gte('created_at', oneHourAgo)
      
      if (error) throw error

      // Check for multiple IPs from same user in short time
      const ips = new Set(data?.map(log => log.ip_address).filter(Boolean) || [])
      const actionCount = data?.length || 0

      if (ips.size > 3 && actionCount > 10) {
        return { isSuspicious: true, reason: 'Multiple IPs detected' }
      }

      return { isSuspicious: false }
    } catch (error) {
      console.error('Suspicious activity check failed:', error)
      return { isSuspicious: false }
    }
  }
}

/**
 * Higher-order function to wrap API calls with audit logging
 */
export const withAudit = (entity_type, module_name) => {
  return {
    create: async (entityId, metadata = {}) => {
      await auditService.logCreate(entity_type, entityId, module_name, metadata)
    },
    update: async (entityId, metadata = {}) => {
      await auditService.logUpdate(entity_type, entityId, module_name, metadata)
    },
    delete: async (entityId, metadata = {}) => {
      await auditService.logDelete(entity_type, entityId, module_name, metadata)
    }
  }
}
