import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { X, Building2, MapPin, Globe, Mail, Phone, Users, FileText, Star, Calendar, CheckCircle, ExternalLink, Instagram, Linkedin, Twitter, Youtube, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'
import { ProjectOwner, Project } from '@/lib/supabaseEntities'

export default function ClientPublicProfile() {
  const { id } = useParams()
  const [owner, setOwner] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeProjectIdx, setActiveProjectIdx] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch client profile
        const owners = await ProjectOwner.list()
        const foundOwner = owners.find(o => o.id === id)
        if (foundOwner) {
          setOwner(foundOwner)
          
          // Fetch client's projects
          const allProjects = await Project.filter({ project_owner_email: foundOwner.email })
          setProjects(allProjects.filter(p => p.status === 'verified'))
        }
      } catch (err) {
        //
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!owner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Client profile not found</div>
      </div>
    )
  }

  const nextProject = () => setActiveProjectIdx((i) => (i + 1) % projects.length)
  const prevProject = () => setActiveProjectIdx((i) => (i - 1 + projects.length) % projects.length)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/FindJobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
              {owner.logo_url ? (
                <img src={owner.logo_url} alt={owner.company} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{owner.company || owner.full_name}</h1>
              <p className="text-gray-600 mt-1">{owner.bio || 'Production company seeking creative talent'}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                {owner.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {owner.city}, {owner.country}
                  </span>
                )}
                {owner.website && (
                  <a href={owner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
            {owner.linkedin && (
              <a href={owner.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-blue-600">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {owner.instagram && (
              <a href={owner.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-pink-500">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {owner.twitter && (
              <a href={owner.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-blue-400">
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {owner.youtube && (
              <a href={owner.youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-red-600">
                <Youtube className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
            <div className="text-sm text-gray-500">Active Projects</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{owner.profile_public ? 'Public' : 'Private'}</div>
            <div className="text-sm text-gray-500">Profile Status</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{owner.verification_status === 'verified' ? 'Verified' : 'Pending'}</div>
            <div className="text-sm text-gray-500">Verification</div>
          </div>
        </div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Projects
            </h2>
            
            <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
              {projects[activeProjectIdx]?.image_url ? (
                <img 
                  src={projects[activeProjectIdx].image_url} 
                  alt={projects[activeProjectIdx].title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FileText className="w-12 h-12" />
                </div>
              )}
              
              {projects.length > 1 && (
                <>
                  <button
                    onClick={prevProject}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextProject}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {projects.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveProjectIdx(i)}
                        className={`h-2 rounded-full transition-all ${i === activeProjectIdx ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">{projects[activeProjectIdx]?.title || 'Untitled Project'}</h3>
              <p className="text-gray-600 text-sm">{projects[activeProjectIdx]?.notes || 'No description available'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {projects[activeProjectIdx]?.departments_needed?.map((dept, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                    {dept}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                {projects[activeProjectIdx]?.budget_min && (
                  <span>Budget: KES {projects[activeProjectIdx].budget_min?.toLocaleString()}</span>
                )}
                {projects[activeProjectIdx]?.project_type && (
                  <span>Type: {projects[activeProjectIdx].project_type.replace(/_/g, ' ')}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </h2>
          <div className="space-y-3">
            {owner.email && (
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{owner.email}</span>
              </div>
            )}
            {owner.phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{owner.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
