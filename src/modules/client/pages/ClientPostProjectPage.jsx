import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ClientSidebar from '@/components/ClientSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast';

export default function ClientPostProject() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    project_type: 'commercial',
    budget: '',
    location: '',
    timeline_start: '',
    timeline_end: '',
    requirements: ''
  });

  React.useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const budget = parseFloat(projectForm.budget) || 0;
      const budget_range =
        budget <= 0 ? 'not_disclosed' :
        budget < 10000 ? 'under_10k' :
        budget < 25000 ? '10k_25k' :
        budget < 50000 ? '25k_50k' :
        budget < 100000 ? '50k_100k' :
        budget < 250000 ? '100k_250k' : '250k_plus';

      const notes = [projectForm.title ? `${projectForm.title}\n` : '', projectForm.description, projectForm.requirements ? `\nRequirements: ${projectForm.requirements}` : ''].join('');

      await base44.entities.Project.create({
        project_owner_email: user.email,
        project_owner_name: user.full_name,
        project_type: projectForm.project_type,
        location_city: projectForm.location,
        timeline_start: projectForm.timeline_start || undefined,
        timeline_deadline: projectForm.timeline_end || undefined,
        budget_range,
        notes,
        status: 'submitted'
      });

      success('Project Posted', 'Your project has been submitted successfully');
      navigate(createPageUrl('ClientDashboard'));
    } catch (err) {
      console.error('Error posting project:', err);
      toastError('Posting Failed', 'Failed to post project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white">
      <ClientSidebar />
      <main className="w-full h-full flex flex-col overflow-y-auto bg-white pl-20">
        <div className="p-6 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('ClientDashboard'))}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Project</h1>
          <p className="text-gray-600 mb-8">Share your project details to connect with talented creators</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Project Title</label>
              <Input
                type="text"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                placeholder="Enter project title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Project Type</label>
              <select
                value={projectForm.project_type}
                onChange={(e) => setProjectForm({ ...projectForm, project_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="commercial">Commercial</option>
                <option value="short_film">Short Film</option>
                <option value="film">Feature Film</option>
                <option value="music_video">Music Video</option>
                <option value="documentary">Documentary</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Describe your project in detail"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Budget</label>
                <Input
                  type="number"
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  placeholder="Enter budget"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
                <Input
                  type="text"
                  value={projectForm.location}
                  onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                  placeholder="Project location"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={projectForm.timeline_start}
                  onChange={(e) => setProjectForm({ ...projectForm, timeline_start: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">End Date</label>
                <Input
                  type="date"
                  value={projectForm.timeline_end}
                  onChange={(e) => setProjectForm({ ...projectForm, timeline_end: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Requirements</label>
              <textarea
                value={projectForm.requirements}
                onChange={(e) => setProjectForm({ ...projectForm, requirements: e.target.value })}
                placeholder="Specific requirements for the project"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Project'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(createPageUrl('ClientDashboard'))}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}