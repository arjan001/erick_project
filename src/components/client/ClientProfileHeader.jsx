import React from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, Globe, Upload } from 'lucide-react'

export default function ClientProfileHeader({
  user, projectOwner, uploadingLogo, logoInputRef, onLogoUpload,
  companyName, editingProfile, setEditingProfile,
  editingBio, setEditingBio, profileBio, setProfileBio, onSaveBio,
  editingSocial, setEditingSocial, profileWebsite, setProfileWebsite, onSaveSocial,
  profileIndustry, setProfileIndustry, profileCompanyName, setProfileCompanyName,
  profileCompanySize, setProfileCompanySize, onSaveProfile
}) {
  return (
    <div className="p-6 bg-white border-b border-gray-100">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{companyName || user.full_name}</h1>
          <p className="text-sm text-gray-600 mb-2">
            {profileIndustry && `${profileIndustry} • `}
            {profileCompanySize}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>

          {editingBio ? (
            <div className="mt-3">
              <textarea
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Tell us about your company..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none"
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={onSaveBio} className="bg-black text-white hover:bg-gray-800">Save</Button>
                <Button size="sm" onClick={() => setEditingBio(false)} variant="outline">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              {projectOwner?.bio ? (
                <p className="text-gray-700 text-sm leading-relaxed">{projectOwner.bio}</p>
              ) : (
                <button onClick={() => setEditingBio(true)} className="text-gray-400 hover:text-gray-600 text-sm">Add company bio</button>
              )}
              {projectOwner?.bio && (
                <button onClick={() => setEditingBio(true)} className="text-gray-400 hover:text-gray-600 ml-2">
                  <Edit2 className="w-3 h-3 inline" />
                </button>
              )}
            </div>
          )}

          {editingSocial ? (
            <div className="flex gap-2 items-center mt-3">
              <Globe className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profileWebsite}
                onChange={(e) => setProfileWebsite(e.target.value)}
                placeholder="Website URL"
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 flex-1"
              />
              <Button size="sm" onClick={onSaveSocial} className="bg-black text-white hover:bg-gray-800">Save</Button>
              <Button size="sm" onClick={() => setEditingSocial(false)} variant="outline">Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-3">
              {projectOwner?.website && (
                <a href={projectOwner.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="Website">
                  <Globe className="w-5 h-5" />
                </a>
              )}
              <button onClick={() => setEditingSocial(true)} className="text-gray-400 hover:text-gray-600">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <Button onClick={() => setEditingProfile(!editingProfile)} variant="outline" size="sm" className="flex items-center gap-2">
          <Edit2 className="w-4 h-4" />
          {editingProfile ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {editingProfile && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                value={profileCompanyName}
                onChange={(e) => setProfileCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <input
                type="text"
                value={profileIndustry}
                onChange={(e) => setProfileIndustry(e.target.value)}
                placeholder="e.g., Technology, Retail"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company Size</label>
              <select
                value={profileCompanySize}
                onChange={(e) => setProfileCompanySize(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={onSaveProfile} className="bg-black text-white hover:bg-gray-800">Save Changes</Button>
            <Button onClick={() => setEditingProfile(false)} variant="outline">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}