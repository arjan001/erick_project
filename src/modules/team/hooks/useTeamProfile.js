import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '../api/team.api';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export function useTeamProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current team profile
  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', 'current'],
    queryFn: () => teamApi.getCurrentTeam(),
    enabled: !!user
  });

  // Update team profile
  const updateProfile = useMutation({
    mutationFn: (updates) => teamApi.updateCurrentTeam(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'current'] });
    }
  });

  // Upload team logo
  const uploadLogo = useMutation({
    mutationFn: async (file) => {
      const logoUrl = await teamApi.uploadTeamLogo(file);
      if (!team) throw new Error('No team profile');
      return teamApi.updateCurrentTeam({ logo_url: logoUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'current'] });
    }
  });

  // Add portfolio clip
  const addPortfolioClip = useMutation({
    mutationFn: (clipData) => {
      if (!team) throw new Error('No team profile');
      return teamApi.addPortfolioClip(team.id, clipData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'current'] });
    }
  });

  // Update portfolio clip
  const updatePortfolioClip = useMutation({
    mutationFn: ({ clipId, updates }) => teamApi.updatePortfolioClip(clipId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'current'] });
    }
  });

  // Delete portfolio clip
  const deletePortfolioClip = useMutation({
    mutationFn: (clipId) => teamApi.deletePortfolioClip(clipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'current'] });
    }
  });

  return {
    team,
    isLoading,
    error,
    updateProfile: updateProfile.mutateAsync,
    isUpdating: updateProfile.isPending,
    uploadLogo: uploadLogo.mutateAsync,
    isUploadingLogo: uploadLogo.isPending,
    addPortfolioClip: addPortfolioClip.mutateAsync,
    isAddingClip: addPortfolioClip.isPending,
    updatePortfolioClip: updatePortfolioClip.mutateAsync,
    isUpdatingClip: updatePortfolioClip.isPending,
    deletePortfolioClip: deletePortfolioClip.mutateAsync,
    isDeletingClip: deletePortfolioClip.isPending
  };
}
