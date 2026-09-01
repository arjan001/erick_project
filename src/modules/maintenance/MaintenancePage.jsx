/**
 * Maintenance Page
 * Shown to users when maintenance mode is enabled
 */

import React, { useState, useEffect } from 'react';
import { getMaintenanceMessage, getMaintenanceEndTime, getMaintenanceTemplate, isMaintenanceMode } from '@/lib/maintenanceMode';
import { Clock, Mail, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  const [message, setMessage] = useState('');
  const [endTime, setEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactEmail, setContactEmail] = useState('support@ericrabar.app');

  useEffect(() => {
    loadMaintenanceInfo();
  }, []);

  useEffect(() => {
    let interval;
    if (endTime) {
      interval = setInterval(() => {
        const now = new Date();
        const remaining = endTime - now;
        
        if (remaining <= 0) {
          setTimeRemaining(null);
          clearInterval(interval);
          // Reload page to check if maintenance is over
          setTimeout(() => window.location.reload(), 5000);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [endTime]);

  const loadMaintenanceInfo = async () => {
    try {
      const [msg, end, template] = await Promise.all([
        getMaintenanceMessage(),
        getMaintenanceEndTime(),
        getMaintenanceTemplate()
      ]);
      
      setMessage(msg);
      setEndTime(end);
      
      // Extract contact email from message or use default
      const emailMatch = msg.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        setContactEmail(emailMatch[0]);
      }
    } catch (error) {
      console.error('Error loading maintenance info:', error);
      setMessage('<h2>Site Under Maintenance</h2><p>We are currently performing scheduled maintenance. Please check back soon.</p>');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (ms) => {
    if (!ms) return null;
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-4 shadow-lg">
              <span className="text-white text-3xl font-bold">22</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Eric Rabar</h1>
            <p className="text-gray-500 mt-2">Professional Creative Platform</p>
          </div>

          {/* Maintenance Message */}
          <div className="prose prose-gray max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: message }} />
          </div>

          {/* Countdown Timer */}
          {timeRemaining && (
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Estimated Time Remaining</span>
              </div>
              <div className="text-3xl font-bold text-black text-center">
                {formatTimeRemaining(timeRemaining)}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Need Help?</span>
            </div>
            <p className="text-gray-600 mb-2">
              For urgent inquiries, please contact us at:
            </p>
            <a 
              href={`mailto:${contactEmail}`}
              className="text-black font-medium hover:underline"
            >
              {contactEmail}
            </a>
          </div>

          {/* Refresh Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Check Status
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              © 2026 Eric Rabar. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
