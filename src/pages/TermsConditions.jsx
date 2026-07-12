import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertCircle, CheckCircle, XCircle, Scale } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/" className="inline-block mb-6">
            <span className="text-3xl font-black tracking-tighter text-gray-900">22.</span>
          </Link>
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
              By accessing or using Studio22, you agree to be bound by these Terms & Conditions. If you disagree with any part of these terms, you may not access our service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Accounts
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Account Registration</h3>
                <p className="text-gray-700">You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Account Security</h3>
                <p className="text-gray-700">You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage from your failure to comply with this security obligation.</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Acceptable Use
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to use Studio22 for lawful purposes only. You must not:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Upload content that is illegal, harmful, or violates intellectual property rights</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Impersonate any person or entity or misrepresent your affiliation</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Interfere with or disrupt our service or servers</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Use automated systems to access our service without permission</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Engage in fraudulent or deceptive practices</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The content, features, and functionality of Studio22 are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You retain ownership of content you upload, but grant us a license to use, display, and distribute it as necessary to provide our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6" />
              Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account immediately if you breach these Terms & Conditions. Upon termination, your right to use the service will cease immediately.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms & Conditions shall be governed by and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <Link to="/legal/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link to="/legal/gdpr" className="hover:text-gray-900">GDPR</Link>
            <Link to="/legal/cookies" className="hover:text-gray-900">Cookie Policy</Link>
            <Link to="/legal/imprint" className="hover:text-gray-900">Imprint</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
