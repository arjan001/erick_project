import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, ExternalLink, Trash2, Edit, Star, Check, X } from 'lucide-react'
import Footer from '@/components/landing/backstage/Footer'
import Navbar from '@/components/landing/backstage/Navbar'

export default function PartnersPage() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState(null)
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    website: '',
    status: 'active',
    featured: false,
    description: '',
    industry: '',
    contact_email: ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPartners(data || [])
    } catch (err) {
      console.error('Error fetching partners:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) return

    setUploading(true)
    try {
      if (editingPartner) {
        const { error } = await supabase
          .from('partners')
          .update(form)
          .eq('id', editingPartner.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('partners')
          .insert(form)
        if (error) throw error
      }
      await fetchPartners()
      setShowAddModal(false)
      setEditingPartner(null)
      setForm({
        name: '',
        logo_url: '',
        website: '',
        status: 'active',
        featured: false,
        description: '',
        industry: '',
        contact_email: ''
      })
    } catch (err) {
      console.error('Error saving partner:', err)
      alert('Failed to save partner')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this partner?')) return
    try {
      const { error } = await supabase.from('partners').delete().eq('id', id)
      if (error) throw error
      await fetchPartners()
    } catch (err) {
      console.error('Error deleting partner:', err)
      alert('Failed to delete partner')
    }
  }

  const handleToggleStatus = async (partner) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ status: partner.status === 'active' ? 'inactive' : 'active' })
        .eq('id', partner.id)
      if (error) throw error
      await fetchPartners()
    } catch (err) {
      console.error('Error toggling status:', err)
    }
  }

  const handleToggleFeatured = async (partner) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ featured: !partner.featured })
        .eq('id', partner.id)
      if (error) throw error
      await fetchPartners()
    } catch (err) {
      console.error('Error toggling featured:', err)
    }
  }

  const activePartners = partners.filter(p => p.status === 'active')
  const featuredPartners = activePartners.filter(p => p.featured)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Our Partners</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We work with leading brands and organizations in the creative industry
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{activePartners.length}+</div>
              <div className="text-gray-600">Active Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{featuredPartners.length}+</div>
              <div className="text-gray-600">Featured Brands</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">10+</div>
              <div className="text-gray-600">Years of Partnership</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Partners */}
      {featuredPartners.length > 0 && (
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Partners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredPartners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                  {partner.logo_url && (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="w-24 h-24 mx-auto mb-4 object-contain"
                    />
                  )}
                  <h3 className="font-bold text-gray-900 mb-2">{partner.name}</h3>
                  {partner.description && (
                    <p className="text-sm text-gray-600 mb-4">{partner.description}</p>
                  )}
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      Visit Website <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Partners Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">All Partners</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
          ) : activePartners.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No partners yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {activePartners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                  {partner.logo_url && (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="w-24 h-24 mx-auto mb-4 object-contain"
                    />
                  )}
                  <h3 className="font-bold text-gray-900 mb-2">{partner.name}</h3>
                  {partner.industry && (
                    <div className="text-sm text-gray-500 mb-2">{partner.industry}</div>
                  )}
                  {partner.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{partner.description}</p>
                  )}
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      Visit Website <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Partner</h2>
          <p className="text-gray-300 mb-8">
            Interested in partnering with SmartGigs Kenya? Get in touch with us today.
          </p>
          <a
            href="mailto:partners@smartgigs.co.ke"
            className="inline-block bg-[#C9A962] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#D4B575] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}
