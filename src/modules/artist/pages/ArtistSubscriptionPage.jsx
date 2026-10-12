import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Subscription, SubscriptionPackage, Artist } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Crown, Star, Zap, Check, ArrowRight, Loader2, Crown as CrownIcon, ShieldCheck, HeadphonesIcon, BarChart3, Users, CreditCard, Calendar, Info, X } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'

export default function ArtistSubscriptionPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { success, error: toastError } = useToast()
  const [subscription, setSubscription] = useState(null)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/SignIn')
      return
    }
    fetchData()
  }, [isAuthenticated, user, navigate])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch current subscription using user_id (not user_email)
      const subscriptionData = await Subscription.filter({ user_id: user.id })
      setSubscription(subscriptionData[0] || null)

      // Fetch available packages
      const packagesData = await SubscriptionPackage.list()
      setPackages(packagesData || [])
    } catch (err) {
      console.error('Error fetching subscription data:', err)
      toastError('Error', 'Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg)
    // Open checkout modal instead of redirecting
    setShowCheckoutModal(true)
  }

  const handleManageSubscription = () => {
    navigate('/ArtistSubscriptionCheckout')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
          <p className="text-gray-600">Choose the perfect plan to unlock your full potential</p>
        </div>

        {subscription && subscription.status === 'active' && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Active Subscription</h2>
                </div>
                <p className="text-gray-600">
                  You are currently on the <span className="font-semibold">Active</span> plan
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Billing cycle: {subscription.billing_cycle || 'Monthly'}
                </p>
              </div>
              <Button onClick={handleManageSubscription}>
                Manage Subscription
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isPopular = pkg.slug === 'pro'
            const isActive = subscription?.package_id === pkg.id

            return (
              <div
                key={pkg.id}
                className={`relative rounded-lg border-2 p-6 transition-all ${isPopular
                  ? 'border-purple-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300'
                  } ${isActive ? 'bg-green-50 border-green-500' : 'bg-white'}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {isActive && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">{pkg.currency || 'KES'} {pkg.price_monthly}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  {pkg.price_yearly && (
                    <div className="flex items-baseline justify-center gap-1 mt-1">
                      <span className="text-sm text-gray-500">or {pkg.currency || 'KES'} {pkg.price_yearly}/year</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">{pkg.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.features && Array.isArray(pkg.features) ? (
                    pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">Access to all job listings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">Unlimited job applications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">Priority support</span>
                      </li>
                    </>
                  )}
                </ul>

                <Button
                  onClick={() => handleSelectPackage(pkg)}
                  disabled={isActive}
                  className={`w-full ${isPopular
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                >
                  {isActive ? 'Current Plan' : 'Subscribe Now'}
                  {!isActive && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            )
          })}
        </div>

        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Upgrade?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <CrownIcon className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Premium Features</h4>
                <p className="text-sm text-gray-600">Unlock advanced tools and exclusive features</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Verified Badge</h4>
                <p className="text-sm text-gray-600">Get verified and stand out from the crowd</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Analytics</h4>
                <p className="text-sm text-gray-600">Track your profile views and engagement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Subscribe to {selectedPackage.name}</h2>
                <p className="text-sm text-gray-500">{selectedPackage.currency || 'KES'} {selectedPackage.price_monthly}/month</p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Checkout functionality coming soon. This will allow you to pay via M-Pesa or Card.</p>
              <Button onClick={() => setShowCheckoutModal(false)} className="w-full">Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
