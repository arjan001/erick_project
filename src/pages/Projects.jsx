import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Sparkles } from 'lucide-react';
import RequestIntroductionModal from '../components/RequestIntroductionModal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const allProjects = await base44.entities.Project.list();
        const verified = allProjects.filter(p => p.status === 'verified');
        setProjects(verified);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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

  const getStatusBadge = (project) => {
    if (project.open_to_backing) {
      return <Badge className="bg-blue-100 text-blue-800">Seeking Backing</Badge>;
    }
    return <Badge variant="outline">In Production</Badge>;
  };

  const filteredProjects = selectedType === 'all' 
    ? projects 
    : projects.filter(p => p.project_type === selectedType);

  const projectTypes = [
    { value: 'all', label: 'All Projects' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'short_film', label: 'Short Films' },
    { value: 'film', label: 'Feature Films' },
    { value: 'music_video', label: 'Music Videos' },
    { value: 'documentary', label: 'Documentaries' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Creative Projects
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Explore productions from across Europe. Support projects seeking backing. Connect with creators.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-2 flex-wrap">
            {projectTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedType === type.value
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No projects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <Card 
                  key={project.id} 
                  className="group hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col"
                >
                  {/* Visual Header */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative group-hover:from-gray-200 group-hover:to-gray-300 transition-all">
                    <div className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity">
                      {project.project_type === 'commercial' && '📹'}
                      {project.project_type === 'short_film' && '🎬'}
                      {project.project_type === 'film' && '🎭'}
                      {project.project_type === 'music_video' && '🎵'}
                      {project.project_type === 'documentary' && '📸'}
                    </div>
                  </div>

                  <CardContent className="flex-1 pt-6 pb-4 flex flex-col">
                    {/* Status Badge */}
                    <div className="mb-3">
                      {getStatusBadge(project)}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">
                      {project.project_owner_company || project.project_owner_name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                      {project.notes}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">{getProjectTypeLabel(project.project_type)}</span>
                      </div>
                      {project.location_city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>{project.location_city}, {project.location_country}</span>
                        </div>
                      )}
                      {project.timeline_start && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>{project.timeline_start} onwards</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button 
                      onClick={() => {
                        setSelectedProject(project);
                        setModalOpen(true);
                      }}
                      variant="outline"
                      className="w-full text-xs font-medium group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors"
                    >
                      {project.open_to_backing ? (
                        <>
                          <Sparkles className="w-3 h-3 mr-2" />
                          Support This Project
                        </>
                      ) : (
                        <>Request Introduction</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Have a project to share?</h2>
          <p className="text-gray-300 mb-6">Post your production and connect with the Studio22 network.</p>
          <Button className="bg-white text-black hover:bg-gray-100">
            Post Your Project
          </Button>
        </div>
      </section>

      {/* Modal */}
      <RequestIntroductionModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectTitle={selectedProject?.project_owner_company || selectedProject?.project_owner_name}
      />
    </div>
  );
}