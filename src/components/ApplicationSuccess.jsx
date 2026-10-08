import React from 'react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { CheckCircle, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ApplicationSuccess({ type, name, message }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-600/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-amber-600" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Application Submitted</h1>
        <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto">
          {message || `Thank you, ${name}. Your ${type} application is now under review.`}
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8 text-left">
          <div className="flex items-start gap-4 mb-6">
            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                The Eric Rabar team will review your application and portfolio within 3-5 business days. 
                We carefully curate our network to maintain the highest quality standards.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-600 font-bold text-xs">
                1
              </div>
              <div>
                <p className="text-sm text-gray-300">Application review and portfolio assessment</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-600 font-bold text-xs">
                2
              </div>
              <div>
                <p className="text-sm text-gray-300">Email notification with decision</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-600 font-bold text-xs">
                3
              </div>
              <div>
                <p className="text-sm text-gray-300">If approved, welcome to the Eric Rabar network</p>
              </div>
            </div>
          </div>
        </div>

        <Link to={createPageUrl('Home')}>
          <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
            Back to Home
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}