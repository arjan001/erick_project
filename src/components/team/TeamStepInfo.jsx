import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

export default function TeamStepInfo({ data, updateData }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Team Information</h2>
      <p className="text-gray-600 mb-8">Basic details about your team</p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="team_code" className="text-base mb-3 flex items-center gap-2">
            Team Code *
            <Info className="w-4 h-4 text-gray-400" />
          </Label>
          <Input
            id="team_code"
            value={data.team_code}
            onChange={(e) => updateData('team_code', e.target.value.toUpperCase())}
            placeholder="e.g., AMS LUX 01, BCN POST 03"
            className="bg-white border-gray-300 text-black h-12 font-mono"
          />
          <p className="text-xs text-gray-600 mt-2">
            Format: CITY CODE NUMBER (e.g., AMS CAM 01, BRU POST A)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="city" className="text-base mb-3 block">City *</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => updateData('city', e.target.value)}
              placeholder="e.g., Amsterdam"
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>

          <div>
            <Label htmlFor="country" className="text-base mb-3 block">Country *</Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => updateData('country', e.target.value)}
              placeholder="e.g., Netherlands"
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="contact_name" className="text-base mb-3 block">Contact Name *</Label>
            <Input
              id="contact_name"
              value={data.contact_name}
              onChange={(e) => updateData('contact_name', e.target.value)}
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>

          <div>
            <Label htmlFor="contact_email" className="text-base mb-3 block">Contact Email *</Label>
            <Input
              id="contact_email"
              type="email"
              value={data.contact_email}
              onChange={(e) => updateData('contact_email', e.target.value)}
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>
        </div>

        <div>
          <Label className="text-base mb-3 block">Team Size</Label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['solo', '2_5', '6_10', '11_20', '20_plus'].map(size => (
              <button
                key={size}
                onClick={() => updateData('team_size', size)}
                className={`p-3 rounded-lg text-sm transition-all ${
                  data.team_size === size
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-gray-300 text-black hover:bg-gray-50'
                }`}
              >
                {size.replace('_', '-').replace('plus', '+')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}