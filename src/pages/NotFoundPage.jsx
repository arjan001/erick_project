import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Text */}
        <div className="mb-6">
          <h1 className="text-[120px] font-bold text-black leading-none tracking-tight">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-black text-white hover:bg-gray-800 px-8 py-3 rounded-xl"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="px-8 py-3 rounded-xl border-2 border-gray-300 hover:border-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => navigate('/Projects')}
              className="text-gray-600 hover:text-black transition-colors"
            >
              Projects
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/Work')}
              className="text-gray-600 hover:text-black transition-colors"
            >
              Our Work
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/Services')}
              className="text-gray-600 hover:text-black transition-colors"
            >
              Services
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/Categories')}
              className="text-gray-600 hover:text-black transition-colors"
            >
              Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
