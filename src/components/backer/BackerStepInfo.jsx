import React from 'react'
import { Input } from '@/components/ui/input'

export default function BackerStepInfo({ data, updateData }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
        <p className="text-gray-600 mb-6">Please provide your contact details</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Contact Name *</label>
        <Input
          value={data.contact_name}
          onChange={(e) => updateData('contact_name', e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Contact Email *</label>
        <Input
          type="email"
          value={data.contact_email}
          onChange={(e) => updateData('contact_email', e.target.value)}
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Organization Name *</label>
        <Input
          value={data.organization_name}
          onChange={(e) => updateData('organization_name', e.target.value)}
          placeholder="Your organization name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">City *</label>
          <Input
            value={data.city}
            onChange={(e) => updateData('city', e.target.value)}
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Country *</label>
          <Input
            value={data.country}
            onChange={(e) => updateData('country', e.target.value)}
            placeholder="Country"
          />
        </div>
      </div>
    </div>
  )
}
