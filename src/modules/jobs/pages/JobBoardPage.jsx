import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Project, Application, Job } from '@/lib/supabaseEntities';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, MessageSquare, Search, Filter, CheckCircle, TrendingUp, X, Bookmark, BookmarkCheck, Eye, EyeOff, Lock, Clock } from 'lucide-react';
import ShareProjectButton from '@/components/projects/ShareProjectButton';

export default function JobBoard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterSkill, setFilterSkill] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [generatingImageFor, setGeneratingImageFor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [hiddenProjects, setHiddenProjects] = useState([]);
  const navigate = useNavigate();
  const { success, error } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const fetchProjects = async () => {
      try {
        // Fetch all projects from clients (not just verified)
        const allProjects = await Project.filter({});
        
        // Fetch jobs as well to unify data
        const allJobs = await Job.filter({});
        
        // Fetch applications to show engagement
        const applications = await Application.list();
        
        // Convert jobs to project-like format for unified display
        const jobsAsProjects = allJobs.map(job => ({
          id: job.id,
          project_type: job.job_type,
          notes: job.description,
          title: job.title,
          location_city: job.location,
          location_country: '',
          timeline_start: job.application_deadline,
          budget_range: job.budget ? `${job.budget}_plus` : null,
          project_owner_name: 'Client',
          project_owner_company: '',
          project_owner_email: job.client_email || '',
          status: job.status === 'open' ? 'verified' : job.status,
          departments_needed: job.required_skills || [],
          isJob: true,
          job_id: job.id,
          created_at: job.created_at,
          duration: job.duration,
          is_premium: job.is_premium
        }));
        
        // Combine projects and jobs
        const allItems = [...allProjects, ...jobsAsProjects];
        
        // Enrich with application counts
        const enrichedItems = allItems.map(item => {
          const itemApplications = applications.filter(app => 
            app.project_id === item.id || app.job_id === item.job_id
          );
          return {
            ...item,
            applicantCount: itemApplications.length,
            hasApplied: itemApplications.some(app => app.artist_email === user.email),
            inDiscussion: itemApplications.filter(app => app.status === 'chat_started').length > 0
          };
        });
        
        setProjects(enrichedItems);
        if (enrichedItems.length > 0) setSelectedProject(enrichedItems[0]);
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
      const clientType = project.project_owner_company ? 'corporate brand' : 'independent creator';
      const departments = project.departments_needed?.join(', ').replace(/_/g, ' ') || 'production';
      
      const prompt = `Wide cinematic banner image for ${project.project_type?.replace(/_/g, ' ')} project by ${clientType}. Visual style: ${description}. Location atmosphere: ${location}. Focus on ${departments} aesthetic. Film production, creative, professional, vibrant colors, no text, no logos, cinematic composition`;
      
      const imageResult = await base44.integrations.Core.GenerateImage({ prompt });
      await Project.update(project.id, { image_url: imageResult.url });
      
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
      await Application.create({
        project_id: selectedProject.isJob ? null : selectedProject.id,
        job_id: selectedProject.isJob ? selectedProject.job_id : null,
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
      success('Application Sent', `You've applied to ${selectedProject.title || selectedProject.project_type}`);
      setShowDetailModal(false);
    } catch (err) {
      console.error('Error applying:', err);
      error('Failed', 'Failed to submit application');
    }
  };

  const handleToggleWishlist = (project) => {
    if (wishlist.includes(project.id)) {
      setWishlist(wishlist.filter(id => id !== project.id));
      success('Removed', 'Removed from wishlist');
    } else {
      setWishlist([...wishlist, project.id]);
      success('Added', 'Added to wishlist');
    }
  };

  const handleHideProject = (project) => {
    setHiddenProjects([...hiddenProjects, project.id]);
    success('Hidden', 'Project hidden from view');
  };

  const handleSkip = () => {
    if (selectedProject) {
      handleHideProject(selectedProject);
      setShowDetailModal(false);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredProjects = projects.filter(project => {
    if (hiddenProjects.includes(project.id)) return false;
    
    const matchesSearch = project.project_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.location_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.departments_needed?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filterType !== 'all' && project.project_type !== filterType) return false;
    if (filterRole !== 'all' && project.job_type !== filterRole) return false;
    if (filterCategory !== 'all' && project.category !== filterCategory) return false;
    if (filterLocation !== 'all' && project.location_city !== filterLocation) return false;
    if (filterSkill !== 'all' && !project.departments_needed?.includes(filterSkill)) return false;
    if (filterPayment !== 'all') {
      if (filterPayment === 'paid' && !project.budget) return false;
      if (filterPayment === 'unpaid' && project.budget) return false;
    }
    
    return true;
  });

  const projectTypes = [...new Set(projects.map(p => p.project_type))].filter(Boolean);
  const jobRoles = [...new Set(projects.map(p => p.job_type))].filter(Boolean);
  const allSkills = [...new Set(projects.flatMap(p => p.departments_needed || []))].filter(Boolean);
  const locations = [...new Set(projects.map(p => p.location_city))].filter(Boolean);

  if (!user || loading) return null;

  return (
    <div className="h-full bg-white overflow-hidden">
      <main className="h-full flex flex-col bg-white">
        {/* Header with Search */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jobs & Projects</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredProjects.length} active opportunities · {filteredProjects.filter(p => !p.hasApplied).length} available to apply
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs..."
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
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                    <div className="space-y-4">
                      {/* Project Type */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Project Type</label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                        >
                          <option value="all">All Types</option>
                          {projectTypes.map(type => (
                            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </div>

                      {/* Role */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Role</label>
                        <select
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                        >
                          <option value="all">All Roles</option>
                          {jobRoles.map(role => (
                            <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </div>

                      {/* Location */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Location</label>
                        <select
                          value={filterLocation}
                          onChange={(e) => setFilterLocation(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                        >
                          <option value="all">All Locations</option>
                          {locations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>

                      {/* Skill */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Skill</label>
                        <select
                          value={filterSkill}
                          onChange={(e) => setFilterSkill(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                        >
                          <option value="all">All Skills</option>
                          {allSkills.map(skill => (
                            <option key={skill} value={skill}>{skill.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </div>

                      {/* Payment Type */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Payment</label>
                        <select
                          value={filterPayment}
                          onChange={(e) => setFilterPayment(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                        >
                          <option value="all">All</option>
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                      </div>

                      <Button
                        onClick={() => {
                          setFilterType('all');
                          setFilterRole('all');
                          setFilterCategory('all');
                          setFilterLocation('all');
                          setFilterSkill('all');
                          setFilterPayment('all');
                        }}
                        variant="outline"
                        className="w-full text-sm"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Minimal Card Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
              >
                {/* Minimal Card Content */}
                <div 
                  className="p-4"
                  onClick={() => { setSelectedProject(project); setShowDetailModal(true); }}
                >
                  {/* Type Badge */}
                  <div className="mb-2">
                    <span className="px-2 py-1 bg-black text-white text-xs font-bold rounded uppercase">
                      {project.project_type?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                    {project.title || project.project_type?.replace(/_/g, ' ')}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{project.location_city || 'Remote'}</span>
                  </div>

                  {/* Time Posted */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeAgo(project.created_at)}</span>
                  </div>

                  {/* Applicant Count */}
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Users className="w-3 h-3" />
                    <span className="font-semibold">{project.applicantCount}</span>
                    <span>applicants</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleWishlist(project); }}
                    className="flex-1 p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    title={wishlist.includes(project.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {wishlist.includes(project.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-black mx-auto" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-gray-400 mx-auto" />
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleHideProject(project); }}
                    className="flex-1 p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    title="Hide from view"
                  >
                    <EyeOff className="w-4 h-4 text-gray-400 mx-auto" />
                  </button>
                </div>

                {/* Premium Badge */}
                {project.is_premium && (
                  <div className="absolute top-2 left-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                      <Lock className="w-3 h-3" />
                      <span>Premium</span>
                    </div>
                  </div>
                )}

                {/* Applied Badge */}
                {project.hasApplied && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      Applied
                    </span>
                  </div>
                )}
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-500">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg font-semibold">No jobs found</p>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedProject.title || selectedProject.project_type?.replace(/_/g, ' ')}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedProject.project_owner_name || 'Client'}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Type Badge */}
              <div>
                <span className="px-3 py-1.5 bg-black text-white text-sm font-bold rounded uppercase">
                  {selectedProject.project_type?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Engagement Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-semibold">Applicants</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{selectedProject.applicantCount}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
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
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Description</h3>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {selectedProject.notes || 'This is an exciting opportunity for talented creatives.'}
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
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Skills Needed</h3>
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
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1"
              >
                Skip / Hide
              </Button>
              <Button
                onClick={handleApply}
                disabled={selectedProject.hasApplied}
                className={`flex-1 font-bold ${
                  selectedProject.hasApplied
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {selectedProject.hasApplied ? 'Already Applied' : 'Apply Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}