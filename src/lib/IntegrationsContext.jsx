import React, { createContext, useContext, useState, useEffect } from 'react'

const IntegrationsContext = createContext()

export const IntegrationsProvider = ({ children }) => {
  const [integrations, setIntegrations] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const savedSettings = localStorage.getItem('smartgigs_integrations')
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
      localStorage.setItem('smartgigs_integrations', JSON.stringify(updated))
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
