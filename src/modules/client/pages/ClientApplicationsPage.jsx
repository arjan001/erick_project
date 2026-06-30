import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ClientSidebar from '@/components/ClientSidebar';
import { Button } from '@/components/ui/button';
import { FileText, User, Calendar, MapPin, Check, X, Crown, Star, Briefcase, Eye, Bookmark, BookmarkCheck, Play } from 'lucide-react';
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

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    setUser(JSON.parse(storedUser));

    const fetchApplications = async () => {
      try {
        // Fetch jobs posted by this client
        const jobs = await base44.entities.Job.filter({ client_email: JSON.parse(storedUser).email });
        
        // Fetch applications for these jobs
        const allApplications = await Promise.all(
          jobs.map(async (job) => {
            const jobApplications = await base44.entities.Application.filter({ job_id: job.id });
            return jobApplications.map(app => ({ ...app, job_title: job.title }));
          })
        );
        
        const flatApplications = allApplications.flat();
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
      await base44.entities.Application.update(applicationId, { status: 'accepted' });
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
      await base44.entities.Application.update(applicationId, { status: 'rejected' });
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
      await base44.entities.Application.update(applicationId, { status: 'shortlisted' });
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

  if (loading) {
    return (
      <div className="h-screen bg-white">
        <ClientSidebar />
        <main className="w-full h-full flex items-center justify-center pl-20">
          <div className="text-gray-600">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <ClientSidebar />
      <main className="w-full h-full flex flex-col overflow-y-auto bg-white pl-20">
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
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Review Artist Application</h2>
              <Button variant="ghost" onClick={() => setShowReviewModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {artistProfiles[selectedApplication.artist_email] && (
              <div className="space-y-6">
                {/* Artist Profile */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {artistProfiles[selectedApplication.artist_email].full_name}
                      </h3>
                      <p className="text-gray-600">
                        {artistProfiles[selectedApplication.artist_email].role?.replace(/_/g, ', ') || 'Creative Professional'}
                      </p>
                      {artistSubscriptions[selectedApplication.artist_email] && (
                        <SubscriptionBadge 
                          subscription={artistSubscriptions[selectedApplication.artist_email].subscription}
                          package={artistSubscriptions[selectedApplication.artist_email].package}
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{artistProfiles[selectedApplication.artist_email].based_in_city || 'Location'}, {artistProfiles[selectedApplication.artist_email].based_in_country || 'Country'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span>{artistProfiles[selectedApplication.artist_email].years_of_experience || 0} years experience</span>
                    </div>
                  </div>
                  {artistProfiles[selectedApplication.artist_email].bio && (
                    <p className="mt-4 text-gray-700">{artistProfiles[selectedApplication.artist_email].bio}</p>
                  )}
                </div>

                {/* Portfolio */}
                {artistPortfolios[selectedApplication.artist_email]?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Portfolio Work</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {artistPortfolios[selectedApplication.artist_email].map((clip) => (
                        <div key={clip.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="aspect-video bg-gray-300 rounded mb-2 flex items-center justify-center">
                            <Play className="w-8 h-8 text-gray-500" />
                          </div>
                          <h5 className="font-medium text-gray-900">{clip.title}</h5>
                          <p className="text-sm text-gray-600">{clip.project_type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {selectedApplication.cover_letter && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Cover Letter</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedApplication.cover_letter}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t">
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