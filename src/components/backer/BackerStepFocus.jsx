import React from 'react'

const FOCUS_OPTIONS = [
  'Feature Films',
  'Short Films',
  'Documentaries',
  'Music Videos',
  'Commercials',
  'Animation',
  'VR/AR Projects',
  'Interactive Media'
]

export default function BackerStepFocus({ data, updateData }) {
  const toggleFocus = (focus) => {
    const current = data.investment_focus || []
    if (current.includes(focus)) {
      updateData('investment_focus', current.filter(f => f !== focus))
    } else {
      updateData('investment_focus', [...current, focus])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Investment Focus</h3>
        <p className="text-gray-600 mb-6">Select the types of projects you're interested in funding</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Investment Focus Areas *</label>
        <div className="grid grid-cols-2 gap-3">
          {FOCUS_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleFocus(option)}
              className={`px-4 py-3 rounded-lg border-2 text-left transition-all ${
                (data.investment_focus || []).includes(option)
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Investment Range</label>
        <select
          value={data.investment_range}
          onChange={(e) => updateData('investment_range', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Select range</option>
          <option value="10k-50k">$10,000 - $50,000</option>
          <option value="50k-100k">$50,000 - $100,000</option>
          <option value="100k-500k">$100,000 - $500,000</option>
          <option value="500k-1m">$500,000 - $1,000,000</option>
          <option value="1m+">$1,000,000+</option>
        </select>
      </div>
    </div>
  )
}
