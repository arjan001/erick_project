import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job, Application, Artist, ConnectsTransaction, Project } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Euro, ChevronDown, Calendar, Building2, Users, Star, ExternalLink, Crown, Lock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { base44 } from '@/api/base44Client';
import skillsAndRoles from '@/lib/skillsAndRoles.json';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({
    roles: [],
    location: [],
    project_types: [],
    skills: [],
    paid: null
  });
  const [showFilters, setShowFilters] = useState({
    roles: false,
    location: false,
    project_types: false,
    skills: false,
    paid: false
  });
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

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
    
    const fetchData = async () => {
      try {
        // Fetch both Jobs and Projects for comprehensive job listings
        const [allJobs, allProjects] = await Promise.all([
          Job.list(),
          Project.filter({ status: 'verified' })
        ]);
        
        const openJobs = allJobs.filter(j => j.status === 'open');
        
        // Convert projects to job-like format for unified display
        const projectJobs = allProjects.map(project => ({
          id: project.id,
          title: project.project_type?.replace(/_/g, ' ') || 'Project',
          description: project.notes || project.description || 'No description available',
          short_description: project.notes?.substring(0, 150) + '...' || 'Project opportunity',
          location: [project.location_city, project.location_country].filter(Boolean).join(', ') || 'Remote',
          client_name: project.project_owner_name || 'Client',
          client_avatar_url: null,
          roles_needed: project.departments_needed || [],
          budget_min: project.budget_min || 0,
          budget_max: project.budget_max || 0,
          budget_type: project.budget_range?.includes('hourly') ? 'Hourly' : project.budget_range?.includes('daily') ? 'Daily' : 'Fixed',
          payment_type: project.budget_range?.includes('hourly') ? 'per hour' : project.budget_range?.includes('daily') ? 'per day' : 'fixed price',
          skills_required: project.departments_needed || [],
          posted_at: project.created_at,
          application_deadline: project.timeline_start,
          duration: project.duration,
          isProject: true,
          image_url: project.image_url,
          requires_subscription: project.is_premium || false
        }));

        // Combine jobs and projects
        const allListings = [...openJobs, ...projectJobs];
        setJobs(allListings);
        if (allListings.length > 0) setSelectedJob(allListings[0]);

        const userApplications = await Application.filter({ artist_email: user.email });
        const enrichedApplications = await Promise.all(
          userApplications.map(async (app) => {
            const job = await Job.get(app.job_id);
            return { ...app, job };
          })
        );
        setApplications(enrichedApplications);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApply = async () => {
    if (!selectedJob || !user) return;

    try {
      const artists = await Artist.filter({ email: user.email });
      const artist = artists?.[0];
      const balance = artist?.connects_balance ?? 0;

      if (balance <= 0) {
        toastError('Out of Connects', 'You have no connects left. Buy more connects or upgrade your plan to keep applying for jobs.');
        return;
      }

      await Application.create({
        job_id: selectedJob.id,
        artist_email: user.email,
        status: 'applied',
        applied_at: new Date().toISOString()
      });

      const newBalance = balance - 1;
      await Artist.update(artist.id, { connects_balance: newBalance });
      await ConnectsTransaction.create({
        artist_email: user.email,
        amount: -1,
        reason: 'job_application',
        balance_after: newBalance
      });

      success('Application Submitted', `1 connect used. ${newBalance} connect${newBalance === 1 ? '' : 's'} remaining.`);
    } catch (err) {
      console.error('Error applying:', err);
      toastError('Application Failed', 'Failed to submit application');
    }
  };

  // Calculate filter counts from available jobs
  const filterCounts = useMemo(() => {
    const filteredJobsForCounts = jobs.filter(job => {
      if (filters.roles.length > 0 && !filters.roles.some(r => job.roles_needed?.includes(r))) return false;
      if (filters.location.length > 0 && !filters.location.includes(job.location)) return false;
      if (filters.project_types.length > 0 && !filters.project_types.some(t => job.project_types?.includes(t))) return false;
      if (filters.paid && job.budget_min !== undefined) {
        if (filters.paid === 'below100' && job.budget_min >= 100) return false;
        if (filters.paid === '100-500' && (job.budget_min < 100 || job.budget_min > 500)) return false;
        if (filters.paid === '500-1000' && (job.budget_min < 500 || job.budget_min > 1000)) return false;
        if (filters.paid === 'above1000' && job.budget_min <= 1000) return false;
      }
      if (filters.skills.length > 0 && !filters.skills.some(s => job.skills_required?.includes(s))) return false;
      return true;
    });

    const roles = {};
    const locations = {};
    const projectTypes = {};
    const skills = {};

    // Use all available roles from JSON, then count matches
    Object.values(skillsAndRoles.film_roles_by_category).flat().forEach(role => {
      roles[role] = filteredJobsForCounts.filter(job => job.roles_needed?.includes(role)).length;
    });

    // Use all available skills from JSON, then count matches
    Object.values(skillsAndRoles.skills_by_category).flat().forEach(skill => {
      skills[skill] = filteredJobsForCounts.filter(job => job.skills_required?.includes(skill)).length;
    });

    filteredJobsForCounts.forEach(job => {
      if (job.location) {
        locations[job.location] = (locations[job.location] || 0) + 1;
      }
      job.project_types?.forEach(type => {
        projectTypes[type] = (projectTypes[type] || 0) + 1;
      });
    });

    return { roles, locations, projectTypes, skills };
  }, [jobs, filters]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (filters.roles.length > 0 && !filters.roles.some(r => job.roles_needed?.includes(r))) return false;
      if (filters.location.length > 0 && !filters.location.includes(job.location)) return false;
      if (filters.project_types.length > 0 && !filters.project_types.some(t => job.project_types?.includes(t))) return false;
      if (filters.paid && job.budget_min !== undefined) {
        if (filters.paid === 'below100' && job.budget_min >= 100) return false;
        if (filters.paid === '100-500' && (job.budget_min < 100 || job.budget_min > 500)) return false;
        if (filters.paid === '500-1000' && (job.budget_min < 500 || job.budget_min > 1000)) return false;
        if (filters.paid === 'above1000' && job.budget_min <= 1000) return false;
      }
      if (filters.skills.length > 0 && !filters.skills.some(s => job.skills_required?.includes(s))) return false;
      return true;
    });
  }, [jobs, filters]);

  const toggleFilter = (filterType, value) => {
    setFilters(prev => {
      if (filterType === 'paid') {
        return { ...prev, paid: prev.paid === value ? null : value };
      }
      const current = prev[filterType];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterType]: updated };
    });
  };

  if (!user || loading) return null;

  const FilterDropdown = ({ type, label }) => (
    <div className="relative">
      <button
        onClick={() => setShowFilters(prev => {
          const newState = { roles: false, location: false, project_types: false, skills: false, paid: false };
          newState[type] = !prev[type];
          return newState;
        })}
        className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        {label}
        {filters[type]?.length > 0 && type !== 'paid' && (
          <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {filters[type].length}
          </span>
        )}
        {filters.paid && type === 'paid' && (
          <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">1</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>
      {showFilters[type] && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] max-h-80 overflow-y-auto">
          {type === 'roles' && Object.entries(filterCounts.roles)
            .filter(([_, count]) => count > 0)
            .sort(([_, a], [__, b]) => b - a)
            .map(([role, count]) => (
            <button
              key={role}
              onClick={() => toggleFilter('roles', role)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                filters.roles.includes(role) ? 'bg-gray-100' : ''
              }`}
            >
              <span className="truncate">{role}</span>
              <span className="text-gray-500">({count})</span>
            </button>
          ))}
          {type === 'skills' && Object.entries(filterCounts.skills)
            .filter(([_, count]) => count > 0)
            .sort(([_, a], [__, b]) => b - a)
            .map(([skill, count]) => (
            <button
              key={skill}
              onClick={() => toggleFilter('skills', skill)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                filters.skills.includes(skill) ? 'bg-gray-100' : ''
              }`}
            >
              <span className="truncate">{skill}</span>
              <span className="text-gray-500">({count})</span>
            </button>
          ))}
          {type === 'location' && Object.entries(filterCounts.locations).map(([loc, count]) => (
            <button
              key={loc}
              onClick={() => toggleFilter('location', loc)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                filters.location.includes(loc) ? 'bg-gray-100' : ''
              }`}
            >
              <span>{loc}</span>
              <span className="text-gray-500">({count})</span>
            </button>
          ))}
          {type === 'project_types' && Object.entries(filterCounts.projectTypes).map(([type, count]) => (
            <button
              key={type}
              onClick={() => toggleFilter('project_types', type)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                filters.project_types.includes(type) ? 'bg-gray-100' : ''
              }`}
            >
              <span>{type}</span>
              <span className="text-gray-500">({count})</span>
            </button>
          ))}
          {type === 'paid' && (
            <>
              <button
                onClick={() => toggleFilter('paid', 'below100')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  filters.paid === 'below100' ? 'bg-gray-100' : ''
                }`}
              >
                Below €100
              </button>
              <button
                onClick={() => toggleFilter('paid', '100-500')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  filters.paid === '100-500' ? 'bg-gray-100' : ''
                }`}
              >
                €100 - €500
              </button>
              <button
                onClick={() => toggleFilter('paid', '500-1000')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  filters.paid === '500-1000' ? 'bg-gray-100' : ''
                }`}
              >
                €500 - €1,000
              </button>
              <button
                onClick={() => toggleFilter('paid', 'above1000')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  filters.paid === 'above1000' ? 'bg-gray-100' : ''
                }`}
              >
                Above €1,000
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full bg-white">
      <main className="h-full flex flex-col bg-white">
        {/* Header with Tabs */}
        <div className="border-b border-gray-200 px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('board')}
                className={`pb-4 font-semibold text-base transition-colors ${
                  activeTab === 'board'
                    ? 'text-black border-b-2 border-black -mb-0.5'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Job Board
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`pb-4 font-semibold text-base transition-colors ${
                  activeTab === 'applications'
                    ? 'text-black border-b-2 border-black -mb-0.5'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Applications ({applications.length})
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`pb-4 font-semibold text-base transition-colors ${
                  activeTab === 'invitations'
                    ? 'text-black border-b-2 border-black -mb-0.5'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Invitations
              </button>
            </div>
          </div>

          {/* Filters */}
          {activeTab === 'board' && (
            <div className="flex gap-3 pb-6 flex-wrap">
              <FilterDropdown type="roles" label="Roles" />
              <FilterDropdown type="skills" label="Skills" />
              <FilterDropdown type="location" label="Location" />
              <FilterDropdown type="project_types" label="Project types" />
              <FilterDropdown type="paid" label="Paid" />
            </div>
          )}
        </div>

        {/* Content Area */}
        {activeTab === 'board' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length === 0 ? (
                <div className="col-span-full flex items-center justify-center h-64 text-gray-500">
                  No jobs match your filters
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`w-full text-left bg-white rounded-2xl border-2 transition-all overflow-hidden shadow-sm hover:shadow-lg ${
                      selectedJob?.id === job.id
                        ? 'border-black shadow-md ring-2 ring-black/5'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {/* Job Card Image */}
                    <div className="relative h-48 bg-gray-100">
                      {job.image_url ? (
                        <img 
                          src={job.image_url} 
                          alt={job.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      {job.isProject && (
                        <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          Project
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {job.budget_type === 'Hourly' ? '€/hr' : job.budget_type === 'Daily' ? '€/day' : 'Fixed'}
                      </div>
                      {job.requires_subscription && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Premium
                        </div>
                      )}
                    </div>
                    
                    {/* Job Card Content */}
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-gray-50">
                          {job.client_avatar_url ? (
                            <img src={job.client_avatar_url} alt={job.client_name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-gray-900 truncate">{job.client_name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{job.location || 'Remote'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-2 text-sm line-clamp-2 leading-tight">{job.title}</h3>
                      
                      {/* Skills/Roles Tags */}
                      {job.roles_needed && job.roles_needed.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {job.roles_needed.slice(0, 3).map((role) => (
                            <span key={role} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full truncate max-w-[100px]">
                              {role}
                            </span>
                          ))}
                          {job.roles_needed.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{job.roles_needed.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-gray-900 text-base">
                            {job.budget_type === 'Hourly' ? `€${job.budget_min}/hr` : job.budget_type === 'Daily' ? `€${job.budget_min}/day` : `€${job.budget_min}`}
                          </div>
                          {job.budget_max && job.budget_max > job.budget_min && job.budget_type !== 'Hourly' && job.budget_type !== 'Daily' && (
                            <div className="text-xs text-gray-500">- €{job.budget_max}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Job Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {selectedJob ? (
                <div className="p-6">
                  {/* Header with Image */}
                  <div className="relative h-48 bg-gray-100 rounded-xl mb-6 overflow-hidden">
                    {selectedJob.image_url ? (
                      <img 
                        src={selectedJob.image_url} 
                        alt={selectedJob.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {selectedJob.isProject && (
                      <div className="absolute top-3 left-3 bg-black text-white text-sm font-bold px-3 py-1.5 rounded">
                        Project
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur text-black text-sm font-bold px-3 py-1.5 rounded shadow">
                      {selectedJob.budget_type === 'Hourly' ? 'Hourly Rate' : selectedJob.budget_type === 'Daily' ? 'Daily Rate' : 'Fixed Price'}
                    </div>
                    {selectedJob.requires_subscription && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm font-bold px-3 py-1.5 rounded shadow flex items-center gap-1">
                        <Crown className="w-4 h-4" />
                        Premium
                      </div>
                    )}
                  </div>

                  {/* Client Info */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {selectedJob.client_avatar_url ? (
                        <img src={selectedJob.client_avatar_url} alt={selectedJob.client_name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-black mb-1">{selectedJob.title}</h1>
                      <p className="text-gray-600 text-sm font-medium">{selectedJob.client_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-500">Verified Client</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 uppercase font-bold mb-1">Budget</div>
                      <div className="text-lg font-bold text-black">
                        {selectedJob.budget_type === 'Hourly' ? `€${selectedJob.budget_min}/hr` : selectedJob.budget_type === 'Daily' ? `€${selectedJob.budget_min}/day` : `€${selectedJob.budget_min}`}
                      </div>
                      {selectedJob.budget_max && selectedJob.budget_max > selectedJob.budget_min && selectedJob.budget_type !== 'Hourly' && selectedJob.budget_type !== 'Daily' && (
                        <div className="text-xs text-gray-500">up to €{selectedJob.budget_max}</div>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 uppercase font-bold mb-1">Location</div>
                      <div className="text-sm font-bold text-black truncate">{selectedJob.location}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 uppercase font-bold mb-1">Duration</div>
                      <div className="text-sm font-bold text-black">{selectedJob.duration || 'Flexible'}</div>
                    </div>
                  </div>

                  {/* Full Description */}
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-black rounded"></span>
                      Job Description
                    </h2>
                    <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line bg-gray-50 rounded-lg p-4">
                      {selectedJob.description}
                    </div>
                  </div>

                  {/* Roles Needed */}
                  {selectedJob.roles_needed && selectedJob.roles_needed.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-black rounded"></span>
                        Roles Needed
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.roles_needed.map((role) => (
                          <span key={role} className="px-3 py-1.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Required */}
                  {selectedJob.skills_required && selectedJob.skills_required.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-black rounded"></span>
                        Skills Required
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skills_required.map((skill) => (
                          <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deadline */}
                  {selectedJob.application_deadline && (
                    <div className="mb-6">
                      <h2 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-black rounded"></span>
                        Application Deadline
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedJob.application_deadline).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pricing Details */}
                  <div className="mb-6 bg-gray-50 rounded-lg p-4">
                    <h2 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-black rounded"></span>
                      Pricing Details
                    </h2>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Type</span>
                        <span className="text-sm font-bold text-black">{selectedJob.payment_type || selectedJob.budget_type || 'Fixed'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Budget Range</span>
                        <span className="text-sm font-bold text-black">
                          {selectedJob.budget_type === 'Hourly' 
                            ? `€${selectedJob.budget_min}/hr` 
                            : selectedJob.budget_type === 'Daily'
                            ? `€${selectedJob.budget_min}/day`
                            : `€${selectedJob.budget_min}${selectedJob.budget_max ? ` - €${selectedJob.budget_max}` : ''}`}
                        </span>
                      </div>
                      {selectedJob.requires_subscription && (
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-sm text-gray-600">Subscription Required</span>
                          <span className="text-sm font-bold text-yellow-600 flex items-center gap-1">
                            <Crown className="w-4 h-4" />
                            Premium
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Button
                    onClick={handleApply}
                    className="w-full bg-black text-white hover:bg-gray-800 font-bold py-4 text-lg rounded-xl"
                  >
                    Apply Now
                  </Button>
                  
                  <p className="text-center text-xs text-gray-500 mt-3">
                    1 connect will be used to apply
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="flex-1 overflow-y-auto p-6">
            {applications.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-black text-sm mb-1">{app.job?.title}</h3>
                        <p className="text-xs text-gray-600">{app.job?.client_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'applied' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {app.job?.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(app.applied_at).toLocaleDateString()}
                      </div>
                      <div className="font-bold text-black">
                        €{app.job?.budget_min || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Invitations coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
}