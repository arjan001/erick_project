import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Project } from '@/lib/supabaseEntities'
import { MapPin, Calendar, Briefcase } from 'lucide-react'
import SEOMetaTags from '@/components/SEOMetaTags'

export default function ProjectPublic() {
  const [searchParams] = useSearchParams()
  const [project, setProject] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const id = searchParams.get('id')
    if (!id) { setNotFound(true); return; }
    Project.get(id).then(setProject).catch(() => setNotFound(true))
  }, [searchParams])

  if (notFound) return (
    <>
      <SEOMetaTags
        title="Project Not Found — SmartGigs Kenya"
        description="The project you're looking for could not be found."
        keywords="project not found, smartgigs kenya"
        ogImage="https://smartgigs.co.ke/og-404.jpg"
        ogType="website"
      />
      <div className="min-h-screen flex items-center justify-center text-gray-500">Project not found</div>
    </>
  )
  if (!project) return (
    <>
      <SEOMetaTags
        title="Loading Project — SmartGigs Kenya"
        description="Loading project details..."
        keywords="project, smartgigs kenya"
        ogImage="https://smartgigs.co.ke/og-project.jpg"
        ogType="website"
      />
      <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" /></div>
    </>
  )

  const projectType = (project.project_type || 'Project').replace(/_/g, ' ')
  const title = `${projectType} — SmartGigs Kenya`
  const desc = project.notes || `A ${projectType} project on SmartGigs Kenya, connecting clients with top creative talent.`

  return (
    <>
      <SEOMetaTags
        title={title}
        description={desc}
        keywords={`project, ${projectType}, smartgigs kenya`}
        ogImage={project.image_url || 'https://smartgigs.co.ke/og-project.jpg'}
        ogType="website"
      />
      <div className="min-h-screen bg-white">
        <div className="relative h-64 bg-gray-900">
          {project.image_url && <img src={project.image_url} alt={project.project_type} className="w-full h-full object-cover opacity-80" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
        <div className="max-w-3xl mx-auto px-6 -mt-16 relative pb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded uppercase">
              {project.project_type?.replace(/_/g, ' ')}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
              {project.project_owner_company || project.project_owner_name || 'SmartGigs Kenya Project'}
            </h1>
            <p className="text-gray-700 leading-relaxed mb-6">{project.notes || 'A new creative production project.'}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-8">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{project.location_city || 'Remote'}, {project.location_country || 'Worldwide'}</div>
              {project.timeline_start && <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(project.timeline_start).toLocaleDateString()}</div>}
              {project.departments_needed?.length > 0 && (
                <div className="flex items-center gap-2 col-span-2"><Briefcase className="w-4 h-4" />{project.departments_needed.join(', ').replace(/_/g, ' ')}</div>
              )}
            </div>
            <Link to="/SignIn" className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
              Sign in to apply
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}