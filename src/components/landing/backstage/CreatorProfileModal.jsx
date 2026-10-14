import React, { useState } from 'react'
import { X, MapPin, Star, ExternalLink, Mail, Phone, Calendar, FileText, Award, GraduationCap, Shield, Users, Globe, Instagram, Linkedin, Twitter, Youtube, CheckCircle, XCircle, Heart, MessageCircle, ChevronLeft, ChevronRight, Image as ImageIcon, Video } from 'lucide-react'

export default function CreatorProfileModal({ profile, onClose }) {
  const [imgIdx, setImgIdx] = useState(0)
  const [favorited, setFavorited] = useState(false)

  if (!profile) return null

  const nextImg = () => setImgIdx((i) => (i + 1) % profile.images.length)
  const prevImg = () => setImgIdx((i) => (i - 1 + profile.images.length) % profile.images.length)

  // Ensure we have at least 5 slots (1 large + 4 small)
  const displayImages = profile.images.slice(0, 5)
  const largeImage = displayImages[0]
  const smallImages = displayImages.slice(1, 5)
  const hasVideo = profile.images.some(img => img.includes('.mp4') || img.includes('.mov'))

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in panel from right - narrower width */}
      <div className="fixed right-0 top-0 z-[51] h-full w-[450px] max-w-[90vw] bg-white shadow-2xl overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 ring-2 ring-gray-100">
              <img src={profile.images[0] || '/placeholder-avatar.png'} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
              <p className="text-xs text-gray-500">{profile.profession}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Media Grid - One large on left, 4 small on right */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Large image - takes full height */}
            <div className="row-span-2 aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {largeImage ? (
                largeImage.includes('.mp4') || largeImage.includes('.mov') ? (
                  <video src={largeImage} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={largeImage} alt={`${profile.name} main`} className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* 4 small images */}
            {[0, 1, 2, 3].map((idx) => {
              const img = smallImages[idx]
              return (
                <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  {img ? (
                    img.includes('.mp4') || img.includes('.mov') ? (
                      <div className="w-full h-full relative">
                        <video src={img} className="w-full h-full object-cover" />
                        <Video className="absolute bottom-1 right-1 w-4 h-4 text-white bg-black/50 rounded p-0.5" />
                      </div>
                    ) : (
                      <img src={img} alt={`${profile.name} ${idx + 2}`} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {profile.location}
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-1">
                {profile.skills.slice(0, 6).map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Credits */}
          {profile.credits && (profile.credits.film?.length > 0 || profile.credits.commercials?.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Credits</h3>
              <div className="space-y-1">
                {profile.credits.film?.slice(0, 3).map((credit, idx) => (
                  <p key={idx} className="text-xs text-gray-600">• {credit}</p>
                ))}
                {profile.credits.commercials?.slice(0, 3).map((credit, idx) => (
                  <p key={idx} className="text-xs text-gray-600">• {credit}</p>
                ))}
              </div>
            </div>
          )}

          {/* Social Media */}
          {profile.socialMedia && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Social</h3>
              <div className="flex gap-2">
                {profile.socialMedia.instagram && (
                  <a href={profile.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {profile.socialMedia.linkedin && (
                  <a href={profile.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {profile.socialMedia.youtube && (
                  <a href={profile.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-gray-200 p-4 bg-white flex gap-2">
          <button className="flex-1 bg-black text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm">
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
          <button
            onClick={() => setFavorited(!favorited)}
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>
    </>
  )
}
