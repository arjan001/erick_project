import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import ArtistStepRole from '../components/artist/ArtistStepRole';
import ArtistStepQuestions from '../components/artist/ArtistStepQuestions';
import ArtistStepPortfolio from '../components/artist/ArtistStepPortfolio';
import ArtistStepDetails from '../components/artist/ArtistStepDetails';
import ApplicationSuccess from '../components/ApplicationSuccess';

const STEPS = [
  { id: 1, name: 'Role', component: ArtistStepRole },
  { id: 2, name: 'Questions', component: ArtistStepQuestions },
  { id: 3, name: 'Portfolio', component: ArtistStepPortfolio },
  { id: 4, name: 'Details', component: ArtistStepDetails },
];

export default function ApplyArtist() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artistData, setArtistData] = useState({
    role: '',
    secondary_roles: [],
    ai_questionnaire_response: {},
    portfolio_clips: [],
    email: '',
    full_name: '',
    based_in_city: '',
    based_in_country: '',
    years_experience: '',
    languages_spoken: [],
    website: '',
    instagram: '',
    vimeo: '',
    imdb: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const updateData = (field, value) => {
    setArtistData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return artistData.role !== '';
      case 2: return Object.keys(artistData.ai_questionnaire_response || {}).length > 0;
      case 3: return artistData.portfolio_clips.length > 0;
      case 4: return artistData.email !== '' && artistData.full_name !== '';
      default: return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await base44.entities.Artist.create({
        ...artistData,
        status: 'pending'
      });
      setSubmitted(true);
    } catch (error) {
      alert('Error submitting application. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <ApplicationSuccess type="artist" name={artistData.full_name} />;
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-zinc-950 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">Join Studio22 Network</h1>
          <p className="text-lg text-gray-400">Apply as an artist</p>
        </div>

        {/* Progress */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step.id < currentStep
                        ? 'bg-amber-600 text-white'
                        : step.id === currentStep
                        ? 'bg-amber-600 text-white ring-4 ring-amber-600/20'
                        : 'bg-zinc-800 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className="hidden sm:block text-xs text-gray-500 mt-2">{step.name}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full ${
                    step.id < currentStep ? 'bg-amber-600' : 'bg-zinc-800'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center text-sm text-gray-400">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 mb-8 border border-zinc-800 min-h-[400px]">
          <CurrentStepComponent data={artistData} updateData={updateData} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="border-zinc-700 hover:bg-zinc-800 order-2 sm:order-1"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-amber-600 hover:bg-amber-700 order-1 sm:order-2"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 order-1 sm:order-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
              <Check className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}