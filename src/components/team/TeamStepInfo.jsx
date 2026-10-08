import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import CountrySelector from '../CountrySelector'

export default function TeamStepInfo({ data, updateData }) {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Team Information</h2>
      <p className="text-gray-600 mb-8">Tell us about your team and how to reach you</p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="team_name" className="text-base mb-3 block">
            Team/Company Name *
          </Label>
          <Input
            id="team_name"
            value={data.team_name || ''}
            onChange={(e) => updateData('team_name', e.target.value)}
            placeholder="e.g., Amsterdam Post House, Lux Studios"
            className="bg-white border-gray-300 text-black h-12"
          />
        </div>



        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="city" className="text-base mb-3 block">City *</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => updateData('city', e.target.value)}
              placeholder="e.g., Amsterdam"
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>

          <div>
            <Label htmlFor="country" className="text-base mb-3 block">Country *</Label>
            <CountrySelector
              value={data.country}
              onChange={(country) => updateData('country', country)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="contact_name" className="text-base mb-3 block">Contact Name *</Label>
            <Input
              id="contact_name"
              value={data.contact_name || ''}
              onChange={(e) => updateData('contact_name', e.target.value)}
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>

          <div>
            <Label htmlFor="contact_email" className="text-base mb-3 block">
              Contact Email *
            </Label>
            <Input
              id="contact_email"
              type="email"
              value={data.contact_email || ''}
              onChange={(e) => updateData('contact_email', e.target.value)}
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
          <div>
            <Label htmlFor="password" className="text-base mb-3 block">Create Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={data.password || ''}
                onChange={(e) => updateData('password', e.target.value)}
                placeholder="Min 6 characters"
                className="bg-white border-gray-300 text-black h-12 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">This becomes your login as the team admin</p>
          </div>
          <div>
            <Label htmlFor="confirm_password" className="text-base mb-3 block">Confirm Password *</Label>
            <Input
              id="confirm_password"
              type={showPassword ? 'text' : 'password'}
              value={data.confirmPassword || ''}
              onChange={(e) => updateData('confirmPassword', e.target.value)}
              placeholder="Repeat password"
              className="bg-white border-gray-300 text-black h-12"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone" className="text-base mb-3 block">Mobile Number (WhatsApp preferred) *</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => updateData('phone', e.target.value)}
            placeholder="+31 6 1234 5678"
            className="bg-white border-gray-300 text-black h-12"
          />
          <p className="text-xs text-gray-600 mt-2">
            We'll use this to communicate quickly about project opportunities
          </p>
        </div>

        <div>
          <Label className="text-base mb-3 block">Team Size</Label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['solo', '2_5', '6_10', '11_20', '20_plus'].map(size => (
              <button
                key={size}
                onClick={() => updateData('team_size', size)}
                className={`p-3 rounded-lg text-sm transition-all ${
                  data.team_size === size
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-gray-300 text-black hover:bg-gray-50'
                }`}
              >
                {size.replace('_', '-').replace('plus', '+')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}