import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CountrySelector from '../CountrySelector';

export default function TeamOnboardingDetailsStep({ data, updateData }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Where is your team based?</h2>
      <p className="text-gray-600 mb-8">This helps clients find teams near their production</p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label className="text-base mb-3 block">City *</Label>
            <Input
              value={data.city || ''}
              onChange={(e) => updateData('city', e.target.value)}
              placeholder="e.g., Amsterdam"
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>
          <div>
            <Label className="text-base mb-3 block">Country *</Label>
            <CountrySelector value={data.country} onChange={(country) => updateData('country', country)} />
          </div>
        </div>

        <div>
          <Label className="text-base mb-3 block">Team Size</Label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['solo', '2_5', '6_10', '11_20', '20_plus'].map(size => (
              <button
                key={size}
                type="button"
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

        <div>
          <Label className="text-base mb-3 block">Languages Spoken</Label>
          <Input
            value={(data.languages_spoken || []).join(', ')}
            onChange={(e) => updateData('languages_spoken', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="English, Dutch, Spanish"
            className="bg-white border-gray-300 text-black h-12"
          />
        </div>
      </div>
    </div>
  );
}