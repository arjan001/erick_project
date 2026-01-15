import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, Play, MapPin, Award, Sparkles, Wand2, Paperclip, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../components/useTranslation';
import { base44 } from '@/api/base44Client';
import EuropeanPresenceMap from '../components/home/EuropeanPresenceMap';
import FeaturedWork from '../components/home/FeaturedWork';
import ServicesPreview from '../components/home/ServicesPreview';

const PROJECT_TYPES = [
  { value: 'commercial', label: 'Commercial', icon: '📺' },
  { value: 'music_video', label: 'Music Video', icon: '🎵' },
  { value: 'short_film', label: 'Short Film', icon: '🎬' },
  { value: 'feature_film', label: 'Feature Film', icon: '🎥' },
  { value: 'documentary', label: 'Documentary', icon: '📹' },
  { value: 'branded_content', label: 'Branded Content', icon: '✨' },
  { value: 'event_coverage', label: 'Event Coverage', icon: '📸' },
  { value: 'product_demo', label: 'Product Demo', icon: '🎁' },
  { value: 'social_media', label: 'Social Media', icon: '💬' },
  { value: 'animation', label: 'Animation', icon: '🎨' },
];

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [referenceUrl, setReferenceUrl] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('commercial');
  const [isExtracting, setIsExtracting] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleExtract = async () => {
    if (!referenceUrl.trim()) return;
    
    setIsExtracting(true);
    try {
      const { data } = await base44.functions.invoke('extractWebsite', { url: referenceUrl });
      if (data.success) {
        setDescription(data.description);
      }
    } catch (error) {
      console.error('Extract error:', error);
      alert('Failed to extract website content. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRefreshDescription = async (newType) => {
    if (!description.trim()) return;
    
    setIsRefreshing(true);
    try {
      const typeLabel = PROJECT_TYPES.find(t => t.value === newType)?.label || 'commercial';
      const { data } = await base44.functions.invoke('extractWebsite', { 
        url: `refresh-${Date.now()}`,
        description: description,
        projectType: typeLabel
      });
      
      if (data.success) {
        setDescription(data.description);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerate = () => {
    // Navigate to SubmitProject with initial data
    const projectData = {
      notes: description,
      project_type: projectType,
    };
    
    navigate(createPageUrl('SubmitProject'), { 
      state: { initialData: projectData } 
    });
  };

  const selectedType = PROJECT_TYPES.find(t => t.value === projectType) || PROJECT_TYPES[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-20 bg-white">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white z-10" />
          <img 
            src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000" 
            alt="Production"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        {/* Hero Content - Form Style */}
        <div className="relative z-20 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-100">
            {/* Studio22 Branding */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">S22</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">Studio<span className="text-gray-600">22</span></h2>
                <p className="text-sm text-gray-500">Production Network</p>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-black">
              New Project
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              One sentence. The system handles the rest.
            </p>

            {/* Reference Website */}
            <div className="mb-8">
              <label className="block text-base font-semibold mb-3 text-black">
                Reference Website (Optional)
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  placeholder="www.example.com"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="flex-1 px-5 py-4 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                <Button 
                  onClick={handleExtract}
                  disabled={!referenceUrl.trim() || isExtracting}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl text-base font-medium disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Extract
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Provide a URL and click Extract to auto-generate your project description
              </p>
            </div>

            {/* Project Description */}
            <div className="mb-8">
              <label className="block text-base font-semibold mb-3 text-black">
                Project Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe your project or use Extract button above. You can write multiple sentences with details about your vision, target audience, style, and goals."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                className="w-full px-5 py-4 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none overflow-hidden"
                style={{ minHeight: '80px' }}
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="relative">
                <button 
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-base font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  {React.createElement(selectedType.icon, { className: "w-4 h-4 text-gray-600" })}
                  {selectedType.label}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showTypeDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 max-h-96 overflow-y-auto">
                    {PROJECT_TYPES.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => {
                            const newType = type.value;
                            setProjectType(newType);
                            setShowTypeDropdown(false);
                            if (description.trim()) {
                              handleRefreshDescription(newType);
                            }
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                            projectType === type.value ? 'bg-gray-100' : ''
                          }`}
                        >
                          <IconComponent className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerate}
                  disabled={!description.trim()}
                  size="lg" 
                  className="bg-gray-700 hover:bg-gray-800 text-white px-10 py-4 text-base font-medium rounded-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Production Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Work */}
      <FeaturedWork />

      {/* Services Preview */}
      <ServicesPreview />

      {/* First Frame CTA */}
      <section className="py-24 bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="w-16 h-16 text-amber-600 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Studio22 First Frame</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Experience how Studio22 works with one complimentary production day for verified projects. See our quality firsthand.
          </p>
          <Link to={createPageUrl('FirstFrame')}>
            <Button size="lg" variant="outline" className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-8 py-6 text-lg rounded-lg">
              Learn More About First Frame
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Ready to start?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Submit your project and let us assemble the perfect team.
          </p>
          <Link to={createPageUrl('SubmitProject')}>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-6 text-lg rounded-lg shadow-2xl shadow-amber-600/20">
              Submit Your Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}