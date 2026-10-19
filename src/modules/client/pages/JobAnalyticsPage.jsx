import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Job, Application } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Eye, MousePointer, Users, Briefcase, ChevronRight, X, Send, 
  CheckCircle, XCircle, Clock, TrendingUp, Filter, Search,
  MessageSquare, Download, Calendar, MapPin, Euro, Star
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

export default function JobAnalyticsPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [selectedApplicants, setSelectedApplicants] = useState([])
  const [messageText, setMessageText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/SignIn')
      return
    }
    fetchJobs()
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (selectedJob) {
      fetchApplications(selectedJob.id)
      fetchAnalytics(selectedJob.id)
    }
  }, [selectedJob])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const jobData = await Job.filter({ client_id: authUser?.id })
      setJobs(jobData || [])
      if (jobData && jobData.length > 0) {
        setSelectedJob(jobData[0])
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
      toastError('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async (jobId) => {
    try {
      const appData = await Application.filter({ job_id: jobId })
      setApplications(appData || [])
    } catch (err) {
      console.error('Error fetching applications:', err)
    }
  }

  const fetchAnalytics = async (jobId) => {
    try {
      const { data, error } = await supabase
        .from('job_analytics')
        .select('*')
        .eq('job_id', jobId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching analytics:', error)
      }
      
      setAnalytics(data || {
        view_count: 0,
        click_count: 0,
        application_count: applications.length,
        unique_viewers: 0
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
    }
  }

  const handleShortlist = async (applicationId) => {
    try {
      await Application.update(applicationId, { 
        status: 'shortlisted',
        shortlisted_at: new Date().toISOString(),
        shortlisted_by: authUser?.id
      })
      success('Application shortlisted')
      fetchApplications(selectedJob.id)
    } catch (err) {
      console.error('Error shortlisting:', err)
      toastError('Failed to shortlist application')
    }
  }

  const handleReject = async (applicationId) => {
    try {
      await Application.update(applicationId, { status: 'rejected' })
      success('Application rejected')
      fetchApplications(selectedJob.id)
    } catch (err) {
      console.error('Error rejecting:', err)
      toastError('Failed to reject application')
    }
  }

  const handleHire = async (applicationId) => {
    try {
      await Application.update(applicationId, { status: 'hired' })
      success('Application marked as hired')
      fetchApplications(selectedJob.id)
    } catch (err) {
      console.error('Error hiring:', err)
      toastError('Failed to mark as hired')
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || selectedApplicants.length === 0) return

    try {
      for (const application of selectedApplicants) {
        await supabase.from('application_messages').insert({
          application_id: application.id,
          sender_id: authUser?.id,
          message: messageText,
          is_bulk: selectedApplicants.length > 1
        })
      }
      success('Message sent successfully')
      setMessageText('')
      setShowMessageModal(false)
      setSelectedApplicants([])
    } catch (err) {
      console.error('Error sending message:', err)
      toastError('Failed to send message')
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesSearch = !searchQuery || 
      app.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant_email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    viewed: applications.filter(a => a.status === 'viewed').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    hired: applications.filter(a => a.status === 'hired').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Analytics</h1>
              <p className="text-sm text-gray-500">Track your job postings and manage applications</p>
            </div>
            <Button onClick={() => navigate('/ClientPostProject')} className="bg-purple-600 hover:bg-purple-700">
              <Briefcase className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Jobs List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Jobs</h2>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No jobs posted yet</p>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-left p-4 rounded-xl transition-colors ${
                        selectedJob?.id === job.id
                          ? 'bg-purple-100 border-2 border-purple-600'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 text-sm mb-1">{job.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full ${
                          job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {job.status || 'Open'}
                        </span>
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedJob ? (
              <>
                {/* Job Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-500">Views</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analytics.view_count || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <MousePointer className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-500">Clicks</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analytics.click_count || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-500">Applications</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analytics.application_count || applications.length}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-gray-500">Unique Viewers</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analytics.unique_viewers || 0}</p>
                  </div>
                </div>

                {/* Applications Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Applications</h2>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search applicants..."
                          className="pl-10 w-64"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="viewed">Viewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Tabs */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                          statusFilter === status
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                      </button>
                    ))}
                  </div>

                  {/* Applications List */}
                  {filteredApplications.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No applications found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredApplications.map((application) => (
                        <div key={application.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {application.applicant_name || 'Applicant'}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  application.status === 'viewed' ? 'bg-blue-100 text-blue-700' :
                                  application.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                                  application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  application.status === 'hired' ? 'bg-purple-100 text-purple-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {application.status || 'Pending'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{application.applicant_email || 'No email'}</p>
                              {application.role_applied_for && (
                                <p className="text-sm text-gray-500">Role: {application.role_applied_for}</p>
                              )}
                              {application.cover_letter && (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{application.cover_letter}</p>
                              )}
                              {application.audition_file_url && (
                                <a
                                  href={application.audition_file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-2"
                                >
                                  <Download className="w-4 h-4" />
                                  View Audition File
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedApplicants.includes(application.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedApplicants([...selectedApplicants, application.id])
                                  } else {
                                    setSelectedApplicants(selectedApplicants.filter(id => id !== application.id))
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleShortlist(application.id)}
                                disabled={application.status === 'shortlisted' || application.status === 'hired'}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(application.id)}
                                disabled={application.status === 'rejected' || application.status === 'hired'}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleHire(application.id)}
                                disabled={application.status === 'hired'}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Hire
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bulk Actions */}
                  {selectedApplicants.length > 0 && (
                    <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                      <span className="text-sm text-gray-600">{selectedApplicants.length} selected</span>
                      <Button
                        onClick={() => setShowMessageModal(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedApplicants([])}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Job Selected</h2>
                <p className="text-gray-500 mb-4">Select a job from the sidebar to view its analytics</p>
                <Button onClick={() => navigate('/ClientPostProject')} className="bg-purple-600 hover:bg-purple-700">
                  Post Your First Job
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Send Message</h3>
              <button onClick={() => setShowMessageModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Sending to {selectedApplicants.length} applicant{selectedApplicants.length > 1 ? 's' : ''}
            </p>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700">
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
