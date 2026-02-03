import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Banknote } from 'lucide-react';

export default function BackedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const allProjects = await base44.entities.Project.list();
        const backedProjects = allProjects.filter(p => p.open_to_backing === true);
        setProjects(backedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getBackingTypeLabel = (type) => {
    const labels = {
      sponsorship: 'Sponsorship',
      co_production: 'Co-Production',
      cultural_support: 'Cultural Support',
      city_support: 'City Support',
      investment: 'Investment'
    };
    return labels[type] || type;
  };

  const getProjectTypeLabel = (type) => {
    const labels = {
      commercial: 'Commercial',
      short_film: 'Short Film',
      film: 'Feature Film',
      music_video: 'Music Video',
      documentary: 'Documentary'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-black">Projects Seeking Backing</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover creative projects from studios and filmmakers across Europe looking for sponsorship, 
            co-production partnerships, or cultural support. Studio22 facilitates introductions and collaboration 
            without handling payments or equity arrangements.
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects seeking backing at the moment. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{project.project_owner_company || project.project_owner_name}</CardTitle>
                      <p className="text-sm text-gray-600">{project.notes}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline">{getProjectTypeLabel(project.project_type)}</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Seeking Backing</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location_city}, {project.location_country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{project.timeline_start} to {project.timeline_deadline}</span>
                    </div>
                    {project.budget_range && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Banknote className="w-4 h-4" />
                        <span className="capitalize">{project.budget_range.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </div>

                  {project.backing_types && project.backing_types.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-900">Looking for:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.backing_types.map((type) => (
                          <Badge key={type} className="bg-amber-100 text-amber-800">
                            {getBackingTypeLabel(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.backing_notes && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-900">Partnership Details:</h4>
                      <p className="text-sm text-gray-600">{project.backing_notes}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t mt-4">
                    <Button variant="outline" className="w-full text-xs font-medium">
                      Express Interest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}