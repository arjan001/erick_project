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
  { id: 1, name: 'Details', component: ArtistStepDetails },
  { id: 2, name: 'Role', component: ArtistStepRole },
  { id: 3, name: 'Skills', component: ArtistStepQuestions },
  { id: 4, name: 'Portfolio', component: ArtistStepPortfolio },
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
      case 1: return artistData.full_name !== '' && artistData.email !== '' && artistData.based_in_country !== '';
      case 2: return artistData.role !== '';
      case 3: return true; // Skills optional
      case 4: return true; // Portfolio optional, allow draft save
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

  const handleSaveDraft = async () => {
    try {
      await base44.auth.updateMe({
        artist_draft: artistData
      });
      alert('Draft saved. You can come back and complete it anytime.');
    } catch (error) {
      alert('Error saving draft. Please try again.');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!artistData.email || !artistData.full_name || !artistData.role || !artistData.based_in_country) {
      alert('Please fill in name, email, role, and country to submit.');
      return;
    }

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
    <div className="min-h-screen bg-white py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-black">Join the Creator Network</h1>
          <p className="text-lg text-gray-600 max-w-3xl">Apply as an individual creator to get access to a curated marketplace of projects, connect with clients, and collaborate with top-tier professionals from around the world.</p>
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
                        ? 'bg-black text-white'
                        : step.id === currentStep
                        ? 'bg-black text-white ring-4 ring-black/20'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className="hidden sm:block text-xs text-gray-500 mt-2">{step.name}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full ${
                    step.id < currentStep ? 'bg-black' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 lg:p-10 mb-8 border border-gray-200 min-h-[400px]">
          <CurrentStepComponent data={artistData} updateData={updateData} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2 order-2 sm:order-1">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSaveDraft}
              className="border-gray-300 hover:bg-gray-50"
            >
              Save Draft
            </Button>
          </div>

          {currentStep < STEPS.length ? (
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-black text-white hover:bg-gray-800 order-1 sm:order-2"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-gray-800 order-1 sm:order-2"
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