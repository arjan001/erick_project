import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Backer, BackedProject, Project } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, DollarSign, MapPin, Calendar, TrendingUp, Heart, Star, Play } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';
import { useAuth } from '@/lib/AuthContext';

export default function BackerProjectsPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { user: authUser, isAuthenticated } = useAuth();
  const [backer, setBacker] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBudget, setFilterBudget] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  const [ignoredProjects, setIgnoredProjects] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/';
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      // Fetch backer profile
      const backers = await Backer.filter({ contact_email: authUser?.email });
      if (backers.length > 0) {
        setBacker(backers[0]);
      }

      // Fetch all projects
      const allProjects = await Project.list();
      setProjects(allProjects);
      setFilteredProjects(allProjects);
    } catch (err) {
      console.error('Error fetching data:', err);
      toastError('Load Failed', 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    if (filterBudget !== 'all') {
      const budget = parseFloat(filterBudget);
      filtered = filtered.filter(p => {
        const projectBudget = parseFloat(p.budget) || 0;
        if (filterBudget === 'under10k') return projectBudget < 10000;
        if (filterBudget === '10k-50k') return projectBudget >= 10000 && projectBudget < 50000;
        if (filterBudget === '50k-100k') return projectBudget >= 50000 && projectBudget < 100000;
        if (filterBudget === '100k+') return projectBudget >= 100000;
        return true;
      });
    }

    setFilteredProjects(filtered);
  }, [searchTerm, filterCategory, filterStatus, filterBudget, projects]);

  const handleBackProject = async (project) => {
    if (!backer) {
      toastError('Profile Required', 'Please complete your backer profile first');
      navigate(createPageUrl('BackerProfile'));
      return;
    }

    const investmentAmount = prompt(`Enter investment amount for "${project.title}":`);
    if (!investmentAmount || isNaN(investmentAmount)) return;

    try {
      // Create backed project record
      await BackedProject.create({
        backer_email: user.email,
        project_id: project.id,
        project_title: project.title,
        investment_amount: parseFloat(investmentAmount),
        status: 'active',
        investment_date: new Date().toISOString(),
        expected_roi: parseFloat(investmentAmount) * 1.15 // 15% expected ROI
      });

      // Update backer totals
      await Backer.update(backer.id, {
        total_invested: (backer.total_invested || 0) + parseFloat(investmentAmount),
        investment_count: (backer.investment_count || 0) + 1
      });

      // Update project funding
      await Project.update(project.id, {
        current_funding: (project.current_funding || 0) + parseFloat(investmentAmount),
        backers_count: (project.backers_count || 0) + 1
      });

      success('Project Backed', `You have successfully backed "${project.title}" with $${investmentAmount}`);
      fetchData();
    } catch (err) {
      console.error('Error backing project:', err);
      toastError('Backing Failed', err.message || 'Failed to back project. Please try again.');
    }
  };

  const handleQuickBack = (project) => {
    if (!backer) {
      toastError('Profile Required', 'Please complete your backer profile first');
      navigate(createPageUrl('BackerProfile'));
      return;
    }
    handleBackProject(project);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleSaveProject = (project) => {
    if (savedProjects.includes(project.id)) {
      setSavedProjects(savedProjects.filter(id => id !== project.id));
      success('Removed', 'Project removed from saved');
    } else {
      setSavedProjects([...savedProjects, project.id]);
      success('Saved', 'Project saved for later');
    }
  };

  const handleIgnoreProject = (project) => {
    if (!ignoredProjects.includes(project.id)) {
      setIgnoredProjects([...ignoredProjects, project.id]);
      success('Ignored', 'Project will not be shown again');
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Projects</h1>
          <p className="text-gray-600">Discover and back creative projects from talented creators</p>
        </div>

        {/* Search and Filters - Minimalist */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black h-9"
          >
            <option value="all">All Categories</option>
            <option value="film">Film & Video</option>
            <option value="photography">Photography</option>
            <option value="music">Music</option>
            <option value="animation">Animation</option>
            <option value="design">Design</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black h-9"
          >
            <option value="all">All Status</option>
            <option value="seeking_funding">Seeking Funding</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterBudget}
            onChange={(e) => setFilterBudget(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black h-9"
          >
            <option value="all">All Budgets</option>
            <option value="under10k">Under $10K</option>
            <option value="10k-50k">$10K - $50K</option>
            <option value="50k-100k">$50K - $100K</option>
            <option value="100k+">$100K+</option>
          </select>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.filter(p => !ignoredProjects.includes(p.id)).map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group" onClick={() => handleViewProject(project)}>
                <div className="aspect-video bg-gray-100 relative">
                  {project.images && project.images.length > 0 ? (
                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                  ) : project.image_url ? (
                    <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <Play className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 bg-black/80 backdrop-blur-sm text-white text-xs font-medium rounded">
                      {project.project_type || 'Creative'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 truncate">{project.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{project.location_city || project.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">${(project.budget || 0).toLocaleString()}</span>
                    <span className="text-green-600 font-medium">${(project.current_funding || 0).toLocaleString()} raised</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Project Detail Modal */}
        {showProjectModal && selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProjectModal(false)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                {selectedProject.images && selectedProject.images.length > 0 ? (
                  <img src={selectedProject.images[0]} alt={selectedProject.title} className="w-full h-64 object-cover" />
                ) : selectedProject.image_url ? (
                  <img src={selectedProject.image_url} alt={selectedProject.title} className="w-full h-64 object-cover" />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <Play className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedProject.location_city || selectedProject.location || 'Remote'}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-black text-white text-sm font-medium rounded">
                    {selectedProject.project_type || 'Creative'}
                  </span>
                </div>

                <p className="text-gray-600 mb-6">{selectedProject.description || 'No description available.'}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Budget</div>
                    <div className="text-xl font-bold text-gray-900">${(selectedProject.budget || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Raised</div>
                    <div className="text-xl font-bold text-green-600">${(selectedProject.current_funding || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Backers</div>
                    <div className="text-xl font-bold text-gray-900">{selectedProject.backers_count || 0}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Progress</div>
                    <div className="text-xl font-bold text-gray-900">
                      {selectedProject.budget ? Math.round(((selectedProject.current_funding || 0) / selectedProject.budget) * 100) : 0}%
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${selectedProject.budget ? ((selectedProject.current_funding || 0) / selectedProject.budget) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => { handleBackProject(selectedProject); setShowProjectModal(false); }}
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Back Project
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleSaveProject(selectedProject)}
                    className={savedProjects.includes(selectedProject.id) ? 'border-green-500 text-green-600 bg-green-50' : ''}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${savedProjects.includes(selectedProject.id) ? 'fill-current' : ''}`} />
                    {savedProjects.includes(selectedProject.id) ? 'Saved' : 'Save'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => { handleIgnoreProject(selectedProject); setShowProjectModal(false); }}
                    className="text-gray-600 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Ignore
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}