import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job, Connection, Endorsement, Testimonial } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Award, ThumbsUp, MessageCircle, TrendingUp, Clock, Filter, RefreshCw } from 'lucide-react';

export default function ActivityFeedPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, jobs, connections, endorsements, testimonials

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

    const fetchActivities = async () => {
      try {
        const allActivities = [];
        
        // Fetch jobs posted by connections
        const jobs = await Job.filter({ status: 'open' });
        jobs.forEach(job => {
          allActivities.push({
            id: `job-${job.id}`,
            type: 'job',
            title: 'New Job Posted',
            message: `${job.client_email} posted a new job: ${job.title}`,
            actor: job.client_email,
            actor_name: job.client_email.split('@')[0],
            created_date: job.created_date,
            link: `/jobs/${job.id}`,
            icon: <Briefcase className="w-5 h-5 text-blue-600" />
          });
        });

        // Fetch new connections
        const connections = await Connection.filter({ status: 'accepted' });
        connections.forEach(conn => {
          if (conn.recipient_email === user.email || conn.requester_email === user.email) {
            const otherEmail = conn.recipient_email === user.email ? conn.requester_email : conn.recipient_email;
            allActivities.push({
              id: `connection-${conn.id}`,
              type: 'connection',
              title: 'New Connection',
              message: `You connected with ${otherEmail}`,
              actor: otherEmail,
              actor_name: otherEmail.split('@')[0],
              created_date: conn.updated_date || conn.created_date,
              link: '/network',
              icon: <Users className="w-5 h-5 text-green-600" />
            });
          }
        });

        // Fetch endorsements
        const endorsements = await Endorsement.list();
        endorsements.forEach(endorsement => {
          if (endorsement.endorsed_email === user.email || endorsement.endorser_email === user.email) {
            const isReceived = endorsement.endorsed_email === user.email;
            allActivities.push({
              id: `endorsement-${endorsement.id}`,
              type: 'endorsement',
              title: isReceived ? 'Endorsement Received' : 'Endorsement Given',
              message: isReceived 
                ? `${endorsement.endorser_name} endorsed you for ${endorsement.skill}`
                : `You endorsed ${endorsement.endorsed_name} for ${endorsement.skill}`,
              actor: isReceived ? endorsement.endorser_email : endorsement.endorsed_email,
              actor_name: isReceived ? endorsement.endorser_name : endorsement.endorsed_name,
              created_date: endorsement.created_date,
              link: '/endorsements',
              icon: <Award className="w-5 h-5 text-yellow-600" />
            });
          }
        });

        // Fetch testimonials
        const testimonials = await Testimonial.list();
        testimonials.forEach(testimonial => {
          if (testimonial.recipient_email === user.email || testimonial.author_email === user.email) {
            const isReceived = testimonial.recipient_email === user.email;
            allActivities.push({
              id: `testimonial-${testimonial.id}`,
              type: 'testimonial',
              title: isReceived ? 'Testimonial Received' : 'Testimonial Written',
              message: isReceived
                ? `${testimonial.author_name} wrote a testimonial about working with you`
                : `You wrote a testimonial for ${testimonial.recipient_name}`,
              actor: isReceived ? testimonial.author_email : testimonial.recipient_email,
              actor_name: isReceived ? testimonial.author_name : testimonial.recipient_name,
              created_date: testimonial.created_date,
              link: '/testimonials',
              icon: <ThumbsUp className="w-5 h-5 text-purple-600" />
            });
          }
        });

        // Sort by created_date descending
        const sorted = allActivities.sort((a, b) => 
          new Date(b.created_date) - new Date(a.created_date)
        );
        
        setActivities(sorted);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const handleRefresh = () => {
    setLoading(true);
    // Re-fetch activities
    const fetchActivities = async () => {
      try {
        const allActivities = [];
        
        const jobs = await Job.filter({ status: 'open' });
        jobs.forEach(job => {
          allActivities.push({
            id: `job-${job.id}`,
            type: 'job',
            title: 'New Job Posted',
            message: `${job.client_email} posted a new job: ${job.title}`,
            actor: job.client_email,
            actor_name: job.client_email.split('@')[0],
            created_date: job.created_date,
            link: `/jobs/${job.id}`,
            icon: <Briefcase className="w-5 h-5 text-blue-600" />
          });
        });

        const connections = await Connection.filter({ status: 'accepted' });
        connections.forEach(conn => {
          if (conn.recipient_email === user.email || conn.requester_email === user.email) {
            const otherEmail = conn.recipient_email === user.email ? conn.requester_email : conn.recipient_email;
            allActivities.push({
              id: `connection-${conn.id}`,
              type: 'connection',
              title: 'New Connection',
              message: `You connected with ${otherEmail}`,
              actor: otherEmail,
              actor_name: otherEmail.split('@')[0],
              created_date: conn.updated_date || conn.created_date,
              link: '/network',
              icon: <Users className="w-5 h-5 text-green-600" />
            });
          }
        });

        const endorsements = await Endorsement.list();
        endorsements.forEach(endorsement => {
          if (endorsement.endorsed_email === user.email || endorsement.endorser_email === user.email) {
            const isReceived = endorsement.endorsed_email === user.email;
            allActivities.push({
              id: `endorsement-${endorsement.id}`,
              type: 'endorsement',
              title: isReceived ? 'Endorsement Received' : 'Endorsement Given',
              message: isReceived 
                ? `${endorsement.endorser_name} endorsed you for ${endorsement.skill}`
                : `You endorsed ${endorsement.endorsed_name} for ${endorsement.skill}`,
              actor: isReceived ? endorsement.endorser_email : endorsement.endorsed_email,
              actor_name: isReceived ? endorsement.endorser_name : endorsement.endorsed_name,
              created_date: endorsement.created_date,
              link: '/endorsements',
              icon: <Award className="w-5 h-5 text-yellow-600" />
            });
          }
        });

        const testimonials = await Testimonial.list();
        testimonials.forEach(testimonial => {
          if (testimonial.recipient_email === user.email || testimonial.author_email === user.email) {
            const isReceived = testimonial.recipient_email === user.email;
            allActivities.push({
              id: `testimonial-${testimonial.id}`,
              type: 'testimonial',
              title: isReceived ? 'Testimonial Received' : 'Testimonial Written',
              message: isReceived
                ? `${testimonial.author_name} wrote a testimonial about working with you`
                : `You wrote a testimonial for ${testimonial.recipient_name}`,
              actor: isReceived ? testimonial.author_email : testimonial.recipient_email,
              actor_name: isReceived ? testimonial.author_name : testimonial.recipient_name,
              created_date: testimonial.created_date,
              link: '/testimonials',
              icon: <ThumbsUp className="w-5 h-5 text-purple-600" />
            });
          }
        });

        const sorted = allActivities.sort((a, b) => 
          new Date(b.created_date) - new Date(a.created_date)
        );
        
        setActivities(sorted);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
          <p className="text-sm text-gray-600 mt-1">
            Stay updated with your network
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            >
              <option value="all">All Activity</option>
                  <option value="job">Jobs</option>
                  <option value="connection">Connections</option>
                  <option value="endorsement">Endorsements</option>
                  <option value="testimonial">Testimonials</option>
                </select>
              </div>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

        <div className="space-y-4 max-w-3xl">
          {filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Activity Yet</h2>
              <p className="text-gray-600 max-w-sm mx-auto">
                {filter === 'all' 
                  ? "Start connecting with people to see their activity here."
                  : `No ${filter} activity to show.`
                }
              </p>
            </div>
          ) : (
            <>
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {activity.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{activity.message}</p>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(activity.created_date)}
                          </p>
                        </div>
                        {activity.link && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(activity.link)}
                            className="ml-4"
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
    </>
  );
}