import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Backer } from '@/lib/supabaseEntities';
import BackerStepInfo from '@/components/backer/BackerStepInfo';
import BackerStepFocus from '@/components/backer/BackerStepFocus';
import BackerStepPortfolio from '@/components/backer/BackerStepPortfolio';
import ApplicationSuccess from '@/components/ApplicationSuccess';

const STEPS = [
  { id: 1, name: 'Info', component: BackerStepInfo },
  { id: 2, name: 'Investment Focus', component: BackerStepFocus },
  { id: 3, name: 'Portfolio', component: BackerStepPortfolio },
];

export default function ApplyBacker() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backerData, setBackerData] = useState({
    contact_email: '',
    contact_name: '',
    organization_name: '',
    city: '',
    country: '',
    investment_focus: [],
    investment_range: '',
    portfolio_clips: [],
    website: '',
    social_media: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const updateData = (field, value) => {
    setBackerData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return backerData.contact_name && backerData.contact_email && backerData.organization_name && backerData.city && backerData.country;
      case 2: return backerData.investment_focus && backerData.investment_focus.length > 0;
      case 3: return true; // Portfolio optional, allow draft save
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
      await Backer.create({
        email: backerData.contact_email,
        full_name: backerData.contact_name,
        organization_name: backerData.organization_name,
        city: backerData.city,
        country: backerData.country,
        investment_focus: backerData.investment_focus,
        investment_range: backerData.investment_range,
        portfolio_clips: backerData.portfolio_clips,
        website: backerData.website,
        social_media: backerData.social_media,
        admin_approval_status: 'pending'
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  if (submitted) {
    return <ApplicationSuccess type="backer" />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Apply as Backer</h1>
          <p className="text-gray-600 mt-2">Join our network of investors and support creative projects</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-300 text-gray-300'
              }`}>
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <div className={`ml-3 text-sm font-medium ${
                currentStep >= step.id ? 'text-black' : 'text-gray-400'
              }`}>
                {step.name}
              </div>
              {step.id < STEPS.length && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-black' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-gray-50 rounded-lg p-8">
          <CurrentStepComponent 
            data={backerData}
            updateData={updateData}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep === STEPS.length ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}