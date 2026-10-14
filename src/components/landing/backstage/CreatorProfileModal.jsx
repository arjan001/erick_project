import React, { useState } from 'react'
import { X, MapPin, Star, ExternalLink, Mail, Phone, Calendar, FileText, Award, GraduationCap, Shield, Users, Globe, Instagram, Linkedin, Twitter, Youtube, CheckCircle, XCircle, Heart, MessageCircle, ChevronLeft, ChevronRight, Image as ImageIcon, Video, Play } from 'lucide-react'

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

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Wide modal - 3/4 screen width */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[51] w-[75vw] max-w-5xl h-[90vh] bg-white shadow-2xl overflow-y-auto rounded-xl">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 ring-2 ring-gray-100">
              <img src={profile.images[0] || '/placeholder-avatar.png'} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-500">{profile.profession}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Purple header bar */}
        <div className="bg-[#5842D3] px-6 py-3 flex gap-6 text-white text-sm font-medium">
          <button className="hover:opacity-80">Artist Portfolio</button>
          <button className="hover:opacity-80">Welcome</button>
        </div>

        {/* Main content */}
        <div className="p-6">
          {/* Profile image section - large image + 4 small images */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Large image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                {largeImage ? (
                  largeImage.includes('.mp4') || largeImage.includes('.mov') ? (
                    <video src={largeImage} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={largeImage} alt={`${profile.name} main`} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* 4 small images */}
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((idx) => {
                  const img = smallImages[idx]
                  return (
                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                      {img ? (
                        img.includes('.mp4') || img.includes('.mov') ? (
                          <div className="w-full h-full relative">
                            <video src={img} className="w-full h-full object-cover" />
                            <Play className="absolute bottom-1 right-1 w-5 h-5 text-white bg-black/50 rounded p-0.5" />
                          </div>
                        ) : (
                          <img src={img} alt={`${profile.name} ${idx + 2}`} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            {profile.images.length > 5 && (
              <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View {profile.images.length - 5} more photos
              </button>
            )}
          </div>

          {/* Basic info */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">{profile.profession}</h3>
          </div>

          {/* Location */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {profile.location}
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 10).map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Credits */}
          {profile.credits && (profile.credits.film?.length > 0 || profile.credits.commercials?.length > 0) && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Credits & Experience</h3>
              <div className="space-y-4">
                {profile.credits.film && profile.credits.film.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Film</h4>
                    <ul className="space-y-1">
                      {profile.credits.film.slice(0, 5).map((credit, idx) => (
                        <li key={idx} className="text-sm text-gray-600">• {credit}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {profile.credits.commercials && profile.credits.commercials.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Commercials & Industrials</h4>
                    <ul className="space-y-1">
                      {profile.credits.commercials.slice(0, 5).map((credit, idx) => (
                        <li key={idx} className="text-sm text-gray-600">• {credit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {profile.education && profile.education.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Education & Training</h3>
              <div className="space-y-2">
                {profile.education.slice(0, 3).map((edu, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    {edu}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media */}
          {profile.socialMedia && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Social Media</h3>
              <div className="flex gap-3">
                {profile.socialMedia.instagram && (
                  <a href={profile.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600">
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
                {profile.socialMedia.linkedin && (
                  <a href={profile.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    <Linkedin className="w-6 h-6" />
                  </a>
                )}
                {profile.socialMedia.youtube && (
                  <a href={profile.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">
                    <Youtube className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-gray-200 p-6 bg-white flex gap-3">
          <button className="flex-1 bg-black text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
          <button
            onClick={() => setFavorited(!favorited)}
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
            {favorited ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </>
  )
}
