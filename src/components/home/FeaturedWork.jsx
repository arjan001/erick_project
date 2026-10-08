import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { ArrowRight } from 'lucide-react'
import { FeaturedWork } from '@/lib/supabaseEntities'

export default function FeaturedWork() {
  const [hoveredId, setHoveredId] = useState(null)
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const works = await FeaturedWork.filter({ status: 'active' }, 'display_order', 6)
        
        setFeaturedProjects(works || [])
      } catch (error) {
        
        setFeaturedProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProjects()
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    )
  }

  if (featuredProjects.length === 0) {
    return null
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-black">Featured Work</h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              Curated productions delivered by our European network
            </p>
          </div>
          <Link 
            to={createPageUrl('Work')} 
            className="mt-4 md:mt-0 text-amber-600 hover:text-amber-500 flex items-center gap-2 group"
          >
            <span className="text-lg font-medium">View All</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Netflix-style Grid - 3 per line, max 6 total */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {featuredProjects.slice(0, 6).map((project) => (
            <div
              key={project.id}
              className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer hover-lift"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Thumbnail */}
              <img
                src={project.images?.[0] || project.video_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'}
                alt={project.title}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  hoveredId === project.id ? 'scale-110 opacity-80' : 'scale-100 opacity-100'
                }`}
                loading="lazy"
                decoding="async"
              />

              {/* Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 ${
                hoveredId === project.id ? 'opacity-100' : 'opacity-60'
              }`}>
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <div className="text-xs font-medium text-amber-600 mb-2">
                    {project.featured_type === 'paid' ? 'Paid Feature' : 
                     project.featured_type === 'subscription' ? 'Subscription' : 'Admin Pick'}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-300 line-clamp-2 mt-1">{project.description}</p>
                  )}
                </div>
              </div>

              {/* Play indicator on hover */}
              {hoveredId === project.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-600/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Load More Button */}
        <div className="text-center mt-12">
          <Link to={createPageUrl('Work')}>
            <button className="px-8 py-4 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all hover-lift">
              LOAD MORE
              <ArrowRight className="inline-block ml-2 w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}