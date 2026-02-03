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
    type: 'all',
    category: 'all',
    country: 'all',
    count: 10
  });
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress('Generating creators with AI...');

    try {
      const prompt = `CRITICAL: Research and find ${config.count} REAL, EXISTING European production companies/creators.

${config.type !== 'all' ? `Type: ${config.type}` : 'Mix of: freelance, studio, agency, team, collective'}
${config.category !== 'all' ? `Specialty: ${config.category}` : 'Various specialties in film production'}
${config.country !== 'all' ? `Country: ${config.country}` : 'Various European countries'}

MANDATORY REQUIREMENTS - DO NOT MAKE UP FAKE COMPANIES:
1. Find REAL production companies, studios, agencies, freelancers (like Ridley Scott Associates, MJZ, Stink Films, etc.)
2. Use their ACTUAL company names from real world
3. Use their REAL cities and countries where they operate
4. Find their REAL website URLs (verify they exist)
5. logo_url: Search for and use their ACTUAL company logo. If you can find the real logo URL, use it. Otherwise, use a relevant Unsplash image that represents their type of work
6. profile_image_url: Use high-quality production/cinematography images from Unsplash (e.g., https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800)
7. Award counts: Realistic (0-50 range, most companies have 0-10)
8. Categories: 2-4 realistic specialties based on what they actually do

EXAMPLES OF REAL COMPANIES TO FIND:
- Production companies like RSA Films, Partizan, Somesuch, Iconoclast
- Studios like The Mill, Framestore, MPC
- Agencies like UNIT9, MediaMonks
- Freelance DOPs, directors, editors with real portfolios

Use your web search capability to find REAL companies. Return ONLY valid JSON.`;

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
            <label className="text-sm font-medium mb-2 block">Type</label>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 text-left"
              >
                <span className="capitalize">
                  {config.type === 'all' ? 'All Types (Mixed)' : config.type}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === 'type' && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[200px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setConfig({...config, type: 'all'});
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    All Types (Mixed)
                  </button>
                  {TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        setConfig({...config, type: t});
                        setOpenDropdown(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 capitalize"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category Focus</label>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 text-left"
              >
                <span className="capitalize">
                  {config.category === 'all' ? 'All Categories (Mixed)' : config.category.replace('_', ' ')}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === 'category' && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[200px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setConfig({...config, category: 'all'});
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    All Categories (Mixed)
                  </button>
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setConfig({...config, category: c});
                        setOpenDropdown(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 capitalize"
                    >
                      {c.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Country</label>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'country' ? null : 'country')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 text-left"
              >
                <span>
                  {config.country === 'all' ? 'All Countries (Mixed)' : config.country}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === 'country' && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[200px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setConfig({...config, country: 'all'});
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    All Countries (Mixed)
                  </button>
                  {COUNTRIES.map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setConfig({...config, country: c});
                        setOpenDropdown(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
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