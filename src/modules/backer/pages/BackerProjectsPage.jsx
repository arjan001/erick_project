import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BackerSidebar from '@/components/BackerSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, DollarSign, MapPin, Calendar, TrendingUp, Heart, Star, Play } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function BackerProjectsPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [backer, setBacker] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBudget, setFilterBudget] = useState('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('studio22_user'));
      
      // Fetch backer profile
      const backers = await base44.entities.Backer.filter({ email: storedUser.email });
      if (backers.length > 0) {
        setBacker(backers[0]);
      }

      // Fetch all projects
      const allProjects = await base44.entities.Project.list();
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
      await base44.entities.BackedProject.create({
        backer_email: user.email,
        project_id: project.id,
        project_title: project.title,
        investment_amount: parseFloat(investmentAmount),
        status: 'active',
        investment_date: new Date().toISOString(),
        expected_roi: parseFloat(investmentAmount) * 1.15 // 15% expected ROI
      });

      // Update backer totals
      await base44.entities.Backer.update(backer.id, {
        total_invested: (backer.total_invested || 0) + parseFloat(investmentAmount),
        investment_count: (backer.investment_count || 0) + 1
      });

      // Update project funding
      await base44.entities.Project.update(project.id, {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <BackerSidebar />
      <div className="ml-20 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Projects</h1>
          <p className="text-gray-600">Discover and back creative projects from talented creators</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
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
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">All Status</option>
                <option value="seeking_funding">Seeking Funding</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={filterBudget}
                onChange={(e) => setFilterBudget(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">All Budgets</option>
                <option value="under10k">Under $10K</option>
                <option value="10k-50k">$10K - $50K</option>
                <option value="50k-100k">$50K - $100K</option>
                <option value="100k+">$100K+</option>
              </select>
            </div>
          </CardContent>
        </Card>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  {project.thumbnail_url ? (
                    <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-black/90 backdrop-blur-sm text-white text-xs font-bold rounded">
                      {project.category || 'Creative'}
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location || 'Remote'}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-semibold">${project.budget?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Raised</span>
                      <span className="font-semibold text-green-600">${project.current_funding?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${((project.current_funding || 0) / (project.budget || 1)) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Backers</span>
                      <span className="font-semibold">{project.backers_count || 0}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleBackProject(project)}
                      className="flex-1 bg-black text-white hover:bg-gray-800"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Back Project
                    </Button>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuickBack(project)}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
