import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Calendar, User, Share2, Facebook, Twitter, Linkedin, Mail, Clock, Tag, ArrowRight, ChevronRight } from 'lucide-react'
import Footer from '@/components/landing/backstage/Footer'
import Navbar from '@/components/landing/backstage/Navbar'

export default function BlogPage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchArticle(slug)
    }
  }, [slug])

  const fetchArticle = async (articleSlug) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', articleSlug)
        .single()

      if (error) throw error
      setArticle(data)

      // Fetch related articles
      const { data: related, error: relatedError } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .neq('id', data?.id)
        .order('created_at', { ascending: false })
        .limit(6)

      if (relatedError) throw relatedError
      setRelatedArticles(related || [])
    } catch (err) {
      console.error('Error fetching article:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = (platform) => {
    const url = window.location.href
    const title = article?.title || 'SmartGigs Kenya Blog'
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link to="/Blog" className="text-blue-600 hover:underline">Back to Blog</Link>
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
          <div className="w-full h-[500px] md:h-[600px] bg-gray-100">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>SmartGigs Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : new Date(article.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>5 min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Social Share */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Share:</span>
            <button onClick={() => handleShare('facebook')} className="p-2 hover:bg-gray-100 rounded-full">
              <Facebook className="w-5 h-5 text-blue-600" />
            </button>
            <button onClick={() => handleShare('twitter')} className="p-2 hover:bg-gray-100 rounded-full">
              <Twitter className="w-5 h-5 text-blue-400" />
            </button>
            <button onClick={() => handleShare('linkedin')} className="p-2 hover:bg-gray-100 rounded-full">
              <Linkedin className="w-5 h-5 text-blue-700" />
            </button>
            <button onClick={() => handleShare('email')} className="p-2 hover:bg-gray-100 rounded-full">
              <Mail className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black">
            <Share2 className="w-4 h-4" />
            Copy Link
          </button>
        </div>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none mb-12">
          {article.excerpt && (
            <p className="text-xl text-gray-600 font-medium mb-8 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-12 pb-8 border-b border-gray-200">
            <Tag className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((related) => (
                <Link key={related.id} to={`/Blog/${related.slug}`} className="group">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {related.cover_image && (
                      <div className="aspect-video bg-gray-100">
                        <img
                          src={related.cover_image}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {related.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{related.published_at ? new Date(related.published_at).toLocaleDateString() : new Date(related.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* More Articles */}
        {relatedArticles.length > 3 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">More Articles</h2>
            <div className="space-y-4">
              {relatedArticles.slice(3).map((related) => (
                <Link key={related.id} to={`/Blog/${related.slug}`} className="flex items-start gap-4 group p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  {related.cover_image && (
                    <div className="w-24 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={related.cover_image}
                        alt={related.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {related.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{related.published_at ? new Date(related.published_at).toLocaleDateString() : new Date(related.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
