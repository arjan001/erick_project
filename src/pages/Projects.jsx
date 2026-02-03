import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, DollarSign, Star, Sparkles } from 'lucide-react';

export default function Projects() {
  const [filters, setFilters] = useState({
    type: 'all',
    budget: 'all',
    location: 'all',
    verified_only: false
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.filter({ status: 'approved' }, '-created_date')
  });

  const filteredProjects = projects.filter(project => {
    if (filters.type !== 'all' && project.project_type !== filters.type) return false;
    if (filters.budget !== 'all' && project.budget_range !== filters.budget) return false;
    if (filters.location !== 'all' && project.location_country !== filters.location) return false;
    if (filters.verified_only && !project.verified_only) return false;
    return true;
  });

  const featuredProjects = filteredProjects.filter(p => p.featured);
  const regularProjects = filteredProjects.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1800px] mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">Browse Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Discover exciting opportunities posted by clients looking for talented creators and teams.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-12 items-center">
          <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Project Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="short_film">Short Film</SelectItem>
              <SelectItem value="film">Feature Film</SelectItem>
              <SelectItem value="music_video">Music Video</SelectItem>
              <SelectItem value="documentary">Documentary</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.budget} onValueChange={(value) => setFilters({...filters, budget: value})}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Budget Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budgets</SelectItem>
              <SelectItem value="under_10k">Under $10k</SelectItem>
              <SelectItem value="10k_25k">$10k - $25k</SelectItem>
              <SelectItem value="25k_50k">$25k - $50k</SelectItem>
              <SelectItem value="50k_100k">$50k - $100k</SelectItem>
              <SelectItem value="100k_250k">$100k - $250k</SelectItem>
              <SelectItem value="250k_plus">$250k+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {Array.from(new Set(projects.map(p => p.location_country).filter(Boolean))).map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant={filters.verified_only ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({...filters, verified_only: !filters.verified_only})}
              className={filters.verified_only ? "bg-black text-white" : ""}
            >
              <Star className="w-4 h-4 mr-2" />
              Verified Only
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-gray-400">Loading projects...</div>
          </div>
        ) : (
          <>
            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-3xl font-bold">Featured Projects</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Projects */}
            {regularProjects.length > 0 ? (
              <div>
                <h2 className="text-3xl font-bold mb-6">All Projects</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500">No projects match your filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, featured }) {
  const budgetLabels = {
    'under_10k': 'Under $10k',
    '10k_25k': '$10k - $25k',
    '25k_50k': '$25k - $50k',
    '50k_100k': '$50k - $100k',
    '100k_250k': '$100k - $250k',
    '250k_plus': '$250k+',
    'not_disclosed': 'Budget TBD'
  };

  const typeLabels = {
    'commercial': 'Commercial',
    'short_film': 'Short Film',
    'film': 'Feature Film',
    'music_video': 'Music Video',
    'documentary': 'Documentary',
    'other': 'Other'
  };

  return (
    <div className="group bg-white rounded-xl border-2 border-gray-200 hover:border-black hover:shadow-xl transition-all duration-300 overflow-hidden">
      {featured && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Featured</span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Badge className="mb-3 bg-black text-white">
              {typeLabels[project.project_type] || project.project_type}
            </Badge>
            <h3 className="text-xl font-bold mb-2 line-clamp-2">
              {project.project_owner_company || 'Untitled Project'}
            </h3>
          </div>
          {project.verified_only && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-700">
              <Star className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{project.location_city}, {project.location_country}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Start: {project.timeline_start || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>{budgetLabels[project.budget_range] || 'Budget TBD'}</span>
          </div>
        </div>

        {project.notes && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
            {project.notes}
          </p>
        )}

        <Button 
          size="sm" 
          className="w-full bg-black text-white hover:bg-gray-800"
        >
          View Full Brief
        </Button>
      </div>
    </div>
  );
}