import React, { useState } from 'react'
import { Upload, X, CheckCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { base44 } from '@/api/base44Client'

export default function ArtistStepPortfolio({ data, updateData }) {
  const [isUploading, setIsUploading] = useState(false)
  const [agreements, setAgreements] = useState({
    noLogos: false,
    portfolioUsage: false
  })

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!agreements.noLogos || !agreements.portfolioUsage) {
      alert('Please agree to the portfolio requirements first')
      return
    }

    setIsUploading(true)
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file })
      
      const clipData = {
        uploaded_by_type: 'artist',
        uploaded_by_id: 'temp',
        original_video_url: file_url,
        trimmed_video_url: file_url,
        trim_start_time: 0,
        duration: 30,
        no_logos_agreement: agreements.noLogos,
        portfolio_usage_agreement: agreements.portfolioUsage,
        status: 'pending'
      }

      updateData('portfolio_clips', [...(data.portfolio_clips || []), clipData])
    } catch (error) {
      alert('Error uploading file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeClip = (index) => {
    updateData('portfolio_clips', data.portfolio_clips.filter((_, i) => i !== index))
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Portfolio</h2>
      <p className="text-gray-600 mb-8">Upload 1-3 clips showcasing your work (max 30 seconds each)</p>

      {/* Agreements */}
      <div className="space-y-4 mb-8 p-6 bg-gray-100 rounded-xl border border-gray-200">
        <h3 className="font-semibold mb-3 text-black">Portfolio Requirements</h3>
        
        <div className="flex items-start gap-3">
          <Checkbox
            id="noLogos"
            checked={agreements.noLogos}
            onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, noLogos: checked }))}
            className="mt-1"
          />
          <Label htmlFor="noLogos" className="text-sm cursor-pointer leading-relaxed">
            I confirm my clips contain <strong>no logos, watermarks, or overlays</strong>
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="portfolioUsage"
            checked={agreements.portfolioUsage}
            onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, portfolioUsage: checked }))}
            className="mt-1"
          />
          <Label htmlFor="portfolioUsage" className="text-sm cursor-pointer leading-relaxed">
            I agree to <strong>Eric Rabar using these clips</strong> as visual direction examples for clients
          </Label>
        </div>
      </div>

      {/* Uploaded Clips */}
      {(data.portfolio_clips || []).length > 0 && (
        <div className="space-y-3 mb-6">
          {data.portfolio_clips.map((clip, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-300">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-black">Portfolio clip {index + 1}</span>
              </div>
              <button
                onClick={() => removeClip(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {(data.portfolio_clips || []).length < 3 && (
        <div>
          <input
            type="file"
            id="portfolio-upload"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={!agreements.noLogos || !agreements.portfolioUsage || isUploading}
          />
          <Label htmlFor="portfolio-upload">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              agreements.noLogos && agreements.portfolioUsage
                ? 'border-gray-300 hover:border-amber-600 cursor-pointer'
                : 'border-gray-300 opacity-50 cursor-not-allowed'
            }`}>
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="font-medium mb-2 text-black">
                {isUploading ? 'Uploading...' : 'Click to upload video'}
              </p>
              <p className="text-sm text-gray-600">Max 30 seconds, MP4 or MOV</p>
            </div>
          </Label>
        </div>
      )}
    </div>
  )
}