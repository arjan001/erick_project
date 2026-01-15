import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const COUNTRIES = [
  'Netherlands', 'Belgium', 'France', 'Spain', 'Germany', 'Italy', 
  'United Kingdom', 'Austria', 'Luxembourg', 'Portugal', 'Switzerland', 'Other'
];

export default function StepLocation({ data, updateData }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">Where is production?</h2>
      <p className="text-gray-400 mb-8">Help us find teams in your area</p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="country" className="text-base mb-3 block">Country</Label>
          <select
            id="country"
            value={data.location_country}
            onChange={(e) => updateData('location_country', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
          >
            <option value="">Select a country</option>
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="city" className="text-base mb-3 block">City</Label>
          <Input
            id="city"
            value={data.location_city}
            onChange={(e) => updateData('location_city', e.target.value)}
            placeholder="e.g., Amsterdam, Barcelona, Paris"
            className="bg-zinc-800 border-zinc-700 text-white h-12"
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg">
          <Checkbox
            id="remote"
            checked={data.is_remote}
            onCheckedChange={(checked) => updateData('is_remote', checked)}
            className="border-zinc-600"
          />
          <Label htmlFor="remote" className="text-base cursor-pointer">
            Remote production possible
          </Label>
        </div>
      </div>
    </div>
  );
}