import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function ArtistsQueue() {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: artists, isLoading } = useQuery({
    queryKey: ['admin-artists'],
    queryFn: () => base44.entities.Artist.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Artist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artists'] });
      setSelectedArtist(null);
    },
  });

  const handleApprove = (artist) => {
    updateMutation.mutate({
      id: artist.id,
      data: { 
        status: 'approved', 
        admin_notes: adminNotes || artist.admin_notes,
        approved_date: new Date().toISOString()
      }
    });
  };

  const handleReject = (artist) => {
    updateMutation.mutate({
      id: artist.id,
      data: { status: 'rejected', admin_notes: adminNotes || artist.admin_notes }
    });
  };

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading artists...</div>;

  const pending = artists?.filter(a => a.status === 'pending') || [];
  const approved = artists?.filter(a => a.status === 'approved') || [];
  const rejected = artists?.filter(a => a.status === 'rejected') || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Pending */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Pending ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map(artist => (
              <div
                key={artist.id}
                onClick={() => setSelectedArtist(artist)}
                className={`p-4 bg-zinc-900 rounded-lg border cursor-pointer transition-all ${
                  selectedArtist?.id === artist.id ? 'border-amber-600' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{artist.full_name}</h4>
                    <p className="text-sm text-gray-400 capitalize">{artist.role.replace('_', ' ')}</p>
                  </div>
                  <Badge className="bg-amber-600">Pending</Badge>
                </div>
                <p className="text-sm text-gray-400">{artist.based_in_city}, {artist.based_in_country}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Approved */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Approved ({approved.length})
          </h3>
          <div className="space-y-3">
            {approved.map(artist => (
              <div
                key={artist.id}
                onClick={() => setSelectedArtist(artist)}
                className={`p-4 bg-zinc-900 rounded-lg border cursor-pointer transition-all ${
                  selectedArtist?.id === artist.id ? 'border-amber-600' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <h4 className="font-semibold">{artist.full_name}</h4>
                <p className="text-sm text-gray-400 capitalize">{artist.role.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Panel */}
      <div className="lg:sticky lg:top-4">
        {selectedArtist ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedArtist.full_name}</h2>
                <p className="text-gray-400 capitalize">{selectedArtist.role.replace('_', ' ')}</p>
              </div>
              <Badge className={
                selectedArtist.status === 'approved' ? 'bg-green-600' :
                selectedArtist.status === 'rejected' ? 'bg-red-600' : 'bg-amber-600'
              }>
                {selectedArtist.status}
              </Badge>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="font-medium">{selectedArtist.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Location</label>
                <p className="font-medium">{selectedArtist.based_in_city}, {selectedArtist.based_in_country}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Experience</label>
                <p className="font-medium">{selectedArtist.years_experience} years</p>
              </div>
              {selectedArtist.secondary_roles?.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400">Additional Skills</label>
                  <p className="text-sm">{selectedArtist.secondary_roles.join(', ')}</p>
                </div>
              )}
              {selectedArtist.languages_spoken?.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400">Languages</label>
                  <p className="text-sm">{selectedArtist.languages_spoken.join(', ')}</p>
                </div>
              )}
              
              {/* Social Links */}
              <div className="flex gap-2 pt-2">
                {selectedArtist.website && (
                  <a href={selectedArtist.website} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Website
                    </Button>
                  </a>
                )}
                {selectedArtist.vimeo && (
                  <a href={selectedArtist.vimeo} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">Vimeo</Button>
                  </a>
                )}
              </div>

              {/* Questionnaire */}
              {selectedArtist.ai_questionnaire_response && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Questionnaire</label>
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedArtist.ai_questionnaire_response).map(([key, value]) => (
                      <div key={key} className="bg-zinc-800/50 p-3 rounded">
                        <p className="text-gray-300">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">Admin Notes</label>
              <Textarea
                value={adminNotes || selectedArtist.admin_notes || ''}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                rows={3}
              />
            </div>

            {selectedArtist.status === 'pending' && (
              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(selectedArtist)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(selectedArtist)}
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
            <p className="text-gray-400">Select an artist to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}