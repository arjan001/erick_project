/**
 * Maintenance Guard
 * Redirects to maintenance page if maintenance mode is enabled
 * Allows admins to bypass maintenance mode
 * Allows access codes to bypass maintenance mode
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isMaintenanceMode, isAllowedDuringMaintenance, canAccessSite } from '@/lib/maintenanceMode';
import { useAuth } from '@/lib/AuthContext';

export function MaintenanceGuard({ children }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // Check for access code in URL (e.g., /code/SECRET123)
        if (location.pathname?.startsWith('/code/')) {
          const pathParts = location.pathname?.split('/').filter(Boolean);
          const code = pathParts[1]; // Second path segment after 'code'
          
          if (code) {
            const allowed = await canAccessSite(null, code);
            if (allowed) {
              // Store code in session storage for temporary access
              sessionStorage.setItem('maintenance_access_code', code);
              navigate('/Admin');
              return;
            }
          }
        }

        // Skip maintenance check for admin routes if user has valid access code
        if (location.pathname?.startsWith('/Admin')) {
          const hasAccessCode = sessionStorage.getItem('maintenance_access_code');
          const isAdmin = user?.role === 'admin';
          
          if (isAdmin || hasAccessCode) {
            setLoading(false);
            return;
          }
        }

        // Skip maintenance check for maintenance page itself
        if (location.pathname?.startsWith('/Maintenance')) {
          setLoading(false);
          return;
        }

        const maintenance = await isMaintenanceMode();
        
        if (maintenance) {
          // Check if user is admin (admins can bypass maintenance)
          const isAdmin = user?.role === 'admin';
          const hasAccessCode = sessionStorage.getItem('maintenance_access_code');
          
          if (!isAdmin && !hasAccessCode) {
            navigate('/Maintenance');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking maintenance mode:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
  }, [location.pathname, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return children;
}
