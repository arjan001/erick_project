import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, MessageSquare, Search, Filter, CheckCircle, TrendingUp } from 'lucide-react';

export default function JobBoard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [generatingImageFor, setGeneratingImageFor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    
    const fetchProjects = async () => {
      try {
        // Fetch all verified projects from clients
        const allProjects = await base44.entities.Project.filter({ status: 'verified' });
        
        // Fetch applications to show engagement
        const applications = await base44.entities.Application.list();
        
        // Enrich projects with application counts
        const enrichedProjects = allProjects.map(project => {
          const projectApplications = applications.filter(app => app.job_id === project.id);
          return {
            ...project,
            applicantCount: projectApplications.length,
            hasApplied: projectApplications.some(app => app.artist_email === user.email),
            inDiscussion: projectApplications.filter(app => app.status === 'chat_started').length > 0
          };
        });
        
        setProjects(enrichedProjects);
        if (enrichedProjects.length > 0) setSelectedProject(enrichedProjects[0]);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleGenerateImage = async (project) => {
    setGeneratingImageFor(project.id);
    try {
      const description = project.notes || `${project.project_type?.replace(/_/g, ' ')} production project`;
      const location = `${project.location_city || 'modern city'}, ${project.location_country || 'Europe'}`;
      const prompt = `Wide cinematic banner for ${project.project_type?.replace(/_/g, ' ')}. ${description}. Location: ${location}. Film production, creative, professional, vibrant`;
      
      const imageResult = await base44.integrations.Core.GenerateImage({ prompt });
      await base44.entities.Project.update(project.id, { image_url: imageResult.url });
      
      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === project.id ? { ...p, image_url: imageResult.url } : p
      ));
      if (selectedProject?.id === project.id) {
        setSelectedProject({ ...selectedProject, image_url: imageResult.url });
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setGeneratingImageFor(null);
    }
  };

  const handleApply = async () => {
    if (!selectedProject || !user) return;
    
    try {
      await base44.entities.Application.create({
        job_id: selectedProject.id,
        artist_email: user.email,
        status: 'applied',
        applied_at: new Date().toISOString()
      });
      
      // Update local state
      setProjects(projects.map(p => 
        p.id === selectedProject.id 
          ? { ...p, hasApplied: true, applicantCount: p.applicantCount + 1 }
          : p
      ));
      setSelectedProject({ ...selectedProject, hasApplied: true, applicantCount: selectedProject.applicantCount + 1 });
    } catch (err) {
      console.error('Error applying:', err);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.project_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.location_city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterType === 'all') return true;
    return project.project_type === filterType;
  });

  const projectTypes = [...new Set(projects.map(p => p.project_type))].filter(Boolean);

  if (!user || loading) return null;

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      <ArtistSidebar />
      
      <main className="fixed inset-0 flex flex-col bg-white pl-20">
        {/* Header with Search */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects from Clients</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredProjects.length} active projects · {filteredProjects.filter(p => !p.hasApplied).length} available to apply
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 w-64"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  {filterType === 'all' ? 'All Types' : filterType}
                </button>
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => { setFilterType('all'); setShowFilters(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100"
                    >
                      All Types
                    </button>
                    {projectTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => { setFilterType(type); setShowFilters(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0 capitalize"
                      >
                        {type.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Grid Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Projects Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl">
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`group relative text-left rounded-2xl border-2 transition-all overflow-hidden hover:shadow-xl ${
                    selectedProject?.id === project.id
                      ? 'border-black shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Generate Button */}
                  {!project.image_url && (
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <button
                        onClick={() => handleGenerateImage(project)}
                        disabled={generatingImageFor === project.id}
                        className="w-full px-3 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50"
                      >
                        {generatingImageFor === project.id ? 'Generating...' : 'Generate Banner'}
                      </button>
                    </div>
                  )}

                  {/* Project Image/Banner */}
                  {project.image_url && (
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      <img 
                        src={project.image_url} 
                        alt={project.project_type} 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Status Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {project.hasApplied && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Applied
                          </span>
                        )}
                        {project.inDiscussion && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            In Discussion
                          </span>
                        )}
                      </div>

                      {/* Trending Badge */}
                      {project.applicantCount > 5 && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Hot
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Project Content */}
                  <div className="p-5">
                    {/* Client Info */}
                    <div className="mb-3">
                      <div className="font-semibold text-sm text-gray-900">
                        {project.project_owner_name || 'Client'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {project.project_owner_company || 'Independent'}
                      </div>
                    </div>

                    {/* Project Type */}
                    <div className="mb-2">
                      <span className="px-2 py-1 bg-black text-white text-xs font-bold rounded uppercase">
                        {project.project_type?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Project Description */}
                    <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                      {project.notes || 'Exciting new project opportunity'}
                    </p>

                    {/* Project Meta */}
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{project.location_city || 'Remote'}, {project.location_country || 'Worldwide'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {project.timeline_start ? new Date(project.timeline_start).toLocaleDateString() : 'Flexible start'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span className="font-semibold text-gray-900">
                          {project.applicantCount} {project.applicantCount === 1 ? 'applicant' : 'applicants'}
                        </span>
                      </div>
                    </div>

                    {/* Budget Badge */}
                    {project.budget_range && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Budget Range</div>
                        <div className="font-bold text-sm text-gray-900 capitalize">
                          {project.budget_range.replace(/_/g, ' - ').replace('k', 'K')}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {filteredProjects.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-lg font-semibold">No projects found</p>
                  <p className="text-sm mt-2">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Detail Sidebar */}
          {selectedProject && (
            <div className="w-96 border-l border-gray-200 overflow-y-auto bg-gray-50">
              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900">{selectedProject.project_owner_name}</h2>
                  <p className="text-sm text-gray-600">{selectedProject.project_owner_company}</p>
                </div>

                {/* Type Badge */}
                <div className="mb-4">
                  <span className="px-3 py-1.5 bg-black text-white text-sm font-bold rounded uppercase">
                    {selectedProject.project_type?.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Engagement Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-semibold">Applicants</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{selectedProject.applicantCount}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-semibold">Status</span>
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {selectedProject.inDiscussion ? 'Discussing' : 'Open'}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Project Description</h3>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {selectedProject.notes || 'This is an exciting opportunity for talented creatives to join a unique project.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Location</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      <MapPin className="w-4 h-4" />
                      {selectedProject.location_city || 'Remote'}, {selectedProject.location_country || 'Worldwide'}
                    </div>
                  </div>

                  {selectedProject.timeline_start && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Timeline</h3>
                      <div className="text-sm text-gray-800">
                        Starts: {new Date(selectedProject.timeline_start).toLocaleDateString()}
                        {selectedProject.timeline_deadline && (
                          <> · Deadline: {new Date(selectedProject.timeline_deadline).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedProject.budget_range && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Budget</h3>
                      <div className="text-lg font-bold text-gray-900 capitalize">
                        {selectedProject.budget_range.replace(/_/g, ' - ').replace('k', 'K')}
                      </div>
                    </div>
                  )}

                  {selectedProject.departments_needed && selectedProject.departments_needed.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Departments Needed</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.departments_needed.map(dept => (
                          <span key={dept} className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded capitalize">
                            {dept.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleApply}
                  disabled={selectedProject.hasApplied}
                  className={`w-full font-bold py-3 ${
                    selectedProject.hasApplied
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {selectedProject.hasApplied ? 'Already Applied' : 'Apply Now'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}