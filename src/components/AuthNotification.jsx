import React, { useEffect } from 'react'
import { CheckCircle, LogOut, X, Bell } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export default function AuthNotification() {
  const { authNotification, setAuthNotification } = useAuth()

  useEffect(() => {
    // Request notification permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  if (!authNotification) return null

  const typeStyles = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  }

  const Icon = authNotification.type === 'success' ? CheckCircle : authNotification.type === 'info' ? LogOut : Bell

  return (
    <div className={`fixed top-4 right-4 z-[9999] max-w-sm p-4 rounded-lg shadow-2xl flex items-center gap-3 text-white animate-slide-in ${typeStyles[authNotification.type] || typeStyles.info}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium flex-1">{authNotification.message}</span>
      <button
        onClick={() => setAuthNotification(null)}
        className="text-white/80 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
