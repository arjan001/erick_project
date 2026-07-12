import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, Lock, Database, Trash2, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/" className="inline-block mb-6">
            <span className="text-3xl font-black tracking-tighter text-gray-900">22.</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: July 12, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Studio22 ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our creative network platform. Please read this policy carefully.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6" />
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                <p className="text-gray-700">Name, email address, profile information, location data, and other details you provide when creating an account.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Professional Information</h3>
                <p className="text-gray-700">Portfolio, skills, experience, project history, and creative work you upload to showcase your talents.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Usage Data</h3>
                <p className="text-gray-700">Pages visited, features used, time spent, and other analytics data to improve our services.</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6" />
              How We Use Your Information
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Provide and maintain our creative network platform</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Connect filmmakers, creators, and production teams</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Process transactions and send related information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Send technical notices and support messages</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Respond to comments and questions</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              Your Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Access and update your personal information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Request deletion of your account and data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Opt-out of marketing communications</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Export your data (GDPR right to data portability)</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-900 font-semibold mt-2">privacy@studio22.com</p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <Link to="/legal/terms" className="hover:text-gray-900">Terms & Conditions</Link>
            <Link to="/legal/gdpr" className="hover:text-gray-900">GDPR</Link>
            <Link to="/legal/cookies" className="hover:text-gray-900">Cookie Policy</Link>
            <Link to="/legal/imprint" className="hover:text-gray-900">Imprint</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
