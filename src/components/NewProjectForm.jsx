import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, CheckCircle2, Loader } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'
import { analyzeWebsiteUrl, saveAnalyzedProjectToStorage } from '@/lib/urlAnalysisService'

export default function NewProjectForm({ selectedCategory = 'commercial' }) {
  const navigate = useNavigate()
  const [referenceUrl, setReferenceUrl] = useState('')
  const [description, setDescription] = useState('')
  const projectTypeMap = {
    commercial: 'commercial',
    short: 'short_film',
    feature: 'film',
    music: 'music_video',
    documentary: 'documentary'
  }
  const [projectType, setProjectType] = useState(projectTypeMap[selectedCategory] || 'commercial')
  const [extracting, setExtracting] = useState(false)
  const [extractProgress, setExtractProgress] = useState(null)
  const [regenerating, setRegenerating] = useState(false)
  const previousProjectTypeRef = useRef(projectType)
  const previousDescriptionRef = useRef(description)



  React.useEffect(() => {
    const newProjectType = projectTypeMap[selectedCategory] || 'commercial'

    setProjectType(newProjectType)
  }, [selectedCategory])

  // Auto-regenerate analysis when project type changes (if URL exists)
  useEffect(() => {


    const timer = setTimeout(async () => {
      // Check if project type actually changed and we have a reference URL
      if (previousProjectTypeRef.current !== projectType && referenceUrl && referenceUrl.trim() !== '') {


        try {
          setRegenerating(true)

          // Re-analyze the URL with the new project type
          const analysisResult = await analyzeWebsiteUrl(referenceUrl, projectType)



          if (analysisResult.success && analysisResult.rawAnalysis) {
            setDescription(analysisResult.rawAnalysis)
          }
        } catch (err) {

        } finally {
          setRegenerating(false)
        }
      }

      // Update refs
      previousProjectTypeRef.current = projectType
    }, 500); // 0.5 second debounce

    return () => clearTimeout(timer)
  }, [projectType, referenceUrl])

  const getCategoryContext = (type) => {
    const contexts = {
      commercial: 'Commercial Project: Brand-focused, clear structure, defined budgets, marketing-driven.',
      short_film: 'Short Film: Narrative-driven, script-heavy, small to mid crews, artistic focus.',
      film: 'Feature Film: Full production planning, cast, locations, long schedule, cinematic.',
      music_video: 'Music Video: Visual-first, short schedule, strong art direction, performance-based.',
      documentary: 'Documentary: Real-world content, flexible planning, research-focused, authentic storytelling.'
    }
    return contexts[type] || contexts.commercial
  }

  const progressSteps = [
    'Fetching site content',
    'Analyzing brand and tone',
    'Identifying visual language',
    'Translating into a film concept'
  ]

  const handleExtract = async () => {
    if (!referenceUrl) return

    setExtracting(true)
    setExtractProgress(0)

    // Simulate progress through steps
    const progressInterval = setInterval(() => {
      setExtractProgress(prev => {
        if (prev === null) return 0
        if (prev < progressSteps.length - 1) return prev + 1
        return prev
      })
    }, 800)

    try {
      // Use the new urlAnalysisService
      const analysisResult = await analyzeWebsiteUrl(referenceUrl, projectType)

      clearInterval(progressInterval)

      if (analysisResult.success && analysisResult.rawAnalysis) {
        // Set description directly from raw analysis for speed
        setDescription(analysisResult.rawAnalysis)
        setExtractProgress(progressSteps.length - 1)
        setTimeout(() => {
          setExtractProgress(null)
        }, 600)
      } else {

        setExtractProgress(null)
      }
    } catch (error) {

      setExtractProgress(null)
      clearInterval(progressInterval)
    } finally {
      setExtracting(false)
    }
  }

  const handleSubmit = () => {
    if (!description) return

    // Save analyzed data to localStorage for SubmitProject flow - pass URL as-is without validation
    saveAnalyzedProjectToStorage({
      url: referenceUrl,
      analysis: { rawAnalysis: description, url: referenceUrl },
      brief: null,
      projectType: selectedCategory,
      additionalNotes: description
    })

    // Navigate to SubmitProject with the description
    const params = new URLSearchParams()
    params.set('description', description)
    params.set('category', selectedCategory)
    navigate(createPageUrl(`SubmitProject?${params.toString()}`))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-[#1a1a1a] -mt-2">New Project</h2>
      <p className="text-[#666] text-sm mb-6">One sentence. The system handles the rest.</p>

      {/* Reference Website */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-2 text-[#666]">Domain or Reference (Optional)</label>
        <div className="flex gap-2 mb-1">
          <Input
            placeholder="www.example.com or nike.com or apple.com"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            className="flex-1 bg-white border-gray-300 text-sm"
          />
          <Button
            onClick={handleExtract}
            disabled={!referenceUrl || extracting}
            size="sm"
            className="bg-gray-700 hover:bg-gray-800 text-white"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {extracting ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
        <p className="text-xs text-[#999]">
          Enter any company domain or reference URL. We'll analyze their brand, visual language, and tone to help frame your project.
        </p>

        {/* Progress Indicator */}
        {extractProgress !== null && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-2">
              {progressSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {idx < extractProgress && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                  {idx === extractProgress && (
                    <Loader className="w-4 h-4 text-blue-600 flex-shrink-0 animate-spin" />
                  )}
                  {idx > extractProgress && (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                  )}
                  <span className={idx <= extractProgress ? 'text-gray-800' : 'text-gray-500'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Project Description */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-[#666]">Project Description</label>
          {regenerating && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Loader className="w-3 h-3 animate-spin" />
              <span>Reanalyzing...</span>
            </div>
          )}
        </div>
        <Textarea
          placeholder="Describe your project or use Analyze button above. Example: 'We need a 30-second commercial showcasing our new product line with a sleek, modern aesthetic inspired by Nike's visual style. Target audience is 25-40 year olds who value innovation.'"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] text-sm bg-white border-gray-300"
        />
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2">
        <Button
          onClick={handleSubmit}
          disabled={!description}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm"
        >
          Continue to Project Details
        </Button>
      </div>
    </div>
  )
}