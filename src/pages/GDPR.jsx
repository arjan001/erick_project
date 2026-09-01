import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Download, Trash2, FileText, UserCheck } from 'lucide-react';

export default function GDPR() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/" className="inline-block mb-6">
            <span className="text-3xl font-black tracking-tighter text-gray-900">22.</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GDPR Compliance</h1>
          <p className="text-gray-600">General Data Protection Regulation • Last updated: July 12, 2026</p>
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
              Eric Rabar is committed to complying with the General Data Protection Regulation (GDPR) and protecting the personal data of our users within the European Union. This document outlines your rights under GDPR and how we handle your data.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6" />
              Your GDPR Rights
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Access</h3>
                <p className="text-gray-700">You have the right to request a copy of the personal data we hold about you. We will provide this information within 30 days of your request.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Rectification</h3>
                <p className="text-gray-700">You can request correction of inaccurate or incomplete personal data we hold about you.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Erasure</h3>
                <p className="text-gray-700">You can request deletion of your personal data, subject to certain legal obligations we may have to retain it.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Portability</h3>
                <p className="text-gray-700">You can request transfer of your data to another service provider in a machine-readable format.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Object</h3>
                <p className="text-gray-700">You can object to processing of your personal data based on legitimate interests or for direct marketing purposes.</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-6 h-6" />
              Data Export Request
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To request a copy of your personal data, please contact us with:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Your full name and email address associated with your account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Specific data you wish to receive (or all data)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Preferred format (JSON, CSV, or PDF)</span>
              </li>
            </ul>
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
              <li>Review the data that will be deleted</li>
              <li>Confirm deletion</li>
            </ol>
            <p className="text-gray-600 text-sm mt-4">
              Note: Some data may be retained for legal or security purposes even after account deletion.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Data Processing Basis
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Contractual Necessity:</strong> To provide our services as described in our Terms & Conditions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Legitimate Interest:</strong> To improve our services, prevent fraud, and ensure platform security</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Consent:</strong> For marketing communications and optional features</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Legal Obligation:</strong> When required by applicable laws and regulations</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection Officer</h2>
            <p className="text-gray-700 leading-relaxed">
              For GDPR-related inquiries, please contact our Data Protection Officer at:
            </p>
            <p className="text-gray-900 font-semibold mt-2">dpo@ericrabar.com</p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <Link to="/legal/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-gray-900">Terms & Conditions</Link>
            <Link to="/legal/cookies" className="hover:text-gray-900">Cookie Policy</Link>
            <Link to="/legal/imprint" className="hover:text-gray-900">Imprint</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
