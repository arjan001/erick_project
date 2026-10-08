import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ShopShell from '@/components/shop/ShopShell'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { formatKES } from '@/data/shopProducts'
import { useShop } from '@/contexts/ShopContext'
import { getWishlist, removeFromWishlist as removeFromWishlistService } from '@/services/shopService'
import { useToast } from '@/hooks/useToast'

export default function WishlistPage() {
  const { addToCart } = useShop()
  const { success } = useToast()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load wishlist from localStorage on mount
    const loadWishlist = () => {
      setWishlist(getWishlist())
      setLoading(false)
    }

    loadWishlist()

    // Listen for wishlist updates from other components
    const handleWishlistUpdate = () => {
      setWishlist(getWishlist())
    }

    window.addEventListener('wishlist-updated', handleWishlistUpdate)
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate)
  }, [])

  const removeFromWishlist = (itemId) => {
    removeFromWishlistService(itemId)
    setWishlist(getWishlist())
  }

  const moveToCart = (item) => {
    // Create a product object from wishlist item
    const product = {
      id: item.product_id,
      name: item.product_name,
      image: item.image,
      price: item.price,
    }
    addToCart(product)
    success('Added to cart', `${item.product_name} has been added to your cart.`)
  }

  if (loading) {
    return (
      <ShopShell title="Wishlist — SmartGigs Kenya Shop" description="Your saved items.">
        <div className="bg-[#fff0e0] px-4 py-10 lg:px-8">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-[#4F46E5]" />
            </div>
          </div>
        </div>
      </ShopShell>
    )
  }

  return (
    <ShopShell title="Wishlist — SmartGigs Kenya Shop" description="Your saved items.">
      <div className="bg-[#fff0e0] px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <h1 className="mb-6 text-2xl font-bold text-black md:text-3xl">My Wishlist</h1>

          {wishlist.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center">
              <Heart className="mx-auto h-10 w-10 text-black/20" />
              <p className="mt-3 text-base font-semibold text-black">Your wishlist is empty</p>
              <Link to="/Shop" className="mt-5 inline-block rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA]">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {wishlist.map((item) => (
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
                        <p className="mt-1 text-sm font-bold text-black">
                          {formatKES(item.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        aria-label="Remove from wishlist"
                        className="rounded-full p-2 text-black/40 hover:bg-black/[0.05] hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center gap-3 pt-2">
                      <button
                        onClick={() => moveToCart(item)}
                        className="flex items-center gap-2 rounded-full bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4338CA]"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ShopShell>
  )
}
