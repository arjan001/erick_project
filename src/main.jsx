import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { logWebVitals } from '@/lib/analytics'

// Log Web Vitals in development
logWebVitals()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
