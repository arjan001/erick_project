import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Job, Project, Application } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { FileText, User, Calendar, MapPin, Check, X, Crown, Star, Briefcase, Eye, Bookmark, BookmarkCheck, Play, Download, Globe, Linkedin, Instagram, Youtube, Twitter, Award, Languages, Globe2, Building2, Mail, Phone, Tag, Clock, DollarSign, GraduationCap } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast';
import SubscriptionBadge from '@/modules/artist/components/SubscriptionBadge';

export default function ClientApplications() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [artistSubscriptions, setArtistSubscriptions] = useState({});
  const [artistProfiles, setArtistProfiles] = useState({});
  const [artistPortfolios, setArtistPortfolios] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

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
        const jobs = await Job.filter({ client_email: clientEmail });
        const jobApplicationsLists = await Promise.all(
          jobs.map(async (job) => {
            const jobApplications = await Application.filter({ job_id: job.id });
            return jobApplications.map(app => ({ ...app, job_title: job.title }));
          })
        );

        // Fetch projects posted by this client
        const projects = await Project.filter({ project_owner_email: clientEmail });
        const projectApplicationsLists = await Promise.all(
          projects.map(async (project) => {
            const projectApplications = await Application.filter({ project_id: project.id });
            return projectApplications.map(app => ({ ...app, job_title: project.project_type?.replace(/_/g, ' ') + ' project' }));
          })
        );

        const flatApplications = [...jobApplicationsLists.flat(), ...projectApplicationsLists.flat()];
        setApplications(flatApplications);

        // Fetch subscriptions, profiles, and portfolios for all artists who applied
        const artistEmails = [...new Set(flatApplications.map(app => app.artist_email))];
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
              const artists = await base44.entities.Artist.filter({ email });
              if (artists.length > 0) {
                profilesData[email] = artists[0];
              }

              // Fetch portfolio clips
              const clips = await base44.entities.PortfolioClip.filter({ 
                uploaded_by_type: 'artist',
                uploaded_by_id: artists[0]?.id,
                status: 'approved'
              });
              portfoliosData[email] = clips;
            } catch (err) {
              console.error('Error fetching artist data:', err);
            }
          })
        );
        
        setArtistSubscriptions(subscriptionsData);
        setArtistProfiles(profilesData);
        setArtistPortfolios(portfoliosData);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleAccept = async (applicationId) => {
    try {
      await Application.update(applicationId, { status: 'accepted' });
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: 'accepted' } : app
      ));
      success('Application Accepted', 'Application has been accepted');
    } catch (err) {
      console.error('Error accepting application:', err);
      toastError('Action Failed', 'Failed to accept application');
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await Application.update(applicationId, { status: 'rejected' });
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: 'rejected' } : app
      ));
      success('Application Rejected', 'Application has been rejected');
    } catch (err) {
      console.error('Error rejecting application:', err);
      toastError('Action Failed', 'Failed to reject application');
    }
  };

  const handleShortlist = async (applicationId) => {
    try {
      await Application.update(applicationId, { status: 'shortlisted' });
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: 'shortlisted' } : app
      ));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications</h1>
      <p className="text-gray-600 mb-8">Review applications for your job postings</p>

          {applications.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600">Applications will appear here when artists apply to your jobs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-900">{application.job_title}</h3>
                        {artistSubscriptions[application.artist_email] && (
                          <SubscriptionBadge 
                            subscription={artistSubscriptions[application.artist_email].subscription}
                            package={artistSubscriptions[application.artist_email].package}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {application.artist_email}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          application.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                      {application.cover_letter && (
                        <p className="text-sm text-gray-600 line-clamp-2">{application.cover_letter}</p>
                      )}
                    </div>
                    {application.status === 'applied' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleShortlist(application.id)}
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Bookmark className="w-4 h-4 mr-1" />
                          Shortlist
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleViewProfile(application)}
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    )}
                    {application.status === 'shortlisted' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(application.id)}
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(application.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

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