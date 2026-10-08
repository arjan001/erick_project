import React, { useState } from 'react'
import { Team } from '@/lib/supabaseEntities'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

export default function TeamsQueue() {
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const queryClient = useQueryClient()

  const { data: teams, isLoading } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: () => Team.list('-created_date'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => Team.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teams'] })
      setSelectedTeam(null)
    },
  })

  const handleApprove = (team) => {
    updateMutation.mutate({
      id: team.id,
      data: { 
        status: 'approved', 
        admin_notes: adminNotes || team.admin_notes,
        approved_date: new Date().toISOString()
      }
    })
  }

  const handleReject = (team) => {
    updateMutation.mutate({
      id: team.id,
      data: { status: 'rejected', admin_notes: adminNotes || team.admin_notes }
    })
  }

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading teams...</div>

  const pending = teams?.filter(t => t.status === 'pending') || []
  const approved = teams?.filter(t => t.status === 'approved') || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Pending ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map(team => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`p-4 bg-zinc-900 rounded-lg border cursor-pointer transition-all ${
                  selectedTeam?.id === team.id ? 'border-amber-600' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold font-mono">{team.team_code}</h4>
                    <p className="text-sm text-gray-400">{team.city}, {team.country}</p>
                  </div>
                  <Badge className="bg-amber-600">Pending</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Approved ({approved.length})
          </h3>
          <div className="space-y-3">
            {approved.map(team => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`p-4 bg-zinc-900 rounded-lg border cursor-pointer transition-all ${
                  selectedTeam?.id === team.id ? 'border-amber-600' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <h4 className="font-semibold font-mono">{team.team_code}</h4>
                <p className="text-sm text-gray-400">{team.city}, {team.country}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-4">
        {selectedTeam ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold font-mono">{selectedTeam.team_code}</h2>
                <p className="text-gray-400">{selectedTeam.city}, {selectedTeam.country}</p>
              </div>
              <Badge className={
                selectedTeam.status === 'approved' ? 'bg-green-600' :
                selectedTeam.status === 'rejected' ? 'bg-red-600' : 'bg-amber-600'
              }>
                {selectedTeam.status}
              </Badge>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-400">Contact</label>
                <p className="font-medium">{selectedTeam.contact_name}</p>
                <p className="text-sm text-gray-400">{selectedTeam.contact_email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Specialties</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTeam.specialties?.map(s => (
                    <Badge key={s} variant="outline">{s.replace('_', ' ')}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Team Size</label>
                <p className="font-medium">{selectedTeam.team_size?.replace('_', '-')}</p>
              </div>
              {selectedTeam.languages_spoken?.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400">Languages</label>
                  <p className="text-sm">{selectedTeam.languages_spoken.join(', ')}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">Admin Notes</label>
              <Textarea
                value={adminNotes || selectedTeam.admin_notes || ''}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                rows={3}
              />
            </div>

            {selectedTeam.status === 'pending' && (
              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(selectedTeam)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(selectedTeam)}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
            <p className="text-gray-400">Select a team to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}