import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import TeamStepInfo from '../components/team/TeamStepInfo';
import TeamStepSpecialties from '../components/team/TeamStepSpecialties';
import TeamStepPortfolio from '../components/team/TeamStepPortfolio';
import ApplicationSuccess from '../components/ApplicationSuccess';
import SEOMetaTags from '../components/SEOMetaTags';

const STEPS = [
  { id: 1, name: 'Info', component: TeamStepInfo },
  { id: 2, name: 'Specialties', component: TeamStepSpecialties },
  { id: 3, name: 'Portfolio', component: TeamStepPortfolio },
];

export default function ApplyTeam() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [teamData, setTeamData] = useState({
    contact_email: '',
    contact_name: '',
    password: '',
    confirmPassword: '',
    city: '',
    country: '',
    specialties: [],
    team_size: '',
    equipment_owned: [],
    portfolio_clips: [],
    languages_spoken: [],
  });
  const [submitted, setSubmitted] = useState(false);

  const updateData = (field, value) => {
    setTeamData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return teamData.team_name && teamData.contact_name && teamData.contact_email && teamData.phone && teamData.city && teamData.country
        && teamData.password && teamData.password.length >= 6 && teamData.password === teamData.confirmPassword;
      case 2: return teamData.specialties && teamData.specialties.length > 0;
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

  const handleSaveDraft = async () => {
    try {
      await base44.auth.updateMe({
        team_draft: teamData
      });
      alert('Draft saved. You can come back and complete it anytime.');
    } catch (error) {
      alert('Error saving draft. Please try again.');
      console.error(error);
    }
  };

  const generateTeamCode = () => {
    const cityCode = teamData.city?.substring(0, 3).toUpperCase() || 'XXX';
    const randomNum = String(Math.floor(Math.random() * 100) + 1).padStart(2, '0');
    return `${cityCode} ${randomNum}`;
  };

  const handleSubmit = async () => {
    if (!teamData.team_name || !teamData.contact_name || !teamData.contact_email || !teamData.phone || !teamData.city || !teamData.country) {
      alert('Please fill in all required fields to submit.');
      return;
    }
    if (!teamData.password || teamData.password.length < 6) {
      alert('Please set a password (min 6 characters) so you can log in as team admin.');
      return;
    }
    if (teamData.password !== teamData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      // Create the login account first — this is what lets the team admin sign in later.
      const { password, confirmPassword, ...teamFields } = teamData;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: teamData.contact_email,
        password: teamData.password,
        options: { data: { full_name: teamData.contact_name, role: 'team' } },
      });
      if (signUpError) throw signUpError;

      await base44.entities.Team.create({
        ...teamFields,
        team_code: generateTeamCode(),
        status: 'pending',
        availability: 'available'
      });

      if (signUpData.session) {
        login({
          id: signUpData.user.id,
          email: signUpData.user.email,
          full_name: teamData.contact_name,
          role: 'team',
        });
        navigate('/teamdashboard');
        return;
      }
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'Error submitting application. Please try again.');
      alert(error.message || 'Error submitting application. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <ApplicationSuccess
        type="team"
        name={teamData.contact_name}
      />
    );
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-white py-8 lg:py-12">
      <SEOMetaTags
        title="Join as Production Team | Eric Rabar Video Production Marketplace"
        description="Register your production team, studio, or collective on Eric Rabar and connect with brands, agencies, and clients seeking professional video production services. Showcase your portfolio, manage your crew, and access premium commercial, music video, documentary, and branded content projects."
        keywords="production team registration, video production company, film studio, production collective, video production services, commercial production company, music video production, documentary production, film crew services, production team portfolio, creative studio, video production agency"
        ogImage="https://ericrabar.com/og-apply-team.jpg"
        ogType="website"
        schemaType="ProfilePage"
        schemaData={{
          name: "Eric Rabar Team Application",
          description: "Register your production team on the premium video production marketplace",
          author: "oneplusafrica.com - OnePlusAfrica Tech Solution"
        }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-black">Join the Creator Network</h1>
          <p className="text-lg text-gray-600 max-w-3xl">Apply as a team, studio, or collective to access high-value projects, manage your crew, and grow your business on our curated marketplace.</p>
        </div>

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
          <CurrentStepComponent data={teamData} updateData={updateData} />
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