import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { FolderKanban, Calendar, DollarSign, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProjectAdmin() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['myProjects'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Project.filter({ project_owner_email: user.email });
    },
    enabled: !!user,
  });

  if (!user || user.role !== 'project_admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-gray-600">Project Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">My Projects</h1>
          <p className="text-gray-600">Manage your production projects</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No projects submitted yet</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects?.map((project) => (
              <Card key={project.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl text-black">{project.project_type}</CardTitle>
                    <Badge className={
                      project.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'verified' ? 'bg-green-100 text-green-800' :
                      project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.location_city && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location_city}, {project.location_country}</span>
                    </div>
                  )}
                  {project.timeline_start && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.timeline_start).toLocaleDateString()} - {new Date(project.timeline_deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  {project.budget_range && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{project.budget_range.replace('_', ' - ')}</span>
                    </div>
                  )}
                  {project.notes && (
                    <p className="text-sm text-gray-600 mt-4">{project.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}