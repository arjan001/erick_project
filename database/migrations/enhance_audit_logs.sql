-- Migration: Enhance audit_logs for comprehensive tracking
-- This adds columns for IP tracking, device info, and security alerts

ALTER TABLE public.audit_logs
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS page_path TEXT,
ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
ADD COLUMN IF NOT EXISTS module_name TEXT;

-- Add indexes for security monitoring
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON public.audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_is_suspicious ON public.audit_logs(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON public.audit_logs(module_name);

-- Add comments
COMMENT ON COLUMN public.audit_logs.ip_address IS 'IP address of the user for security tracking';
COMMENT ON COLUMN public.audit_logs.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN public.audit_logs.page_path IS 'Page where action occurred';
COMMENT ON COLUMN public.audit_logs.is_suspicious IS 'Flag for potentially malicious activity';
COMMENT ON COLUMN public.audit_logs.severity IS 'Severity level for security monitoring';
COMMENT ON COLUMN public.audit_logs.module_name IS 'Module where action occurred (e.g., Admin, Artist, Client)';
