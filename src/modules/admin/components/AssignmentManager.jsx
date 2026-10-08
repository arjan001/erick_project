import React, { useState } from 'react'
import { base44 } from '@/api/base44Client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

export default function AssignmentManager() {
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedType, setSelectedType] = useState('artist')
  const [selectedResource, setSelectedResource] = useState('')
  const queryClient = useQueryClient()

  const { data: projects } = useQuery({
    queryKey: ['verified-projects'],
    queryFn: () => base44.entities.Project.filter({ status: 'verified' }),
  })

  const { data: artists } = useQuery({
    queryKey: ['approved-artists'],
    queryFn: () => base44.entities.Artist.filter({ status: 'approved' }),
  })

  const { data: teams } = useQuery({
    queryKey: ['approved-teams'],
    queryFn: () => base44.entities.Team.filter({ status: 'approved' }),
  })

  const { data: assignments } = useQuery({
    queryKey: ['assignments', selectedProject],
    queryFn: () => selectedProject ? base44.entities.Assignment.filter({ project_id: selectedProject }) : [],
    enabled: !!selectedProject
  })

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Assignment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      setSelectedResource('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Assignment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })

  const handleAssign = () => {
    if (!selectedProject || !selectedResource) return
    
    createMutation.mutate({
      project_id: selectedProject,
      assigned_type: selectedType,
      assigned_id: selectedResource,
      assignment_status: 'proposed'
    })
  }

  const resources = selectedType === 'artist' ? artists : teams
  const project = projects?.find(p => p.id === selectedProject)

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-2xl font-bold mb-6">Create Assignment</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Select Project</label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Choose a verified project" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {projects?.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.project_type} - {p.project_owner_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Resource Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="artist">Artist</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">{selectedType === 'artist' ? 'Artist' : 'Team'}</label>
              <Select value={selectedResource} onValueChange={setSelectedResource}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder={`Select ${selectedType}`} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {resources?.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {selectedType === 'artist' ? r.full_name : r.team_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleAssign}
            disabled={!selectedProject || !selectedResource || createMutation.isPending}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      {selectedProject && project && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-xl font-bold mb-4">
            Assignments for: {project.project_type} - {project.project_owner_name}
          </h3>

          {assignments?.length > 0 ? (
            <div className="space-y-3">
              {assignments.map(assignment => {
                const resource = assignment.assigned_type === 'artist' 
                  ? artists?.find(a => a.id === assignment.assigned_id)
                  : teams?.find(t => t.id === assignment.assigned_id)

                return (
                  <div key={assignment.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {assignment.assigned_type === 'artist' ? resource?.full_name : resource?.team_code}
                      </p>
                      <p className="text-sm text-gray-400 capitalize">{assignment.assigned_type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-600">{assignment.assignment_status}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(assignment.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No assignments yet</p>
          )}
        </div>
      )}
    </div>
  )
}