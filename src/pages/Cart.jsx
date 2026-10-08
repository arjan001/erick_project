import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ShopShell from '@/components/shop/ShopShell'
import { Minus, Plus, ShoppingBag, Trash2, Trophy } from 'lucide-react'
import { formatKES } from '@/data/shopProducts'
import { getCart, removeFromCart, updateCartQuantity, calcTotals, getShopSettings } from '@/services/shopService'
import { useAuth } from '@/lib/AuthContext'

export default function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({ enableMpesa: true, enableCard: true, shippingThreshold: 5000, shippingCost: 500 })

  useEffect(() => {
    loadCart()

    const handleStorageChange = () => loadCart()
    window.addEventListener('cart-updated', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('cart-updated', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const loadCart = async () => {
    const cartItems = getCart()
    setCart(cartItems)
    const shopSettings = await getShopSettings()
    setSettings(shopSettings)
    setLoading(false)
  }

  const setQuantity = (id, qty) => {
    if (qty < 1) return
    updateCartQuantity(id, qty)
    setCart(getCart())
  }

  const remove = (id) => {
    removeFromCart(id)
    setCart(getCart())
  }

  const totals = calcTotals(cart, settings)

  return (
    <ShopShell title="Your Cart — SmartGigs Kenya Shop" description="Review the items in your SmartGigs Kenya cart.">
      <div className="bg-[#fff0e0] px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <h1 className="mb-6 text-2xl font-bold text-black md:text-3xl">Your Cart</h1>

          {loading && cart.length === 0 ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-[#4F46E5]" />
            </div>
          ) : cart.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-black/20" />
              <p className="mt-3 text-base font-semibold text-black">Your cart is empty</p>
              <Link to="/Shop" className="mt-5 inline-block rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA]">
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-2xl bg-white p-4">
                    <Link to={`/shop/${item.product_id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      <img src={item.image} alt={item.product_name} className="h-full w-full object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link to={`/shop/${item.product_id}`} className="block truncate text-sm font-bold text-black hover:underline">
                            {item.product_name}
                          </Link>
                          {item.is_auction_claim && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              <Trophy className="h-3 w-3" /> Auction prize
                            </span>
                          )}
                          <p className="mt-1 text-xs text-black/50">{formatKES(item.unit_price)} each</p>
                        </div>
                        <button
                          onClick={() => remove(item.id)}
                          aria-label="Remove item"
                          className="rounded-full p-2 text-black/40 hover:bg-black/[0.05] hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        {item.is_auction_claim ? (
                          <span className="text-xs text-black/50">Qty 1</span>
                        ) : (
                          <div className="flex items-center rounded-lg border border-black/10">
                            <button
                              onClick={() => setQuantity(item.id, Number(item.quantity) - 1)}
                              disabled={Number(item.quantity) <= 1}
                              aria-label="Decrease quantity"
                              className="px-2.5 py-1.5 text-black/60 hover:bg-black/[0.03] disabled:opacity-30"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-semibold text-black">{item.quantity}</span>
                            <button
                              onClick={() => setQuantity(item.id, Number(item.quantity) + 1)}
                              aria-label="Increase quantity"
                              className="px-2.5 py-1.5 text-black/60 hover:bg-black/[0.03]"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        <p className="text-base font-bold text-black">{formatKES(Number(item.unit_price) * Number(item.quantity))}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="h-fit rounded-2xl bg-white p-5">
                <h2 className="text-lg font-bold text-black">Order summary</h2>
                <dl className="mt-4 space-y-2 text-sm">
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
                  onClick={() => navigate('/Checkout')}
                  className="mt-5 w-full rounded-full bg-[#4F46E5] py-3 text-sm font-semibold text-white hover:bg-[#4338CA]"
                >
                  Proceed to checkout
                </button>
                <Link to="/Shop" className="mt-3 block text-center text-sm font-medium text-black/60 hover:text-black">
                  Continue shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </div>
    </ShopShell>
  )
}
