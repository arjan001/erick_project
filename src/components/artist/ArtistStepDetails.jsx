import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CountrySelector from '../CountrySelector';

const LANGUAGES = ['English', 'Dutch', 'Spanish', 'French', 'German', 'Italian', 'Portuguese'];

export default function ArtistStepDetails({ data, updateData }) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const toggleLanguage = (lang) => {
    const current = data.languages_spoken || [];
    if (current.includes(lang)) {
      updateData('languages_spoken', current.filter(l => l !== lang));
    } else {
      updateData('languages_spoken', [...current, lang]);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateData('artist_logo', file_url);
    } catch (error) {
      alert('Error uploading photo. Please try again.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Contact Details</h2>
      <p className="text-gray-600 mb-8">How can we reach you?</p>

      <div className="space-y-6">
        {/* Profile Photo Section */}
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-semibold mb-3 text-black">Profile Photo (optional)</h3>
          <p className="text-sm text-gray-600 mb-4">Upload a professional headshot or logo</p>
          
          {data.artist_logo ? (
            <div className="flex items-center gap-4">
              <img src={data.artist_logo} alt="Profile" className="w-20 h-20 object-cover rounded-full border-2 border-gray-300" />
              <button
                onClick={() => updateData('artist_logo', null)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove photo
              </button>
            </div>
          ) : (
            <>
              <input
                type="file"
                id="artist-logo-upload"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={isUploadingLogo}
              />
              <label htmlFor="artist-logo-upload">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-600 cursor-pointer transition-all">
                  <ImageIcon className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium text-black mb-1">
                    {isUploadingLogo ? 'Uploading...' : 'Click to upload photo'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG (max 2MB)</p>
                </div>
              </label>
            </>
          )}
        </div>
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
          <Label htmlFor="experience" className="text-base mb-3 block">Years of Experience</Label>
          <Input
            id="experience"
            type="number"
            value={data.years_experience}
            onChange={(e) => updateData('years_experience', e.target.value)}
            className="bg-white border-gray-300 text-black h-12"
          />
        </div>

        <div>
          <Label className="text-base mb-3 block">Languages Spoken</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  (data.languages_spoken || []).includes(lang)
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-gray-300 text-black hover:bg-gray-50'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold mb-4 text-black">Social Links (optional)</h3>
          <div className="space-y-4">
            <Input
              placeholder="Website URL"
              value={data.website}
              onChange={(e) => updateData('website', e.target.value)}
              className="bg-white border-gray-300 text-black h-12"
            />
            <Input
              placeholder="Instagram @username"
              value={data.instagram}
              onChange={(e) => updateData('instagram', e.target.value)}
              className="bg-white border-gray-300 text-black h-12"
            />
            <Input
              placeholder="Vimeo URL"
              value={data.vimeo}
              onChange={(e) => updateData('vimeo', e.target.value)}
              className="bg-white border-gray-300 text-black h-12"
            />
            <Input
              placeholder="IMDb URL"
              value={data.imdb}
              onChange={(e) => updateData('imdb', e.target.value)}
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>
        </div>
      </div>
    </div>
  );
}