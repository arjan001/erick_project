import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Gavel, Heart, ShoppingCart } from 'lucide-react'
import { formatKES } from '@/data/shopProducts'
import { discountPercent, isAuctionProduct, addToCart, removeFromWishlist, addToWishlist, isInWishlist } from '@/services/shopService'
import { AuctionMeta } from './AuctionMeta'
import { useShop } from '@/contexts/ShopContext'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'

/** Price shown for a straight purchase: auction items sell at full price unless the buyer wins the draw. */
export const buyNowPrice = (p) => (isAuctionProduct(p) ? p.price : p.discount_price || p.price)

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { add, toggleWish, isWished } = useShop()
  const { isAuthenticated } = useAuth()
  const { success, info } = useToast()
  const auction = isAuctionProduct(product)
  const outOfStock = Number(product.stock) <= 0
  const sale = !auction && discountPercent(product) > 0
  const wished = isWished(product.id)

  const handleAddToCart = () => {
    if (outOfStock) return
    add(product)
    success('Added to cart', `${product.name} has been added to your cart.`)
  }

  const handleToggleWishlist = () => {
    toggleWish(product)
    if (wished) {
      info('Removed from wishlist', `${product.name} has been removed from your wishlist.`)
    } else {
      success('Added to wishlist', `${product.name} has been added to your wishlist.`)
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white transition-all hover:shadow-lg">
      <Link to={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {auction && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              <Flame className="h-3 w-3" /> Auction
            </div>
          )}
          {sale && (
            <div className="absolute left-2 top-2 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold text-white">
              -{discountPercent(product)}%
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white">Sold out</div>
          )}
        </div>

        <div className="p-3 pb-0">
          <p className="text-xs font-medium text-black/50">{product.category}</p>
          <h3 className="mt-1 truncate text-sm font-bold text-black">{product.name}</h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
            {sale ? (
              <>
                <span className="text-base font-bold text-black">{formatKES(product.discount_price)}</span>
                <span className="text-xs text-black/40 line-through">{formatKES(product.price)}</span>
              </>
            ) : (
              <span className="text-base font-bold text-black">{formatKES(product.price)}</span>
            )}
          </div>
          {auction && (
            <p className="mt-1 text-xs text-black/60">
              Grab it for <strong className="text-red-600">{formatKES(product.discount_price)}</strong>
            </p>
          )}
          <div className="mt-2 min-h-[28px]">
            {auction ? <AuctionMeta product={product} /> : <p className="text-xs text-black/50">{outOfStock ? 'Out of stock' : `${product.stock} in stock`}</p>}
          </div>
        </div>
      </Link>

      <button
        onClick={handleToggleWishlist}
        aria-label="Add to wishlist"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
      >
        <Heart className={`h-4 w-4 ${wished ? 'fill-red-500 text-red-500' : 'text-black/60'}`} />
      </button>

      <div className="mt-auto grid gap-2 p-3 pt-3">
        <button
          disabled={outOfStock}
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#4F46E5] py-2 text-xs font-semibold text-white transition-colors hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:bg-black/20"
        >
          <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
        </button>
        {auction && (
          <button
            onClick={() => navigate(`/shop/${product.id}#auction`)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2 text-xs font-bold text-white hover:bg-red-600"
          >
            <Gavel className="h-3.5 w-3.5" /> Grab Discount
          </button>
        )}
      </div>
    </div>
  )
}
