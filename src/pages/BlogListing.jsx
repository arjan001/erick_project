import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Calendar, User, Search, ArrowRight, Clock, Mail, Play, TrendingUp, Users, Award, ChevronRight, Star, Tag } from 'lucide-react'
import Footer from '@/components/landing/backstage/Footer'
import Navbar from '@/components/landing/backstage/Navbar'

export default function BlogListingPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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

  const featuredArticle = articles[0]
  const topStories = articles.slice(1, 4)
  const latestMain = articles[4]
  const latestSide = articles.slice(5, 9)
  const castingCalls = articles.slice(0, 4)
  const behindScenesMain = articles[4]
  const behindScenes = articles.slice(5, 9)
  const otherStories = articles.slice(9, 13)
  const castingNewsMain = articles[13]
  const castingNews = articles.slice(14, 18)

  const filteredArticles = articles.filter(article => {
    return article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const SUBJECTS = ['Acting', 'Directing', 'Casting', 'Producing', 'Voiceover', 'Screenwriting', 'Stunts', 'Modeling']

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Top Stories Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Top Stories</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Featured */}
          {featuredArticle && (
            <div className="lg:col-span-2">
              <Link to={`/Blog/${featuredArticle.slug}`} className="group block">
                <div className="relative rounded-xl overflow-hidden">
                  {featuredArticle.cover_image && (
                    <div className="aspect-[16/9] bg-gray-100">
                      <img
                        src={featuredArticle.cover_image}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-gray-200 text-sm line-clamp-2">
                      {featuredArticle.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Side Stories */}
          <div className="space-y-4">
            {topStories.map((article, idx) => (
              <Link key={article.id} to={`/Blog/${article.slug}`} className="group block">
                <div className="flex gap-4">
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
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
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

      {/* The Latest Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">The Latest</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Article */}
            {latestMain && (
              <div className="lg:col-span-2">
                <Link to={`/Blog/${latestMain.slug}`} className="group block">
                  <div className="relative rounded-xl overflow-hidden mb-4">
                    {latestMain.cover_image && (
                      <div className="aspect-[16/9] bg-gray-100">
                        <img
                          src={latestMain.cover_image}
                          alt={latestMain.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {latestMain.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {latestMain.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{latestMain.published_at ? new Date(latestMain.published_at).toLocaleDateString() : new Date(latestMain.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>5 min read</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Side Articles */}
            <div className="space-y-4">
              {latestSide.map((article) => (
                <Link key={article.id} to={`/Blog/${article.slug}`} className="group block">
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                      {article.title}
                    </h4>
                    <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Casting Calls */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Casting Calls</h2>
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
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                  <button className="w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Behind the Scenes - Dark Background */}
      <div className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Behind the Scenes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Article */}
            {behindScenesMain && (
              <div className="lg:col-span-2">
                <Link to={`/Blog/${behindScenesMain.slug}`} className="group block">
                  <div className="relative rounded-xl overflow-hidden mb-4">
                    {behindScenesMain.cover_image && (
                      <div className="aspect-[16/9] bg-gray-800">
                        <img
                          src={behindScenesMain.cover_image}
                          alt={behindScenesMain.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-gray-300 transition-colors">
                    {behindScenesMain.title}
                  </h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">
                    {behindScenesMain.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{behindScenesMain.published_at ? new Date(behindScenesMain.published_at).toLocaleDateString() : new Date(behindScenesMain.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Side Articles */}
            <div className="space-y-4">
              {behindScenes.map((article) => (
                <Link key={article.id} to={`/Blog/${article.slug}`} className="group block">
                  <div className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-colors">
                    <h4 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-gray-300 transition-colors mb-2">
                      {article.title}
                    </h4>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Other Stories */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Other Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherStories.map((article) => (
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

      {/* Casting News - Dark Background */}
      <div className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Casting News</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Article */}
            {castingNewsMain && (
              <div className="lg:col-span-2">
                <Link to={`/Blog/${castingNewsMain.slug}`} className="group block">
                  <div className="relative rounded-xl overflow-hidden mb-4">
                    {castingNewsMain.cover_image && (
                      <div className="aspect-[16/9] bg-gray-800">
                        <img
                          src={castingNewsMain.cover_image}
                          alt={castingNewsMain.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-gray-300 transition-colors">
                    {castingNewsMain.title}
                  </h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">
                    {castingNewsMain.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{castingNewsMain.published_at ? new Date(castingNewsMain.published_at).toLocaleDateString() : new Date(castingNewsMain.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Side Articles */}
            <div className="space-y-4">
              {castingNews.map((article) => (
                <Link key={article.id} to={`/Blog/${article.slug}`} className="group block">
                  <div className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-colors">
                    <h4 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-gray-300 transition-colors mb-2">
                      {article.title}
                    </h4>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* More Articles by Subject */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">More Articles by Subject</h2>
          <div className="flex flex-wrap gap-3">
            {SUBJECTS.map((subject) => (
              <Link key={subject} to={`/Blog?tag=${subject}`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                {subject}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Ready to Join CTA */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join?</h2>
              <p className="text-lg text-gray-700">
                Find your next creative gig and make it work for you.
              </p>
              <Link to="/SignUp" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Sign Up
              </Link>
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
      <div className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="w-16 h-16 mb-4">
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
