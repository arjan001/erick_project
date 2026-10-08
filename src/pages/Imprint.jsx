import React from 'react'
import { Building2, Mail, Phone, MapPin, Globe } from 'lucide-react'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'

export default function Imprint() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Imprint</h1>
          <p className="text-gray-600">Legal Information</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Company Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-900">Company Name</p>
                <p className="text-gray-700">SmartGigs Kenya</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Legal Form</p>
                <p className="text-gray-700">Limited Liability Company</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Business Address
            </h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700">
                SmartGigs Kenya<br />
                Nairobi, Kenya<br />
                Kenya
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-6 h-6" />
              Contact Information
            </h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-gray-700">contact@smartgigskenya.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <p className="text-gray-700">+254 XXX XXX XXX</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-500" />
              Website
            </h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700">https://smartgigskenya.com</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed">
              SmartGigs Kenya accepts no liability for the accuracy, completeness, or timeliness of the information provided. The information contained on this website is for general information purposes only. Any reliance you place on such information is strictly at your own risk.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Alternative Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              The European Commission provides an online dispute resolution platform (ODR) for consumer disputes: <a href="https://ec.europa.eu/consumers/odr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>. We are not obliged to participate in dispute resolution proceedings before a consumer arbitration board.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
