/**
 * Access Code Page
 * Handles access code validation for maintenance mode bypass
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { canAccessSite } from '@/lib/maintenanceMode'
import { Key, CheckCircle2, XCircle } from 'lucide-react'

export default function AccessCodePage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const validateCode = async () => {
      try {
        const allowed = await canAccessSite(null, code)
        
        if (allowed) {
          // Store code in session storage for temporary access
          sessionStorage.setItem('maintenance_access_code', code)
          setStatus('success')
          setMessage('Access code validated. Redirecting to admin panel...')
          
          setTimeout(() => {
            navigate('/Admin')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Invalid or expired access code')
        }
      } catch (error) {
        //
        setStatus('error')
        setMessage('Error validating access code')
      }
    }

    if (code) {
      validateCode()
    } else {
      setStatus('error')
      setMessage('No access code provided')
    }
  }, [code, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Key className="w-8 h-8 text-gray-400 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Validating Access Code</h1>
              <p className="text-gray-600">Please wait while we verify your access code...</p>
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Granted</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => navigate('/Maintenance')}
                className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Return to Maintenance Page
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
