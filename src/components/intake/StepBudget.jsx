import React from 'react'
import { DollarSign } from 'lucide-react'

const BUDGET_RANGES = [
  { value: 'under_10k', label: 'Under €10k', description: 'Small projects' },
  { value: '10k_25k', label: '€10k - €25k', description: 'Medium projects' },
  { value: '25k_50k', label: '€25k - €50k', description: 'Standard commercials' },
  { value: '50k_100k', label: '€50k - €100k', description: 'Premium productions' },
  { value: '100k_250k', label: '€100k - €250k', description: 'Large scale' },
  { value: '250k_plus', label: '€250k+', description: 'Major productions' },
  { value: 'not_disclosed', label: 'Prefer not to say', description: 'We can discuss later' },
]

export default function StepBudget({ data, updateData }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Budget Range</h2>
      <p className="text-gray-600 mb-2">This helps us match you with the right teams</p>
      <p className="text-sm text-gray-500 mb-8">Optional - you can discuss exact numbers later</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BUDGET_RANGES.map((range) => {
          const isSelected = data.budget_range === range.value
          return (
            <button
              key={range.value}
              onClick={() => updateData('budget_range', range.value)}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-amber-600 bg-amber-600/10'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <DollarSign className={`w-7 h-7 mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
              <h3 className="text-base font-semibold mb-1 text-black">{range.label}</h3>
              <p className="text-sm text-gray-600">{range.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}