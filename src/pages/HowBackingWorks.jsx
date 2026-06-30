import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Handshake, Building2, Users, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';

export default function HowBackingWorks() {
  const backingTypes = [
    {
      icon: Lightbulb,
      title: 'Sponsorship',
      description: 'Brands or organizations provide resources (funding, equipment, or services) in exchange for visibility and association with the project. No financial return is expected.',
      example: 'A camera manufacturer sponsors a film production in exchange for credits and behind-the-scenes visibility.'
    },
    {
      icon: Users,
      title: 'Co-Production',
      description: 'Multiple entities collaborate on a project as creative and production partners. Each party contributes resources and shares in the project\'s creative direction and outcomes.',
      example: 'Two production companies from different countries jointly produce a film, each bringing regional expertise and crew.'
    },
    {
      icon: Building2,
      title: 'Cultural & City Support',
      description: 'Cultural institutions, tourism boards, or city development agencies support projects that promote regional identity, tourism, or cultural values.',
      example: 'A city tourism board supports a documentary filmed in their region to increase cultural visibility and attract visitors.'
    },
    {
      icon: Handshake,
      title: 'Strategic Partnership',
      description: 'Organizations align with projects for mutual benefit—exposure, networking, or creative collaboration without direct financial investment.',
      example: 'A production services company partners on a project to showcase their capabilities to potential future clients.'
    },
    {
      icon: Trophy,
      title: 'Investment (Optional)',
      description: 'In some cases, investors may provide capital with clear expectations about the project\'s commercial potential or return. This is entirely optional and project-dependent.',
      example: 'An investor funds a feature film project with defined financial terms negotiated directly between parties.'
    }
  ];

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-black">How Backing Works</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Backing is about collaboration and mutual benefit. Studio22 connects creative projects with supporters who share 
            values, vision, and ambition. We facilitate introductions and partnerships—we don't handle payments, equity, or financial arrangements.
          </p>
        </div>

        {/* Backing Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {backingTypes.map((type, idx) => {
            const Icon = type.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-amber-700" />
                    </div>
                    <CardTitle className="text-xl">{type.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{type.description}</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">Example: </span>
                      {type.example}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How Studio22 Helps */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16 border border-gray-200">
          <h2 className="text-2xl font-bold mb-8 text-black">Studio22's Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-black">What Studio22 Does</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <ArrowRight className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Curates projects seeking backing and matches them with suitable supporters</span>
                </li>
                <li className="flex gap-3">
                  <ArrowRight className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Facilitates introductions between creative teams and potential partners</span>
                </li>
                <li className="flex gap-3">
                  <ArrowRight className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Provides a platform to showcase projects and build creative networks</span>
                </li>
                <li className="flex gap-3">
                  <ArrowRight className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Manages project visibility and approves backing projects</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-black">What Studio22 Does NOT Do</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-gray-400 font-bold">✗</span>
                  <span>Handle financial transactions or payments</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400 font-bold">✗</span>
                  <span>Manage equity stakes or ownership arrangements</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400 font-bold">✗</span>
                  <span>Negotiate contracts or legal terms</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400 font-bold">✗</span>
                  <span>Guarantee financial returns or outcomes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Process */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-black">The Process</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Project Submission', desc: 'A creator submits their project and marks it as "Open to Backing" with details about what support they\'re seeking.' },
              { step: '2', title: 'Studio22 Review', desc: 'We review the project to ensure it aligns with our community standards and is clearly articulated.' },
              { step: '3', title: 'Visibility & Discovery', desc: 'Approved backing projects appear on our platform, visible to potential supporters and partners.' },
              { step: '4', title: 'Introductions', desc: 'When we identify aligned interests, we facilitate introductions between creators and potential backing partners.' },
              { step: '5', title: 'Direct Negotiation', desc: 'All partnership terms, agreements, and arrangements are handled directly between the parties involved.' },
              { step: '6', title: 'Collaboration & Visibility', desc: 'Partners collaborate on the project. Studio22 continues to provide production support and creative services.' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 pb-6 border-b border-gray-200 last:border-b-0">
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 md:p-12 border border-amber-200 text-center">
          <h2 className="text-2xl font-bold mb-4 text-black">Ready to Explore Backing Opportunities?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Browse projects seeking support or post your own project to connect with potential backing partners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('BackedProjects')}>
              <Button className="bg-amber-600 hover:bg-amber-700">
                Browse Backed Projects
              </Button>
            </Link>
            <Link to={createPageUrl('SubmitProject')}>
              <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                Post Your Project
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}