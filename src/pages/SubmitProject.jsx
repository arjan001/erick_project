import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import StepProjectType from '../components/intake/StepProjectType';
import StepUsage from '../components/intake/StepUsage';
import StepVisualDirection from '../components/intake/StepVisualDirection';
import StepLocation from '../components/intake/StepLocation';
import StepDepartments from '../components/intake/StepDepartments';
import StepTimeline from '../components/intake/StepTimeline';
import StepBudget from '../components/intake/StepBudget';
import StepFinal from '../components/intake/StepFinal';
import StepFundingDetails from '../components/intake/StepFundingDetails';
import StepSuccess from '../components/intake/StepSuccess';

const getStepsForProjectType = (projectType) => {
  const baseSteps = [
    { id: 1, name: 'Project Type', component: StepProjectType },
  ];

  if (projectType === 'funding_coproduction') {
    return [
      ...baseSteps,
      { id: 2, name: 'Funding Details', component: StepFundingDetails },
      { id: 3, name: 'Budget', component: StepBudget },
      { id: 4, name: 'Timeline', component: StepTimeline },
      { id: 5, name: 'Location', component: StepLocation },
      { id: 6, name: 'Details', component: StepFinal },
    ];
  }

  return [
    ...baseSteps,
    { id: 2, name: 'Usage', component: StepUsage },
    { id: 3, name: 'Visual Direction', component: StepVisualDirection },
    { id: 4, name: 'Location', component: StepLocation },
    { id: 5, name: 'Departments', component: StepDepartments },
    { id: 6, name: 'Timeline', component: StepTimeline },
    { id: 7, name: 'Budget', component: StepBudget },
    { id: 8, name: 'Details', component: StepFinal },
  ];
};

export default function SubmitProject() {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectData, setProjectData] = useState({
    project_type: '',
    usage: [],
    visual_direction_clips: [],
    location_country: '',
    location_city: '',
    is_remote: false,
    departments_needed: [],
    timeline_start: '',
    timeline_deadline: '',
    budget_range: '',
    notes: '',
    interested_in_first_frame: false,
    project_owner_email: '',
    project_owner_name: '',
    project_owner_company: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // Initialize with data from Home page if available
  useEffect(() => {
    if (location.state?.initialData) {
      setProjectData(prev => ({
        ...prev,
        ...location.state.initialData
      }));
    }
  }, [location.state]);

  const updateData = (field, value) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const STEPS = getStepsForProjectType(projectData.project_type);

  const canProceed = () => {
    if (currentStep === 1) return projectData.project_type !== '';
    
    const currentStepName = STEPS[currentStep - 1]?.name;
    
    switch (currentStepName) {
      case 'Funding Details':
        return projectData.funding_stage && (projectData.seeking_partners || []).length > 0;
      case 'Usage':
        return projectData.usage.length > 0;
      case 'Visual Direction':
        return projectData.visual_direction_clips.length > 0;
      case 'Location':
        return projectData.location_country !== '';
      case 'Departments':
        return projectData.departments_needed.length > 0;
      case 'Timeline':
        return projectData.timeline_start !== '' && projectData.timeline_deadline !== '';
      case 'Budget':
        return true; // Optional
      case 'Details':
        return projectData.project_owner_email !== '' && projectData.project_owner_name !== '';
      default:
        return true;
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
      let projectImage = null;

      // Generate and save project image once
      if (projectData.project_type !== 'funding_coproduction') {
        try {
          const imageResponse = await base44.functions.invoke('generateProjectImage', {
            projectType: projectData.project_type,
            description: projectData.notes,
            company: projectData.project_owner_company || projectData.project_owner_name
          });
          if (imageResponse.data?.image_url) {
            projectImage = imageResponse.data.image_url;
          }
        } catch (imgError) {
          console.error('Image generation failed, continuing without image:', imgError);
        }
      }

      await base44.entities.Project.create({
        ...projectData,
        status: 'submitted',
        image_url: projectImage
      });
      setSubmitted(true);
    } catch (error) {
      alert('Error submitting project. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <StepSuccess projectData={projectData} />;
  }

  const CurrentStepComponent = STEPS[currentStep - 1]?.component || StepProjectType;

  return (
    <div className="min-h-screen bg-white py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-black">Submit Your Project</h1>
          <p className="text-lg text-gray-600">Let's find the perfect team for your production</p>
        </div>

        {/* Progress Bar */}
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
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className="hidden sm:block text-xs text-gray-600 mt-2 text-center max-w-[80px]">{step.name}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    step.id < currentStep ? 'bg-amber-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 lg:p-10 mb-8 border border-gray-200 min-h-[400px]">
          <CurrentStepComponent 
            data={projectData} 
            updateData={updateData}
          />
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="border-gray-300 hover:bg-gray-50 order-2 sm:order-1"
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
              {isSubmitting ? 'Submitting...' : 'Submit Project'}
              <Check className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}