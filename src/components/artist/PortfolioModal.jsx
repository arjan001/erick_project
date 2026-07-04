import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Video, Link2, Film } from 'lucide-react';
import RolesTagInput from './RolesTagInput';

const PROJECT_TYPES = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'music_video', label: 'Music Video' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'short_film', label: 'Short Film' },
  { value: 'film', label: 'Film' },
  { value: 'other', label: 'Other' },
];

const VIDEO_SOURCES = [
  { value: 'upload', label: 'Upload Video File' },
  { value: 'vimeo', label: 'Vimeo Link' },
  { value: 'youtube', label: 'YouTube Link' },
  { value: 'tiktok', label: 'TikTok Link' },
  { value: 'google_drive', label: 'Google Drive Link' },
];

// Convert a raw video URL into an embeddable URL based on the source
export function getEmbedUrl(url, source) {
  if (!url) return '';
  try {
    if (source === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    }
    if (source === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : url;
    }
    if (source === 'tiktok') {
      const match = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
      return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : url;
    }
    if (source === 'google_drive') {
      const match = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
      return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
    }
    return url;
  } catch {
    return url;
  }
}

// Add/Edit portfolio work modal — supports cover image, video upload, or external video links
export default function PortfolioModal({
  editingPortfolio,
  portfolioForm,
  setPortfolioForm,
  onClose,
  onSubmit,
  uploading,
  selectedCoverImage,
  setSelectedCoverImage,
  selectedVideoFile,
  setSelectedVideoFile,
  maxVideoSizeMB = 20,
}) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [videoError, setVideoError] = useState('');
  const [videoSource, setVideoSource] = useState(portfolioForm?.video_source || 'upload');
  const [videoLink, setVideoLink] = useState(portfolioForm?.original_video_url || '');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedCoverImage(file);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxVideoSizeMB * 1024 * 1024) {
      setVideoError(`Video must be under ${maxVideoSizeMB}MB. This file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
      setSelectedVideoFile(null);
      e.target.value = '';
      return;
    }
    setVideoError('');
    setSelectedVideoFile(file);
  };

  const handleVideoSourceChange = (src) => {
    setVideoSource(src);
    setVideoError('');
    if (src !== 'upload') {
      setSelectedVideoFile(null);
    } else {
      setVideoLink('');
    }
  };

  const handleVideoLinkChange = (e) => {
    const val = e.target.value;
    setVideoLink(val);
    setPortfolioForm(prev => ({
      ...prev,
      original_video_url: val,
      video_source: videoSource,
      video_embed_url: getEmbedUrl(val, videoSource),
    }));
  };

  const handleSubmit = () => {
    // Ensure video_source and link data are in the form
    if (videoSource !== 'upload' && videoLink) {
      setPortfolioForm(prev => ({
        ...prev,
        video_source: videoSource,
        original_video_url: videoLink,
        video_embed_url: getEmbedUrl(videoLink, videoSource),
      }));
    }
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {editingPortfolio ? 'Edit Portfolio Item' : 'Add Work to Portfolio'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Showcase a photo, a video, or an external video link.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
            <input
              type="text"
              value={portfolioForm.title}
              onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter project title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
            <select
              value={portfolioForm.project_type}
              onChange={(e) => setPortfolioForm(prev => ({ ...prev, project_type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            >
              {PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Role(s) <span className="text-xs text-gray-400">— select all that apply</span></label>
            <RolesTagInput
              selected={portfolioForm.roles || []}
              onChange={(roles) => setPortfolioForm(prev => ({
                ...prev,
                roles,
                role: roles[0] || prev.role || '',
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={portfolioForm.description}
              onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the project..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-600">{selectedCoverImage ? selectedCoverImage.name : 'Click to upload a photo'}</p>
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Video Source Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-indigo-500" /> Video Source
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {VIDEO_SOURCES.map(src => (
                <button
                  key={src.value}
                  type="button"
                  onClick={() => handleVideoSourceChange(src.value)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                    videoSource === src.value
                      ? 'bg-black text-white font-medium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>

            {/* Upload video file */}
            {videoSource === 'upload' && (
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Video className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-600">{selectedVideoFile ? selectedVideoFile.name : 'Click to upload a video'}</p>
                <p className="text-xs text-gray-400 mt-1">Max {maxVideoSizeMB}MB</p>
              </div>
            )}

            {/* External video link */}
            {videoSource !== 'upload' && (
              <div>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={videoLink}
                    onChange={handleVideoLinkChange}
                    placeholder={
                      videoSource === 'vimeo' ? 'https://vimeo.com/123456789' :
                      videoSource === 'youtube' ? 'https://youtube.com/watch?v=...' :
                      videoSource === 'tiktok' ? 'https://tiktok.com/@user/video/...' :
                      'https://drive.google.com/file/d/...'
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                {videoLink && videoSource !== 'tiktok' && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      src={getEmbedUrl(videoLink, videoSource)}
                      className="w-full aspect-video"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="Video preview"
                    />
                  </div>
                )}
                {videoLink && videoSource === 'tiktok' && (
                  <p className="text-xs text-gray-500 mt-2">TikTok link saved — video will be embedded on your profile.</p>
                )}
              </div>
            )}

            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
            {videoError && <p className="text-xs text-red-600 mt-1">{videoError}</p>}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-1 bg-black text-white hover:bg-gray-800"
          >
            {uploading ? 'Uploading...' : (editingPortfolio ? 'Update' : 'Add')}
          </Button>
        </div>
      </div>
    </div>
  );
}