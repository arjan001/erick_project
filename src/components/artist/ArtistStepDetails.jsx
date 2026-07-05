import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CountrySelector from '../CountrySelector';
import MultiSelectAutocomplete from '@/components/MultiSelectAutocomplete';
import languages from '@/data/languages.json';

export default function ArtistStepDetails({ data, updateData }) {
  const selectedLanguages = data.languages_spoken || [];

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Contact Details</h2>
      <p className="text-gray-600 mb-8">How can we reach you?</p>

      <div className="space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="full_name" className="text-base mb-3 block">Full Name *</Label>
            <Input
              id="full_name"
              value={data.full_name}
              onChange={(e) => updateData('full_name', e.target.value)}
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-base mb-3 block">Email *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => updateData('email', e.target.value)}
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="city" className="text-base mb-3 block">Based in City</Label>
            <Input
              id="city"
              value={data.based_in_city}
              onChange={(e) => updateData('based_in_city', e.target.value)}
              placeholder="e.g., Amsterdam"
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>

          <div>
            <Label htmlFor="country" className="text-base mb-3 block">Country</Label>
            <CountrySelector
              value={data.based_in_country}
              onChange={(country) => updateData('based_in_country', country)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone" className="text-base mb-3 block">Mobile Number (WhatsApp preferred)</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => updateData('phone', e.target.value)}
            placeholder="+31 6 1234 5678"
            className="bg-white border-gray-300 text-black h-12"
          />
        </div>

        <div>
          <Label className="text-base mb-3 block">Languages Spoken</Label>
          <MultiSelectAutocomplete
            options={languages}
            selected={selectedLanguages}
            onChange={(newLanguages) => updateData('languages_spoken', newLanguages)}
            label="Select languages"
            placeholder="Search and select languages..."
            maxDisplay={8}
            className="mb-4"
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold mb-4 text-black">Social Links (optional)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🌐</span>
              <Input
                placeholder="Website URL"
                value={data.website || ''}
                onChange={(e) => updateData('website', e.target.value)}
                className="bg-white border-gray-300 text-black h-12 pl-10"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📷</span>
              <Input
                placeholder="Instagram @username"
                value={data.instagram || ''}
                onChange={(e) => updateData('instagram', e.target.value)}
                className="bg-white border-gray-300 text-black h-12 pl-10"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">▶️</span>
              <Input
                placeholder="Vimeo URL"
                value={data.vimeo || ''}
                onChange={(e) => updateData('vimeo', e.target.value)}
                className="bg-white border-gray-300 text-black h-12 pl-10"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🎬</span>
              <Input
                placeholder="IMDb URL"
                value={data.imdb || ''}
                onChange={(e) => updateData('imdb', e.target.value)}
                className="bg-white border-gray-300 text-black h-12 pl-10"
              />
            </div>
            <div className="relative sm:col-span-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">💼</span>
              <Input
                placeholder="LinkedIn URL"
                value={data.linkedin || ''}
                onChange={(e) => updateData('linkedin', e.target.value)}
                className="bg-white border-gray-300 text-black h-12 pl-10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}