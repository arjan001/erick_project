import React, { useState } from 'react';
import { X, Building2, MapPin, Globe, Mail, Phone, Users, FileText, Star, Calendar, CheckCircle, ExternalLink, Instagram, Linkedin, Twitter, Youtube, Heart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ClientProfileModal({ client, onClose }) {
  const [projectIdx, setProjectIdx] = useState(0);
  const [favorited, setFavorited] = useState(false);

  if (!client) return null;

  const projects = client.projects || [];

  const nextProject = () => setProjectIdx((i) => (i + 1) % projects.length);
  const prevProject = () => setProjectIdx((i) => (i - 1 + projects.length) % projects.length);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-in panel from right - almost full width */}
      <div className="fixed right-0 top-0 z-[51] h-full w-[90%] max-w-5xl bg-white shadow-2xl overflow-y-auto animate-slide-in">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
              {client.logo_url ? (
                <img src={client.logo_url} alt={client.company} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{client.company || client.full_name}</h2>
              <p className="text-sm text-gray-500">{client.city}, {client.country}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location
              </h3>
              <p className="text-gray-600">{client.city}, {client.country}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Status
              </h3>
              <p className="text-gray-600">{client.verification_status === 'verified' ? 'Verified' : 'Pending'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Profile</h3>
              <p className="text-gray-600">{client.profile_public ? 'Public' : 'Private'}</p>
            </div>
          </div>

          {/* Bio Section */}
          {client.bio && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">About</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700">{client.bio}</p>
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
              <div className="text-sm text-gray-500">Active Projects</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{client.profile_public ? 'Public' : 'Private'}</div>
              <div className="text-sm text-gray-500">Profile Status</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{client.verification_status === 'verified' ? 'Verified' : 'Pending'}</div>
              <div className="text-sm text-gray-500">Verification</div>
            </div>
          </div>

          {/* Projects Section */}
          {projects.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Projects</h3>
              
              <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
                {projects[projectIdx]?.image_url ? (
                  <img 
                    src={projects[projectIdx].image_url} 
                    alt={projects[projectIdx].title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FileText className="w-12 h-12" />
                  </div>
                )}
                
                {projects.length > 1 && (
                  <>
                    <button
                      onClick={prevProject}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextProject}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {projects.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setProjectIdx(i)}
                          className={`h-2 rounded-full transition-all ${i === projectIdx ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">{projects[projectIdx]?.title || 'Untitled Project'}</h4>
                <p className="text-gray-600 text-sm">{projects[projectIdx]?.notes || 'No description available'}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {projects[projectIdx]?.departments_needed?.map((dept, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                      {dept}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                  {projects[projectIdx]?.budget_min && (
                    <span>Budget: KES {projects[projectIdx].budget_min?.toLocaleString()}</span>
                  )}
                  {projects[projectIdx]?.project_type && (
                    <span>Type: {projects[projectIdx].project_type.replace(/_/g, ' ')}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {client.linkedin && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                    <p className="text-gray-600 text-sm truncate">{client.linkedin}</p>
                  </div>
                </div>
              )}
              {client.instagram && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Instagram</p>
                    <p className="text-gray-600 text-sm truncate">{client.instagram}</p>
                  </div>
                </div>
              )}
              {client.twitter && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Twitter</p>
                    <p className="text-gray-600 text-sm truncate">{client.twitter}</p>
                  </div>
                </div>
              )}
              {client.youtube && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <Youtube className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">YouTube</p>
                    <p className="text-gray-600 text-sm truncate">{client.youtube}</p>
                  </div>
                </div>
              )}
              {client.website && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 md:col-span-2">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Website</p>
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 text-sm hover:text-blue-600 truncate">
                      {client.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{client.email}</p>
                  </div>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">{client.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-gray-200 p-4 bg-white flex gap-3">
          <button className="flex-1 bg-[#4F46E5] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Contact {client.company || client.full_name}
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
  );
}
