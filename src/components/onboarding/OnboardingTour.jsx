import React, { useState, useEffect } from 'react'
import { X, ArrowRight, Check, ChevronRight, Briefcase, User, FileText, Settings } from 'lucide-react'

const artistSteps = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your photo, skills, and experience to get noticed by casting directors.',
    icon: User,
    action: 'Go to Profile',
    target: '/artistdashboard?tab=profile'
  },
  {
    id: 'portfolio',
    title: 'Upload Portfolio',
    description: 'Showcase your best work with photos and videos to land more gigs.',
    icon: FileText,
    action: 'Add Portfolio',
    target: '/artistdashboard?tab=portfolio'
  },
  {
    id: 'apply',
    title: 'Apply to Jobs',
    description: 'Browse and apply to roles that match your skills and interests.',
    icon: Briefcase,
    action: 'Find Jobs',
    target: '/FindJobs'
  }
]

const clientSteps = [
  {
    id: 'company',
    title: 'Complete Company Profile',
    description: 'Add your company details and logo to build trust with talent.',
    icon: User,
    action: 'Edit Profile',
    target: '/clientdashboard?tab=profile'
  },
  {
    id: 'post',
    title: 'Post Your First Job',
    description: 'Create a job posting to find the perfect talent for your project.',
    icon: Briefcase,
    action: 'Post a Job',
    target: '/clientdashboard?tab=jobs'
  },
  {
    id: 'settings',
    title: 'Configure Payment',
    description: 'Set up payment methods to hire talent seamlessly.',
    icon: Settings,
    action: 'Payment Settings',
    target: '/clientdashboard?tab=settings'
  }
]

export default function OnboardingTour({ userRole, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [isMinimized, setIsMinimized] = useState(false)

  const steps = userRole === 'client' ? clientSteps : artistSteps

  useEffect(() => {
    // Check if onboarding was already dismissed
    const dismissed = localStorage.getItem(`onboarding_dismissed_${userRole}`)
    if (dismissed) {
      onClose()
    }
  }, [userRole, onClose])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    localStorage.setItem(`onboarding_dismissed_${userRole}`, 'true')
    onComplete()
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleAction = () => {
    const step = steps[currentStep]
    setCompletedSteps(new Set([...completedSteps, step.id]))
    if (step.target) {
      window.location.href = step.target
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-[#4F46E5] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#4338CA] transition-colors"
        >
          <div className="flex items-center gap-1">
            {completedSteps.size} / {steps.length}
          </div>
          <span className="text-sm font-semibold">Onboarding</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const step = steps[currentStep]
  const StepIcon = step.icon
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <StepIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">Step {currentStep + 1} of {steps.length}</span>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
          <p className="text-gray-600 mb-6">{step.description}</p>

          {/* Step indicators */}
          <div className="flex gap-2 mb-6">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`flex-1 h-1 rounded-full ${
                  i <= currentStep ? 'bg-[#4F46E5]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAction}
              className="flex-1 bg-[#4F46E5] text-white py-3 rounded-xl font-semibold hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2"
            >
              {completedSteps.has(step.id) ? (
                <>
                  <Check className="w-4 h-4" />
                  Done
                </>
              ) : (
                <>
                  {step.action}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>

          <button
            onClick={handleSkip}
            className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Skip onboarding
          </button>
        </div>
      </div>
    </div>
  )
}
