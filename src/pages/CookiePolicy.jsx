import React from 'react'
import { Cookie, Settings, Shield, Info, CheckCircle, XCircle } from 'lucide-react'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'
import SEOMetaTags from '@/components/SEOMetaTags'

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOMetaTags
        title="Cookie Policy — SmartGigs Kenya"
        description="Learn how SmartGigs Kenya uses cookies to improve your experience. Information about cookie types, management, and third-party cookies."
        keywords="cookie policy, cookies, privacy, smartgigs kenya"
        ogImage="https://smartgigs.co.ke/og-cookie.jpg"
        ogType="website"
      />
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-gray-600">Last updated: July 12, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by allowing the site to remember your actions and preferences.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6" />
              How We Use Cookies
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Remember your login credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Remember your preferences and settings</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Analyze site traffic and usage patterns</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Managing Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can control and manage cookies in various ways. Please note that removing or blocking cookies may impact your user experience and parts of our website may no longer be fully accessible.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Third-Party Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              SmartGigs Kenya may use third-party services that also use cookies, including analytics providers and payment processors. These third parties have their own privacy policies.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-6 h-6" />
              Updates to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
