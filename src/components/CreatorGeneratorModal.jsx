import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Sparkles, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TYPES = ['freelance', 'studio', 'agency', 'team', 'collective'];
const CATEGORIES = [
  'cinematography', 'directing', 'lighting', 'production', 'editing',
  'color_grading', 'sound_design', 'music', 'vfx', '3d_animation',
  'motion_graphics', 'art_direction', 'production_design', 'costume',
  'makeup', 'camera_operation', 'drone', 'gaffer', 'grip', 'dop',
  'scriptwriting', 'web_design'
];
const COUNTRIES = [
  'Netherlands', 'Germany', 'France', 'Spain', 'Italy',
  'United Kingdom', 'Belgium', 'Sweden', 'Denmark', 'Norway',
  'Finland', 'Austria', 'Switzerland', 'Portugal', 'Poland'
];

export default function CreatorGeneratorModal({ onClose, onGenerated }) {
  const [config, setConfig] = useState({
    types: [],
    categories: [],
    countries: [],
    count: 10
  });
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress('Generating creators with AI...');

    try {
      const prompt = `CRITICAL MISSION: Research and find ${config.count} REAL, EXISTING European production companies/creators with VERIFIED LOGOS.

${config.types.length > 0 ? `Types to focus on: ${config.types.join(', ')}` : 'Mix of: freelance, studio, agency, team, collective'}
${config.categories.length > 0 ? `Specialties to focus on: ${config.categories.join(', ')}` : 'Various specialties in film production'}
${config.countries.length > 0 ? `Countries to focus on: ${config.countries.join(', ')}` : 'Various European countries'}

ABSOLUTE REQUIREMENTS - NO FAKE DATA ALLOWED:
1. Search the web extensively for REAL production companies (RSA Films, MJZ, Stink Films, Partizan, Somesuch, The Mill, Framestore, MPC, Iconoclast, UNIT9, MediaMonks, etc.)
2. Use their EXACT real company names
3. Use their ACTUAL real headquarters city and country
4. Find and verify their REAL website (the actual domain that exists)
5. logo_url: MANDATORY - You MUST find the company's REAL logo image URL. Search their website, LinkedIn, or other sources. DO NOT include a company if you cannot find their actual logo. Use direct image URLs (PNG, JPG, SVG) or high-quality sources.
6. profile_image_url: Find representative images from their portfolio or use cinematic Unsplash images
7. Award counts: Research their actual awards if possible (0-50 realistic range)
8. Categories: Based on their actual specialties

CRITICAL: If you cannot find a company's REAL logo, DO NOT include that company. Only return companies where you successfully found their actual logo.

Search deeply, take your time, verify logos exist. Quality over speed. Return ONLY valid JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            creators: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string", enum: TYPES },
                  categories: { type: "array", items: { type: "string" } },
                  country: { type: "string" },
                  city: { type: "string" },
                  website: { type: "string" },
                  awards_count: { type: "number" },
                  logo_url: { type: "string" },
                  profile_image_url: { type: "string" }
                }
              }
            }
          }
        }
      });

      setProgress(`Saving ${response.creators.length} creators to database...`);

      // Save to database
      await base44.entities.Creator.bulkCreate(response.creators);

      setProgress('Complete!');
      setTimeout(() => {
        onGenerated();
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Failed to generate creators:', error);
      setProgress('Error: ' + error.message);
    } finally {
      setTimeout(() => setGenerating(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6"
      onClick={() => {
        setOpenDropdown(null);
        onClose();
      }}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full p-8 relative z-[101]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Generate Creators with AI</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Types (Multi-select)</label>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 text-left"
              >
                <span className="capitalize text-sm">
                  {config.types.length === 0 ? 'All Types (Mixed)' : `${config.types.length} selected`}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === 'type' && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[200px] overflow-y-auto">
                  {TYPES.map(t => {
                    const isSelected = config.types.includes(t);
                    return (
                      <label key={t} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const newTypes = isSelected
                              ? config.types.filter(x => x !== t)
                              : [...config.types, t];
                            setConfig({...config, types: newTypes});
                          }}
                          className="w-4 h-4"
                        />
                        <span className="capitalize text-sm">{t}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {config.types.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {config.types.map(t => (
                  <span key={t} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Categories (Multi-select)</label>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 text-left"
              >
                <span className="capitalize text-sm">
                  {config.categories.length === 0 ? 'All Categories (Mixed)' : `${config.categories.length} selected`}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === 'category' && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[200px] overflow-y-auto">
                  {CATEGORIES.map(c => {
                    const isSelected = config.categories.includes(c);
                    return (
                      <label key={c} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const newCats = isSelected
                              ? config.categories.filter(x => x !== c)
                              : [...config.categories, c];
                            setConfig({...config, categories: newCats});
                          }}
                          className="w-4 h-4"
                        />
                        <span className="capitalize text-sm">{c.replace('_', ' ')}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {config.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {config.categories.map(c => (
                  <span key={c} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded capitalize">
                    {c.replace('_', ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Countries (Multi-select)</label>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'country' ? null : 'country')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 text-left"
              >
                <span className="text-sm">
                  {config.countries.length === 0 ? 'All Countries (Mixed)' : `${config.countries.length} selected`}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === 'country' && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[200px] overflow-y-auto">
                  {COUNTRIES.map(c => {
                    const isSelected = config.countries.includes(c);
                    return (
                      <label key={c} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const newCountries = isSelected
                              ? config.countries.filter(x => x !== c)
                              : [...config.countries, c];
                            setConfig({...config, countries: newCountries});
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{c}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {config.countries.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {config.countries.map(c => (
                  <span key={c} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Number to Generate</label>
            <Input 
              type="number"
              min="1"
              max="100"
              value={config.count}
              onChange={(e) => setConfig({...config, count: parseInt(e.target.value) || 10})}
              className="text-lg"
            />
          </div>
        </div>

        {progress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-blue-800 font-medium">{progress}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={generating}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? 'Generating...' : `Generate ${config.count} Creators`}
          </Button>
        </div>
      </div>
    </div>
  );
}