import React, { useState } from 'react';
import { X, MapPin, Star, ExternalLink, Mail, Phone, Calendar, FileText, Award, GraduationCap, Shield, Users, Globe, Instagram, Linkedin, Twitter, Youtube, CheckCircle, XCircle, Heart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CreatorProfileModal({ profile, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [favorited, setFavorited] = useState(false);

  if (!profile) return null;

  const nextImg = () => setImgIdx((i) => (i + 1) % profile.images.length);
  const prevImg = () => setImgIdx((i) => (i - 1 + profile.images.length) % profile.images.length);

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
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 ring-2 ring-gray-100">
              <img src={profile.images[0]} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-sm text-gray-500">{profile.profession} • {profile.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Large profile image */}
        <div className="relative aspect-[16/9] bg-gray-100">
          <img
            src={profile.images[imgIdx]}
            alt={`${profile.name} portfolio`}
            className="w-full h-full object-cover"
          />
          {profile.images.length > 1 && (
            <>
              <button
                onClick={prevImg}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImg}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {profile.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-2 rounded-full transition-all ${i === imgIdx ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location
              </h3>
              <p className="text-gray-600">{profile.location}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Profession
              </h3>
              <p className="text-gray-600">{profile.profession}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Gender</h3>
              <p className="text-gray-600">{profile.gender}</p>
            </div>
          </div>

          {profile.overlayText && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="text-lg font-bold text-purple-900">{profile.overlayText}</p>
            </div>
          )}

          {/* Appearance Section */}
          {profile.appearance && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Appearance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(profile.appearance).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-gray-900 font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {profile.skills && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Credits Section */}
          {profile.credits && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Credits</h3>
              <div className="space-y-4">
                {profile.credits.film && profile.credits.film.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Film</h4>
                    <ul className="space-y-2">
                      {profile.credits.film.map((credit, idx) => (
                        <li key={idx} className="text-gray-600 flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {credit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {profile.credits.commercials && profile.credits.commercials.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Commercials</h4>
                    <ul className="space-y-2">
                      {profile.credits.commercials.map((credit, idx) => (
                        <li key={idx} className="text-gray-600 flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {credit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education Section */}
          {profile.education && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Education & Training</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <ul className="space-y-3">
                  {profile.education.map((edu, idx) => (
                    <li key={idx} className="text-gray-600 flex items-start gap-2">
                      <Award className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Social Media Section */}
          {profile.socialMedia && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {profile.socialMedia.instagram && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Instagram className="w-5 h-5 text-pink-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Instagram</p>
                      <p className="text-gray-600 text-sm">{profile.socialMedia.instagram}</p>
                    </div>
                  </div>
                )}
                {profile.socialMedia.linkedin && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                      <p className="text-gray-600 text-sm">{profile.socialMedia.linkedin}</p>
                    </div>
                  </div>
                )}
                {profile.socialMedia.twitter && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Twitter className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Twitter</p>
                      <p className="text-gray-600 text-sm">{profile.socialMedia.twitter}</p>
                    </div>
                  </div>
                )}
                {profile.socialMedia.youtube && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Youtube className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">YouTube</p>
                      <p className="text-gray-600 text-sm">{profile.socialMedia.youtube}</p>
                    </div>
                  </div>
                )}
                {profile.socialMedia.tiktok && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">TikTok</p>
                      <p className="text-gray-600 text-sm">{profile.socialMedia.tiktok}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Representation Section */}
          {profile.representation && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Representation</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Agency</p>
                    <p className="text-gray-900 font-medium">{profile.representation.agent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{profile.representation.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Union Membership Section */}
          {profile.unionMembership && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Union Membership</h3>
              <div className="flex flex-wrap gap-2">
                {profile.unionMembership.map((union, idx) => (
                  <span key={idx} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {union}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* License & Passport Section */}
          {profile.licensePassport && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">License & Passport</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <div>
                    <p className="text-sm text-gray-500">Driver's License</p>
                    <p className="text-gray-900 font-medium">{profile.licensePassport.driverLicense ? 'Valid' : 'Not Provided'}</p>
                  </div>
                  {profile.licensePassport.driverLicense ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <div>
                    <p className="text-sm text-gray-500">Passport</p>
                    <p className="text-gray-900 font-medium">{profile.licensePassport.passport ? 'Valid' : 'Not Provided'}</p>
                  </div>
                  {profile.licensePassport.passport ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Photo Gallery Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio Gallery</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {profile.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImgIdx(idx)}
                  className={`aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-colors ${idx === imgIdx ? 'border-[#4F46E5]' : 'border-transparent'
                    }`}
                >
                  <img src={img} alt={`${profile.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-gray-200 p-4 bg-white flex gap-3">
          <button className="flex-1 bg-[#4F46E5] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Contact {profile.name}
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
