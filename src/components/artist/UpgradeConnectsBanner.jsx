import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { Zap, X, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Subscription } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'

const MESSAGES = [
  { title: 'Looking to apply for more client work?', body: 'Upgrade your plan and get more connects to apply for jobs.' },
  { title: 'Running low on connects?', body: 'Buy more connects to keep applying to great projects.' },
  { title: 'Unlock more opportunities', body: 'Upgrade for featured listing, priority support, and more monthly connects.' },
]

const DISMISS_KEY = 'ericrabar_upgrade_banner_dismissed_at'
const REAPPEAR_MS = 45 * 60 * 1000; // 45 minutes

export default function UpgradeConnectsBanner() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    const dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10)
    const elapsed = Date.now() - dismissedAt
    if (elapsed > REAPPEAR_MS) {
      setMessageIndex(Math.floor(Math.random() * MESSAGES.length))
      setVisible(true)
    }

    // Fetch subscription
    if (user) {
      Subscription.filter({ user_email: user.email }).then(subs => {
        if (subs?.length > 0) {
          setSubscription(subs[0])
        }
      })
    }
  }, [user])

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  if (!visible) return null

  // If user has subscription, show welcome banner instead
  if (subscription && subscription.status === 'active') {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 relative">
        <button onClick={handleDismiss} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-yellow-200 text-gray-500">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1 text-gray-900">Welcome, Pro User!</h3>
              <p className="text-gray-600">You're on the {subscription.package_name || 'Pro'} plan. Enjoy your premium benefits.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const msg = MESSAGES[messageIndex]

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-xl p-6 relative">
      <button onClick={handleDismiss} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-200 text-gray-500">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center justify-between pr-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 text-gray-900">{msg.title}</h3>
            <p className="text-gray-600">{msg.body}</p>
          </div>
        </div>
        <Button
          onClick={() => navigate(createPageUrl('ArtistSubscriptionCheckout'))}
          className="bg-black text-white hover:bg-gray-800 flex-shrink-0"
        >
          View Plans
        </Button>
      </div>
    </div>
  )
}