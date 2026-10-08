import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Team } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LanguageMultiSelect from '@/components/LanguageMultiSelect'
import { Building2, Users, Mail, Phone, Globe, MapPin, Briefcase, ArrowLeft } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast.jsx'

export default function TeamRegistrationPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    team_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    city: '',
    country: '',
    website: '',
    industry: '',
    company_size: '',
    specialties: [],
    equipment_owned: [],
    languages_spoken: [],
    description: '',
    availability: 'available'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const cityCode = formData.city?.substring(0, 3).toUpperCase() || 'XXX'
      const randomNum = String(Math.floor(Math.random() * 100) + 1).padStart(2, '0')
      const teamCode = `${cityCode}${randomNum}`

      const team = await Team.create({
        ...formData,
        team_code: teamCode,
        location: `${formData.city}, ${formData.country}`,
        logo: '',
        verified: false,
        status: 'pending',
        created_at: new Date().toISOString()
      })

      // Store team info in localStorage for demo
      localStorage.setItem('ericrabar_team', JSON.stringify({
        ...team,
        role: 'team_admin'
      }))

      success('Team Registered', 'Your team has been registered successfully. Your application is under review.')
      navigate(createPageUrl('TeamDashboard'))
    } catch (err) {
      //
      toastError('Registration Failed', err.message || 'Failed to register team. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Home'))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Team</h1>
            <p className="text-gray-600">Create your agency or company profile to start collaborating</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Team/Company Name</label>
              <Input
                type="text"
                value={formData.team_name}
                onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                placeholder="Enter your team name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Contact Person Name</label>
              <Input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="Full name of contact person"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Contact Email</label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="contact@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Contact Phone</label>
                <Input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+1 234 567 890"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                <Input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Website</label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourcompany.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select industry</option>
                  <option value="film_production">Film Production</option>
                  <option value="advertising">Advertising</option>
                  <option value="photography">Photography</option>
                  <option value="design">Design</option>
                  <option value="animation">Animation</option>
                  <option value="music">Music</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Team Size</label>
                <select
                  value={formData.company_size}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 members</option>
                  <option value="11-50">11-50 members</option>
                  <option value="51-200">51-200 members</option>
                  <option value="200+">200+ members</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Specialties (comma-separated)</label>
              <Input
                type="text"
                value={formData.specialties.join(', ')}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                placeholder="e.g. Film Production, Commercial, Music Video"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Equipment Owned (comma-separated)</label>
              <Input
                type="text"
                value={formData.equipment_owned.join(', ')}
                onChange={(e) => setFormData({ ...formData, equipment_owned: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                placeholder="e.g. ARRI Alexa, RED Camera, Steadicam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Languages Spoken</label>
              <LanguageMultiSelect
                value={formData.languages_spoken}
                onChange={(languages) => setFormData({ ...formData, languages_spoken: languages })}
                placeholder="Search and select languages..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your team and what you do"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Team'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}