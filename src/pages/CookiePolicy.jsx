import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Settings, Shield, Info } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/" className="inline-block mb-6">
            <span className="text-3xl font-black tracking-tighter text-gray-900">22.</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-gray-600">Last updated: July 12, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6" />
              What Are Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Types of Cookies We Use
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-700">Required for the website to function properly. These include authentication, security, and basic functionality. Cannot be disabled.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                <p className="text-gray-700">Help us understand how visitors interact with our website by collecting anonymous usage data. Used to improve our services.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Preference Cookies</h3>
                <p className="text-gray-700">Remember your settings and preferences, such as language, theme, and display options.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                <p className="text-gray-700">Used to deliver relevant advertisements and track marketing campaigns. Only used with your consent.</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Third-Party Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may use third-party services that set cookies on your device:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Supabase:</strong> Database and authentication services</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Analytics Providers:</strong> Usage tracking and performance monitoring</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Payment Processors:</strong> Secure transaction processing</span>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-6 h-6" />
              Managing Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can control and manage cookies in various ways:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies through their settings</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Cookie Banner:</strong> Use our cookie consent banner to manage your preferences</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Opt-Out Links:</strong> Some third-party services provide opt-out mechanisms</span>
              </li>
            </ul>
            <p className="text-gray-600 text-sm mt-4">
              Note: Disabling cookies may affect the functionality of our website and your user experience.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Duration</h2>
            <p className="text-gray-700 leading-relaxed">
              Session cookies expire when you close your browser. Persistent cookies remain on your device for a specified period or until you delete them. We typically set persistent cookies to expire after 1 year.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
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
            <Link to="/legal/imprint" className="hover:text-gray-900">Imprint</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
