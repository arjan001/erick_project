import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { CheckCircle, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StepSuccess({ projectData }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-600/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-amber-600" />
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Project Submitted</h1>
        <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto">
          Thank you, {projectData.project_owner_name}. Your project is now being reviewed by the Studio22 team.
        </p>

        {/* What's Next */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8 text-left">
          <h2 className="text-2xl font-bold mb-6">What happens next?</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Verification</h3>
                <p className="text-sm text-gray-400">
                  Our team will review your project within 24-48 hours to ensure it aligns with Studio22 standards.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Team Assembly</h3>
                <p className="text-sm text-gray-400">
                  We'll curate and propose the perfect team from our European network based on your requirements.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Introduction</h3>
                <p className="text-sm text-gray-400">
                  You'll receive an email with team suggestions and can request an intro call to discuss your project.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('Home')}>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
              Back to Home
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to={createPageUrl('Work')}>
            <Button size="lg" variant="outline" className="border-zinc-700 hover:bg-zinc-800">
              View Our Work
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}