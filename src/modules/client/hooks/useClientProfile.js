import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../api/client.api';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export function useClientProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current client profile
  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', 'current'],
    queryFn: () => clientApi.getCurrentClient(),
    enabled: !!user
  });

  // Get client projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['client', 'projects'],
    queryFn: () => clientApi.getCurrentProjects(),
    enabled: !!client
  });

  // Update client profile
  const updateProfile = useMutation({
    mutationFn: (updates) => clientApi.updateCurrentClient(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'current'] });
    }
  });

  // Create project
  const createProject = useMutation({
    mutationFn: (projectData) => clientApi.createProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'projects'] });
    }
  });

  // Update project
  const updateProject = useMutation({
    mutationFn: ({ projectId, updates }) => clientApi.updateProject(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'projects'] });
    }
  });

  // Delete project
  const deleteProject = useMutation({
    mutationFn: (projectId) => clientApi.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'projects'] });
    }
  });

  return {
    client,
    isLoading,
    error,
    projects,
    isLoadingProjects,
    updateProfile: updateProfile.mutateAsync,
    isUpdating: updateProfile.isPending,
    createProject: createProject.mutateAsync,
    isCreatingProject: createProject.isPending,
    updateProject: updateProject.mutateAsync,
    isUpdatingProject: updateProject.isPending,
    deleteProject: deleteProject.mutateAsync,
    isDeletingProject: deleteProject.isPending
  };
}
