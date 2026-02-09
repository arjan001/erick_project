import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign } from 'lucide-react';

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    
    const fetchJobs = async () => {
      try {
        const allJobs = await base44.entities.Job.list();
        setJobs(allJobs.filter(j => j.status === 'open'));
        if (allJobs.length > 0) setSelectedJob(allJobs[0]);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleApply = async () => {
    if (!selectedJob || !user) return;
    
    try {
      await base44.entities.Application.create({
        job_id: selectedJob.id,
        artist_email: user.email,
        status: 'applied',
        applied_at: new Date().toISOString()
      });
      alert('Application submitted!');
    } catch (err) {
      console.error('Error applying:', err);
    }
  };

  if (!user || loading) return null;

  return (
    <div className="h-screen bg-white">
      <ArtistSidebar />
      
      <main className="w-full h-full flex overflow-hidden pl-20">
        {/* Job List */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-4">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedJob?.id === job.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-black">{job.client_name}</div>
                    <div className="text-xs text-gray-600">{job.client_name}</div>
                  </div>
                </div>
                
                <h3 className="font-bold text-black mb-2">{job.title}</h3>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{job.short_description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {job.posted_at ? '3m ago' : 'Recently'}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {job.budget_min}-${job.budget_max}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Job Detail */}
        <div className="w-1/2 overflow-y-auto">
          {selectedJob ? (
            <div className="p-8">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0" />
                <div>
                  <h1 className="text-3xl font-bold text-black mb-1">{selectedJob.title}</h1>
                  <p className="text-gray-600">{selectedJob.client_name}</p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <h2 className="text-sm font-bold text-gray-600 uppercase mb-2">Description</h2>
                  <p className="text-gray-800 leading-relaxed">{selectedJob.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200">
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-bold mb-1">Budget</div>
                    <div className="text-lg font-bold text-black">
                      ${selectedJob.budget_min} - ${selectedJob.budget_max}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{selectedJob.budget_type}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-bold mb-1">Location</div>
                    <div className="text-lg font-bold text-black">{selectedJob.location}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 uppercase font-bold mb-1">Role</div>
                    <div className="text-lg font-bold text-black">
                      {selectedJob.roles_needed?.[0] || 'Various'}
                    </div>
                  </div>
                </div>

                {selectedJob.skills_required && selectedJob.skills_required.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-gray-600 uppercase mb-3">Skills Required</h2>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills_required.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleApply}
                className="w-full bg-black text-white hover:bg-gray-800 font-bold py-3"
              >
                Apply Now
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              Select a job to view details
            </div>
          )}
        </div>
      </main>
    </div>
  );
}