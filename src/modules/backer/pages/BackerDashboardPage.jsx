import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Backer, BackedProject, Deal } from '@/lib/supabaseEntities';
import DashboardStatCard from '@/components/DashboardStatCard';
import { DollarSign, TrendingUp, Film, Plus, Eye, Edit2, X, ArrowUpRight, ArrowDownRight, Target, Zap, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';
import { confirmDialog } from '@/lib/sweetAlert';
import InviteCodeCard from '@/components/InviteCodeCard';

export default function BackerDashboardPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [backer, setBacker] = useState(null);
  const [backedProjects, setBackedProjects] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    project_title: '',
    investment_amount: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchData(parsedUser);
  }, []);

  const fetchData = async (currentUser) => {
    try {
      const backers = await Backer.filter({ contact_email: currentUser.email });
      const currentBacker = backers?.[0] || null;
      setBacker(currentBacker);

      const [projects, dealRows] = await Promise.all([
        BackedProject.filter({ backer_email: currentUser.email }, '-investment_date'),
        Deal.filter({ backer_email: currentUser.email })
      ]);
      setBackedProjects(projects || []);
      setDeals(dealRows || []);
    } catch (error) {
      console.error('Error fetching backer data:', error);
      toastError('Load Failed', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackedProject = async () => {
    if (!projectForm.project_title || !projectForm.investment_amount) return;
    try {
      await BackedProject.create({
        backer_email: user.email,
        backer_id: backer?.id,
        project_title: projectForm.project_title,
        investment_amount: parseFloat(projectForm.investment_amount) || 0,
        status: projectForm.status,
        notes: projectForm.notes,
        investment_date: new Date().toISOString()
      });
      if (backer) {
        await Backer.update(backer.id, {
          total_invested: (backer.total_invested || 0) + (parseFloat(projectForm.investment_amount) || 0),
          investment_count: (backer.investment_count || 0) + 1
        });
      }
      setShowModal(false);
      setProjectForm({ project_title: '', investment_amount: '', status: 'active', notes: '' });
      success('Project Backed', 'Project added to your portfolio');
      fetchData(user);
    } catch (err) {
      console.error('Error creating backed project:', err);
      toastError('Creation Failed', 'Failed to back project');
    }
  };

  const handleUpdateBackedProject = async () => {
    if (!editingProject) return;
    try {
      await BackedProject.update(editingProject.id, {
        project_title: projectForm.project_title,
        investment_amount: parseFloat(projectForm.investment_amount) || 0,
        status: projectForm.status,
        notes: projectForm.notes
      });
      setShowModal(false);
      setEditingProject(null);
      setProjectForm({ project_title: '', investment_amount: '', status: 'active', notes: '' });
      success('Project Updated', 'Investment details updated');
      fetchData(user);
    } catch (err) {
      console.error('Error updating backed project:', err);
      toastError('Update Failed', 'Failed to update project');
    }
  };

  const handleDeleteBackedProject = async (project) => {
    if (!(await confirmDialog('Remove this investment?', 'This action cannot be undone'))) return;
    try {
      await BackedProject.delete(project.id);
      if (backer) {
        await Backer.update(backer.id, {
          total_invested: Math.max(0, (backer.total_invested || 0) - (project.investment_amount || 0)),
          investment_count: Math.max(0, (backer.investment_count || 0) - 1)
        });
      }
      success('Project Removed', 'Project removed from portfolio');
      fetchData(user);
    } catch (err) {
      console.error('Error deleting backed project:', err);
      toastError('Deletion Failed', 'Failed to remove project');
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setProjectForm({
        project_title: project.project_title || '',
        investment_amount: project.investment_amount || '',
        status: project.status || 'active',
        notes: project.notes || ''
      });
    } else {
      setEditingProject(null);
      setProjectForm({ project_title: '', investment_amount: '', status: 'active', notes: '' });
    }
    setShowModal(true);
  };

  // Calculate dynamic stats — purely from real data, no placeholders
  const totalInvested = backedProjects.reduce((sum, p) => sum + (p.investment_amount || 0), 0);
  const totalExpectedROI = backedProjects.reduce((sum, p) => sum + (p.expected_roi || 0), 0);
  const totalROI = totalExpectedROI - totalInvested;
  const roiPercentage = totalInvested > 0 ? ((totalROI / totalInvested) * 100).toFixed(1) : 0;
  const activeInvestments = backedProjects.filter(p => p.status === 'active').length;
  const completedInvestments = backedProjects.filter(p => p.status === 'completed').length;
  const averageDealSize = backedProjects.length > 0 ? (totalInvested / backedProjects.length).toFixed(0) : 0;
  const activeDeals = deals.filter(d => d.status === 'active').length;

  if (loading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Investor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {backer?.organization_name || user?.full_name || 'Investor'}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardStatCard icon={DollarSign} label={`${backedProjects.length} investments`} value={`$${totalInvested.toLocaleString()}`} iconBg="bg-green-50" iconColor="text-green-600" />
          <DashboardStatCard icon={totalROI >= 0 ? ArrowUpRight : ArrowDownRight} label={`${roiPercentage}% return`} value={`$${totalROI.toLocaleString()}`} iconBg={totalROI >= 0 ? 'bg-green-50' : 'bg-red-50'} iconColor={totalROI >= 0 ? 'text-green-600' : 'text-red-600'} />
          <DashboardStatCard icon={Target} label={`${completedInvestments} completed`} value={activeInvestments} iconBg="bg-blue-50" iconColor="text-blue-600" />
          <DashboardStatCard icon={Zap} label="Per investment" value={`$${Number(averageDealSize).toLocaleString()}`} iconBg="bg-purple-50" iconColor="text-purple-600" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('BackerProjects'))}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Film className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Browse Projects</div>
                  <div className="text-sm text-gray-600">Discover new opportunities</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('BackerDeals'))}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Manage Deals</div>
                  <div className="text-sm text-gray-600">{activeDeals} active deals</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('BackerAnalytics'))}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">View Analytics</div>
                  <div className="text-sm text-gray-600">Track performance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backed Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Investment Portfolio</CardTitle>
                <CardDescription>Projects you have invested in</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate(createPageUrl('BackerInvestments'))}>
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
                <Button size="sm" onClick={() => openModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Investment
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {backedProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Film className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No investments yet</p>
                <Link to={createPageUrl('BackerProjects')} className="mt-4 inline-block">
                  <Button>Browse Projects</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {backedProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">{project.project_title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>${(project.investment_amount || 0).toLocaleString()} invested</span>
                        {project.expected_roi && (
                          <span className="text-green-600">
                            Expected: ${project.expected_roi?.toLocaleString()}
                          </span>
                        )}
                        {project.investment_date && <span>{new Date(project.investment_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        project.status === 'active' ? 'bg-green-100 text-green-700' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => openModal(project)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteBackedProject(project)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {backedProjects.length > 5 && (
                  <Button variant="outline" className="w-full" onClick={() => navigate(createPageUrl('BackerInvestments'))}>
                    View All {backedProjects.length} Investments
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite Code */}
        <InviteCodeCard />

        {/* Backed Project Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProject ? 'Edit Investment' : 'Add Investment'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Project Title</label>
                  <input
                    type="text"
                    value={projectForm.project_title}
                    onChange={(e) => setProjectForm({ ...projectForm, project_title: e.target.value })}
                    placeholder="Enter project title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Investment Amount</label>
                  <input
                    type="number"
                    value={projectForm.investment_amount}
                    onChange={(e) => setProjectForm({ ...projectForm, investment_amount: e.target.value })}
                    placeholder="Enter investment amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
                  <textarea
                    value={projectForm.notes}
                    onChange={(e) => setProjectForm({ ...projectForm, notes: e.target.value })}
                    placeholder="Add notes about this investment"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={editingProject ? handleUpdateBackedProject : handleCreateBackedProject} className="bg-black text-white hover:bg-gray-800">
                  {editingProject ? 'Update Investment' : 'Add Investment'}
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}