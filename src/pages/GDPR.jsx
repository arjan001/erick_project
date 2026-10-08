import React from 'react'
import { Globe, Download, Trash2, FileText, UserCheck } from 'lucide-react'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'

export default function GDPR() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GDPR Compliance</h1>
          <p className="text-gray-600">Last updated: July 12, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6" />
              GDPR Overview
            </h2>
            <p className="text-gray-700 leading-relaxed">
              SmartGigs Kenya is committed to complying with the General Data Protection Regulation (GDPR) and protecting the personal data of our users within the European Union. This document outlines your rights under GDPR and how we handle your data.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-6 h-6" />
              Your Rights Under GDPR
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Access</h3>
                <p className="text-gray-700">You have the right to request access to your personal data that we hold.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Rectification</h3>
                <p className="text-gray-700">You can request correction of inaccurate or incomplete data.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Erasure</h3>
                <p className="text-gray-700">You can request deletion of your personal data under certain circumstances.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Data Portability</h3>
                <p className="text-gray-700">You can request transfer of your data to another service provider.</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              Account Deletion
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To permanently delete your account and all associated data:
            </p>
            <ol className="space-y-2 text-gray-700 list-decimal list-inside">
              <li>Go to your account settings</li>
              <li>Click "Delete Account"</li>
              <li>Confirm your password</li>
              <li>Your data will be permanently removed within 30 days</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6" />
              Data Protection Officer
            </h2>
            <p className="text-gray-700 leading-relaxed">
              For GDPR-related inquiries, please contact our Data Protection Officer at:
            </p>
            <p className="text-gray-900 font-semibold mt-2">dpo@smartgigskenya.com</p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
