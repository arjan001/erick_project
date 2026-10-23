import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, Phone, ArrowRight, ExternalLink } from 'lucide-react'
import Footer from '@/components/landing/backstage/Footer'
import Navbar from '@/components/landing/backstage/Navbar'

export default function PartnersPage() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    phoneNumber: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPartners(data || [])
    } catch (err) {
      console.error('Error fetching partners:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.companyName) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('partner_inquiries')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          company_name: formData.companyName,
          phone_number: formData.phoneNumber,
          message: formData.message,
        })

      if (error) throw error
      alert('Thank you for your inquiry! We will get back to you soon.')
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        companyName: '',
        phoneNumber: '',
        message: ''
      })
    } catch (err) {
      console.error('Error submitting form:', err)
      alert('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Partner with SMARTGIGS KENYA</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Connect with Kenya's leading creative talent platform. Reach millions of actors, crew, and creative professionals looking for their next opportunity.
          </p>
          <button className="bg-[#C9A962] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#D4B575] transition-colors">
            Contact Us
          </button>
        </div>
      </div>

      {/* Partner Logos Carousel */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-12">
            {partners.map((partner) => (
              <div key={partner.id} className="h-16 flex items-center justify-center">
                {partner.logo_url ? (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
                    {partner.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Partners Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Partners</h2>
              <p className="text-lg text-gray-600 mb-6">
                We partner with leading brands and organizations in the entertainment industry to connect them with the best talent. Our platform has become the go-to destination for creative professionals looking for opportunities.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Through our partnerships, we provide access to exclusive casting calls, industry events, and networking opportunities that help our members advance their careers.
              </p>
              <a
                href="mailto:partners@smartgigs.co.ke"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Become a Partner
              </a>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=400&fit=crop"
                alt="Partners illustration"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">2.8M+</div>
              <div className="text-gray-600">Monthly visitors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">751,346</div>
              <div className="text-gray-600">Members and counting</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">167K</div>
              <div className="text-gray-600">Creators looking for talent</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">1.2M+</div>
              <div className="text-gray-600">Social media followers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Contact Us</h2>
          <p className="text-gray-300 text-center mb-12">
            Interested in partnering with SMARTGIGS KENYA? Fill out the form below and we'll get back to you.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-[#C9A962] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Write a message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-[#C9A962] focus:border-transparent resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#C9A962] text-white py-3 rounded-lg font-semibold hover:bg-[#D4B575] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}
