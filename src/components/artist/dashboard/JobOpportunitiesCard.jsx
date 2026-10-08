import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { Plus, Briefcase, Building2, MapPin, Clock, Star, Flame, Sparkles, DollarSign } from 'lucide-react'
import { Job, Project } from '@/lib/supabaseEntities'
import { getProjectTags, isNewProject, isPopularProject } from '@/shared/utils/projectTags'

const ICON_COLORS = [
  { bg: '#2A9D8F', text: '#ffffff' },
  { bg: '#F4A261', text: '#ffffff' },
  { bg: '#E9C46A', text: '#5a4a1a' },
  { bg: '#264653', text: '#ffffff' },
  { bg: '#2A9D8F', text: '#ffffff' },
]

const getTimeAgo = (date) => {
  if (!date) return 'Recently'
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export default function JobOpportunitiesCard({ jobs = [] }) {
  const [allOpportunities, setAllOpportunities] = useState([])

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        // Fetch both Jobs and Projects
        const [allJobs, allProjects] = await Promise.all([
          Job.filter({ status: 'open' }, '-created_date', 5),
          Project.filter({ status: 'verified' }, '-created_date', 5)
        ])

        // Convert projects to job-like format
        const projectJobs = allProjects.map(project => ({
          id: project.id,
          title: project.project_type?.replace(/_/g, ' ') || 'Project',
          location: [project.location_city, project.location_country].filter(Boolean).join(', ') || 'Remote',
          budget_min: project.budget_min || 0,
          budget_type: project.budget_range?.includes('hourly') ? 'Hourly' : 'Fixed',
          isProject: true,
          image_url: project.image_url,
          client_name: project.project_owner_name || 'Client',
          created_at: project.created_at,
          description: project.notes?.substring(0, 80) || 'Project opportunity',
          // Add project data for tags
          projectData: project
        }))

        // Combine and take first 5
        const combined = [...allJobs, ...projectJobs].slice(0, 5)
        setAllOpportunities(combined)
      } catch (err) {
        
        setAllOpportunities(jobs.slice(0, 5))
      }
    }

    if (jobs.length === 0) {
      fetchOpportunities()
    } else {
      setAllOpportunities(jobs.slice(0, 5))
    }
  }, [jobs])

  const displayItems = allOpportunities.length > 0 ? allOpportunities : jobs.slice(0, 5)

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Find Work</h2>
        <Link
          to={createPageUrl('Jobs')}
          className="flex items-center gap-1 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-full px-2.5 py-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> View All
        </Link>
      </div>
      {displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-4">
          <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
            <Briefcase className="w-4 h-4 text-gray-300" />
          </span>
          <p className="text-xs text-gray-400">No opportunities available right now</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayItems.map((item, idx) => {
            return (
              <Link key={item.id} to={createPageUrl('Jobs')} className="flex gap-3 hover:bg-gray-50 p-3 rounded-xl transition-colors group border border-gray-100">
                {/* Left - Client Avatar */}
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>

                {/* Right - Content */}
                <div className="flex-1 min-w-0">
                  {/* Top Row - Timestamp */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500">{getTimeAgo(item.created_at)}</span>
                    {item.isProject && (
                      <span className="bg-black text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                        Project
                      </span>
                    )}
                  </div>

                  {/* Job Title */}
                  <p className="text-xs font-semibold text-gray-900 truncate mb-1">{item.title}</p>

                  {/* Project Tags */}
                  {item.isProject && item.projectData && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {item.projectData.is_featured && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-2.5 h-2.5 mr-0.5" />
                          Featured
                        </span>
                      )}
                      {isPopularProject(item.projectData.budget) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-orange-100 text-orange-800">
                          <Flame className="w-2.5 h-2.5 mr-0.5" />
                          Popular
                        </span>
                      )}
                      {isNewProject(item.projectData.created_at) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-100 text-blue-800">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                          New
                        </span>
                      )}
                      {item.projectData.open_to_backing && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-green-100 text-green-800">
                          <DollarSign className="w-2.5 h-2.5 mr-0.5" />
                          Backing
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-[10px] text-gray-600 line-clamp-1 mb-1">{item.description || 'Job opportunity'}</p>

                  {/* Location and Pay */}
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <div className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate">{item.location || 'Remote'}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {item.budget_type === 'Hourly' ? `€${item.budget_min}/hr` : `€${item.budget_min}`}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}