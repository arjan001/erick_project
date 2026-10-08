import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job, Application, Artist, ConnectsTransaction, Project, JobInvitation, Notification } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Euro, ChevronDown, Calendar, Building2, Users, Star, ExternalLink, Crown, Lock, Eye, EyeOff, AlertCircle, CheckCircle, XCircle, Hourglass, FileText, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';
import skillsAndRoles from '@/lib/skillsAndRoles.json';
import confetti from 'canvas-confetti';
import { canApplyForJobs } from '@/services/subscriptionService';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [jobsViewTab, setJobsViewTab] = useState('production'); // 'production' or 'roles'
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [artistId, setArtistId] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
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
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('ericrabar_user');
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

        // Fetch view counts from job_views and project_views tables
        const [jobViewCounts, projectViewCounts] = await Promise.all([
          supabase.from('job_views').select('job_id').then(({ data }) => {
            const counts = {};
            data?.forEach(v => {
              counts[v.job_id] = (counts[v.job_id] || 0) + 1;
            });
            return counts;
          }),
          supabase.from('project_views').select('project_id').then(({ data }) => {
            const counts = {};
            data?.forEach(v => {
              counts[v.project_id] = (counts[v.project_id] || 0) + 1;
            });
            return counts;
          })
        ]);

        // Convert projects to job-like format for unified display
        const projectJobs = allProjects.map(project => ({
          id: project.id,
          title: project.title || project.project_type?.replace(/_/g, ' ') || 'Project',
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
          requires_team: project.requires_team || false,
          image_url: project.image_url,
          requires_subscription: project.is_premium || false,
          view_count: projectViewCounts[project.id] || 0
        }));

        // Convert jobs with view counts
        const jobsWithCounts = openJobs.map(job => ({
          ...job,
          view_count: jobViewCounts[job.id] || 0
        }));

        // Combine jobs and projects
        const allListings = [...jobsWithCounts, ...projectJobs];
        setJobs(allListings);
        if (allListings.length > 0) setSelectedJob(allListings[0]);

        // Get artist ID first
        const artists = await Artist.filter({ email: user.email });
        const artist = artists?.[0];

        if (artist) {
          setArtistId(artist.id);
          const userApplications = await Application.filter({ artist_id: artist.id });
          const enrichedApplications = await Promise.all(
            userApplications.map(async (app) => {
              let job = null;
              if (app.job_id) {
                job = await Job.get(app.job_id);
              } else if (app.project_id) {
                // For projects, fetch the project and convert to job-like format
                const project = await Project.get(app.project_id);
                if (project) {
                  job = {
                    id: project.id,
                    title: project.title || project.project_type?.replace(/_/g, ' ') || 'Project',
                    description: project.notes || project.description,
                    location: [project.location_city, project.location_country].filter(Boolean).join(', ') || 'Remote',
                    client_name: project.project_owner_name || 'Client',
                    budget_min: project.budget_min || 0,
                    budget_max: project.budget_max || 0,
                    budget_type: project.budget_range?.includes('hourly') ? 'Hourly' : project.budget_range?.includes('daily') ? 'Daily' : 'Fixed',
                    isProject: true,
                    image_url: project.image_url
                  };
                }
              }
              return { ...app, job };
            })
          );
          setApplications(enrichedApplications);

          // Fetch job invitations
          const userInvitations = await JobInvitation.filter({ artist_id: artist.id });
          const enrichedInvitations = await Promise.all(
            userInvitations.map(async (inv) => {
              const job = await Job.get(inv.job_id);
              return { ...inv, job };
            })
          );
          setInvitations(enrichedInvitations);
        } else {
          setArtistId(null);
          setApplications([]);
          setInvitations([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApply = useCallback(async () => {
    if (!selectedJob) return;

    // Check if user is authenticated
    if (!user) {
      // Store the current path and job details for redirect after login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      sessionStorage.setItem('applyAfterLogin', JSON.stringify({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        selectedRole: selectedJob.selectedRole
      }));
      navigate('/SignIn');
      return;
    }

    try {
      const artists = await Artist.filter({ email: user.email });
      const artist = artists?.[0];

      if (!artist) {
        toastError('Profile Required', 'Please complete your artist profile before applying for jobs.');
        return;
      }

      // Check if user has active subscription
      const hasSubscription = await canApplyForJobs(artist.id);
      if (!hasSubscription) {
        toastError('Subscription Required', 'Contacting job posters and applying for roles requires an active subscription.');
        navigate('/Subscribe');
        return;
      }

      const balance = artist?.connects_balance ?? 0;

      if (balance <= 0) {
        toastError('Out of Connects', 'You have no connects left. Buy more connects or upgrade your plan to keep applying for jobs.');
        return;
      }

      // Check if already applied to this job/project
      const existingApplications = await Application.filter({ artist_id: artist.id });
      const alreadyApplied = existingApplications.some(app => {
        if (selectedJob.isProject) {
          return app.project_id === selectedJob.id;
        } else {
          return app.job_id === selectedJob.id;
        }
      });

      if (alreadyApplied) {
        toastError('Already Applied', 'You have already applied to this position.');
        return;
      }

      // Check if job/project requires team and user is solo artist
      if (selectedJob.requires_team && !artist.is_team) {
        toastError('Team Required', 'This position requires a team. Solo artists cannot apply.');
        return;
      }

      // Use project_id for projects, job_id for jobs
      const applicationData = {
        artist_id: artist.id,
        status: 'pending',
        applied_at: new Date().toISOString()
      };

      if (selectedJob.isProject) {
        applicationData.project_id = selectedJob.id;
      } else {
        applicationData.job_id = selectedJob.id;
      }

      await Application.create(applicationData);

      const newBalance = balance - 1;
      await Artist.update(artist.id, { connects_balance: newBalance });
      await ConnectsTransaction.create({
        artist_email: user.email,
        amount: -1,
        reason: 'job_application',
        balance_after: newBalance
      });

      // Send notification for job application submitted
      await Notification.create({
        recipient_email: user.email,
        type: 'job_application',
        title: 'Application Submitted',
        message: `Your application for "${selectedJob.title}" has been submitted successfully.`,
        metadata: { job_title: selectedJob.title, job_id: selectedJob.id },
        read: false
      });

      // Trigger confetti effect with normal colors
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff']
      });

      success('Application Submitted Successfully', `1 connect used. ${newBalance} connect${newBalance === 1 ? '' : 's'} remaining.`);

      // Refresh applications list - handle both jobs and projects
      const userApplications = await Application.filter({ artist_id: artist.id });
      const enrichedApplications = await Promise.all(
        userApplications.map(async (app) => {
          let job = null;
          if (app.job_id) {
            job = await Job.get(app.job_id);
          } else if (app.project_id) {
            // For projects, fetch the project and convert to job-like format
            const project = await Project.get(app.project_id);
            if (project) {
              job = {
                id: project.id,
                title: project.title || project.project_type?.replace(/_/g, ' ') || 'Project',
                description: project.notes || project.description,
                location: [project.location_city, project.location_country].filter(Boolean).join(', ') || 'Remote',
                client_name: project.project_owner_name || 'Client',
                budget_min: project.budget_min || 0,
                budget_max: project.budget_max || 0,
                budget_type: project.budget_range?.includes('hourly') ? 'Hourly' : project.budget_range?.includes('daily') ? 'Daily' : 'Fixed',
                isProject: true,
                image_url: project.image_url
              };
            }
          }
          return { ...app, job };
        })
      );
      setApplications(enrichedApplications);

      // Close modal
      setSelectedJob(null);
    } catch (err) {
      console.error('Error applying:', err);
      toastError('Application Failed', 'Failed to submit application');
    }
  }, [selectedJob, user, navigate, toastError, artistId]);

  // Handle auto-apply after login
  useEffect(() => {
    if (!user) return;

    const applyAfterLogin = sessionStorage.getItem('applyAfterLogin');
    if (applyAfterLogin) {
      const applyData = JSON.parse(applyAfterLogin);
      sessionStorage.removeItem('applyAfterLogin');

      // Find the job and select it
      const fetchData = async () => {
        try {
          const allJobs = await Job.list();
          const allProjects = await Project.filter({ status: 'verified' });

          const openJobs = allJobs.filter(j => j.status === 'open');
          const projectJobs = allProjects.map(project => ({
            id: project.id,
            title: project.title || project.project_type?.replace(/_/g, ' ') || 'Project',
            description: project.notes || project.description || 'No description available',
            short_description: project.notes?.substring(0, 150) + '...' || 'Project opportunity',
            location: [project.location_city, project.location_country].filter(Boolean).join(', ') || 'Remote',
            client_name: project.project_owner_name || 'Client',
            roles_needed: project.departments_needed || [],
            budget_min: project.budget_min || 0,
            budget_max: project.budget_max || 0,
            budget_type: project.budget_range?.includes('hourly') ? 'Hourly' : project.budget_range?.includes('daily') ? 'Daily' : 'Fixed',
            isProject: true,
            image_url: project.image_url
          }));

          const allListings = [...openJobs, ...projectJobs];
          const jobToApply = allListings.find(j => j.id === applyData.jobId);

          if (jobToApply) {
            setSelectedJob({ ...jobToApply, selectedRole: applyData.selectedRole });
            // Show a toast message that user can click to apply
            success('Login Successful', 'You can now apply for the job by clicking the Apply button.');
          }
        } catch (err) {
          console.error('Error finding job for auto-apply:', err);
        }
      };

      fetchData();
    }
  }, [user, success]);

  // Check if user has already applied to selected job/project
  const hasAlreadyApplied = () => {
    if (!selectedJob || !applications) return false;
    return applications.some(app => {
      if (selectedJob.isProject) {
        return app.project_id === selectedJob.id;
      } else {
        return app.job_id === selectedJob.id;
      }
    });
  };

  const handleJobClick = async (job) => {
    setSelectedJob(job);

    // Track view in job_views or project_views table
    try {
      const { user } = await import('@/lib/AuthContext');
      const authUser = user();

      if (job.isProject) {
        // Insert into project_views - unique constraint will prevent duplicates
        try {
          await supabase.from('project_views').insert({
            project_id: job.id,
            user_id: authUser?.id || null,
            ip_address: null // TODO: Add IP tracking if needed
          });
        } catch (err) {
          // Ignore duplicate key errors - view already tracked
          if (err.code !== '23505') {
            console.error('Error tracking project view:', err);
          }
        }
      } else {
        // Insert into job_views - unique constraint will prevent duplicates
        try {
          await supabase.from('job_views').insert({
            job_id: job.id,
            user_id: authUser?.id || null,
            ip_address: null // TODO: Add IP tracking if needed
          });
        } catch (err) {
          // Ignore duplicate key errors - view already tracked
          if (err.code !== '23505') {
            console.error('Error tracking job view:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  // Handle accepting invitation
  const handleAcceptInvitation = async (invitation) => {
    try {
      await JobInvitation.update(invitation.id, {
        status: 'accepted',
        responded_at: new Date().toISOString()
      });

      // Create application automatically when invitation is accepted
      await Application.create({
        job_id: invitation.job_id,
        artist_id: artistId,
        status: 'pending',
        applied_at: new Date().toISOString()
      });

      success('Invitation Accepted', 'You have accepted the invitation and applied for the job.');

      // Refresh invitations and applications
      const userInvitations = await JobInvitation.filter({ artist_id: artistId });
      const enrichedInvitations = await Promise.all(
        userInvitations.map(async (inv) => {
          const job = await Job.get(inv.job_id);
          return { ...inv, job };
        })
      );
      setInvitations(enrichedInvitations);

      const userApplications = await Application.filter({ artist_id: artistId });
      const enrichedApplications = await Promise.all(
        userApplications.map(async (app) => {
          const job = await Job.get(app.job_id);
          return { ...app, job };
        })
      );
      setApplications(enrichedApplications);

      setSelectedInvitation(null);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      toastError('Failed to Accept', 'Could not accept the invitation');
    }
  };

  // Handle declining invitation
  const handleDeclineInvitation = async (invitation) => {
    try {
      await JobInvitation.update(invitation.id, {
        status: 'declined',
        responded_at: new Date().toISOString()
      });

      success('Invitation Declined', 'You have declined the invitation.');

      // Refresh invitations
      const userInvitations = await JobInvitation.filter({ artist_id: artistId });
      const enrichedInvitations = await Promise.all(
        userInvitations.map(async (inv) => {
          const job = await Job.get(inv.job_id);
          return { ...inv, job };
        })
      );
      setInvitations(enrichedInvitations);

      setSelectedInvitation(null);
    } catch (err) {
      console.error('Error declining invitation:', err);
      toastError('Failed to Decline', 'Could not decline the invitation');
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

    // Use all available roles from JSON (talent roles for job browsing), then count matches
    Object.values(skillsAndRoles.talent_roles_by_category).flat().forEach(role => {
      roles[role] = filteredJobsForCounts.filter(job => job.roles_needed?.includes(role)).length;
    });

    // Use all available skills from JSON (talent skills for job browsing), then count matches
    Object.values(skillsAndRoles.talent_skills_by_category).flat().forEach(skill => {
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

  const isJobExpired = (job) => {
    if (!job.application_deadline) return false;
    return new Date(job.application_deadline) < new Date();
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { icon: Hourglass, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
      viewed: { icon: Eye, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Viewed' },
      shortlisted: { icon: Star, color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Shortlisted' },
      interview_scheduled: { icon: Calendar, color: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Interview' },
      accepted: { icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200', label: 'Accepted' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected' },
      withdrawn: { icon: FileText, color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Withdrawn' },
      expired: { icon: AlertCircle, color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Expired' }
    };
    return configs[status] || configs.pending;
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
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${filters.roles.includes(role) ? 'bg-gray-100' : ''
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
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${filters.skills.includes(skill) ? 'bg-gray-100' : ''
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
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${filters.location.includes(loc) ? 'bg-gray-100' : ''
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
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${filters.project_types.includes(type) ? 'bg-gray-100' : ''
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
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filters.paid === 'below100' ? 'bg-gray-100' : ''
                  }`}
              >
                Below €100
              </button>
              <button
                onClick={() => toggleFilter('paid', '100-500')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filters.paid === '100-500' ? 'bg-gray-100' : ''
                  }`}
              >
                €100 - €500
              </button>
              <button
                onClick={() => toggleFilter('paid', '500-1000')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filters.paid === '500-1000' ? 'bg-gray-100' : ''
                  }`}
              >
                €500 - €1,000
              </button>
              <button
                onClick={() => toggleFilter('paid', 'above1000')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filters.paid === 'above1000' ? 'bg-gray-100' : ''
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
                className={`pb-4 font-semibold text-base transition-colors ${activeTab === 'board'
                  ? 'text-black border-b-2 border-black -mb-0.5'
                  : 'text-gray-600 hover:text-black'
                  }`}
              >
                Job Board
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`pb-4 font-semibold text-base transition-colors ${activeTab === 'applications'
                  ? 'text-black border-b-2 border-black -mb-0.5'
                  : 'text-gray-600 hover:text-black'
                  }`}
              >
                Applications {applications.length > 0 && `(${applications.length})`}
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`pb-4 font-semibold text-base transition-colors ${activeTab === 'invitations'
                  ? 'text-black border-b-2 border-black -mb-0.5'
                  : 'text-gray-600 hover:text-black'
                  }`}
              >
                Invitations {invitations.length > 0 && `(${invitations.length})`}
              </button>
            </div>
            {/* Production/Roles toggle */}
            {activeTab === 'board' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setJobsViewTab('production')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${jobsViewTab === 'production'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Production
                </button>
                <button
                  onClick={() => setJobsViewTab('roles')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${jobsViewTab === 'roles'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Roles
                </button>
              </div>
            )}
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
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full">
              {/* Left Side - Job List */}
              <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-4">
                {filteredJobs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No jobs match your filters
                  </div>
                ) : jobsViewTab === 'roles' ? (
                  // Roles view - show individual roles
                  <div className="space-y-3">
                    {filteredJobs.flatMap((job) =>
                      (job.roles_needed || []).map((role, roleIdx) => (
                        <button
                          key={`${job.id}-${roleIdx}`}
                          onClick={() => handleJobClick({ ...job, selectedRole: role })}
                          className={`w-full text-left bg-white rounded-xl border transition-all overflow-hidden shadow-sm hover:shadow-md ${selectedJob?.id === job.id && selectedJob?.selectedRole === role
                            ? 'border-black shadow-md ring-1 ring-black/5'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="flex gap-3 p-4">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                              {job.image_url ? (
                                <>
                                  <img src={job.image_url} alt={job.title} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                                </>
                              ) : (
                                <Briefcase className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500">{getTimeAgo(job.posted_at)}</span>
                                {job.isProject && (
                                  <span className="bg-black text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                                    Project
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1 text-sm">{role}</h3>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-1">{job.title}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{job.location || 'Remote'}</span>
                                </div>
                                <div className="flex items-center gap-1 font-medium text-gray-900">
                                  <Euro className="w-3 h-3" />
                                  <span>
                                    {job.budget_type === 'Hourly' ? `€${job.budget_min}/hr` :
                                      job.budget_type === 'Daily' ? `€${job.budget_min}/day` :
                                        `€${job.budget_min}${job.budget_max && job.budget_max > job.budget_min ? ` - €${job.budget_max}` : ''}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  // Production view - show productions with expandable roles
                  <div className="space-y-3">
                    {filteredJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => handleJobClick(job)}
                        className={`w-full text-left bg-white rounded-xl border transition-all overflow-hidden shadow-sm hover:shadow-md ${selectedJob?.id === job.id
                          ? 'border-black shadow-md ring-1 ring-black/5'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex gap-3 p-4">
                          {/* Left - Job Image (square) */}
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                            {job.image_url ? (
                              <>
                                <img src={job.image_url} alt={job.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                              </>
                            ) : (
                              <Briefcase className="w-6 h-6 text-gray-400" />
                            )}
                          </div>

                          {/* Right - Content */}
                          <div className="flex-1 min-w-0">
                            {/* Top Row - Timestamp and Badges */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{getTimeAgo(job.posted_at)}</span>
                                {job.isProject && (
                                  <span className="bg-black text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                                    Project
                                  </span>
                                )}
                                {job.requires_subscription && (
                                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[10px] font-medium px-2 py-0.5 rounded-full">
                                    Premium
                                  </span>
                                )}
                              </div>
                              {job.view_count > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Eye className="w-3 h-3" />
                                  <span>{job.view_count}</span>
                                </div>
                              )}
                            </div>

                            {/* Job Title */}
                            <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-1">{job.title}</h3>

                            {/* Description - blurred for pro-only jobs */}
                            {job.requires_subscription ? (
                              <div className="relative mb-2">
                                <p className="text-xs text-gray-600 line-clamp-2 blur-sm">{job.short_description || job.description?.substring(0, 100) + '...'}</p>
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm rounded">
                                  <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                    <Lock className="w-3 h-3" />
                                    Unlock with Pro
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{job.short_description || job.description?.substring(0, 100) + '...'}</p>
                            )}

                            {/* Location and Pay */}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{job.location || 'Remote'}</span>
                              </div>
                              <div className="flex items-center gap-1 font-medium text-gray-900">
                                <Euro className="w-3 h-3" />
                                <span>
                                  {job.budget_type === 'Hourly' ? `€${job.budget_min}/hr` :
                                    job.budget_type === 'Daily' ? `€${job.budget_min}/day` :
                                      `€${job.budget_min}${job.budget_max && job.budget_max > job.budget_min ? ` - €${job.budget_max}` : ''}`}
                                </span>
                              </div>
                            </div>

                            {/* Skills/Roles Tags */}
                            {job.roles_needed && job.roles_needed.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {job.roles_needed.slice(0, 3).map((role) => (
                                  <span key={role} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                                    {role}
                                  </span>
                                ))}
                                {job.roles_needed.length > 3 && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                                    +{job.roles_needed.length - 3}
                                  </span>
                                )}
                                {job.roles_needed.length > 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Toggle expanded state for this job
                                      setExpandedJobId(prev => prev === job.id ? null : job.id);
                                    }}
                                    className="px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] text-[10px] rounded-full flex items-center gap-1"
                                  >
                                    {expandedJobId === job.id ? (
                                      <>
                                        <ChevronUp className="w-3 h-3" />
                                        Show Less
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="w-3 h-3" />
                                        Show All
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Expandable Roles */}
                            {expandedJobId === job.id && job.roles_needed && job.roles_needed.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="text-xs font-semibold text-gray-700 mb-2">All Roles ({job.roles_needed.length})</div>
                                <div className="space-y-2">
                                  {job.roles_needed.map((role, idx) => (
                                    <div
                                      key={idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleJobClick({ ...job, selectedRole: role });
                                      }}
                                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                                    >
                                      <span className="text-xs font-medium text-gray-900">{role}</span>
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side - Details Panel */}
              <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
                {selectedJob ? (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
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

                    {/* Apply Button */}
                    <Button
                      className={`w-full py-3 text-lg font-bold ${hasAlreadyApplied()
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      onClick={handleApply}
                      disabled={hasAlreadyApplied()}
                    >
                      {hasAlreadyApplied() ? 'Application Sent' : selectedJob.requires_team ? 'Apply as Team' : 'Apply Now'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a job to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="flex-1 overflow-y-auto p-6">
            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No applications yet</p>
                <p className="text-sm mt-1">Start applying to jobs to track your applications here</p>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto">
                {/* Status Filter Bar */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                  <button
                    onClick={() => setApplicationStatusFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${applicationStatusFilter === 'all'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    All ({applications.length})
                  </button>
                  {['pending', 'viewed', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn', 'expired'].map(status => {
                    const count = applications.filter(app => app.status === status).length;
                    if (count === 0) return null;
                    const config = getStatusConfig(status);
                    const Icon = config.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => setApplicationStatusFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${applicationStatusFilter === status
                          ? config.color
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {config.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {applications
                        .filter(app => applicationStatusFilter === 'all' || app.status === applicationStatusFilter)
                        .map((app) => {
                          const job = app.job;
                          const statusConfig = getStatusConfig(app.status);
                          const StatusIcon = statusConfig.icon;
                          const expired = isJobExpired(job);

                          return (
                            <tr key={app.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {job?.image_url ? (
                                      <img src={job.image_url} alt={job.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <Briefcase className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">{job?.title}</div>
                                    {expired && (
                                      <div className="flex items-center gap-1 text-xs text-orange-600 mt-0.5">
                                        <AlertCircle className="w-3 h-3" />
                                        Expired
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-600">{job?.client_name}</div>
                                {app.viewed_by_client && (
                                  <div className="flex items-center gap-1 text-xs text-blue-600 mt-0.5">
                                    <Eye className="w-3 h-3" />
                                    Viewed
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {job?.budget_type === 'Hourly' ? `€${job?.budget_min}/hr` :
                                  job?.budget_type === 'Daily' ? `€${job?.budget_min}/day` :
                                    `€${job?.budget_min}${job?.budget_max && job?.budget_max > job?.budget_min ? ` - €${job?.budget_max}` : ''}`}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job?.location || 'Remote'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusConfig.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{getTimeAgo(app.applied_at)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => { setSelectedJob(job); setActiveTab('board'); }}
                                    className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                  >
                                    View
                                  </button>
                                  {app.status === 'pending' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await Application.update(app.id, { status: 'withdrawn' });
                                          setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'withdrawn' } : a));
                                          toastError('Withdrawn', 'Application withdrawn successfully');
                                        } catch (err) {
                                          console.error('Error withdrawing:', err);
                                        }
                                      }}
                                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      Withdraw
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="flex-1 overflow-y-auto p-6">
            {invitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Mail className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No invitations yet</p>
                <p className="text-sm mt-1">When clients invite you to jobs, they'll appear here</p>
              </div>
            ) : selectedInvitation ? (
              // Invitation Detail View
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => setSelectedInvitation(null)}
                  className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-black"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to invitations
                </button>

                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {selectedInvitation.job?.title || 'Job Invitation'}
                      </h1>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Invited {new Date(selectedInvitation.sent_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedInvitation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      selectedInvitation.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        selectedInvitation.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {selectedInvitation.status.charAt(0).toUpperCase() + selectedInvitation.status.slice(1)}
                    </div>
                  </div>

                  {/* Client Message */}
                  {selectedInvitation.message && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Message from Client</h3>
                      <p className="text-sm text-gray-700">{selectedInvitation.message}</p>
                    </div>
                  )}

                  {/* Job Details */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Job Details</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                        <div className="text-gray-700 leading-relaxed text-sm bg-gray-50 rounded-lg p-4">
                          {selectedInvitation.job?.description || 'No description available'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <MapPin className="w-4 h-4" />
                            {selectedInvitation.job?.location || 'Remote'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Budget</label>
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Euro className="w-4 h-4" />
                            €{selectedInvitation.job?.budget || 'Not specified'}
                          </div>
                        </div>
                      </div>

                      {selectedInvitation.job?.required_skills && selectedInvitation.job.required_skills.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Required Skills</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedInvitation.job.required_skills.map((skill, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedInvitation.status === 'pending' && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleDeclineInvitation(selectedInvitation)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-xl"
                      >
                        Decline Invitation
                      </Button>
                      <Button
                        onClick={() => handleAcceptInvitation(selectedInvitation)}
                        className="flex-1 bg-black text-white hover:bg-gray-800 font-semibold py-3 rounded-xl"
                      >
                        Accept & Apply
                      </Button>
                    </div>
                  )}

                  {selectedInvitation.status === 'accepted' && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-xl">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">You have accepted this invitation and applied for the job.</span>
                    </div>
                  )}

                  {selectedInvitation.status === 'declined' && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">You have declined this invitation.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Invitations List View
              <div className="max-w-6xl mx-auto">
                <div className="grid gap-4">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      onClick={() => setSelectedInvitation(invitation)}
                      className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {invitation.job?.title || 'Job Opportunity'}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              invitation.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                invitation.status === 'declined' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {invitation.job?.description || 'No description available'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(invitation.sent_at).toLocaleDateString()}
                            </div>
                            {invitation.job?.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {invitation.job.location}
                              </div>
                            )}
                            {invitation.job?.budget && (
                              <div className="flex items-center gap-1">
                                <Euro className="w-3.5 h-3.5" />
                                €{invitation.job.budget}
                              </div>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}