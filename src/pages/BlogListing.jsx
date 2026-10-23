import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Calendar, User, Search, Filter, Tag, ArrowRight, Clock, Mail, Play, TrendingUp, Users, Award, ChevronRight, Star } from 'lucide-react'
import Footer from '@/components/landing/backstage/Footer'
import Navbar from '@/components/landing/backstage/Navbar'

export default function BlogListingPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false, nullsFirst: false })

      if (error) throw error
      setArticles(data || [])
    } catch (err) {
      console.error('Error fetching articles:', err)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', 'Casting', 'News', 'Tips', 'Industry']
  const featuredArticle = articles[0]
  const topStories = articles.slice(1, 4)
  const latestArticles = articles.slice(4, 10)
  const castingCalls = articles.slice(0, 4)
  const behindScenes = articles.slice(4, 8)
  const coverStories = articles.slice(8, 12)

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const EXPERTS = [
    { name: 'Sarah Johnson', title: 'Casting Director', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { name: 'Michael Chen', title: 'Film Producer', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    { name: 'Amanda Williams', title: 'Talent Agent', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    { name: 'David Kim', title: 'Voice Coach', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero / Top Stories Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Featured Article */}
            {featuredArticle && (
              <div className="lg:col-span-2">
                <Link to={`/Blog/${featuredArticle.slug}`} className="group block">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    {featuredArticle.cover_image && (
                      <div className="aspect-[16/9] bg-gray-100">
                        <img
                          src={featuredArticle.cover_image}
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                      <span className="inline-block px-3 py-1 bg-[#C9A962] text-white text-xs font-bold rounded-full mb-3">
                        FEATURED
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-gray-200 text-sm line-clamp-2 mb-4">
                        {featuredArticle.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-white text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{featuredArticle.published_at ? new Date(featuredArticle.published_at).toLocaleDateString() : new Date(featuredArticle.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>5 min read</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Top Stories Side */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Top Stories</h3>
              {topStories.map((article, idx) => (
                <Link key={article.id} to={`/Blog/${article.slug}`} className="group block">
                  <div className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    {article.cover_image && (
                      <div className="w-24 h-24 shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-[#C9A962] transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-gray-600 text-xs line-clamp-2 mt-1">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <Calendar className="w-3 h-3" />
                        <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The Latest Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">The Latest</h2>
            <button className="text-[#C9A962] font-semibold text-sm hover:underline flex items-center gap-1">
              View More <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <Link key={article.id} to={`/Blog/${article.slug}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {article.cover_image && (
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {article.category && (
                      <span className="inline-block px-2 py-1 bg-[#C9A962]/10 text-[#C9A962] text-xs font-medium rounded-full mb-3">
                        {article.category}
                      </span>
                    )}
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#C9A962] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>5 min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Backstage Experts Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Backstage Experts</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {EXPERTS.map((expert, idx) => (
              <div key={idx} className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-200">
                  <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
                </div>
                <div className="font-semibold text-gray-900 text-sm">{expert.name}</div>
                <div className="text-xs text-gray-500">{expert.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Casting Calls */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Casting Calls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {castingCalls.map((article, idx) => (
              <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {article.cover_image && (
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                  <button className="w-full mt-4 bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Behind the Scenes */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Behind the Scenes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {behindScenes.map((article, idx) => (
              <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {article.cover_image && (
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cover Stories */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Cover Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coverStories.map((article, idx) => (
              <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {article.cover_image && (
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Casting News */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Casting News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {castingCalls.slice(0, 4).map((article, idx) => (
              <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {article.cover_image && (
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ready to Join CTA */}
      <div className="py-16 bg-[#E8F4FD]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join?</h2>
              <p className="text-lg text-gray-700">
                Find your next creative gig and make it work for you.
              </p>
              <button className="mt-6 bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Sign Up
              </button>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop"
                alt="Creative talent"
                className="rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Casting Calls Straight to Your Inbox */}
      <div className="py-16 bg-[#E8F4FD]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="w-16 h-16 mb-4">
                  {/* Envelope flying image placeholder - user will upload actual image */}
                  <Mail className="w-full h-full text-[#C9A962]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Casting Calls Straight to Your Inbox</h2>
                <p className="text-gray-600 mb-6">
                  Get the latest casting calls and opportunities delivered directly to your email. Never miss an opportunity.
                </p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <button className="bg-[#C9A962] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D4B575] transition-colors">
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
