import React from 'react';
import { Upload, MapPin, Edit, Edit2, Globe, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Team profile header (logo, name, bio, social links + status) and the admin-only
// "Edit Team Profile" form. Invited members (isTeamMember) get a read-only header —
// only the team admin can edit team-wide settings.
export default function TeamProfileHeaderCard({
  team, setTeam, isTeamMember,
  uploadingLogo, handleLogoUpload,
  editingBio, setEditingBio, profileBio, setProfileBio, handleSaveBio,
  editingSocial, setEditingSocial, profileWebsite, setProfileWebsite,
  profileInstagram, setProfileInstagram, profileLinkedin, setProfileLinkedin, handleSaveSocial,
  getStatusBadge, getAvailabilityBadge,
  editingProfile, setEditingProfile, handleSaveProfile,
}) {
  return (
    <>
      <Card className="mb-8 bg-gray-50 border-2 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-lg bg-gray-300 flex items-center justify-center text-gray-700 text-3xl font-bold overflow-hidden">
                  {team.team_logo_url ? (
                    <img src={team.team_logo_url} alt={team.team_name} className="w-full h-full object-cover" />
                  ) : (
                    team.team_name?.charAt(0).toUpperCase()
                  )}
                </div>
                {!isTeamMember && (
                  <>
                    <input type="file" id="team-logo-upload" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                    <label htmlFor="team-logo-upload" className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      {uploadingLogo ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 text-gray-600" />
                      )}
                    </label>
                  </>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-black mb-1">{team.team_name}</h2>
                <p className="text-gray-600 mb-2">Team Code: {team.team_code}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{team.city}, {team.country}</span>
                </div>

                {/* Bio */}
                {editingBio ? (
                  <div className="mb-3">
                    <textarea value={profileBio} onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="Tell us about your team..." rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none" />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={handleSaveBio} className="bg-black text-white hover:bg-gray-800">Save</Button>
                      <Button size="sm" onClick={() => setEditingBio(false)} variant="outline">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    {team?.bio ? (
                      <p className="text-gray-700 text-sm leading-relaxed">{team.bio}</p>
                    ) : !isTeamMember ? (
                      <button onClick={() => setEditingBio(true)} className="text-gray-400 hover:text-gray-600 text-sm">Add bio</button>
                    ) : null}
                    {team?.bio && !isTeamMember && (
                      <button onClick={() => setEditingBio(true)} className="text-gray-400 hover:text-gray-600 ml-2">
                        <Edit2 className="w-3 h-3 inline" />
                      </button>
                    )}
                  </div>
                )}

                {/* Social Links */}
                {editingSocial ? (
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex gap-2 items-center">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <input type="text" value={profileWebsite} onChange={(e) => setProfileWebsite(e.target.value)}
                        placeholder="Website URL" className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 flex-1" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <Instagram className="w-4 h-4 text-gray-400" />
                      <input type="text" value={profileInstagram} onChange={(e) => setProfileInstagram(e.target.value)}
                        placeholder="Instagram URL" className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 flex-1" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <Linkedin className="w-4 h-4 text-gray-400" />
                      <input type="text" value={profileLinkedin} onChange={(e) => setProfileLinkedin(e.target.value)}
                        placeholder="LinkedIn URL" className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 flex-1" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={handleSaveSocial} className="bg-black text-white hover:bg-gray-800">Save</Button>
                      <Button size="sm" onClick={() => setEditingSocial(false)} variant="outline">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-3">
                    {team?.website && (
                      <a href={team.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="Website">
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    {team?.instagram && (
                      <a href={team.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="Instagram">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {team?.linkedin && (
                      <a href={team.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="LinkedIn">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {!isTeamMember && (
                      <button onClick={() => setEditingSocial(true)} className="text-gray-400 hover:text-gray-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              {getStatusBadge()}
              {getAvailabilityBadge()}
              {isTeamMember ? (
                <span className="text-xs font-medium text-gray-500 px-3 py-1.5 border border-gray-200 rounded-md">Team Member</span>
              ) : (
                <Button onClick={() => setEditingProfile(!editingProfile)} variant="outline" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  {editingProfile ? 'Cancel' : 'Edit Profile'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {editingProfile && !isTeamMember && (
        <Card className="mb-8 border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Edit Team Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Team Name</label>
                <Input value={team.team_name || ''} onChange={(e) => setTeam({ ...team, team_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contact Name</label>
                <Input value={team.contact_name || ''} onChange={(e) => setTeam({ ...team, contact_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contact Email</label>
                <Input value={team.contact_email || ''} onChange={(e) => setTeam({ ...team, contact_email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input value={team.phone || ''} onChange={(e) => setTeam({ ...team, phone: e.target.value })} placeholder="+31 6 1234 5678" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <select value={team.availability || 'available'} onChange={(e) => setTeam({ ...team, availability: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-md px-3">
                  <option value="available">Available</option>
                  <option value="limited">Limited Availability</option>
                  <option value="booked">Fully Booked</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleSaveProfile} className="bg-black hover:bg-gray-800">Save Changes</Button>
              <Button onClick={() => setEditingProfile(false)} variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}