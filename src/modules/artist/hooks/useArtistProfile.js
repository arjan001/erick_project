import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { artistApi } from '../api/artist.api'
import { useAuth } from '@/modules/auth/hooks/useAuth'

export function useArtistProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Get current artist profile
  const { data: artist, isLoading, error } = useQuery({
    queryKey: ['artist', 'current'],
    queryFn: () => artistApi.getCurrentArtist(),
    enabled: !!user
  })

  // Update artist profile
  const updateProfile = useMutation({
    mutationFn: (updates) => artistApi.updateCurrentArtist(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', 'current'] })
    }
  })

  // Add portfolio clip
  const addPortfolioClip = useMutation({
    mutationFn: (clipData) => {
      if (!artist) throw new Error('No artist profile')
      return artistApi.addPortfolioClip(artist.id, clipData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', 'current'] })
    }
  })

  // Update portfolio clip
  const updatePortfolioClip = useMutation({
    mutationFn: ({ clipId, updates }) => artistApi.updatePortfolioClip(clipId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', 'current'] })
    }
  })

  // Delete portfolio clip
  const deletePortfolioClip = useMutation({
    mutationFn: (clipId) => artistApi.deletePortfolioClip(clipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', 'current'] })
    }
  })

  return {
    artist,
    isLoading,
    error,
    updateProfile: updateProfile.mutateAsync,
    isUpdating: updateProfile.isPending,
    addPortfolioClip: addPortfolioClip.mutateAsync,
    isAddingClip: addPortfolioClip.isPending,
    updatePortfolioClip: updatePortfolioClip.mutateAsync,
    isUpdatingClip: updatePortfolioClip.isPending,
    deletePortfolioClip: deletePortfolioClip.mutateAsync,
    isDeletingClip: deletePortfolioClip.isPending
  }
}
