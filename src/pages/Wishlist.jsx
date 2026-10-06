import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ShopShell from '@/components/shop/ShopShell';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { formatKES } from '@/data/shopProducts';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock wishlist data
    const mockWishlist = [
      {
        id: 'seed-1',
        name: "Selina's Iconic Dress",
        image: 'https://images.unsplash.com/photo-1539109236226-a51a09e5105f?w=600&h=600&fit=crop',
        price: 65000,
        discount_price: 6500,
        category: 'Wardrobe',
        auction_enabled: true,
      },
      {
        id: 'seed-3',
        name: 'SmartGigs Branded Hoodie',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95109ea?w=600&h=600&fit=crop',
        price: 5800,
        discount_price: 3200,
        category: 'Merchandise',
        auction_enabled: false,
      },
    ];
    setWishlist(mockWishlist);
    setLoading(false);
  }, []);

  const removeFromWishlist = (id) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  const moveToCart = (item) => {
    // Add to cart logic here
    alert(`${item.name} added to cart`);
  };

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
    );
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
                  <Link to={`/shop/${item.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link to={`/shop/${item.id}`} className="block truncate text-sm font-bold text-black hover:underline">
                          {item.name}
                        </Link>
                        <p className="mt-1 text-xs text-black/50">{item.category}</p>
                        <p className="mt-1 text-sm font-bold text-black">
                          {item.discount_price ? (
                            <>
                              {formatKES(item.discount_price)}
                              <span className="ml-2 text-xs text-black/40 line-through">{formatKES(item.price)}</span>
                            </>
                          ) : (
                            formatKES(item.price)
                          )}
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
                      {item.auction_enabled && (
                        <span className="text-xs text-red-600 font-semibold">Live Auction</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ShopShell>
  );
}
