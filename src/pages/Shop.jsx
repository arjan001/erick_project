import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ShopShell from '@/components/shop/ShopShell'
import ProductCard from '@/components/shop/ProductCard'
import { shopCategories, buildSeedProducts } from '@/data/shopProducts'
import { isAuctionProduct, listProducts } from '@/services/shopService'
import { Search, Flame, ShoppingBag, Tag } from 'lucide-react'

const shopTabs = [
  { id: 'all', label: 'All Items', icon: '🛍️' },
  { id: 'auction', label: 'Live Auctions', icon: '🔥' },
  ...shopCategories,
]

export default function ShopPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const products = await listProducts()
        setProducts(products)
      } catch (error) {
        //
        // Fallback to seed products on error
        const seedProducts = buildSeedProducts()
        setProducts(seedProducts)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return products.filter((p) => {
      if (activeTab === 'auction' && !isAuctionProduct(p)) return false
      if (activeTab !== 'all' && activeTab !== 'auction' && p.category !== activeTab) return false
      if (q && !p.name.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) return false
      return true
    })
  }, [products, activeTab, searchQuery])

  const auctionCount = products.filter(isAuctionProduct).length

  const handleSearch = () => {
    // Search is real-time, already applied via filteredProducts
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleProductClick = (product) => {
    navigate(`/shop/${product.id}`)
  }

  return (
    <ShopShell
      title="Shop — SmartGigs Kenya | Film Gear, Merch & Live Auctions"
      description="Shop branded merchandise, film equipment, collectibles and join live discount auctions on SmartGigs Kenya."
    >
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e] px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-center gap-2 text-sm font-medium text-white/80">
            <ShoppingBag className="h-4 w-4" /> SmartGigs Shop
          </div>
          <h1 className="mt-3 font-serif text-3xl font-bold text-white md:text-5xl">Shop & Win Big 🔥</h1>
          <p className="mt-3 max-w-xl text-sm text-white/80 md:text-base">
            Browse branded merch, film gear, and collectibles. Buy now at the listed price — or
            join a live auction for a chance to win premium items at a fraction of the cost.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              <Flame className="h-4 w-4" /> {auctionCount} Live Auctions
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              <Tag className="h-4 w-4" /> Up to 90% Off
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center px-4 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {shopTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-[#1a1a2e] text-white' : 'text-black/70 hover:bg-black/[0.04]'
                  }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white px-4 pt-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products..."
              className="w-full rounded-full border border-black/10 bg-white py-3 pl-12 pr-4 text-sm text-black placeholder:text-black/40 focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
            />
          </div>
        </div>
      </div>

      {/* Ad Banner Section */}
      <div className="bg-gray-50 px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] p-6 md:p-8">
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-8 translate-y-8 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">Sponsored</span>
                <h3 className="mt-2 text-lg font-bold text-white md:text-xl">Upgrade to Premium for Exclusive Deals</h3>
                <p className="mt-1 text-sm text-white/80">Get 20% off all shop items with a SmartGigs Premium subscription</p>
              </div>
              <button className="shrink-0 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#4F46E5] hover:bg-white/90 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="bg-[#fff0e0] px-4 pb-12 pt-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-2xl bg-white p-4 md:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black md:text-2xl">
                {activeTab === 'auction' ? '🔥 Live Auctions' : '🛍️ All Products'}
              </h2>
              <p className="text-sm font-medium text-black/50">{filteredProducts.length} items</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-[#4F46E5]" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-black/40">No products found. Try a different filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} onClick={() => handleProductClick(product)} className="cursor-pointer">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopShell>
  )
}
