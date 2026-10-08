import React, { useState } from 'react'
import { base44 } from '@/api/base44Client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Eye, Clock, Truck, Package } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: 'bg-blue-600', icon: Clock },
  verified: { label: 'Verified', color: 'bg-green-600', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-amber-600', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-purple-600', icon: Package },
  rejected: { label: 'Rejected', color: 'bg-red-600', icon: XCircle },
}

export default function ProjectsQueue() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const queryClient = useQueryClient()

  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] })
      setSelectedProject(null)
    },
  })

  const handleStatusChange = (project, newStatus) => {
    updateMutation.mutate({
      id: project.id,
      data: { status: newStatus, admin_notes: adminNotes || project.admin_notes }
    })
  }

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading projects...</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects List */}
        <div className="space-y-4">
          {projects?.map((project) => {
            const statusConfig = STATUS_CONFIG[project.status]
            const StatusIcon = statusConfig.icon
            return (
              <div
                key={project.id}
                className={`p-4 sm:p-6 bg-zinc-900 rounded-xl border transition-all cursor-pointer ${
                  selectedProject?.id === project.id ? 'border-amber-600' : 'border-zinc-800 hover:border-zinc-700'
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{project.project_type.replace('_', ' ')}</h3>
                    <p className="text-sm text-gray-400">{project.project_owner_name}</p>
                  </div>
                  <Badge className={`${statusConfig.color} text-white`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Location: {project.location_city}, {project.location_country}</p>
                  <p>Start: {project.timeline_start}</p>
                </div>
              </div>
            )
          })}
          {!projects?.length && (
            <div className="text-center py-12 text-gray-400">No projects yet</div>
          )}
        </div>

        {/* Project Details */}
        <div className="lg:sticky lg:top-4">
          {selectedProject ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-2xl font-bold mb-6">Project Details</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-400">Type</label>
                  <p className="font-medium capitalize">{selectedProject.project_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Owner</label>
                  <p className="font-medium">{selectedProject.project_owner_name}</p>
                  <p className="text-sm text-gray-400">{selectedProject.project_owner_email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Usage</label>
                  <p className="font-medium">{selectedProject.usage?.join(', ')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Departments</label>
                  <p className="font-medium">{selectedProject.departments_needed?.join(', ')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Timeline</label>
                  <p className="font-medium">{selectedProject.timeline_start} → {selectedProject.timeline_deadline}</p>
                </div>
                {selectedProject.budget_range && (
                  <div>
                    <label className="text-sm text-gray-400">Budget</label>
                    <p className="font-medium">{selectedProject.budget_range.replace('_', ' ')}</p>
                  </div>
                )}
                {selectedProject.notes && (
                  <div>
                    <label className="text-sm text-gray-400">Notes</label>
                    <p className="text-sm">{selectedProject.notes}</p>
                  </div>
                )}
                {selectedProject.interested_in_first_frame && (
                  <Badge className="bg-amber-600">Interested in First Frame</Badge>
                )}
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Admin Notes</label>
                <Textarea
                  value={adminNotes || selectedProject.admin_notes || ''}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selectedProject.status === status ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(selectedProject, status)}
                    className={selectedProject.status === status ? config.color : ''}
                  >
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
              <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Select a project to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}