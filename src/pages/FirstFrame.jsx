import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Award, CheckCircle, Calendar, Gift, ArrowRight } from 'lucide-react';

export default function FirstFrame() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-zinc-950 to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,169,98,0.1),transparent_50%)]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Award className="w-20 h-20 text-amber-600 mx-auto mb-8" />
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            Studio22 <span className="gradient-text">First Frame</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Experience how Studio22 works with one complimentary production day for serious projects
          </p>
          <Link to={createPageUrl('SubmitProject')}>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-6">
              Apply for First Frame
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">What's Included</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Calendar, title: 'One Full Production Day', desc: 'Complete shoot day with professional crew' },
              { icon: CheckCircle, title: 'Curated Team', desc: 'Director, cinematographer, and essential crew' },
              { icon: Gift, title: 'Basic Equipment Package', desc: 'Professional camera and lighting setup' },
              { icon: CheckCircle, title: 'Location Coordination', desc: 'Basic location scouting and permits' },
              { icon: CheckCircle, title: 'Raw Footage Delivery', desc: 'All captured footage organized and delivered' },
              { icon: CheckCircle, title: 'Production Report', desc: 'Detailed breakdown and recommendations' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex gap-4 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Eligibility</h2>
          
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 md:p-12">
            <p className="text-lg text-gray-300 mb-8">
              Studio22 First Frame is designed for serious projects that meet our quality standards. We evaluate applications based on:
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                'Project scope and creative vision',
                'Budget allocated for full production (minimum €10k)',
                'Clear timeline and deliverables',
                'Professional production team or brand',
                'Potential for continued collaboration'
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>

            <div className="bg-amber-600/10 border border-amber-600/20 rounded-xl p-6">
              <p className="text-amber-600 font-semibold mb-2">Important Note</p>
              <p className="text-gray-300 text-sm">
                First Frame is not a free service for small projects. It's a trial day for serious productions to experience Studio22's approach before committing to a full production contract.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">How to Apply</h2>
          
          <div className="space-y-6 mb-12">
            {[
              { num: '1', title: 'Submit Your Project', desc: 'Complete the project intake form and check "Interested in First Frame"' },
              { num: '2', title: 'Review Process', desc: 'Our team evaluates your project within 3-5 business days' },
              { num: '3', title: 'Approval & Planning', desc: 'If approved, we schedule your production day and assemble your team' },
              { num: '4', title: 'Experience Studio22', desc: 'One full day of professional production with curated team' }
            ].map((step) => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-xl font-bold">
                  {step.num}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to={createPageUrl('SubmitProject')}>
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                Apply Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}