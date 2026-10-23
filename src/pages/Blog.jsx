import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin, Mail, Tag, ArrowRight, Star, Play, Users, Award, ChevronRight, Heart, Bookmark } from 'lucide-react'
import Footer from '@/components/landing/backstage/Footer'
import Navbar from '@/components/landing/backstage/Navbar'

export default function BlogPage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState([])

  useEffect(() => {
    fetchArticle()
  }, [slug])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (error) throw error
      setArticle(data)

      // Fetch related articles
      const { data: related, error: relatedError } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .neq('id', data.id)
        .order('published_at', { ascending: false })
        .limit(4)

      if (relatedError) throw relatedError
      setRelatedArticles(related || [])
    } catch (err) {
      console.error('Error fetching article:', err)
    } finally {
      setLoading(false)
    }
  }

  const AUDITION_CALLS = [
    { title: 'Lead Role in Drama Series', type: 'Main Character', location: 'Nairobi', deadline: '2 days' },
    { title: 'Supporting Role in Comedy', type: 'Supporting Actor', location: 'Mombasa', deadline: '5 days' },
    { title: 'Extra for Music Video', type: 'Background Actor', location: 'Kisumu', deadline: '7 days' },
  ]

  const OPEN_CASTING_CALLS = [
    { title: 'Commercial Brand Ambassador', type: 'Model', company: 'Leading Brand', pay: 'KES 50,000' },
    { title: 'Voice Over Artist', type: 'Voice Talent', company: 'Media House', pay: 'KES 30,000' },
    { title: 'TV Show Host', type: 'Presenter', company: 'Production Co', pay: 'KES 100,000' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link to="/Blog" className="text-[#C9A962] hover:underline">Back to Blog</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative">
        {article.cover_image && (
          <div className="w-full h-[400px] md:h-[500px] bg-gray-100">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            {article.category && (
              <span className="inline-block px-3 py-1 bg-[#C9A962] text-white text-xs font-bold rounded-full mb-4">
                {article.category}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>SmartGigs Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : new Date(article.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>5 min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-2">
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {article.content}
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Sharing */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Share this article</span>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Facebook className="w-5 h-5" />
                  Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                  Tweet
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                  <Linkedin className="w-5 h-5" />
                  Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <Mail className="w-5 h-5" />
                  Email
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Get Started Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Get Started</h3>
              <p className="text-gray-300 mb-6">
                Join SmartGigs Kenya today and find your next creative opportunity.
              </p>
              <Link to="/SignIn" className="block w-full bg-[#C9A962] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#D4B575] transition-colors">
                Sign Up Now
              </Link>
            </div>

            {/* Audition Calls Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Audition Calls</h3>
                <Link to="/FindGigs" className="text-[#C9A962] text-sm font-semibold hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {AUDITION_CALLS.map((call, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{call.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{call.type}</span>
                      <span>•</span>
                      <span>{call.location}</span>
                      <span>•</span>
                      <span className="text-red-600">{call.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Casting Calls Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Open Casting Calls</h3>
                <Link to="/FindGigs" className="text-[#C9A962] text-sm font-semibold hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {OPEN_CASTING_CALLS.map((call, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{call.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      <span>{call.type}</span>
                      <span>•</span>
                      <span>{call.company}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#C9A962]">{call.pay}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* You Might Also Like */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedArticles.slice(0, 4).map((article) => (
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

      {/* More Articles */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">More Articles</h2>
            <Link to="/Blog" className="text-[#C9A962] font-semibold text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedArticles.slice(0, 4).map((article) => (
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

      {/* Casting Calls Straight to Your Inbox */}
      <div className="py-16 bg-[#E8F4FD]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="w-16 h-16 mb-4">
                  {/* Envelope flying image - using Mail icon as placeholder */}
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
