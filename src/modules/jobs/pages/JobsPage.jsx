import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Job, Application } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Euro, ChevronDown } from 'lucide-react';
import JobPostingModal from '@/components/JobPostingModal';
import { useToast } from '@/hooks/useToast';

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
  const [showJobModal, setShowJobModal] = useState(false);
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
        const allJobs = await Job.list();
        const openJobs = allJobs.filter(j => j.status === 'open');
        setJobs(openJobs);
        if (openJobs.length > 0) setSelectedJob(openJobs[0]);

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
      const artists = await base44.entities.Artist.filter({ email: user.email });
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
      await base44.entities.Artist.update(artist.id, { connects_balance: newBalance });
      await base44.entities.ConnectsTransaction.create({
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

  const handleJobSubmit = async (jobData) => {
    try {
      await Job.create(jobData);
      setShowJobModal(false);
      // Refresh jobs list
      const allJobs = await Job.list();
      setJobs(allJobs.filter(j => j.status === 'open'));
      success('Job Posted', 'Your job has been posted successfully');
    } catch (err) {
      console.error('Error posting job:', err);
      toastError('Posting Failed', 'Failed to post job');
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
      return true;
    });

    const roles = {};
    const locations = {};
    const projectTypes = {};

    filteredJobsForCounts.forEach(job => {
      job.roles_needed?.forEach(role => {
        roles[role] = (roles[role] || 0) + 1;
      });
      if (job.location) {
        locations[job.location] = (locations[job.location] || 0) + 1;
      }
      job.project_types?.forEach(type => {
        projectTypes[type] = (projectTypes[type] || 0) + 1;
      });
    });

    return { roles, locations, projectTypes };
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
          const newState = { roles: false, location: false, project_types: false, paid: false };
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
          {type === 'roles' && Object.entries(filterCounts.roles).map(([role, count]) => (
            <button
              key={role}
              onClick={() => toggleFilter('roles', role)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                filters.roles.includes(role) ? 'bg-gray-100' : ''
              }`}
            >
              <span>{role}</span>
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
            <Button 
              onClick={() => setShowJobModal(true)}
              className="bg-black text-white hover:bg-gray-800 font-semibold px-6 py-2"
            >
              Post a job
            </Button>
          </div>

          {/* Filters */}
          {activeTab === 'board' && (
            <div className="flex gap-3 pb-6">
              <FilterDropdown type="roles" label="Roles" />
              <FilterDropdown type="location" label="Location" />
              <FilterDropdown type="project_types" label="Project types" />
              <FilterDropdown type="paid" label="Paid" />
            </div>
          )}
        </div>

        {/* Content Area */}
        {activeTab === 'board' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Job List */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 space-y-3">
                {filteredJobs.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    No jobs match your filters
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedJob?.id === job.id
                          ? 'border-gray-400 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <img 
                          src={job.client_avatar_url || 'https://via.placeholder.com/40'}
                          alt={job.client_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-black">{job.client_name}</div>
                          <div className="text-xs text-gray-600">{job.roles_needed?.join(', ') || 'Various roles'}</div>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-black mb-1 text-sm">{job.title}</h3>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{job.short_description || job.description}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.posted_at ? 'Recently' : '4m ago'}
                        </div>
                        <div className="font-bold text-black">
                          €{job.budget_min || 0}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Job Detail */}
            <div className="w-1/2 overflow-y-auto">
              {selectedJob ? (
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-8">
                    <img
                      src={selectedJob.client_avatar_url || 'https://via.placeholder.com/64'}
                      alt={selectedJob.client_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h1 className="text-3xl font-bold text-black mb-2">{selectedJob.title}</h1>
                      <p className="text-gray-600 text-sm">{selectedJob.roles_needed?.join(', ') || 'Various roles'}</p>
                      <p className="text-gray-600 text-sm">{selectedJob.client_name}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xs font-bold text-gray-600 uppercase mb-2">Description</h2>
                      <p className="text-gray-800 leading-relaxed text-sm">{selectedJob.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200">
                      <div>
                        <div className="text-xs text-gray-600 uppercase font-bold mb-2">Budget</div>
                        <div className="text-lg font-bold text-black">
                          €{selectedJob.budget_min || 0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{selectedJob.budget_type || 'Fixed'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 uppercase font-bold mb-2">Type</div>
                        <div className="text-lg font-bold text-black">{selectedJob.budget_type || 'Gig'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 uppercase font-bold mb-2">Location</div>
                        <div className="text-lg font-bold text-black">{selectedJob.location}</div>
                      </div>
                    </div>

                    {selectedJob.skills_required && selectedJob.skills_required.length > 0 && (
                      <div>
                        <h2 className="text-xs font-bold text-gray-600 uppercase mb-3">Skills Required</h2>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.skills_required.map((skill) => (
                            <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleApply}
                    className="w-full bg-black text-white hover:bg-gray-800 font-bold py-3 mt-8"
                  >
                    Apply
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600">
                  Select a job to view details
                </div>
              )}
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

      <JobPostingModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        onSubmit={handleJobSubmit}
        user={user}
      />
    </div>
  );
}