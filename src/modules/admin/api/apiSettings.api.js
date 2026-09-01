import { supabase } from '@/lib/supabase';
import auditLogger from '@/lib/auditLogger';

export const apiSettingsApi = {
  // ============================================
  // API KEYS CRUD
  // ============================================
  
  // Get all API keys
  getAllApiKeys: async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select(`
        *,
        users (
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create a new API key
  createApiKey: async (keyData) => {
    const { name, scopes, created_by } = keyData;
    
    // Generate random keys
    const publicKey = `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    const secretKey = `sk_secret_${Math.random().toString(36).substring(2, 20)}`;
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        name,
        public_key: publicKey,
        secret_key: secretKey,
        scopes: scopes || ['read'],
        status: 'active',
        created_by
      })
      .select()
      .single();

    if (error) throw error;

    // Log audit event
    await auditLogger.api.createApiKey(data.id, name);

    return data;
  },

  // Revoke an API key
  revokeApiKey: async (keyId) => {
    const { data, error } = await supabase
      .from('api_keys')
      .update({ 
        status: 'revoked',
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
      .select()
      .single();

    if (error) throw error;

    // Log audit event
    await auditLogger.api.revokeApiKey(keyId, data.name);

    return data;
  },

  // Delete an API key
  deleteApiKey: async (keyId) => {
    // Get key name before deletion for audit log
    const { data: key } = await supabase
      .from('api_keys')
      .select('name')
      .eq('id', keyId)
      .single();

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);

    if (error) throw error;

    // Log audit event
    if (key) {
      await auditLogger.api.deleteApiKey(keyId, key.name);
    }

    return true;
  },

  // Update last used timestamp
  updateLastUsed: async (keyId) => {
    const { error } = await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyId);

    if (error) throw error;
    return true;
  },

  // ============================================
  // RATE LIMITING SETTINGS
  // ============================================
  
  // Get rate limiting settings
  getRateLimitingSettings: async () => {
    const { data, error } = await supabase
      .from('rate_limiting_settings')
      .select('*')
      .single();

    if (error) {
      // If no settings exist, return defaults
      if (error.code === 'PGRST116') {
        return {
          enabled: true,
          requests_per_minute: 100,
          requests_per_hour: 1000,
          requests_per_day: 10000,
          burst_limit: 20
        };
      }
      throw error;
    }
    return data;
  },

  // Update rate limiting settings
  updateRateLimitingSettings: async (settings) => {
    const { data, error } = await supabase
      .from('rate_limiting_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', settings.id)
      .select()
      .single();

    if (error) throw error;

    // Log audit event
    await auditLogger.api.updateRateLimiting(settings);

    return data;
  },

  // ============================================
  // API CONFIGURATION
  // ============================================
  
  // Get API configuration
  getApiConfiguration: async () => {
    const { data, error } = await supabase
      .from('api_configuration')
      .select('*')
      .single();

    if (error) {
      // If no configuration exists, return defaults
      if (error.code === 'PGRST116') {
        return {
          enable_cors: true,
          allowed_origins: ['https://ericrabar.com', 'https://www.ericrabar.com'],
          enable_api_key_auth: true,
          enable_jwt_auth: true,
          jwt_expiration_seconds: 3600,
          enable_webhooks: true,
          webhook_secret: '',
          enable_api_versioning: true,
          current_version: 'v1',
          enable_logging: true,
          log_retention_days: 30
        };
      }
      throw error;
    }
    return data;
  },

  // Update API configuration
  updateApiConfiguration: async (config) => {
    const { data, error } = await supabase
      .from('api_configuration')
      .update({
        ...config,
        updated_at: new Date().toISOString()
      })
      .eq('id', config.id)
      .select()
      .single();

    if (error) throw error;

    // Log audit event
    await auditLogger.api.updateConfiguration(config);

    return data;
  },

  // ============================================
  // INTEGRATION SETTINGS
  // ============================================
  
  // Get integration settings
  getIntegrationSettings: async (integrationName) => {
    const { data, error } = await supabase
      .from('integrations_settings')
      .select('*')
      .eq('integration_name', integrationName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  },

  // Update integration settings
  updateIntegrationSettings: async (integrationName, settings, isEnabled) => {
    const { data, error } = await supabase
      .from('integrations_settings')
      .upsert({
        integration_name: integrationName,
        settings,
        is_enabled: isEnabled,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log audit event
    await auditLogger.api.updateIntegration(integrationName, isEnabled);

    return data;
  },

  // Get all integrations
  getAllIntegrations: async () => {
    const { data, error } = await supabase
      .from('integrations_settings')
      .select('*')
      .order('integration_name');

    if (error) throw error;
    return data;
  },

  // ============================================
  // API USAGE LOGS
  // ============================================
  
  // Get API usage logs
  getApiUsageLogs: async (limit = 100, offset = 0) => {
    const { data, error } = await supabase
      .from('api_usage_logs')
      .select(`
        *,
        api_keys (
          name,
          public_key
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  // Log API usage
  logApiUsage: async (logData) => {
    const { error } = await supabase
      .from('api_usage_logs')
      .insert({
        ...logData,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  },

  // Clear old logs based on retention policy
  clearOldLogs: async (retentionDays) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { error } = await supabase
      .from('api_usage_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;
    return true;
  }
};
