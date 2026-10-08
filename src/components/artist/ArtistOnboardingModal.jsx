import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Artist } from '@/lib/supabaseEntities'
import ArtistStepRole from './ArtistStepRole'
import ArtistStepQuestions from './ArtistStepQuestions'
import ArtistStepPortfolio from './ArtistStepPortfolio'
import ArtistStepDetails from './ArtistStepDetails'

const STEPS = [
  { id: 1, name: 'Details', component: ArtistStepDetails },
  { id: 2, name: 'Role', component: ArtistStepRole },
  { id: 3, name: 'Skills', component: ArtistStepQuestions },
  { id: 4, name: 'Portfolio', component: ArtistStepPortfolio },
]

// Modern multi-step "complete your profile" modal, shown right after an
// artist's first login when their Artist profile record is still incomplete.
export default function ArtistOnboardingModal({ artist, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState({
    full_name: artist.full_name || '',
    email: artist.email || '',
    based_in_city: artist.based_in_city || '',
    based_in_country: artist.based_in_country || '',
    phone: artist.phone || '',
    languages_spoken: artist.languages_spoken || [],
    website: artist.website || '',
    instagram: artist.instagram || '',
    vimeo: artist.vimeo || '',
    imdb: artist.imdb || '',
    linkedin: artist.linkedin || '',
    role: artist.role || '',
    secondary_roles: artist.secondary_roles || [],
    ai_questionnaire_response: artist.ai_questionnaire_response || {},
    portfolio_clips: artist.portfolio_clips || [],
  })

  const updateData = (field, value) => setData(prev => ({ ...prev, [field]: value }))

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.full_name !== '' && data.based_in_country !== ''
      case 2: return data.role !== ''
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
      await Artist.update(artist.id, { ...data })
      onComplete({ ...artist, ...data })
    } catch (err) {
      
    } finally {
      setIsSubmitting(false)
    }
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white z-10 px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Complete Your Creator Profile</h2>
            <p className="text-sm text-gray-500 mt-1">A few quick steps so clients can find and hire you.</p>
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step.id < currentStep
                        ? 'bg-indigo-600 text-white'
                        : step.id === currentStep
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="hidden sm:block text-xs text-gray-500 mt-1.5">{step.name}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full ${step.id < currentStep ? 'bg-indigo-600' : 'bg-gray-100'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-5 sm:p-6 mb-6 border border-gray-100 min-h-[320px]">
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
            <Button onClick={handleNext} disabled={!canProceed()} className="bg-indigo-600 text-white hover:bg-indigo-700">
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
              {isSubmitting ? 'Saving...' : 'Finish Profile'} <Check className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}