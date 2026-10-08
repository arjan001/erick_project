import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { locationService } from '@/lib/locationService'

class AnalyticsService {
  constructor() {
    this.sessionId = null
    this.userId = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return

    try {
      // Get or create session ID
      let sessionId = sessionStorage.getItem('analytics_session_id')
      if (!sessionId) {
        sessionId = crypto.randomUUID()
        sessionStorage.setItem('analytics_session_id', sessionId)
      }
      this.sessionId = sessionId

      // Get user ID if logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        this.userId = user.id
      }

      // Start session tracking
      await this.startSession()
      this.initialized = true
    } catch (error) {
      
      // Don't block app if analytics fails
      this.initialized = true
    }
  }

  async startSession() {
    try {
      const userAgent = navigator.userAgent
      const deviceInfo = locationService.parseUserAgent(userAgent)
      const referrer = document.referrer

      // Get IP location (best effort)
      let locationData = null
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const { ip } = await ipResponse.json()
        locationData = await locationService.getLocation(ip)
      } catch (error) {
        
      }

      const sessionData = {
        session_id: this.sessionId,
        user_id: this.userId,
        ip_address: locationData ? null : null, // IP would be captured server-side
        user_agent: userAgent,
        country: locationData?.country || null,
        city: locationData?.city || null,
        region: locationData?.region || null,
        latitude: locationData?.latitude || null,
        longitude: locationData?.longitude || null,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        referrer: referrer || null,
        landing_page: window.location.pathname,
        started_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      }

      await supabase.from('user_sessions').insert(sessionData)

      // Update live users table
      await supabase.from('live_users').upsert({
        session_id: this.sessionId,
        user_id: this.userId,
        current_page: window.location.pathname,
        last_activity: new Date().toISOString(),
        country: locationData?.country || null
      }, { onConflict: 'session_id' })

    } catch (error) {
      
    }
  }

  async trackPageView(pagePath, pageTitle) {
    if (!this.sessionId) await this.initialize()

    try {
      await supabase.from('page_views').insert({
        session_id: this.sessionId,
        user_id: this.userId,
        page_path: pagePath,
        page_title: pageTitle || document.title,
        referrer: document.referrer || null,
        viewed_at: new Date().toISOString()
      })

      // Update live users current page
      await supabase.from('live_users')
        .update({
          current_page: pagePath,
          last_activity: new Date().toISOString()
        })
        .eq('session_id', this.sessionId)

      // Update session last activity
      await supabase.from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_id', this.sessionId)

    } catch (error) {
      
    }
  }

  async trackEvent(eventType, eventName, properties = {}) {
    if (!this.sessionId) await this.initialize()

    try {
      await supabase.from('analytics_events').insert({
        user_id: this.userId,
        session_id: this.sessionId,
        event_type: eventType,
        event_name: eventName,
        properties: properties,
        page_path: window.location.pathname,
        occurred_at: new Date().toISOString()
      })
    } catch (error) {
      
    }
  }

  async trackError(error, component, severity = 'error') {
    if (!this.sessionId) await this.initialize()

    try {
      await supabase.from('error_logs').insert({
        user_id: this.userId,
        session_id: this.sessionId,
        error_type: error.name,
        error_message: error.message,
        stack_trace: error.stack,
        page_path: window.location.pathname,
        component_name: component,
        user_agent: navigator.userAgent,
        severity: severity,
        occurred_at: new Date().toISOString()
      })
    } catch (err) {
      
    }
  }

  async endSession() {
    if (!this.sessionId) return

    try {
      const session = await supabase
        .from('user_sessions')
        .select('started_at')
        .eq('session_id', this.sessionId)
        .single()

      if (session.data) {
        const duration = Math.floor(
          (new Date().getTime() - new Date(session.data.started_at).getTime()) / 1000
        )

        await supabase.from('user_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: duration
          })
          .eq('session_id', this.sessionId)
      }

      // Remove from live users
      await supabase.from('live_users')
        .delete()
        .eq('session_id', this.sessionId)

    } catch (error) {
      
    }
  }

  async updateActivity() {
    if (!this.sessionId) return

    try {
      await supabase.from('live_users')
        .update({
          current_page: window.location.pathname,
          last_activity: new Date().toISOString()
        })
        .eq('session_id', this.sessionId)

      await supabase.from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_id', this.sessionId)
    } catch (error) {
      
    }
  }
}

// Export singleton
export const analytics = new AnalyticsService()

// React hook for analytics
export function useAnalytics() {
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    // Initialize analytics in background - don't await
    analytics.initialize().catch(err => {
      
    })

    // Track page view on mount - don't await
    analytics.trackPageView(window.location.pathname, document.title).catch(err => {
      
    })

    // Update activity every 30 seconds
    const activityInterval = setInterval(() => {
      analytics.updateActivity().catch(err => {
        
      })
    }, 30000)

    // Track page changes (for SPA)
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args)
      setTimeout(() => {
        analytics.trackPageView(window.location.pathname, document.title).catch(err => {
          
        })
      }, 0)
    }

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args)
      setTimeout(() => {
        analytics.trackPageView(window.location.pathname, document.title).catch(err => {
          
        })
      }, 0)
    }

    // Handle page unload
    const handleUnload = () => {
      analytics.endSession().catch(err => {
        
      })
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      clearInterval(activityInterval)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener('beforeunload', handleUnload)
      analytics.endSession().catch(err => {
        
      })
    }
  }, [])

  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics)
  }
}

// Error boundary integration
export function trackReactError(error, errorInfo) {
  analytics.trackError(error, errorInfo.componentStack || 'React Error Boundary', 'critical')
}
