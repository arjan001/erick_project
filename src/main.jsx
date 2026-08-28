import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { logWebVitals } from '@/lib/analytics'
import '@/lib/sentry'
import { startPerformanceMonitoring } from '@/lib/performanceMonitor'

// Log Web Vitals in development
logWebVitals()

// Start performance monitoring
startPerformanceMonitoring()

// Register service worker (production only — disabled in dev to avoid preview issues)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope)
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
