import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Award } from 'lucide-react'

export default function StepFinal({ data, updateData }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Final Details</h2>
      <p className="text-gray-600 mb-8">Tell us about your project and how to reach you</p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="name" className="text-base mb-3 block">Your Name *</Label>
          <Input
            id="name"
            value={data.project_owner_name}
            onChange={(e) => updateData('project_owner_name', e.target.value)}
            placeholder="Full name"
            className="bg-white border-gray-300 text-black h-12"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-base mb-3 block">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.project_owner_email}
            onChange={(e) => updateData('project_owner_email', e.target.value)}
            placeholder="your@email.com"
            className="bg-white border-gray-300 text-black h-12"
          />
        </div>

        <div>
          <Label htmlFor="company" className="text-base mb-3 block">Company (optional)</Label>
          <Input
            id="company"
            value={data.project_owner_company}
            onChange={(e) => updateData('project_owner_company', e.target.value)}
            placeholder="Company or brand name"
            className="bg-white border-gray-300 text-black h-12"
          />
        </div>

        <div>
          <Label htmlFor="notes" className="text-base mb-3 block">Additional Notes</Label>
          <Textarea
            id="notes"
            value={data.notes}
            onChange={(e) => updateData('notes', e.target.value)}
            placeholder="Any additional details about your project, creative vision, or requirements..."
            rows={5}
            className="bg-white border-gray-300 text-black"
          />
        </div>

        {/* Open to Backing */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 text-black">Open to Backing</h3>
              <p className="text-sm text-gray-700 mb-4">
                Mark this project as open to sponsorship, co-production, cultural support, or investment. Requires admin approval.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <Checkbox
                  id="open_to_backing"
                  checked={data.open_to_backing}
                  onCheckedChange={(checked) => updateData('open_to_backing', checked)}
                />
                <Label htmlFor="open_to_backing" className="text-sm cursor-pointer font-medium">
                  ☑ Open to Backing
                </Label>
              </div>
              {data.open_to_backing && (
                <div className="mt-4 space-y-3">
                  <Label className="text-sm font-medium">What type of backing are you seeking?</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'sponsorship', label: 'Sponsorship' },
                      { value: 'co_production', label: 'Co-Production' },
                      { value: 'cultural_support', label: 'Cultural Support' },
                      { value: 'city_support', label: 'City Support' },
                      { value: 'investment', label: 'Investment' }
                    ].map((option) => {
                      const isChecked = (data.backing_types || []).includes(option.value)
                      return (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => {
                              const current = data.backing_types || []
                              const updated = isChecked
                                ? current.filter(v => v !== option.value)
                                : [...current, option.value]
                              updateData('backing_types', updated)
                            }}
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      )
                    })}
                  </div>
                  <Textarea
                    value={data.backing_notes || ''}
                    onChange={(e) => updateData('backing_notes', e.target.value)}
                    placeholder="Additional details about backing opportunities..."
                    rows={3}
                    className="bg-white border-gray-300 text-black mt-3"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}