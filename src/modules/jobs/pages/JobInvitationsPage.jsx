import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job, JobInvitation, Application, ProjectOwner } from '@/lib/supabaseEntities';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Clock, CheckCircle, X, MessageCircle, Briefcase, User } from 'lucide-react';

export default function JobInvitations() {
  const [user, setUser] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { success, error } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchInvitations = async () => {
      try {
        // Fetch invitations where the artist is invited
        const allInvitations = await JobInvitation.filter({ 
          artist_email: user.email,
          status: 'pending'
        });

        const enrichedInvitations = await Promise.all(
          allInvitations.map(async (invitation) => {
            try {
              const job = await Job.get(invitation.job_id);
              const client = await ProjectOwner.filter({ email: invitation.client_email });
              return { 
                ...invitation, 
                job, 
                client: client[0] || null 
              };
            } catch (err) {
              console.error('Error fetching job details:', err);
              return { ...invitation, job: null, client: null };
            }
          })
        );

        setInvitations(enrichedInvitations.filter(inv => inv.job));
      } catch (err) {
        console.error('Error fetching invitations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [user]);

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await JobInvitation.update(invitationId, { status: 'accepted' });
      
      // Create application automatically
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (invitation) {
        await Application.create({
          job_id: invitation.job_id,
          artist_email: user.email,
          status: 'applied',
          applied_at: new Date().toISOString()
        });
      }

      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      success('Accepted', 'Invitation accepted and application submitted');
    } catch (err) {
      console.error('Error accepting invitation:', err);
      error('Failed', 'Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      await JobInvitation.update(invitationId, { status: 'declined' });
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      success('Declined', 'Invitation declined');
    } catch (err) {
      console.error('Error declining invitation:', err);
      error('Failed', 'Failed to decline invitation');
    }
  };

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      <main className="w-full h-full flex flex-col overflow-hidden bg-white">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Job Invitations</h1>
          <p className="text-sm text-gray-600 mt-1">
            {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-400 text-6xl mb-4">📬</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Pending Invitations</h2>
              <p className="text-gray-600 max-w-sm mx-auto">
                When clients invite you to apply for jobs, they'll appear here. Keep building your portfolio!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">{invitation.job.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{invitation.job.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {invitation.client?.company_name || invitation.client?.full_name || 'Client'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {invitation.job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          €{invitation.job.budget_min || invitation.job.budget}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(invitation.created_date).toLocaleDateString()}
                        </span>
                      </div>

                      {invitation.message && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700 italic">"{invitation.message}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      className="bg-green-600 text-white hover:bg-green-700 flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept & Apply
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleDeclineInvitation(invitation.id)}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}