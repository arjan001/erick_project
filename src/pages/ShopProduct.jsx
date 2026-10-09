import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import ShopShell from '@/components/shop/ShopShell'
import ProductCard, { buyNowPrice } from '@/components/shop/ProductCard'
import { formatCountdown, useNow } from '@/components/shop/AuctionMeta'
import { formatKES } from '@/data/shopProducts'
import {
  discountPercent as calcDiscount,
  getAuctionInfo,
  getProduct,
  hasJoinedAuction,
  isAuctionProduct,
  joinAuction,
  listProducts,
} from '@/services/shopService'
import { useShop } from '@/contexts/ShopContext'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { Flame, Check, ShoppingCart, ArrowLeft, Shield, Gavel, Trophy, Heart, Users } from 'lucide-react'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hash } = useLocation()
  const { user, isAuthenticated } = useAuth()
  const { add, toggleWish, isWished } = useShop()
  const { success, info } = useToast()
  const now = useNow()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [joined, setJoined] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setQuantity(1)
    Promise.all([getProduct(id), listProducts()])
      .then(([p, all]) => {
        if (cancelled) return
        setProduct(p)
        setRelated(all.filter((x) => String(x.id) !== String(id) && x.status !== 'inactive').slice(0, 4))
      })
      .catch(() => { })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!product || !isAuthenticated || !isAuctionProduct(product)) return
    hasJoinedAuction(product.id, user.email).then(setJoined)
  }, [product?.id, isAuthenticated, user?.email])

  useEffect(() => {
    if (!loading && product && hash === '#auction') {
      document.getElementById('auction')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [loading, product, hash])

  const handleJoin = useCallback(async () => {
    if (!isAuthenticated) {
      info('Sign in required', 'Please sign in to join this auction.')
      navigate('/SignIn')
      return
    }
    setJoining(true)
    try {
      const res = await joinAuction(product, user)
      setProduct(res.product)
      setJoined(true)
      if (!res.already) success("You're in!", 'Good luck — the winner is drawn when the auction closes.')
    } catch (err) {
      //
      info('Could not join', 'Something went wrong. Please try again.')
    } finally {
      setJoining(false)
    }
  }, [isAuthenticated, product, user, info, success, navigate])

  if (loading) {
    return (
      <ShopShell
        title="Shop — SmartGigs Kenya"
        description="Loading product details..."
        keywords="shop, product, smartgigs kenya"
        ogImage="https://smartgigs.co.ke/og-shop.jpg"
      >
        <div className="flex justify-center bg-white py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-[#4F46E5]" />
        </div>
      </ShopShell>
    )
  }

  if (!product) {
    return (
      <ShopShell
        title="Product not found — SmartGigs Kenya Shop"
        description="We couldn't find that product."
        keywords="product not found, smartgigs kenya"
        ogImage="https://smartgigs.co.ke/og-shop.jpg"
      >
        <div className="bg-white px-4 py-24 text-center">
          <p className="text-lg font-semibold text-black">We couldn't find that product.</p>
          <Link to="/Shop" className="mt-4 inline-block rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white">
            Back to Shop
          </Link>
        </div>
      </ShopShell>
    )
  }

  const auction = isAuctionProduct(product)
  const aInfo = getAuctionInfo(product, now)
  const auctionClosed = auction && !aInfo.open
  const isWinner = auction && product.auction_winner_email && product.auction_winner_email === user?.email
  const outOfStock = Number(product.stock) <= 0
  const wished = isWished(product.id)
  const sale = !auction && calcDiscount(product) > 0
  const unitPrice = buyNowPrice(product)

  return (
    <ShopShell
      title={`${product.name} — SmartGigs Kenya Shop`}
      description={product.description}
      keywords={`shop, ${product.category}, ${product.name}, smartgigs kenya`}
      ogImage={product.image || 'https://smartgigs.co.ke/og-shop.jpg'}
    >
      {/* Breadcrumb */}
      <div className="bg-white px-4 py-3 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 text-sm text-black/50">
          <Link to="/Shop" className="flex items-center gap-1 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
          <span>/</span>
          <span className="font-medium text-black/70">{product.category}</span>
        </div>
      </div>

      {/* Product detail */}
      <div className="bg-white px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Image */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl bg-gray-100">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              </div>
              {auction && (
                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                  <Flame className="h-4 w-4" /> Live Auction
                </div>
              )}
              {sale && (
                <div className="absolute right-4 top-4 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white">
                  -{calcDiscount(product)}%
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <p className="text-sm font-medium text-black/50">{product.category}</p>
              <h1 className="mt-2 text-2xl font-bold text-black md:text-3xl">{product.name}</h1>

              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                {sale ? (
                  <>
                    <span className="text-3xl font-bold text-black">{formatKES(product.discount_price)}</span>
                    <span className="text-xl text-black/40 line-through">{formatKES(product.price)}</span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                      Save {formatKES(product.price - product.discount_price)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-black">{formatKES(product.price)}</span>
                )}
              </div>

              <p className="mt-5 text-sm leading-relaxed text-black/70">{product.description}</p>

              <div className="mt-4 flex items-center gap-2 text-sm">
                <Check className={`h-4 w-4 ${outOfStock ? 'text-red-500' : 'text-green-600'}`} />
                <span className="text-black/70">{outOfStock ? 'Out of stock' : `${product.stock} in stock`}</span>
              </div>

              {/* ─── Auction ─── */}
              {auction && (
                <div id="auction" className="mt-5 rounded-xl border-2 border-red-200 bg-red-50 p-5">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-red-600" />
                    <h3 className="text-sm font-bold text-red-900">Grab Discount Auction</h3>
                  </div>
                  <p className="mt-2 text-sm text-red-800">
                    Join for free for a chance to win this item at <strong>{formatKES(product.discount_price)}</strong>{' '}
                    (regular price {formatKES(product.price)}). When the auction closes, a winner is picked at random
                    from everyone who joined.
                  </p>

                  <div className="mt-4 text-center">
                    {auctionClosed ? (
                      <div className="text-2xl font-bold text-gray-500">Auction closed</div>
                    ) : aInfo.type === 'count' ? (
                      <>
                        <div className="flex items-center justify-center gap-2 text-3xl font-bold text-red-600">
                          <Users className="h-6 w-6" /> {aInfo.participants.toLocaleString()} / {aInfo.target.toLocaleString()}
                        </div>
                        <p className="mt-1 text-xs text-red-400">Participants joined</p>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-red-600">{formatCountdown(aInfo.timeLeft ?? 0)}</div>
                        <p className="mt-1 text-xs text-red-400">Time remaining</p>
                      </>
                    )}
                  </div>

                  {!auctionClosed && (
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-red-100">
                      <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${aInfo.progress}%` }} />
                    </div>
                  )}

                  <div className="mt-4">
                    {isWinner ? (
                      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-center">
                        <Trophy className="mx-auto h-7 w-7 text-amber-500" />
                        <p className="mt-1 text-sm font-bold text-amber-900">You won! 🎉</p>
                        <p className="text-xs text-amber-800">Claim it now at {formatKES(product.discount_price)}.</p>
                        <button
                          onClick={async () => {
                            const ok = await add(product, 1, { unitPrice: product.discount_price, isAuctionClaim: true })
                            if (ok) navigate('/Cart')
                          }}
                          className="mt-3 w-full rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-white hover:bg-amber-600"
                        >
                          Claim prize — {formatKES(product.discount_price)}
                        </button>
                      </div>
                    ) : auctionClosed ? (
                      <div className="rounded-xl border border-black/10 bg-white p-4 text-center text-sm text-black/60">
                        {product.auction_winner_name
                          ? 'The winner has been drawn and notified.'
                          : 'This auction closed without any participants.'}
                      </div>
                    ) : joined ? (
                      <div className="flex items-center justify-center gap-3 rounded-xl border-2 border-green-200 bg-green-50 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-900">You're in the auction! 🎉</p>
                          <p className="text-xs text-green-700">Come back when it closes to see if you won. Good luck!</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                      >
                        <Gavel className="h-5 w-5" /> {joining ? 'Joining…' : "Join Auction — It's Free"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {!outOfStock && (
                <div className="mt-6 flex items-center gap-4">
                  <label className="text-sm font-medium text-black/70">Quantity:</label>
                  <div className="flex items-center rounded-lg border border-black/10">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-4 py-2 text-lg font-bold text-black/60 hover:bg-black/[0.03]"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-black">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(Number(product.stock) || 1, q + 1))}
                      className="px-4 py-2 text-lg font-bold text-black/60 hover:bg-black/[0.03]"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Buy actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  disabled={outOfStock}
                  onClick={() => add(product, quantity, { unitPrice })}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#4F46E5] px-6 py-3.5 text-sm font-semibold text-[#4F46E5] transition-colors hover:bg-[#4F46E5]/5 disabled:cursor-not-allowed disabled:border-black/20 disabled:text-black/30"
                >
                  <ShoppingCart className="h-5 w-5" /> Add to Cart
                </button>
                <button
                  disabled={outOfStock}
                  onClick={async () => {
                    const ok = await add(product, quantity, { unitPrice })
                    if (ok) navigate('/Checkout')
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#4F46E5] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:bg-black/20"
                >
                  Buy Now — {formatKES(unitPrice * quantity)}
                </button>
                <button
                  onClick={() => toggleWish(product)}
                  aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="flex items-center justify-center rounded-full border border-black/10 px-4 py-3.5 hover:bg-black/[0.03]"
                >
                  <Heart className={`h-5 w-5 ${wished ? 'fill-rose-500 text-rose-500' : 'text-black/60'}`} />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-xs text-black/50">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4" /> Secure checkout
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> Authenticity guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="bg-[#fff0e0] px-4 py-8 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <h2 className="mb-4 text-xl font-bold text-black">You might also like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </ShopShell>
  )
}
