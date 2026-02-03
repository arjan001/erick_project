import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Sparkles } from 'lucide-react';
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

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress('Generating creators with AI...');

    try {
      const prompt = `Generate ${config.count} realistic European production companies/creators for a film production directory.

${config.type !== 'all' ? `Type: ${config.type}` : 'Mix of: freelance, studio, agency, team, collective'}
${config.category !== 'all' ? `Specialty: ${config.category}` : 'Various specialties in film production'}
${config.country !== 'all' ? `Country: ${config.country}` : 'Various European countries'}

CRITICAL REQUIREMENTS:
- Real-sounding company/creator names (professional, creative)
- Realistic European cities matching the country
- Professional website domains (use format: companyname.com or .co.uk for UK, .nl for Netherlands, etc)
- Award counts (0-100, weighted toward lower numbers, realistic distribution)
- 2-4 category specialties per creator from the provided list
- Diverse mix of types and specialties
- logo_url: MUST use REAL Unsplash photo IDs for logos, company marks, abstract minimal designs. Format: https://images.unsplash.com/photo-1234567890123-etc?q=80&w=200
- profile_image_url: MUST use REAL Unsplash photo IDs showing actual film production, camera equipment, studios, cinematography. Format: https://images.unsplash.com/photo-1234567890123-etc?q=80&w=800

IMPORTANT: Use actual Unsplash photo IDs that exist. For example:
- Logos: photo-1599305445671-ac291c95aaa9, photo-1634942537034-2531766767d1
- Production: photo-1492691527719-9d1e07e534b4, photo-1574267432553-4b4628081c31

Return ONLY valid JSON, no markdown formatting.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
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
      className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full p-8 relative"
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
            <Select value={config.type} onValueChange={(value) => setConfig({...config, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types (Mixed)</SelectItem>
                {TYPES.map(t => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category Focus</label>
            <Select value={config.category} onValueChange={(value) => setConfig({...config, category: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories (Mixed)</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Country</label>
            <Select value={config.country} onValueChange={(value) => setConfig({...config, country: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries (Mixed)</SelectItem>
                {COUNTRIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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