import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Search, X, Check } from 'lucide-react'

export default function SkillsCategorySelector({
  skillsByCategory,
  selected,
  onChange,
  placeholder = "Search and select your skills..."
}) {
  const [expandedCategories, setExpandedCategories] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  // Initialize all categories as expanded
  React.useEffect(() => {
    const initialExpanded = {}
    Object.keys(skillsByCategory).forEach(category => {
      initialExpanded[category] = true
    })
    setExpandedCategories(initialExpanded)
  }, [skillsByCategory])

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const toggleSkill = (skill) => {
    const isSelected = selected.includes(skill)
    const newSelected = isSelected
      ? selected.filter(s => s !== skill)
      : [...selected, skill]
    onChange(newSelected)
  }

  // Filter skills based on search term
  const filteredCategories = {}
  const hasSearchResults = searchTerm.length > 0

  Object.entries(skillsByCategory).forEach(([category, skills]) => {
    if (hasSearchResults) {
      const filteredSkills = skills.filter(skill =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (filteredSkills.length > 0) {
        filteredCategories[category] = filteredSkills
      }
    } else {
      filteredCategories[category] = skills
    }
  })

  const selectedItems = selected || []
  const allSkills = Object.values(skillsByCategory).flat()

  return (
    <div className="space-y-4">
      {/* Selected Skills Tags */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          {selectedItems.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-black text-white text-sm rounded-md"
            >
              {skill}
              <button
                type="button"
                onClick={() => toggleSkill(skill)}
                className="hover:bg-gray-700 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Skills by Category */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {Object.entries(filteredCategories).map(([category, skills]) => (
          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <span className="font-semibold text-gray-900 text-sm">{category}</span>
              <span className="text-xs text-gray-500 mr-2">
                {skills.filter(s => selectedItems.includes(s)).length}/{skills.length} selected
              </span>
              {expandedCategories[category] ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Skills Grid */}
            {expandedCategories[category] && (
              <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {skills.map((skill) => {
                  const isSelected = selectedItems.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-2 text-sm text-left rounded-md border transition-all ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{skill}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {Object.keys(filteredCategories).length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No skills found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Selected Count */}
      <div className="text-xs text-gray-500">
        {selectedItems.length} skill{selectedItems.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  )
}
