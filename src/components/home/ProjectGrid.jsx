import React from 'react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { ArrowRight } from 'lucide-react'

const FEATURED_PROJECTS = [
  {
    id: 1,
    title: 'ELOREA',
    company: 'Amsterdam Productions',
    score: '300cbt',
    image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800',
    type: 'Commercial'
  },
  {
    id: 2,
    title: 'ANDERSSON BELL',
    company: 'Berlin Creative',
    score: '300cbt',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800',
    type: 'Fashion Film'
  },
  {
    id: 3,
    title: 'D2C Life Science',
    company: 'Studio Lux',
    score: 'Iron Velvet',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
    type: 'Documentary'
  },
]

export default function ProjectGrid() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-5xl md:text-6xl font-black uppercase mb-4 tracking-tight">
            Latest
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-xl text-gray-600">
              Recent productions seeking talent
            </p>
            <Link 
              to={createPageUrl('Work')}
              className="text-sm font-bold uppercase tracking-wider hover:underline flex items-center gap-2"
            >
              View All Projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_PROJECTS.map((project) => (
            <Link 
              key={project.id}
              to={createPageUrl('Work')}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 card-hover"
            >
              {/* Project Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    {project.type}
                  </span>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-black uppercase tracking-tight">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                    <span className="text-sm font-bold">{project.score}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-gray-300" />
                  <span className="font-medium">{project.company}</span>
                  <span className="text-xs">PRO</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View More */}
        <div className="text-center mt-12">
          <Link to={createPageUrl('Work')}>
            <button className="px-8 py-4 border-2 border-black text-black font-bold uppercase text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300">
              View All Nominees
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}