import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { base44 } from '@/api/base44Client'
import TeamOnboardingDetailsStep from './TeamOnboardingDetailsStep'
import TeamStepSpecialties from './TeamStepSpecialties'

const STEPS = [
  { id: 1, name: 'Details', component: TeamOnboardingDetailsStep },
  { id: 2, name: 'Specialties', component: TeamStepSpecialties },
]

// Modern multi-step "complete your team profile" modal, shown right after the
// team admin's first login when their Team record is still incomplete.
export default function TeamOnboardingModal({ team, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState({
    city: team.city || '',
    country: team.country || '',
    team_size: team.team_size || '',
    languages_spoken: team.languages_spoken || [],
    specialties: team.specialties || [],
    custom_specialties: team.custom_specialties || [],
  })

  const updateData = (field, value) => setData(prev => ({ ...prev, [field]: value }))

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.city !== '' && data.country !== ''
      default: return true
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const { custom_specialties, ...rest } = data
      await base44.entities.Team.update(team.id, rest)
      onComplete({ ...team, ...rest })
    } catch (err) {
      
    } finally {
      setIsSubmitting(false)
    }
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-lg">
        <div className="sticky top-0 bg-white z-10 px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Complete Your Team Profile</h2>
            <p className="text-sm text-gray-500 mt-1">A few quick details so clients can find and book your team.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 sm:px-8 pt-6">
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      step.id < currentStep
                        ? 'bg-gray-900 text-white'
                        : step.id === currentStep
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="hidden sm:block text-xs text-gray-500 mt-1.5">{step.name}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full ${step.id < currentStep ? 'bg-gray-900' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-5 sm:p-6 mb-6 border border-gray-100 min-h-[320px]">
            <CurrentStepComponent data={data} updateData={updateData} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white px-6 sm:px-8 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button variant="ghost" onClick={onClose} className="text-gray-500">
              Skip for now
            </Button>
          </div>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="bg-gray-900 hover:bg-gray-800 text-white">
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gray-900 hover:bg-gray-800 text-white">
              {isSubmitting ? 'Saving...' : 'Finish Profile'} <Check className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}