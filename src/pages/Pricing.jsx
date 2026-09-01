import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Info } from 'lucide-react';

const PRICING_TIERS = [
  {
    name: 'Production Day',
    range: '€1,500 - €3,500',
    description: 'Single day shoots with curated crew',
    features: [
      'Director or cinematographer',
      'Basic camera package',
      '1-2 crew members',
      'Up to 8 hours shooting',
      'Raw footage delivery'
    ]
  },
  {
    name: 'Commercial Project',
    range: '€10,000 - €50,000',
    description: 'Full commercial production from concept to delivery',
    features: [
      'Concept & creative development',
      'Full production crew',
      'Professional equipment',
      'Multi-day shooting',
      'Post-production included',
      'Multi-format delivery'
    ],
    highlighted: true
  },
  {
    name: 'Film Support',
    range: '€25,000 - €150,000+',
    description: 'Comprehensive film production support',
    features: [
      'Complete crew assembly',
      'Equipment packages',
      'Location management',
      'Production coordination',
      'Post-production',
      'Festival delivery'
    ]
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Transparent Pricing</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Eric Rabar operates on project-based pricing. Every production is unique, but here are typical ranges
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {PRICING_TIERS.map((tier, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 ${
                tier.highlighted
                  ? 'bg-gradient-to-br from-amber-600/20 to-amber-900/20 border-2 border-amber-600 relative'
                  : 'bg-zinc-900 border border-zinc-800'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="text-3xl font-bold text-amber-600 mb-2">{tier.range}</div>
              <p className="text-gray-400 mb-6">{tier.description}</p>
              
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* What's Included */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">What's Always Included</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Curated team matching',
              'Eric Rabar project management',
              'Quality assurance & oversight',
              'European network access',
              'Multi-language support',
              'Production coordination',
              'Direct communication',
              'Transparent billing'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Costs */}
        <div className="bg-amber-600/10 border border-amber-600/20 rounded-2xl p-8 mb-12">
          <div className="flex gap-4 mb-4">
            <Info className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">Additional Costs</h3>
              <p className="text-gray-300 mb-4">
                Typical production costs not included in crew rates:
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Travel & accommodation for remote shoots</li>
                <li>• Location fees & permits</li>
                <li>• Specialized equipment rentals</li>
                <li>• Catering & production expenses</li>
                <li>• Music licensing & stock assets</li>
                <li>• Casting & talent fees</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How Pricing Works */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          
          <div className="space-y-6">
            {[
              { title: 'Submit Your Project', desc: 'Tell us about your production needs through our intake form' },
              { title: 'We Create a Proposal', desc: 'Based on your requirements, we provide a detailed breakdown and team options' },
              { title: 'Transparent Breakdown', desc: 'Clear costs for crew, equipment, and services with no hidden fees' },
              { title: 'Flexible Payment', desc: 'Milestone-based payments aligned with production phases' }
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start p-6 bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get a custom quote?</h2>
          <p className="text-gray-400 mb-8">Submit your project and we'll provide a detailed proposal</p>
          <Link to={createPageUrl('SubmitProject')}>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
              Submit Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}