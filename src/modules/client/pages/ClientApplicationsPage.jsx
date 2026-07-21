import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Job, Project, Application, Notification, Artist, Team } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, User, Calendar, MapPin, Check, X, Crown, Star, Briefcase, Eye, Bookmark, BookmarkCheck, Play, Download, Globe, Linkedin, Instagram, Youtube, Twitter, Award, Languages, Globe2, Building2, Mail, Phone, Tag, Clock, DollarSign, GraduationCap, Search, Filter, MessageSquare, ChevronDown, ChevronUp, TrendingUp, Users } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast';
import SubscriptionBadge from '@/modules/artist/components/SubscriptionBadge';
import ApplicationRankingEngine from '@/lib/applicationRankingEngine';

export default function ClientApplications() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [artistSubscriptions, setArtistSubscriptions] = useState({});
  const [artistProfiles, setArtistProfiles] = useState({});
  const [artistPortfolios, setArtistPortfolios] = useState({});
  const [teamProfiles, setTeamProfiles] = useState({});
  const [teamPortfolios, setTeamPortfolios] = useState({});
  const [jobs, setJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // 'artist', 'team', 'all'
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('score'); // 'score', 'date', 'name'
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Ranking
  const [rankedApplications, setRankedApplications] = useState([]);
  const [showBestFit, setShowBestFit] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(storedUser));

    const fetchApplications = async () => {
      try {
        const clientEmail = JSON.parse(storedUser).email;

        // Fetch jobs posted by this client
        const clientJobs = await Job.filter({ client_email: clientEmail });
        setJobs(clientJobs);
        
        const jobApplicationsLists = await Promise.all(
          clientJobs.map(async (job) => {
            const jobApplications = await Application.filter({ job_id: job.id });
            return jobApplications.map(app => ({ ...app, job_title: job.title, job_type: job.job_type, job_location: job.location, job_required_skills: job.required_skills }));
          })
        );

        // Fetch projects posted by this client
        const clientProjects = await Project.filter({ project_owner_email: clientEmail });
        setProjects(clientProjects);
        
        const projectApplicationsLists = await Promise.all(
          clientProjects.map(async (project) => {
            const projectApplications = await Application.filter({ project_id: project.id });
            return projectApplications.map(app => ({ ...app, job_title: project.title || project.project_type?.replace(/_/g, ' ') + ' project', job_type: project.project_type, job_location: project.location_city, job_required_skills: project.departments_needed }));
          })
        );

        const flatApplications = [...jobApplicationsLists.flat(), ...projectApplicationsLists.flat()];
        setApplications(flatApplications);

        // Fetch subscriptions, profiles, and portfolios for all artists who applied
        const artistEmails = [...new Set(flatApplications.map(app => app.artist_email).filter(Boolean))];
        const subscriptionsData = {};
        const profilesData = {};
        const portfoliosData = {};
        
        await Promise.all(
          artistEmails.map(async (email) => {
            try {
              // Fetch subscription
              const subs = await base44.entities.Subscription.filter({ user_email: email, status: 'active' });
              if (subs.length > 0) {
                const pkg = await base44.entities.SubscriptionPackage.get(subs[0].package_id);
                subscriptionsData[email] = { subscription: subs[0], package: pkg };
              }

              // Fetch artist profile
              const artists = await Artist.filter({ email });
              if (artists.length > 0) {
                profilesData[email] = artists[0];

                // Fetch portfolio clips
                const clips = await base44.entities.PortfolioClip.filter({ 
                  uploaded_by_type: 'artist',
                  uploaded_by_id: artists[0].id,
                  status: 'approved'
                });
                portfoliosData[email] = clips;
              }
            } catch (err) {
              console.error('Error fetching artist data:', err);
            }
          })
        );
        
        // Fetch team profiles for team applications
        const teamIds = [...new Set(flatApplications.map(app => app.team_id).filter(Boolean))];
        const teamProfilesData = {};
        const teamPortfoliosData = {};
        
        await Promise.all(
          teamIds.map(async (teamId) => {
            try {
              const teams = await base44.entities.Team.filter({ id: teamId });
              if (teams.length > 0) {
                teamProfilesData[teamId] = teams[0];

                // Fetch team portfolio clips
                const clips = await base44.entities.PortfolioClip.filter({ 
                  uploaded_by_type: 'team',
                  uploaded_by_id: teamId,
                  status: 'approved'
                });
                teamPortfoliosData[teamId] = clips;
              }
            } catch (err) {
              console.error('Error fetching team data:', err);
            }
          })
        );
        
        setArtistSubscriptions(subscriptionsData);
        setArtistProfiles(profilesData);
        setArtistPortfolios(portfoliosData);
        setTeamProfiles(teamProfilesData);
        setTeamPortfolios(teamPortfoliosData);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);
  
  // Rank applications using the ranking engine
  useEffect(() => {
    if (applications.length === 0) return;
    
    const rankingEngine = new ApplicationRankingEngine();
    const applicationsWithProfiles = applications.map(app => {
      let profile = null;
      let type = 'unknown';
      let portfolio = [];
      
      if (app.artist_email && artistProfiles[app.artist_email]) {
        profile = artistProfiles[app.artist_email];
        type = 'artist';
        portfolio = artistPortfolios[app.artist_email] || [];
      } else if (app.team_id && teamProfiles[app.team_id]) {
        profile = teamProfiles[app.team_id];
        type = 'team';
        portfolio = teamPortfolios[app.team_id] || [];
      }
      
      // Add portfolio to profile for scoring
      if (profile) {
        profile.portfolio_clips = portfolio;
      }
      
      return {
        application: app,
        profile,
        type,
        jobRequirements: {
          required_skills: app.job_required_skills || [],
          location: app.job_location,
          job_type: app.job_type
        }
      };
    });
    
    const ranked = rankingEngine.rankApplications(applicationsWithProfiles);
    setRankedApplications(ranked);
  }, [applications, artistProfiles, teamProfiles, artistPortfolios, teamPortfolios]);

  const handleAccept = async (applicationId) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      await Application.update(applicationId, { status: 'accepted' });
      setApplications(prev => prev.map(app =>
        app.id === applicationId ? { ...app, status: 'accepted' } : app
      ));

      // Send notification to applicant
      if (application?.artist_email) {
        await Notification.create({
          recipient_email: application.artist_email,
          type: 'job_status',
          title: 'Application Accepted',
          message: `Your application for "${application.job_title || application.project_title}" has been accepted!`,
          metadata: { job_title: application.job_title || application.project_title, application_id: applicationId },
          read: false
        });
      }

      success('Application Accepted', 'Application has been accepted');
    } catch (err) {
      console.error('Error accepting application:', err);
      toastError('Action Failed', 'Failed to accept application');
    }
  };

  const handleReject = async (applicationId) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      await Application.update(applicationId, { status: 'rejected' });
      setApplications(prev => prev.map(app =>
        app.id === applicationId ? { ...app, status: 'rejected' } : app
      ));

      // Send notification to applicant
      if (application?.artist_email) {
        await Notification.create({
          recipient_email: application.artist_email,
          type: 'job_status',
          title: 'Application Rejected',
          message: `Your application for "${application.job_title || application.project_title}" was not selected.`,
          metadata: { job_title: application.job_title || application.project_title, application_id: applicationId },
          read: false
        });
      }

      success('Application Rejected', 'Application has been rejected');
    } catch (err) {
      console.error('Error rejecting application:', err);
      toastError('Action Failed', 'Failed to reject application');
    }
  };

  const handleShortlist = async (applicationId) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      await Application.update(applicationId, { status: 'shortlisted' });
      setApplications(prev => prev.map(app =>
        app.id === applicationId ? { ...app, status: 'shortlisted' } : app
      ));

      // Send notification to applicant
      const recipientEmail = application?.artist_email || application?.team_email;
      if (recipientEmail) {
        await Notification.create({
          recipient_email: recipientEmail,
          type: 'job_status',
          title: 'Application Shortlisted',
          message: `Your application for "${application.job_title}" has been shortlisted.`,
          metadata: { job_title: application.job_title, application_id: applicationId },
          read: false
        });
      }

      success('Application Shortlisted', 'Application has been shortlisted');
    } catch (err) {
      console.error('Error shortlisting application:', err);
      toastError('Action Failed', 'Failed to shortlist application');
    }
  };

  const handleViewProfile = (application) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
  };

  const handleContact = (application) => {
    const recipientEmail = application.artist_email || application.team_email;
    if (recipientEmail) {
      navigate('/Messages', { state: { recipientEmail } });
    }
  };

  const handleGeneratePDF = async (application) => {
    setGeneratingPDF(true);
    try {
      const artist = artistProfiles[application.artist_email];
      const portfolio = artistPortfolios[application.artist_email] || [];
      
      // Create a simple HTML content for PDF
      const pdfContent = `
        <html>
          <head>
            <title>Applicant Profile - ${artist?.full_name || 'Unknown'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
              .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .email { color: #666; font-size: 14px; }
              .section { margin: 30px 0; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
              .info-item { margin: 10px 0; }
              .label { font-weight: bold; color: #666; }
              .value { margin-top: 5px; }
              .skills { display: flex; flex-wrap: wrap; gap: 8px; }
              .skill { background: #f0f0f0; padding: 5px 12px; border-radius: 15px; font-size: 12px; }
              .portfolio-item { margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
              .cover-letter { background: #f9f9f9; padding: 20px; border-radius: 8px; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="name">${artist?.full_name || 'Unknown'}</div>
              <div class="email">${application.artist_email}</div>
              <div style="margin-top: 10px; color: #666;">
                Applied for: ${application.job_title}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Contact Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="label">Location</div>
                  <div class="value">${[artist?.based_in_city, artist?.based_in_country].filter(Boolean).join(', ') || 'Not specified'}</div>
                </div>
                <div class="info-item">
                  <div class="label">Experience</div>
                  <div class="value">${artist?.years_of_experience || 0} years</div>
                </div>
                <div class="info-item">
                  <div class="label">Hourly Rate</div>
                  <div class="value">€${artist?.hourly_rate || 0}/hr</div>
                </div>
                <div class="info-item">
                  <div class="label">Availability</div>
                  <div class="value">${artist?.availability_status || 'Unknown'}</div>
                </div>
              </div>
            </div>

            ${artist?.bio ? `
            <div class="section">
              <div class="section-title">About</div>
              <div class="cover-letter">${artist.bio}</div>
            </div>
            ` : ''}

            ${artist?.roles?.length > 0 ? `
            <div class="section">
              <div class="section-title">Roles</div>
              <div class="skills">
                ${artist.roles.map(role => `<span class="skill">${role.replace(/_/g, ' ')}</span>`).join('')}
              </div>
            </div>
            ` : ''}

            ${artist?.skills_experience?.length > 0 ? `
            <div class="section">
              <div class="section-title">Skills</div>
              <div class="skills">
                ${artist.skills_experience.map(skill => `<span class="skill">${skill.skill}</span>`).join('')}
              </div>
            </div>
            ` : ''}

            ${artist?.past_clients?.length > 0 ? `
            <div class="section">
              <div class="section-title">Past Clients</div>
              <div class="skills">
                ${artist.past_clients.map(client => `<span class="skill">${client}</span>`).join('')}
              </div>
            </div>
            ` : ''}

            ${artist?.project_specialties?.length > 0 ? `
            <div class="section">
              <div class="section-title">Project Specialties</div>
              <div class="skills">
                ${artist.project_specialties.map(specialty => `<span class="skill">${specialty}</span>`).join('')}
              </div>
            </div>
            ` : ''}

            ${artist?.languages_spoken?.length > 0 ? `
            <div class="section">
              <div class="section-title">Languages</div>
              <div class="skills">
                ${artist.languages_spoken.map(lang => `<span class="skill">${lang}</span>`).join('')}
              </div>
            </div>
            ` : ''}

            ${artist?.countries_worked?.length > 0 ? `
            <div class="section">
              <div class="section-title">Countries Worked</div>
              <div class="skills">
                ${artist.countries_worked.map(country => `<span class="skill">${country}</span>`).join('')}
              </div>
            </div>
            ` : ''}

            ${portfolio.length > 0 ? `
            <div class="section">
              <div class="section-title">Portfolio Work (${portfolio.length})</div>
              ${portfolio.map(clip => `
                <div class="portfolio-item">
                  <div style="font-weight: bold; margin-bottom: 5px;">${clip.title}</div>
                  <div style="color: #666; font-size: 14px;">${clip.project_type || 'Project'}</div>
                  ${clip.roles && clip.roles.length > 0 ? `
                    <div class="skills" style="margin-top: 10px;">
                      ${clip.roles.map(role => `<span class="skill">${role}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${application.cover_letter ? `
            <div class="section">
              <div class="section-title">Cover Letter</div>
              <div class="cover-letter">${application.cover_letter}</div>
            </div>
            ` : ''}

            <div class="section">
              <div class="section-title">Application Details</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="label">Applied Date</div>
                  <div class="value">${new Date(application.applied_at).toLocaleDateString()}</div>
                </div>
                <div class="info-item">
                  <div class="label">Status</div>
                  <div class="value">${application.status}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      // Create a blob and download
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applicant-profile-${artist?.full_name?.replace(/\s+/g, '-').toLowerCase() || 'profile'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      success('PDF Generated', 'Applicant profile downloaded successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toastError('Generation Failed', 'Failed to generate PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = rankedApplications;

    // Filter by job
    if (selectedJob !== 'all') {
      filtered = filtered.filter(item => 
        item.application.job_title === selectedJob || 
        item.application.job_id === selectedJob
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.application.status === selectedStatus);
    }

    // Filter by type (artist/team)
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filter by minimum score
    if (minScore > 0) {
      filtered = filtered.filter(item => item.totalScore >= minScore);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const profile = item.profile;
        const app = item.application;
        return (
          profile?.full_name?.toLowerCase().includes(query) ||
          profile?.display_name?.toLowerCase().includes(query) ||
          app.artist_email?.toLowerCase().includes(query) ||
          app.job_title?.toLowerCase().includes(query) ||
          profile?.roles?.some(r => r.toLowerCase().includes(query)) ||
          profile?.skills_experience?.some(s => s.skill.toLowerCase().includes(query))
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'score') {
        comparison = a.totalScore - b.totalScore;
      } else if (sortBy === 'date') {
        comparison = new Date(a.application.applied_at) - new Date(b.application.applied_at);
      } else if (sortBy === 'name') {
        comparison = (a.profile?.full_name || '').localeCompare(b.profile?.full_name || '');
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [rankedApplications, selectedJob, selectedStatus, selectedType, minScore, searchQuery, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedApplications.length / itemsPerPage);
  const paginatedApplications = filteredAndSortedApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get best fit candidates
  const bestFitCandidates = useMemo(() => {
    return rankedApplications.filter(item => item.totalScore >= 75).slice(0, 5);
  }, [rankedApplications]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedJob, selectedStatus, selectedType, minScore, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-600">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications</h1>
          <p className="text-gray-500">Review and manage applications for your job postings</p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-16 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500">Applications will appear here when artists apply to your jobs</p>
          </div>
        ) : (
          <>
            {/* Best Fit Section */}
            {showBestFit && bestFitCandidates.length > 0 && (
              <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-semibold text-white">Best Fit Candidates</h2>
                    <span className="text-gray-300 text-sm">({bestFitCandidates.length} top matches)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBestFit(false)}
                    className="text-gray-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bestFitCandidates.map((item) => (
                    <div key={item.application.id} className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{item.profile?.full_name || 'Unknown'}</p>
                            <p className="text-gray-300 text-xs">{item.application.job_title}</p>
                          </div>
                        </div>
                        <div className="bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
                          {item.totalScore}%
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewProfile(item.application)}
                          className="flex-1 bg-white text-gray-900 hover:bg-gray-100 text-xs"
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleContact(item.application)}
                          variant="outline"
                          className="flex-1 border-white/30 text-white hover:bg-white/10 text-xs"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters Bar */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Job Filter */}
                <div className="flex gap-2">
                  <select
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Jobs</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.title || project.project_type?.replace(/_/g, ' ')}</option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  {/* Type Filter */}
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Types</option>
                    <option value="artist">Artists</option>
                    <option value="team">Teams</option>
                  </select>

                  {/* Score Filter */}
                  <select
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="0">All Scores</option>
                    <option value="50">50%+</option>
                    <option value="60">60%+</option>
                    <option value="70">70%+</option>
                    <option value="80">80%+</option>
                  </select>
                </div>

                {/* Sort Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'score') {
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                    } else {
                      setSortBy('score');
                      setSortOrder('desc');
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  {sortBy === 'score' && sortOrder === 'desc' ? <TrendingUp className="w-4 h-4" : <TrendingUp className="w-4 h-4 transform rotate-180" />}
                  Sort by Score
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
              <span>Total: {filteredAndSortedApplications.length} applications</span>
              <span>•</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>

            {/* Applications Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job/Project</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Match Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedApplications.map((item) => (
                    <tr key={item.application.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            {item.type === 'team' ? (
                              <Users className="w-5 h-5 text-gray-500" />
                            ) : (
                              <User className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.profile?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500 truncate">{item.application.artist_email || item.application.team_email}</p>
                            {artistSubscriptions[item.application.artist_email] && (
                              <SubscriptionBadge
                                subscription={artistSubscriptions[item.application.artist_email].subscription}
                                package={artistSubscriptions[item.application.artist_email].package}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{item.application.job_title}</p>
                        <p className="text-xs text-gray-500">{item.type === 'team' ? 'Team' : 'Artist'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          item.totalScore >= 75 ? 'bg-green-100 text-green-700' :
                          item.totalScore >= 60 ? 'bg-blue-100 text-blue-700' :
                          item.totalScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.totalScore}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          item.application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          item.application.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(item.application.applied_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewProfile(item.application)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleContact(item.application)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          {item.application.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleShortlist(item.application.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Bookmark className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAccept(item.application.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReject(item.application.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {item.application.status === 'shortlisted' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAccept(item.application.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReject(item.application.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {paginatedApplications.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  No applications match your filters
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded bg-white text-sm"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Applicant Profile</h2>
                <p className="text-sm text-gray-600">Application for: {selectedApplication.job_title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleGeneratePDF(selectedApplication)}
                  variant="outline"
                  disabled={generatingPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {generatingPDF ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button variant="ghost" onClick={() => setShowReviewModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {artistProfiles[selectedApplication.artist_email] && (
              <div className="p-6 space-y-8">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ring-4 ring-white shadow-lg">
                      {artistProfiles[selectedApplication.artist_email].profile_photo_url ? (
                        <img 
                          src={artistProfiles[selectedApplication.artist_email].profile_photo_url} 
                          alt={artistProfiles[selectedApplication.artist_email].full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {artistProfiles[selectedApplication.artist_email].full_name}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {artistProfiles[selectedApplication.artist_email].display_name || 'Creative Professional'}
                          </p>
                          {artistSubscriptions[selectedApplication.artist_email] && (
                            <div className="mt-2">
                              <SubscriptionBadge 
                                subscription={artistSubscriptions[selectedApplication.artist_email].subscription}
                                package={artistSubscriptions[selectedApplication.artist_email].package}
                              />
                            </div>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          artistProfiles[selectedApplication.artist_email].availability_status === 'available' ? 'bg-green-100 text-green-700' :
                          artistProfiles[selectedApplication.artist_email].availability_status === 'busy' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {artistProfiles[selectedApplication.artist_email].availability_status || 'Unknown'}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{[artistProfiles[selectedApplication.artist_email].based_in_city, artistProfiles[selectedApplication.artist_email].based_in_country].filter(Boolean).join(', ') || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{artistProfiles[selectedApplication.artist_email].years_of_experience || 0} years experience</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>€{artistProfiles[selectedApplication.artist_email].hourly_rate || 0}/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio & About */}
                {artistProfiles[selectedApplication.artist_email].bio && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      About
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{artistProfiles[selectedApplication.artist_email].bio}</p>
                    </div>
                  </div>
                )}

                {/* Skills & Expertise */}
                {(artistProfiles[selectedApplication.artist_email].roles?.length > 0 || artistProfiles[selectedApplication.artist_email].skills_experience?.length > 0) && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Skills & Expertise
                    </h4>
                    <div className="space-y-3">
                      {artistProfiles[selectedApplication.artist_email].roles?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Roles</p>
                          <div className="flex flex-wrap gap-2">
                            {artistProfiles[selectedApplication.artist_email].roles.map((role) => (
                              <span key={role} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                {role.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {artistProfiles[selectedApplication.artist_email].skills_experience?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {artistProfiles[selectedApplication.artist_email].skills_experience.map((skill) => (
                              <span key={skill.skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {skill.skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Past Clients */}
                {artistProfiles[selectedApplication.artist_email].past_clients?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Past Clients
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {artistProfiles[selectedApplication.artist_email].past_clients.map((client) => (
                          <span key={client} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
                            {client}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Specialties */}
                {artistProfiles[selectedApplication.artist_email].project_specialties?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Project Specialties
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {artistProfiles[selectedApplication.artist_email].project_specialties.map((specialty) => (
                        <span key={specialty} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages & Locations */}
                <div className="grid grid-cols-2 gap-6">
                  {artistProfiles[selectedApplication.artist_email].languages_spoken?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Languages className="w-5 h-5" />
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {artistProfiles[selectedApplication.artist_email].languages_spoken.map((lang) => (
                          <span key={lang} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {artistProfiles[selectedApplication.artist_email].countries_worked?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Globe2 className="w-5 h-5" />
                        Countries Worked
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {artistProfiles[selectedApplication.artist_email].countries_worked.map((country) => (
                          <span key={country} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Media */}
                {(artistProfiles[selectedApplication.artist_email].website || artistProfiles[selectedApplication.artist_email].linkedin || artistProfiles[selectedApplication.artist_email].instagram || artistProfiles[selectedApplication.artist_email].youtube || artistProfiles[selectedApplication.artist_email].twitter) && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Online Presence
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {artistProfiles[selectedApplication.artist_email].website && (
                        <a href={artistProfiles[selectedApplication.artist_email].website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                          <Globe className="w-4 h-4" />
                          <span className="text-sm font-medium">Website</span>
                        </a>
                      )}
                      {artistProfiles[selectedApplication.artist_email].linkedin && (
                        <a href={artistProfiles[selectedApplication.artist_email].linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                          <Linkedin className="w-4 h-4" />
                          <span className="text-sm font-medium">LinkedIn</span>
                        </a>
                      )}
                      {artistProfiles[selectedApplication.artist_email].instagram && (
                        <a href={artistProfiles[selectedApplication.artist_email].instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors">
                          <Instagram className="w-4 h-4" />
                          <span className="text-sm font-medium">Instagram</span>
                        </a>
                      )}
                      {artistProfiles[selectedApplication.artist_email].youtube && (
                        <a href={artistProfiles[selectedApplication.artist_email].youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                          <Youtube className="w-4 h-4" />
                          <span className="text-sm font-medium">YouTube</span>
                        </a>
                      )}
                      {artistProfiles[selectedApplication.artist_email].twitter && (
                        <a href={artistProfiles[selectedApplication.artist_email].twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors">
                          <Twitter className="w-4 h-4" />
                          <span className="text-sm font-medium">Twitter</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Portfolio Work */}
                {artistPortfolios[selectedApplication.artist_email]?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Portfolio Work ({artistPortfolios[selectedApplication.artist_email].length})
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {artistPortfolios[selectedApplication.artist_email].map((clip) => (
                        <div key={clip.id} className="bg-gray-50 rounded-lg overflow-hidden">
                          <div className="aspect-video bg-gray-300 flex items-center justify-center relative">
                            {clip.thumbnail_url ? (
                              <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                            ) : (
                              <Play className="w-8 h-8 text-gray-500" />
                            )}
                            {clip.video_embed_url && (
                              <a href={clip.video_embed_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                                <Play className="w-12 h-12 text-white" />
                              </a>
                            )}
                          </div>
                          <div className="p-3">
                            <h5 className="font-medium text-gray-900 text-sm">{clip.title}</h5>
                            <p className="text-xs text-gray-600">{clip.project_type}</p>
                            {clip.roles && clip.roles.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {clip.roles.slice(0, 2).map((role) => (
                                  <span key={role} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                    {role}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {selectedApplication.cover_letter && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Cover Letter
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedApplication.cover_letter}</p>
                    </div>
                  </div>
                )}

                {/* Application Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Application Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Applied Date</p>
                      <p className="font-medium text-gray-900">{new Date(selectedApplication.applied_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className={`font-medium ${
                        selectedApplication.status === 'accepted' ? 'text-green-600' :
                        selectedApplication.status === 'rejected' ? 'text-red-600' :
                        selectedApplication.status === 'shortlisted' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>
                        {selectedApplication.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-white">
                  {selectedApplication.status === 'applied' && (
                    <>
                      <Button
                        onClick={() => {
                          handleShortlist(selectedApplication.id);
                          setShowReviewModal(false);
                        }}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Bookmark className="w-4 h-4 mr-2" />
                        Shortlist
                      </Button>
                      <Button
                        onClick={() => {
                          handleAccept(selectedApplication.id);
                          setShowReviewModal(false);
                        }}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                    </>
                  )}
                  {selectedApplication.status === 'shortlisted' && (
                    <>
                      <Button
                        onClick={() => {
                          handleAccept(selectedApplication.id);
                          setShowReviewModal(false);
                        }}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => {
                          handleReject(selectedApplication.id);
                          setShowReviewModal(false);
                        }}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}