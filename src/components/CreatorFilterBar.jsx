import React from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RotateCcw, ChevronDown, X, Grid3x3, List } from 'lucide-react'

const TYPES = ['All Types', 'Freelance', 'Studio', 'Agency', 'Team', 'Collective']

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
]

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
]

export default function CreatorFilterBar({ filters, onFilterChange, onReset, resultCount, allCreators, categoryCounts, view, onViewChange }) {
  return (
    <div className="bg-white border-t border-b border-gray-200 py-3 sticky top-[100px] z-10">
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-[160px] px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50">
                  <span className="text-sm">
                    {filters.type === 'all_types' ? 'All Types' : filters.type.replace('_', ' ')}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[160px] p-0" align="start">
                <div className="max-h-[300px] overflow-y-auto">
                  {TYPES.map(type => {
                    const value = type.toLowerCase().replace(' ', '_')
                    return (
                      <button
                        key={type}
                        onClick={() => onFilterChange('type', value)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        {type}
                      </button>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Category Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-[200px] px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50">
                  <span className="text-sm truncate">
                    {filters.category === 'all_categories' ? 'All Categories' : filters.category.replace('_', ' ')}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <div className="max-h-[300px] overflow-y-auto">
                  <button
                    onClick={() => onFilterChange('category', 'all_categories')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    All Categories
                  </button>
                  {Object.entries(categoryCounts || {})
                    .filter(([_, count]) => count > 0)
                    .map(([cat, count]) => (
                      <button
                        key={cat}
                        onClick={() => onFilterChange('category', cat)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                      >
                        <span className="capitalize">{cat.replace('_', ' ')}</span>
                        <span className="text-xs text-gray-500">({count})</span>
                      </button>
                    ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Country Multi-Select Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50">
                  <span className="text-sm truncate">
                    {filters.countries?.length > 0 
                      ? `${filters.countries.length} selected` 
                      : 'All Countries'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0" align="start">
                <div className="max-h-[300px] overflow-y-auto">
                  {COUNTRIES.slice(1).map(country => {
                    const value = country.toLowerCase().replace(' ', '_')
                    const isSelected = filters.countries?.includes(value)
                    return (
                      <label
                        key={country}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
                            const current = filters.countries || []
                            const newCountries = isSelected
                              ? current.filter(c => c !== value)
                              : [...current, value]
                            onFilterChange('countries', newCountries)
                          }}
                        />
                        <span className="text-sm">{country}</span>
                      </label>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear selected countries */}
            {filters.countries?.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onFilterChange('countries', [])}
                className="h-8"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-bold">
              {resultCount}
            </div>
            <Button variant="outline" size="sm" onClick={onReset} className="gap-2 h-8">
              <RotateCcw className="w-4 h-4" />
              Reset filters
            </Button>
            <div className="flex gap-1">
              <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('list')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}