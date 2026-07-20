// Helper functions for audit logging
// Captures IP address and user information for comprehensive tracking

/**
 * Get client IP address from request headers
 * This is a placeholder - in production, you'd get this from the request object
 * For now, we'll return null as the client-side doesn't have access to this
 * @returns {string|null}
 */
export const getClientIP = () => {
  // In a real implementation, this would come from the request headers
  // For client-side apps, you'd need to use an API endpoint that returns the client IP
  return null;
};

/**
 * Get user agent string
 * @returns {string}
 */
export const getUserAgent = () => {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent;
  }
  return null;
};

/**
 * Create audit log entry with automatic IP and user agent capture
 * @param {Object} params - Audit log parameters
 * @param {string} params.actor_email - Email of the user performing the action
 * @param {string} params.actor_role - Role of the actor (admin, artist, team, client, backer)
 * @param {string} params.actor_id - UUID of the actor
 * @param {string} params.action - Action performed
 * @param {string} params.entity_type - Type of entity affected
 * @param {string} params.entity_id - ID of entity affected
 * @param {Object} params.old_values - Previous values (for updates)
 * @param {Object} params.new_values - New values (for updates/creates)
 * @param {Object} params.metadata - Additional context
 * @returns {Object} Complete audit log object
 */
export const createAuditLogEntry = (params) => {
  return {
    actor_email: params.actor_email,
    actor_role: params.actor_role,
    actor_id: params.actor_id,
    action: params.action,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    old_values: params.old_values || null,
    new_values: params.new_values || null,
    ip_address: getClientIP(),
    user_agent: getUserAgent(),
    metadata: params.metadata || {}
  };
};
