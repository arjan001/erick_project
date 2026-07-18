import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Project, Application, Job } from '@/lib/supabaseEntities';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, MessageSquare, Search, Filter, CheckCircle, TrendingUp, X, Bookmark, BookmarkCheck, Eye, EyeOff, Lock, Clock, Building2, Star, Crown } from 'lucide-react';
import ShareProjectButton from '@/components/projects/ShareProjectButton';
import notificationService from '@/shared/services/notificationService';
import subscriptionService from '@/shared/services/subscriptionService';

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
          budget_min: job.budget_min || 0,
          budget_max: job.budget_max || 0,
          budget_type: job.budget_type || 'Fixed',
          payment_type: job.budget_type === 'Hourly' ? 'per hour' : job.budget_type === 'Daily' ? 'per day' : 'fixed price',
          project_owner_name: 'Client',
          project_owner_company: '',
          project_owner_email: job.client_email || '',
          status: job.status === 'open' ? 'verified' : job.status,
          departments_needed: job.required_skills || [],
          isJob: true,
          job_id: job.id,
          created_at: job.created_at,
          duration: job.duration,
          is_premium: job.is_premium,
          requires_subscription: job.is_premium || false
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
    
    // Check subscription limits before applying
    const limitCheck = await subscriptionService.checkLimit(user.email, 'job_application');
    if (!limitCheck.allowed) {
      error('Limit Reached', limitCheck.expired 
        ? 'Your subscription has expired. Please renew to continue applying to jobs.'
        : 'You have reached your monthly job application limit. Upgrade to apply to more jobs.');
      return;
    }
    
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
      
      // Notify user about job application
      notificationService.notifyJobApplication(
        user.email, 
        selectedProject.title || selectedProject.project_type,
        selectedProject.project_owner_name || 'Client'
      );
      
      // Track usage and notify if approaching limit
      await subscriptionService.trackUsage(user.email, 'job_application');
      
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

        {/* Content Area - Enhanced Card Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-64 text-gray-500">
                No projects match your filters
              </div>
            ) : (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => { setSelectedProject(project); setShowDetailModal(true); }}
                  className={`w-full text-left bg-white rounded-xl border transition-all overflow-hidden shadow-sm hover:shadow-md ${
                    selectedProject?.id === project.id
                      ? 'border-black shadow-md ring-1 ring-black/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex gap-3 p-4">
                    {/* Left - Job Image (square) */}
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                      {project.image_url ? (
                        <>
                          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                        </>
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    {/* Right - Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top Row - Timestamp and Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{getTimeAgo(project.created_at)}</span>
                          {project.isJob && (
                            <span className="bg-black text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                              Job
                            </span>
                          )}
                          {project.requires_subscription && (
                            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[10px] font-medium px-2 py-0.5 rounded-full">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Job Title */}
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-1">
                        {project.title || project.project_type?.replace(/_/g, ' ')}
                      </h3>

                      {/* Description - blurred for pro-only jobs */}
                      {project.requires_subscription ? (
                        <div className="relative mb-2">
                          <p className="text-xs text-gray-600 line-clamp-2 blur-sm">
                            {project.notes?.substring(0, 100) + '...' || 'Project opportunity'}
                          </p>
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm rounded">
                            <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                              <Lock className="w-3 h-3" />
                              Unlock with Pro
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {project.notes?.substring(0, 100) + '...' || 'Project opportunity'}
                        </p>
                      )}

                      {/* Location and Pay */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{[project.location_city, project.location_country].filter(Boolean).join(', ') || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-1 font-medium text-gray-900">
                          <span>
                            {project.budget_type === 'Hourly' ? `€${project.budget_min}/hr` : 
                             project.budget_type === 'Daily' ? `€${project.budget_min}/day` : 
                             `€${project.budget_min}${project.budget_max && project.budget_max > project.budget_min ? ` - €${project.budget_max}` : ''}`}
                          </span>
                        </div>
                      </div>

                      {/* Skills/Departments Tags */}
                      {project.departments_needed && project.departments_needed.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.departments_needed.slice(0, 3).map((dept) => (
                            <span key={dept} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                              {dept.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {project.departments_needed.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                              +{project.departments_needed.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header with Image */}
            <div className="relative h-48 bg-gray-100 rounded-xl mb-6 overflow-hidden">
              {selectedProject.image_url ? (
                <img 
                  src={selectedProject.image_url} 
                  alt={selectedProject.title || selectedProject.project_type}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {selectedProject.isJob && (
                <div className="absolute top-3 left-3 bg-black text-white text-sm font-bold px-3 py-1.5 rounded">
                  Job
                </div>
              )}
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur text-black text-sm font-bold px-3 py-1.5 rounded shadow">
                {selectedProject.budget_type === 'Hourly' ? 'Hourly Rate' : selectedProject.budget_type === 'Daily' ? 'Daily Rate' : 'Fixed Price'}
              </div>
              {selectedProject.requires_subscription && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm font-bold px-3 py-1.5 rounded shadow flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  Premium
                </div>
              )}
            </div>

            {/* Client Info */}
            <div className="px-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-black mb-1">{selectedProject.title || selectedProject.project_type?.replace(/_/g, ' ')}</h1>
                  <p className="text-gray-600 text-sm font-medium">{selectedProject.project_owner_name || 'Client'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-500">Verified Client</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="px-6 mb-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 uppercase font-bold mb-1">Budget</div>
                  <div className="text-lg font-bold text-black">
                    {selectedProject.budget_min ? `€${selectedProject.budget_min}` : 'Competitive'}
                  </div>
                  {selectedProject.budget_max && selectedProject.budget_max > selectedProject.budget_min && (
                    <div className="text-xs text-gray-500">up to €{selectedProject.budget_max}</div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 uppercase font-bold mb-1">Location</div>
                  <div className="text-sm font-bold text-black truncate">{[selectedProject.location_city, selectedProject.location_country].filter(Boolean).join(', ') || 'Remote'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 uppercase font-bold mb-1">Duration</div>
                  <div className="text-sm font-bold text-black">{selectedProject.duration || 'Flexible'}</div>
                </div>
              </div>
            </div>

            {/* Full Description */}
            <div className="px-6 mb-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-black rounded"></span>
                Description
              </h2>
              <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line bg-gray-50 rounded-lg p-4">
                {selectedProject.notes || 'This is an exciting opportunity for talented creatives.'}
              </div>
            </div>

            {/* Skills/Departments Needed */}
            {selectedProject.departments_needed && selectedProject.departments_needed.length > 0 && (
              <div className="px-6 mb-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-black rounded"></span>
                  Skills Needed
                </h2>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.departments_needed.map((dept) => (
                    <span key={dept} className="px-3 py-1.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                      {dept.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {selectedProject.timeline_start && (
              <div className="px-6 mb-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-black rounded"></span>
                  Timeline
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedProject.timeline_start).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="px-6 pb-6">
              {!selectedProject.hasApplied ? (
                <Button
                  onClick={handleApply}
                  className="w-full bg-black text-white hover:bg-gray-800 font-bold py-4 text-lg rounded-xl"
                >
                  Apply Now
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-gray-300 text-gray-600 font-bold py-4 text-lg rounded-xl cursor-not-allowed"
                >
                  Already Applied
                </Button>
              )}
              
              <p className="text-center text-xs text-gray-500 mt-3">
                1 connect will be used to apply
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}