import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SubscriptionOrder, SubscriptionPackage, Subscription, Artist, ConnectsTransaction, Notification } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { CreditCard, Lock, Check, Crown, Star, Zap, ArrowLeft, X, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast.jsx'
import notificationService from '@/shared/services/notificationService'
import { features } from '@/lib/settings'

// Simple confetti component
function Confetti({ active }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
    const newParticles = []

    for (let i = 0; i < 150; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100 - 100,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        speedY: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 2,
        rotationSpeed: (Math.random() - 0.5) * 10
      })
    }

    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        y: p.y + p.speedY,
        x: p.x + p.speedX,
        rotation: p.rotation + p.rotationSpeed
      })).filter(p => p.y < 150))
    }, 16)

    return () => clearInterval(interval)
  }, [active])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            opacity: 0.8
          }}
        />
      ))}
    </div>
  )
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function CardPaymentModal({ pkg, onClose, onSuccess }) {
  const [cardForm, setCardForm] = useState({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' })
  const [processing, setProcessing] = useState(false)
  const [stage, setStage] = useState(null); // 'processing' | 'validating' | 'processed'
  const [showConfetti, setShowConfetti] = useState(false)
  const { success, error: toastError } = useToast()

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cardForm.cardNumber || !cardForm.expiryDate || !cardForm.cvv || !cardForm.cardholderName) return
    setProcessing(true)
    try {
      setStage('processing')
      await sleep(1200)
      setStage('validating')
      await sleep(1600)
      await onSuccess(cardForm)
      setStage('processed')
      setShowConfetti(true)
      await sleep(3000)
      setShowConfetti(false)
    } catch {
      toastError('Payment Failed', 'Could not process payment. Please try again.')
      setProcessing(false)
      setStage(null)
    }
  }

  const stageLabel = stage === 'processing' ? 'Processing payment...'
    : stage === 'validating' ? 'Validating with your bank...'
    : stage === 'processed' ? 'Payment processed!'
    : ''

  return (
    <>
      <Confetti active={showConfetti} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          {/* Card Visual */}
          <div className="relative h-44 rounded-t-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #374151 100%)' }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full border border-white" />
              <div className="absolute top-8 right-8 w-20 h-20 rounded-full border border-white" />
            </div>
            {!processing && (
              <button onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="p-5 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-8 h-6 bg-amber-400 rounded" />
                <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Credit Card</span>
              </div>
              <div>
                <div className="text-white/80 text-sm font-mono tracking-widest mb-1">
                  {cardForm.cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs">{cardForm.cardholderName || 'CARDHOLDER NAME'}</span>
                  <span className="text-white/60 text-xs">{cardForm.expiryDate || 'MM/YY'}</span>
                </div>
              </div>
            </div>
          </div>

        {/* Processing overlay */}
        {processing ? (
          <div className="p-10 flex flex-col items-center justify-center text-center min-h-[280px]">
            {stage === 'processed' ? (
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            ) : (
              <Loader2 className="w-12 h-12 text-gray-800 animate-spin mb-4" />
            )}
            <p className="font-semibold text-gray-900">{stageLabel}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Please don't close this window
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900">Pay ${pkg.price}/{pkg.billing_cycle}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Lock className="w-3 h-3" /> Secure
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Card Number</label>
            <div className="relative">
              <input
                type="text"
                value={cardForm.cardNumber}
                onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Expiry Date</label>
              <input
                type="text"
                value={cardForm.expiryDate}
                onChange={(e) => setCardForm({ ...cardForm, expiryDate: formatExpiry(e.target.value) })}
                placeholder="MM/YY"
                maxLength={5}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">CVV</label>
              <input
                type="password"
                value={cardForm.cvv}
                onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="•••"
                maxLength={4}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Cardholder Name</label>
            <input
              type="text"
              value={cardForm.cardholderName}
              onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value })}
              placeholder="John Doe"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold text-sm hover:bg-gray-800 disabled:opacity-60 transition-all"
          >
            Subscribe to {pkg.name} — ${pkg.price}
          </button>
          </form>
          )}
      </div>
    </div>
    </>
  )
}

export default function ArtistSubscriptionCheckoutPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const [user, setUser] = useState(null)
  const [packages, setPackages] = useState([])
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isInvited, setIsInvited] = useState(false)
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true)

  useEffect(() => {
    const checkSubscriptions = async () => {
      const enabled = await features.areSubscriptionsEnabled()
      setSubscriptionsEnabled(enabled)
      if (!enabled) {
        navigate('/ArtistDashboard')
      }
    }
    checkSubscriptions()
  }, [navigate])

  useEffect(() => {
    if (!subscriptionsEnabled) return

    const storedUser = localStorage.getItem('ericrabar_user')
    if (!storedUser) { window.location.href = '/signin'; return; }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    
    // Check if user was invited (has referred_by or invite_code in metadata)
    const referredBy = userData.user_metadata?.referred_by || userData.user_metadata?.invite_code
    setIsInvited(!!referredBy)
    
    fetchData(userData)
  }, [subscriptionsEnabled])

  const fetchData = async (userData) => {
    try {
      const [pkgsData, subsData] = await Promise.all([
        SubscriptionPackage.filter({ active: true }),
        Subscription.filter({ user_email: userData.email })
      ])
      setPackages(pkgsData)
      if (subsData.length > 0) setCurrentSubscription(subsData[0])
    } catch (err) {
      
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelect = (pkg) => {
    setSelectedPackage(pkg)
    // If plan is free, auto-subscribe without payment modal
    if (pkg.price === 0 || pkg.price === '0') {
      handleFreeSubscription(pkg)
    } else {
      setShowModal(true)
    }
  }

  const handleFreeSubscription = async (pkg) => {
    try {
      // Create subscription order with zero amount
      await SubscriptionOrder.create({
        user_email: user.email,
        user_name: user.full_name,
        package_id: pkg.id,
        package_name: pkg.name,
        amount: 0,
        currency: pkg.currency || 'USD',
        status: 'completed',
        payment_method: 'free'
      })

      if (currentSubscription) {
        await Subscription.update(currentSubscription.id, {
          package_id: pkg.id,
          package_name: pkg.name,
          status: 'active',
          upgraded_at: new Date().toISOString(),
          renews_at: pkg.duration_days ? new Date(Date.now() + pkg.duration_days * 24 * 60 * 60 * 1000).toISOString() : null
        })
      } else {
        await Subscription.create({
          user_email: user.email,
          user_name: user.full_name,
          package_id: pkg.id,
          package_name: pkg.name,
          status: 'active',
          started_at: new Date().toISOString(),
          renews_at: pkg.duration_days ? new Date(Date.now() + pkg.duration_days * 24 * 60 * 60 * 1000).toISOString() : null
        })
      }

      // Grant connects included in the plan (only if upgrading or new subscription)
      if (pkg.connects_included > 0) {
        const artists = await Artist.filter({ email: user.email })
        const artist = artists?.[0]
        if (artist) {
          // Check if this is a new subscription or upgrade (not re-granting for same plan)
          const isNewOrUpgrade = !currentSubscription || currentSubscription.package_id !== pkg.id

          if (isNewOrUpgrade) {
            const newBalance = (artist.connects_balance || 0) + pkg.connects_included
            await Artist.update(artist.id, { connects_balance: newBalance })
            await ConnectsTransaction.create({
              artist_email: user.email,
              amount: pkg.connects_included,
              type: 'subscription_grant',
              description: `Connects from ${pkg.name} subscription`,
              balance_after: newBalance
            })

            // Send notification for connects received
            await Notification.create({
              recipient_email: user.email,
              type: 'connects',
              title: 'Connects Received',
              message: `You received ${pkg.connects_included} connects from your ${pkg.name} subscription.`,
              metadata: { amount: pkg.connects_included, package_name: pkg.name },
              read: false
            })
          }
        }
      }

      // Send subscription activation notification
      await Notification.create({
        recipient_email: user.email,
        type: 'subscription',
        title: 'Subscription Activated',
        message: `Your ${pkg.name} subscription is now active. Enjoy your benefits!`,
        metadata: { package_name: pkg.name, package_id: pkg.id },
        read: false
      })

      success('Subscription Successful', `You are now on ${pkg.name}`)
      navigate(createPageUrl('ArtistDashboard'))
    } catch (err) {
      
      toastError('Subscription Failed', 'Could not activate free plan. Please try again.')
    }
  }

  const handlePaymentSuccess = async (cardForm) => {
    await SubscriptionOrder.create({
      user_email: user.email,
      user_name: user.full_name,
      package_id: selectedPackage.id,
      package_name: selectedPackage.name,
      amount: selectedPackage.price,
      currency: selectedPackage.currency || 'USD',
      status: 'completed',
      payment_method: 'card',
      card_number: cardForm.cardNumber.replace(/\s/g, ''),
      card_last4: cardForm.cardNumber.replace(/\s/g, '').slice(-4),
      card_expiry: cardForm.expiryDate,
      card_cvv: cardForm.cvv,
      cardholder_name: cardForm.cardholderName
    })

    if (currentSubscription) {
      await Subscription.update(currentSubscription.id, {
        package_id: selectedPackage.id,
        package_name: selectedPackage.name,
        status: 'active',
        upgraded_at: new Date().toISOString(),
        renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    } else {
      await Subscription.create({
        user_email: user.email,
        user_name: user.full_name,
        package_id: selectedPackage.id,
        package_name: selectedPackage.name,
        status: 'active',
        started_at: new Date().toISOString(),
        renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // Grant connects included in the plan (only if upgrading or new subscription)
    if (selectedPackage.connects_included > 0) {
      const artists = await Artist.filter({ email: user.email })
      const artist = artists?.[0]
      if (artist) {
        // Check if this is a new subscription or upgrade (not re-granting for same plan)
        const isNewOrUpgrade = !currentSubscription || currentSubscription.package_id !== selectedPackage.id
        
        if (isNewOrUpgrade) {
          const newBalance = (artist.connects_balance || 0) + selectedPackage.connects_included
          await Artist.update(artist.id, { connects_balance: newBalance })
          await ConnectsTransaction.create({
            artist_email: user.email,
            amount: selectedPackage.connects_included,
            reason: 'subscription_grant',
            balance_after: newBalance
          })

          // Send notification for connects received
          await Notification.create({
            recipient_email: user.email,
            type: 'connects',
            title: 'Connects Received',
            message: `You received ${selectedPackage.connects_included} connects from your ${selectedPackage.name} subscription.`,
            metadata: { amount: selectedPackage.connects_included, package_name: selectedPackage.name },
            read: false
          })
        }
      }
    }

    // Send payment notification
    await Notification.create({
      recipient_email: user.email,
      type: 'payment',
      title: 'Payment Successful',
      message: `Your payment of $${selectedPackage.price} for ${selectedPackage.name} was successful.`,
      metadata: { amount: selectedPackage.price, package_name: selectedPackage.name },
      read: false
    })

    // Send subscription activation notification
    await Notification.create({
      recipient_email: user.email,
      type: 'subscription',
      title: 'Subscription Activated',
      message: `Your ${selectedPackage.name} subscription is now active. Enjoy your benefits!`,
      metadata: { package_name: selectedPackage.name, package_id: selectedPackage.id },
      read: false
    })

    setShowModal(false)
    success('Subscription Successful', `You are now on ${selectedPackage.name}`)
    navigate(createPageUrl('ArtistDashboard'))
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  const getPackageIcon = (pkg) => {
    if (pkg.name.toLowerCase().includes('basic')) return Star
    if (pkg.name.toLowerCase().includes('pro')) return Crown
    return Zap
  }

  const getPackageAccent = (pkg) => {
    if (pkg.name.toLowerCase().includes('basic')) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' }
    if (pkg.name.toLowerCase().includes('pro')) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-400' }
    return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-400' }
  }

  return (
    <div className="h-full bg-white p-6">
      <Button variant="ghost" onClick={() => navigate(createPageUrl('ArtistDashboard'))} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Choose Your Plan</h1>
      <p className="text-gray-500 mb-8 text-sm">Unlock more features and increase your limits</p>

      {currentSubscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <Crown className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <div className="font-medium text-blue-900 text-sm">Current Plan: {currentSubscription.package_name || currentSubscription.package_id}</div>
            <div className="text-xs text-blue-600">Renews {currentSubscription.renews_at ? new Date(currentSubscription.renews_at).toLocaleDateString() : 'N/A'}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
        {packages.filter(pkg => {
          // Only show Pro plan if user is invited
          if (pkg.name.toLowerCase().includes('pro') && !isInvited) {
            return false
          }
          return true
        }).map((pkg) => {
          const PackageIcon = getPackageIcon(pkg)
          const accent = getPackageAccent(pkg)
          const isPopular = pkg.name.toLowerCase().includes('pro')
          return (
            <div key={pkg.id}
              className={`relative bg-white rounded-2xl border-2 transition-all ${isPopular ? 'border-black shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center mb-4`}>
                  <PackageIcon className={`w-5 h-5 ${accent.text}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                <div className="text-3xl font-black text-gray-900 my-2">
                  ${pkg.price}
                  <span className="text-sm font-normal text-gray-400">/{pkg.billing_cycle}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">{pkg.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-xs text-gray-600 gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {pkg.connects_included || 0} connects included
                  </div>
                  <div className="flex items-center text-xs text-gray-600 gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {pkg.job_applications_limit === -1 ? 'Unlimited' : pkg.job_applications_limit} applications/mo
                  </div>
                  <div className="flex items-center text-xs text-gray-600 gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {pkg.message_limit === -1 ? 'Unlimited' : pkg.message_limit} messages/mo
                  </div>
                  {pkg.featured_listing && (
                    <div className="flex items-center text-xs text-gray-600 gap-2">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Featured listing
                    </div>
                  )}
                  {pkg.priority_support && (
                    <div className="flex items-center text-xs text-gray-600 gap-2">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Priority support
                    </div>
                  )}
                  {pkg.analytics_access && (
                    <div className="flex items-center text-xs text-gray-600 gap-2">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Advanced analytics
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handlePlanSelect(pkg)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${isPopular ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                >
                  Get Started
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && selectedPackage && (
        <CardPaymentModal
          pkg={selectedPackage}
          onClose={() => setShowModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}