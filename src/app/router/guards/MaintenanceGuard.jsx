/**
 * Maintenance Guard
 * Redirects to maintenance page if maintenance mode is enabled
 * Allows admins to bypass maintenance mode
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isMaintenanceMode, isAllowedDuringMaintenance } from '@/lib/maintenanceMode';
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
        // Skip maintenance check for admin routes
        if (location.pathname?.startsWith('/Admin')) {
          setLoading(false);
          return;
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
          
          if (!isAdmin) {
            const allowed = await isAllowedDuringMaintenance();
            if (!allowed) {
              navigate('/Maintenance');
              return;
            }
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
