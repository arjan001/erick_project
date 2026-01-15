import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function PortfolioQueue() {
  const [selectedClip, setSelectedClip] = useState(null);
  const [tags, setTags] = useState('');
  const [useForVisualDirection, setUseForVisualDirection] = useState(false);
  const queryClient = useQueryClient();

  const { data: clips, isLoading } = useQuery({
    queryKey: ['admin-portfolio'],
    queryFn: () => base44.entities.PortfolioClip.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PortfolioClip.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio'] });
      setSelectedClip(null);
      setTags('');
      setUseForVisualDirection(false);
    },
  });

  const handleApprove = (clip) => {
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : [];
    updateMutation.mutate({
      id: clip.id,
      data: {
        status: 'approved',
        visual_style_tags: tagArray,
        approved_for_visual_direction: useForVisualDirection
      }
    });
  };

  const handleReject = (clip) => {
    updateMutation.mutate({
      id: clip.id,
      data: { status: 'rejected' }
    });
  };

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading portfolio...</div>;

  const pending = clips?.filter(c => c.status === 'pending') || [];
  const approved = clips?.filter(c => c.status === 'approved') || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4">Pending Review ({pending.length})</h3>
          <div className="grid grid-cols-2 gap-3">
            {pending.map(clip => (
              <div
                key={clip.id}
                onClick={() => setSelectedClip(clip)}
                className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedClip?.id === clip.id ? 'border-amber-600' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <img
                  src={clip.thumbnail_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400'}
                  alt={clip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <Badge className="absolute top-2 right-2 bg-amber-600">Pending</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Approved ({approved.length})</h3>
          <div className="grid grid-cols-2 gap-3">
            {approved.map(clip => (
              <div
                key={clip.id}
                onClick={() => setSelectedClip(clip)}
                className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedClip?.id === clip.id ? 'border-amber-600' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <img
                  src={clip.thumbnail_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400'}
                  alt={clip.title}
                  className="w-full h-full object-cover"
                />
                {clip.approved_for_visual_direction && (
                  <Badge className="absolute top-2 right-2 bg-green-600">Visual Dir</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-4">
        {selectedClip ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-2xl font-bold mb-4">Clip Details</h2>
            
            <div className="aspect-video bg-zinc-800 rounded-lg mb-6 overflow-hidden">
              <img
                src={selectedClip.thumbnail_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800'}
                alt={selectedClip.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-400">Uploaded by</label>
                <p className="font-medium capitalize">{selectedClip.uploaded_by_type}</p>
              </div>
              {selectedClip.title && (
                <div>
                  <label className="text-sm text-gray-400">Title</label>
                  <p className="font-medium">{selectedClip.title}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-400">Agreements</label>
                <div className="space-y-1 text-sm">
                  <p className={selectedClip.no_logos_agreement ? 'text-green-500' : 'text-red-500'}>
                    {selectedClip.no_logos_agreement ? '✓' : '✗'} No logos/watermarks
                  </p>
                  <p className={selectedClip.portfolio_usage_agreement ? 'text-green-500' : 'text-red-500'}>
                    {selectedClip.portfolio_usage_agreement ? '✓' : '✗'} Portfolio usage
                  </p>
                </div>
              </div>

              {selectedClip.status === 'pending' && (
                <>
                  <div>
                    <Label className="text-sm mb-2 block">Visual Style Tags (comma separated)</Label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., cinematic, colorful, minimal"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg">
                    <Checkbox
                      id="visual-dir"
                      checked={useForVisualDirection}
                      onCheckedChange={setUseForVisualDirection}
                    />
                    <Label htmlFor="visual-dir" className="cursor-pointer">
                      Use for Visual Direction in project intake
                    </Label>
                  </div>
                </>
              )}

              {selectedClip.visual_style_tags?.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedClip.visual_style_tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedClip.status === 'pending' && (
              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(selectedClip)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(selectedClip)}
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
            <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Select a clip to review</p>
          </div>
        )}
      </div>
    </div>
  );
}