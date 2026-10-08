import React from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BackerStepPortfolio({ data, updateData }) {
  const handleAddClip = () => {
    const newClip = {
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: ''
    }
    updateData('portfolio_clips', [...(data.portfolio_clips || []), newClip])
  }

  const handleRemoveClip = (index) => {
    updateData('portfolio_clips', data.portfolio_clips.filter((_, i) => i !== index))
  }

  const handleUpdateClip = (index, field, value) => {
    const updated = data.portfolio_clips.map((clip, i) =>
      i === index ? { ...clip, [field]: value } : clip
    )
    updateData('portfolio_clips', updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Portfolio (Optional)</h3>
        <p className="text-gray-600 mb-6">Showcase your previous investments or projects</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Website</label>
        <input
          type="url"
          value={data.website}
          onChange={(e) => updateData('website', e.target.value)}
          placeholder="https://yourwebsite.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Social Media</label>
        <input
          type="url"
          value={data.social_media}
          onChange={(e) => updateData('social_media', e.target.value)}
          placeholder="https://linkedin.com/in/yourprofile"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-900">Portfolio Clips</label>
          <Button type="button" onClick={handleAddClip} size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Add Clip
          </Button>
        </div>

        {(data.portfolio_clips || []).length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No portfolio clips added</p>
        ) : (
          <div className="space-y-4">
            {data.portfolio_clips.map((clip, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">Clip {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveClip(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={clip.title}
                    onChange={(e) => handleUpdateClip(index, 'title', e.target.value)}
                    placeholder="Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <textarea
                    value={clip.description}
                    onChange={(e) => handleUpdateClip(index, 'description', e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="url"
                    value={clip.video_url}
                    onChange={(e) => handleUpdateClip(index, 'video_url', e.target.value)}
                    placeholder="Video URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
