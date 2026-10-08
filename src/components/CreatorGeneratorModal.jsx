import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Sparkles, ChevronDown } from 'lucide-react'
import { base44 } from '@/api/base44Client'
import { Creator } from '@/lib/supabaseEntities'

const TYPES = ['freelance', 'studio', 'agency', 'team', 'collective']
const CATEGORIES = [
  'cinematography', 'directing', 'lighting', 'production', 'editing',
  'color_grading', 'sound_design', 'music', 'vfx', '3d_animation',
  'motion_graphics', 'art_direction', 'production_design', 'costume',
  'makeup', 'camera_operation', 'drone', 'gaffer', 'grip', 'dop',
  'scriptwriting', 'web_design'
]
const COUNTRIES = [
  'Netherlands', 'Germany', 'France', 'Spain', 'Italy',
  'United Kingdom', 'Belgium', 'Sweden', 'Denmark', 'Norway',
  'Finland', 'Austria', 'Switzerland', 'Portugal', 'Poland'
]

export default function CreatorGeneratorModal({ onClose, onGenerated }) {
  const [config, setConfig] = useState({
    types: [],
    categories: [],
    countries: [],
    count: 10
  })
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setProgress('Generating creators with AI...')

    try {
      const prompt = `YOUR MISSION: Find ${config.count} REAL production companies and get their ACTUAL LOGO from the web.

${config.types.length > 0 ? `Types: ${config.types.join(', ')}` : 'All types'}
${config.categories.length > 0 ? `Categories: ${config.categories.join(', ')}` : 'All categories'}
${config.countries.length > 0 ? `Countries: ${config.countries.join(', ')}` : 'European countries'}

STEP-BY-STEP PROCESS FOR EACH COMPANY:

1. Pick a REAL company (MJZ, Stink Films, RSA Films, The Mill, Framestore, Partizan, etc.)
2. Search Google for "[company name] logo"
3. Find their actual logo image on their website or Wikipedia
4. Get the DIRECT image URL - must end in .png, .jpg, .svg, or .webp
5. If NO real logo found = DO NOT include this company
6. Move to next company

LOGO URL EXAMPLES (what GOOD looks like):
- https://mjzfilms.com/images/mjz-logo.svg
- https://stinkfilms.com/assets/logo.png  
- https://upload.wikimedia.org/wikipedia/commons/logo.png
- https://cdn.company.com/brand/logo.jpg

WHAT TO AVOID:
- Unsplash images
- Placeholder URLs
- Made-up URLs
- URLs without image extensions

FIELDS TO RETURN:
- name: Real company name (verified)
- type: freelance/studio/agency/team/collective
- city: Real city
- country: Real country
- website: Real domain (check it exists)
- logo_url: DIRECT image URL you found (MANDATORY - no logo = skip company)
- profile_image_url: Unsplash cinematic/production image
- categories: 2-4 real specialties
- awards_count: 0-30 realistic number

CRITICAL: Better to return 3 companies with REAL logos than 10 with fake ones.

Return ONLY valid JSON array of companies.`

      const response = await base44.functions.invoke('generateCreators', {
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
      })

      // Filter out creators without valid logo URLs
      const validCreators = response.creators.filter(c => {
        const hasLogo = c.logo_url && 
                       c.logo_url.startsWith('http') && 
                       c.logo_url.length > 20 &&
                       !c.logo_url.includes('placeholder')
        if (!hasLogo) {
          
        }
        return hasLogo
      })

      if (validCreators.length === 0) {
        setProgress('Error: No companies with valid logos were found. Try again with different criteria.')
        setTimeout(() => setGenerating(false), 3000)
        return
      }

      setProgress(`Found ${validCreators.length} creators with verified logos. Saving to database...`)

      // Save to database
      await Promise.all(validCreators.map(c => Creator.create(c)))

      setProgress('Complete!')
      setTimeout(() => {
        onGenerated()
        onClose()
      }, 1000)

    } catch (error) {
      
      setProgress('Error: ' + error.message)
    } finally {
      setTimeout(() => setGenerating(false), 2000)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6"
      onClick={() => {
        setOpenDropdown(null)
        onClose()
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
                    const isSelected = config.types.includes(t)
                    return (
                      <label key={t} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const newTypes = isSelected
                              ? config.types.filter(x => x !== t)
                              : [...config.types, t]
                            setConfig({...config, types: newTypes})
                          }}
                          className="w-4 h-4"
                        />
                        <span className="capitalize text-sm">{t}</span>
                      </label>
                    )
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
                    const isSelected = config.categories.includes(c)
                    return (
                      <label key={c} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const newCats = isSelected
                              ? config.categories.filter(x => x !== c)
                              : [...config.categories, c]
                            setConfig({...config, categories: newCats})
                          }}
                          className="w-4 h-4"
                        />
                        <span className="capitalize text-sm">{c.replace('_', ' ')}</span>
                      </label>
                    )
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
                    const isSelected = config.countries.includes(c)
                    return (
                      <label key={c} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const newCountries = isSelected
                              ? config.countries.filter(x => x !== c)
                              : [...config.countries, c]
                            setConfig({...config, countries: newCountries})
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{c}</span>
                      </label>
                    )
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
  )
}