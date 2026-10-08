import React, { createContext, useContext, useState, useEffect } from 'react'
import { base44 } from '@/api/base44Client'

const IntegrationsContext = createContext()

export const IntegrationsProvider = ({ children }) => {
  const [integrations, setIntegrations] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      // In production, this would fetch from the integrations_settings table
      // For now, we'll use localStorage or environment variables
      const savedSettings = localStorage.getItem('ericrabar_integrations')
      if (savedSettings) {
        setIntegrations(JSON.parse(savedSettings))
      }
    } catch (err) {
      
    } finally {
      setLoading(false)
    }
  }

  const updateIntegration = async (name, settings) => {
    try {
      const updated = { ...integrations, [name]: settings }
      setIntegrations(updated)
      localStorage.setItem('ericrabar_integrations', JSON.stringify(updated))
      // In production, this would update the database
    } catch (err) {
      
    }
  }

  const getGoogleDriveSettings = () => {
    return integrations.google_drive || { enabled: false, clientId: '', clientSecret: '', apiKey: '' }
  }

  return (
    <IntegrationsContext.Provider value={{ integrations, loading, updateIntegration, getGoogleDriveSettings }}>
      {children}
    </IntegrationsContext.Provider>
  )
}

export const useIntegrations = () => {
  const context = useContext(IntegrationsContext)
  if (!context) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider')
  }
  return context
}
