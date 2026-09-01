import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Imprint() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/" className="inline-block mb-6">
            <span className="text-3xl font-black tracking-tighter text-gray-900">22.</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Imprint</h1>
          <p className="text-gray-600">Legal Disclosure • Last updated: July 12, 2026</p>
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
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">Company Name</p>
                  <p className="text-gray-700">Eric Rabar Creative Network GmbH</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Legal Form</p>
                  <p className="text-gray-700">Limited Liability Company (GmbH)</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Registration Number</p>
                  <p className="text-gray-700">HRB 123456</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Register Court</p>
                  <p className="text-gray-700">Local Court of [City]</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">VAT ID</p>
                  <p className="text-gray-700">DE123456789</p>
                </div>
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
                Eric Rabar Creative Network GmbH<br />
                Creative Street 123<br />
                10115 Berlin<br />
                Germany
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
                  <p className="text-gray-700">contact@ericrabar.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <p className="text-gray-700">+49 30 12345678</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-900">Website</p>
                  <p className="text-gray-700">https://ericrabar.com</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Represented By</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700">
                Managing Directors:<br />
                - John Doe<br />
                - Jane Smith
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed">
              Eric Rabar accepts no liability for the accuracy, completeness, or timeliness of the information provided. The information contained on this website is for general information purposes only. Any reliance you place on such information is strictly at your own risk.
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

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <Link to="/legal/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-gray-900">Terms & Conditions</Link>
            <Link to="/legal/gdpr" className="hover:text-gray-900">GDPR</Link>
            <Link to="/legal/cookies" className="hover:text-gray-900">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
