import React from 'react'
import { FileText, AlertCircle, CheckCircle, XCircle, Scale } from 'lucide-react'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-gray-600">Last updated: July 12, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using SmartGigs Kenya, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              User Accounts
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>You must be at least 18 years old to create an account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>You are responsible for maintaining the confidentiality of your account credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>You must provide accurate and complete information</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Acceptable Use
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to use SmartGigs Kenya only for lawful purposes and in accordance with these Terms. You may not:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Use the platform for any illegal or unauthorized purpose</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Violate any international, federal, provincial or local regulations</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Infringe upon or violate our intellectual property rights</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All content on SmartGigs Kenya, including text, graphics, logos, images, and software, is the property of SmartGigs Kenya or its content suppliers and is protected by intellectual property laws.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6" />
              Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms & Conditions shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
