import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { base44 } from '@/api/base44Client'
import { Team } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Phone, MapPin, Briefcase, Edit2, Save, Upload, X, Shield } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast.jsx'
import { useAuth } from '@/lib/AuthContext'

export default function TeamMemberProfilePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { success, error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()
  const [team, setTeam] = useState(null)
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    skills: '',
    bio: '',
    location: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/'
      return
    }
    loadTeamData()
  }, [isAuthenticated])

  const loadTeamData = async () => {
    try {
      let teamData = null
      if (authUser?.team_id) {
        teamData = await Team.filter({ id: authUser.team_id }, '-created_at', 1).then(r => r?.[0] || null)
      } else {
        const teams = await Team.filter({ contact_email: authUser?.email }, '-created_at', 1)
        teamData = teams?.[0] || null
      }
      setTeam(teamData)
      
      const memberId = searchParams.get('id')
      if (memberId) {
        fetchMember(memberId)
      } else {
        setLoading(false)
      }
    } catch (err) {
      //
      toastError('Load Failed', 'Failed to load team data')
      setLoading(false)
    }
  }

  const fetchMember = async (memberId) => {
    try {
      const memberData = await base44.entities.TeamMember.get(memberId)
      setMember(memberData)
      setFormData(memberData)
    } catch (err) {
      //
      toastError('Load Failed', 'Failed to load member profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!member) return
    try {
      await base44.entities.TeamMember.update(member.id, {
        ...formData,
        updated_at: new Date().toISOString()
      })
      setMember({ ...member, ...formData })
      success('Profile Updated', 'Member profile updated successfully')
      setEditing(false)
    } catch (err) {
      //
      toastError('Save Failed', 'Failed to save profile')
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !member) return
    setUploadingPhoto(true)

    try {
      const response = await base44.integrations.Core.UploadFile({ file })
      const fileUrl = response.file_url || response.url
      
      await base44.entities.TeamMember.update(member.id, { profile_photo: fileUrl })
      setMember({ ...member, profile_photo: fileUrl })
      success('Photo Updated', 'Profile photo updated successfully')
    } catch (err) {
      //
      toastError('Upload Failed', 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-gray-600">Member not found</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Member Profile</h1>
            <Button onClick={() => setEditing(!editing)} variant={editing ? 'outline' : 'default'}>
              {editing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                  {member.profile_photo ? (
                    <img src={member.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800">
                    <Upload className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
              <div className="flex-1">
                {editing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-2xl font-bold"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 capitalize">{member.role}</span>
                </div>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Skills (comma-separated)</label>
                  <Input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g. Video Editing, Motion Graphics, Sound Design"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{member.email || 'Email not set'}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{member.location}</span>
                  </div>
                )}
                {member.skills && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4 mt-1" />
                    <div>
                      <div className="font-medium">Skills</div>
                      <div className="text-sm">{member.skills}</div>
                    </div>
                  </div>
                )}
                {member.bio && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-2">Bio</div>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
    </div>
  )
}
