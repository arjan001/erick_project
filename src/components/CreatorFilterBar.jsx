import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const TYPES = ['All Types', 'Freelance', 'Studio', 'Agency', 'Team', 'Collective'];

const CATEGORIES = [
  'All Categories',
  'Cinematography',
  'Directing', 
  'Lighting',
  'Production',
  'Editing',
  'Color Grading',
  'Sound Design',
  'Music',
  'VFX',
  '3D Animation',
  'Motion Graphics',
  'Art Direction',
  'Production Design',
  'Costume',
  'Makeup',
  'Camera Operation',
  'Drone',
  'Gaffer',
  'Grip',
  'DOP',
  'Scriptwriting',
  'Web Design'
];

const COUNTRIES = [
  'All Countries',
  'Netherlands',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'United Kingdom',
  'Belgium',
  'Sweden',
  'Denmark',
  'Norway',
  'Finland',
  'Austria',
  'Switzerland',
  'Portugal',
  'Poland'
];

export default function CreatorFilterBar({ filters, onFilterChange, onReset, resultCount }) {
  return (
    <div className="bg-white border-t border-b border-gray-200 py-6 sticky top-[100px] z-20">
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filters.type} onValueChange={(value) => onFilterChange('type', value)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase().replace(' ', '_')}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat.toLowerCase().replace(' ', '_')}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.country} onValueChange={(value) => onFilterChange('country', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(country => (
                  <SelectItem key={country} value={country.toLowerCase().replace(' ', '_')}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
              {resultCount}
            </div>
            <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}