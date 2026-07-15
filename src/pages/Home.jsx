import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { ArrowRight, Play, Bookmark, Sparkles, X, Plus, Send, CheckCircle2, Loader, Film, Music, Video, Clapperboard, Briefcase, Building, Calendar, Package, Share, Sparkles as SparklesIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Creator, SavedProject, FeaturedWork, SuccessStory, RecentProject, ContentCategory } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EditableSection from '../components/EditableSection';
import CreatorFilterBar from '../components/CreatorFilterBar';
import CreatorGrid from '../components/CreatorGrid';
import CreatorGeneratorModal from '../components/CreatorGeneratorModal';
import ServiceCard from '../components/home/ServiceCard';
import SEOMetaTags from '../components/SEOMetaTags';



// Saved Project Card Component with futuristic hover effect

function SavedProjectCard({ project, editMode, onEdit, onView }) {

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isHovering, setIsHovering] = useState(false);



  useEffect(() => {

    if (!isHovering || project.images.length <= 1) return;

    

    const interval = setInterval(() => {

      setCurrentImageIndex((prev) => (prev + 1) % project.images.length);

    }, 800);

    

    return () => clearInterval(interval);

  }, [isHovering, project.images.length]);



  return (

    <div 

      onClick={editMode ? onEdit : onView}

      onMouseEnter={() => setIsHovering(true)}

      onMouseLeave={() => {

        setIsHovering(false);

        setCurrentImageIndex(0);

      }}

      className="cursor-pointer group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all"

    >

      <div className="relative aspect-[16/10] overflow-hidden bg-black">

        {project.images.map((img, idx) => (

          <img 

            key={idx}

            src={img} 

            alt={`${project.title} - Shot ${idx + 1}`}

            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"

            style={{

              opacity: currentImageIndex === idx ? 1 : 0,

              transform: currentImageIndex === idx ? 'scale(1)' : 'scale(1.1)',

              filter: currentImageIndex === idx ? 'blur(0px)' : 'blur(4px)'

            }}

          />

        ))}

        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">

          {isHovering ? `${currentImageIndex + 1}/${project.images.length}` : `${project.images.length} shots`}

        </div>

        {editMode && (

          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">

            EDIT

          </div>

        )}

      </div>

      <div className="p-4">

        <h4 className="font-bold text-sm mb-1">{project.title || 'Untitled'}</h4>

        <p className="text-xs text-gray-600 line-clamp-2">{project.description || 'No description'}</p>

      </div>

    </div>

  );

}



async function generateSingleShot(prompt) {
  // Skip base44 call to prevent white screen issues
  // Return a placeholder image instead
  return 'https://images.unsplash.com/photo-1485846234645-6ed24d24a7f3?w=800';
}



export default function Home({ editMode = false }) {
  const navigate = useNavigate();

  const [inProduction, setInProduction] = useState([]);
  const [released, setReleased] = useState([]);
  const [collections, setCollections] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const [savedProjects, setSavedProjects] = useState({
    inproduction: [],
    released: [],
    collections: [],
    creators: [],
    recent: [],
    services: []
  });

  const [viewingProject, setViewingProject] = useState(null);
  const [showAddShotPopup, setShowAddShotPopup] = useState(false);
  const [addShotPrompt, setAddShotPrompt] = useState('');
  const [generatingShot, setGeneratingShot] = useState(false);
  const [allCreators, setAllCreators] = useState([]);

  const [creatorFilters, setCreatorFilters] = useState({
    type: 'all_types',
    category: 'all_categories', 
    countries: []
  });

  const [creatorView, setCreatorView] = useState('list');
  const [creatorsPerPage, setCreatorsPerPage] = useState(10);
  const [showCreatorGenerator, setShowCreatorGenerator] = useState(false);

  // Quick project form state
  const [projectUrl, setProjectUrl] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectCategory, setProjectCategory] = useState('commercial');
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(null);

  const projectCategories = [
    { value: 'commercial', label: 'Commercial', icon: Film },
    { value: 'music_video', label: 'Music Video', icon: Music },
    { value: 'short_film', label: 'Short Film', icon: Clapperboard },
    { value: 'documentary', label: 'Documentary', icon: Video },
    { value: 'branded_content', label: 'Branded Content', icon: Briefcase },
    { value: 'corporate_video', label: 'Corporate Video', icon: Building },
    { value: 'event_coverage', label: 'Event Coverage', icon: Calendar },
    { value: 'product_demo', label: 'Product Demo', icon: Package },
    { value: 'social_media', label: 'Social Media', icon: Share },
    { value: 'animation', label: 'Animation', icon: SparklesIcon }
  ];

  const progressSteps = [
    'Fetching site content',
    'Analyzing brand and tone',
    'Identifying visual language',
    'Translating into a film concept'
  ];

  const handleExtract = async () => {
    if (!projectUrl) return;

    setExtracting(true);
    setExtractProgress(0);

    // Simulate progress through steps
    const progressInterval = setInterval(() => {
      setExtractProgress(prev => {
        if (prev === null) return 0;
        if (prev < progressSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    try {
      const response = await base44.functions.invoke('extractAndAnalyze', {
        url: projectUrl,
        projectType: projectCategory
      });

      clearInterval(progressInterval);

      if (response.data?.success && response.data?.description) {
        setProjectDescription(response.data.description);
        setExtractProgress(progressSteps.length - 1);
        setTimeout(() => {
          setExtractProgress(null);
        }, 600);
      } else if (response.data?.error) {
        console.error('Extract error:', response.data.error);
        setExtractProgress(null);
      }
    } catch (error) {
      console.error('Extract failed:', error);
      setExtractProgress(null);
      clearInterval(progressInterval);
    } finally {
      setExtracting(false);
    }
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    // Store the data in sessionStorage to pass to SubmitProject page
    sessionStorage.setItem('quickProjectUrl', projectUrl);
    sessionStorage.setItem('quickProjectDescription', projectDescription);
    sessionStorage.setItem('quickProjectCategory', projectCategory);
    navigate('/SubmitProject');
  };



  useEffect(() => {

    loadContent();

    loadSavedProjects();

    loadCreators();

  }, []);



  const loadCreators = async () => {
    try {
      const creators = await Creator.list();
      setAllCreators(creators);
    } catch (error) {
      console.log('Failed to load creators:', error);
      setAllCreators([]);
    }
  };



  const loadSavedProjects = async () => {
    try {
      const projects = await SavedProject.list();
      const organized = {
        inproduction: [],
        released: [],
        collections: [],
        creators: [],
        recent: [],

        services: []

      };

      

      projects.forEach(project => {

        organized[project.section].push(project);

      });

      

      setSavedProjects(organized);

    } catch (error) {
      console.log('Failed to load saved projects:', error);
      // Set empty state if table doesn't exist
      setSavedProjects({
        inproduction: [],
        released: [],
        collections: [],
        creators: [],
        recent: [],
        services: []
      });
    }

  };



  const saveProjectToDB = async (section, projectData) => {

    try {

      await SavedProject.create({

        section,

        title: projectData.title,

        description: projectData.description,

        images: projectData.images,

        prompt: projectData.prompt

      });

      await loadSavedProjects();

    } catch (error) {

      console.error('Failed to save project:', error);

    }

  };



  const loadContent = async () => {
    try {
      console.log('Loading content from Supabase...');
      
      // Fetch from Supabase entities with error handling for each
      let featuredWorks = [];
      let successStories = [];
      let recentProjectsData = [];
      let categoriesData = [];

      try {
        featuredWorks = await FeaturedWork.filter({ status: 'active' }, 'display_order', 9);
      } catch (err) {
        console.log('FeaturedWork table not available, using fallback');
      }

      try {
        successStories = await SuccessStory.filter({ status: 'published' }, 'display_order', 6);
      } catch (err) {
        console.log('SuccessStory table not available, using fallback');
      }

      try {
        recentProjectsData = await RecentProject.filter({ is_active: true }, 'display_order', 4);
      } catch (err) {
        console.log('RecentProject table not available, using fallback');
      }

      try {
        categoriesData = await ContentCategory.filter({ status: 'active' }, 'display_order', 100);
      } catch (err) {
        console.log('ContentCategory table not available, using fallback');
      }

      console.log('Categories data:', categoriesData);
      console.log('Featured works:', featuredWorks);
      console.log('Success stories:', successStories);
      console.log('Recent projects:', recentProjectsData);

      // Map featured works to in production format
      setInProduction(featuredWorks.map(work => ({
        title: work.title,
        studio: work.artist_id || 'Studio22',
        type: work.featured_type || 'Featured',
        description: work.description || '',
        score: 9.0,
        images: work.images || []
      })));

      // Map success stories to released format
      setReleased(successStories.map(story => ({
        title: story.title,
        studio: story.user_type === 'artist' ? 'Artist' : 'Client',
        type: story.category || 'Success Story',
        description: story.story || '',
        score: story.score || 9.0,
        images: story.images || []
      })));

      // Map recent projects
      setRecent(recentProjectsData.map(project => ({
        title: project.title,
        studio: project.studio || 'Studio22',
        type: project.type || 'Project',
        description: project.description || '',
        images: project.images || []
      })));

      // Map categories from Supabase - use fallback if empty
      const categories = categoriesData && categoriesData.length > 0 ? categoriesData : [
        { name: 'Documentary', description: 'Professional documentary filmmaking and production services', image_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600' },
        { name: 'Commercial', description: 'High-end commercial and advertising production', image_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600' },
        { name: 'Music Video', description: 'Creative music video production and direction', image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600' },
        { name: 'Film Production', description: 'Full-scale film production services', image_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600' },
        { name: 'Photography', description: 'Professional photography services', image_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600' },
        { name: 'Animation', description: '2D and 3D animation services', image_url: 'https://images.unsplash.com/photo-1531297461136-82af022f5b80?w=600' }
      ];
      
      setCollections(categories.map(cat => ({
        title: cat.name,
        description: cat.description,
        image: cat.image_url
      })));
    } catch (error) {
      console.error('Failed to load content from Supabase:', error);
      // Use fallback data if Supabase fails
      setInProduction([
        { title: 'The Last Horizon', studio: 'Studio22', type: 'Documentary', description: 'An epic journey through uncharted territories', score: 9.0, images: ['https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800'] },
        { title: 'Urban Dreams', studio: 'Night Vision', type: 'Commercial', description: 'Capturing the essence of city life', score: 8.5, images: ['https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800'] },
        { title: 'Echoes', studio: 'Soundwave', type: 'Music Video', description: 'A visual symphony in motion', score: 9.2, images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'] },
        { title: 'Beyond Limits', studio: 'Peak Productions', type: 'Film Production', description: 'Pushing the boundaries of storytelling', score: 8.8, images: ['https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800'] },
        { title: 'Light & Shadow', studio: 'Studio22', type: 'Photography', description: 'Exploring the interplay of light', score: 9.5, images: ['https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800'] },
        { title: 'Digital Dreams', studio: 'Future Frame', type: 'Animation', description: 'Where imagination meets technology', score: 9.0, images: ['https://images.unsplash.com/photo-1531297461136-82af022f5b80?w=800'] }
      ]);
      setReleased([
        { title: 'Golden Hour', studio: 'Artist Collective', type: 'Success Story', description: 'Award-winning documentary that changed perspectives', score: 9.8, images: ['https://images.unsplash.com/photo-1579547621113-c130c5abfa72?w=800'] },
        { title: 'City Lights', studio: 'Client Productions', type: 'Success Story', description: 'A commercial campaign that went viral', score: 9.3, images: ['https://images.unsplash.com/photo-1574267432553-c130c5abfa72?w=800'] },
        { title: 'Rhythm of Life', studio: 'Music Vision', type: 'Success Story', description: 'Music video with 10M+ views', score: 9.1, images: ['https://images.unsplash.com/photo-1516035069371-c130c5abfa72?w=800'] },
        { title: 'Frame by Frame', studio: 'Indie Studio', type: 'Success Story', description: 'Independent film festival winner', score: 9.4, images: ['https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800'] },
        { title: 'Visual Poetry', studio: 'Creative Minds', type: 'Success Story', description: 'Art project featured in galleries worldwide', score: 9.6, images: ['https://images.unsplash.com/photo-1492691527719-c130c5abfa72?w=800'] },
        { title: 'The Perfect Shot', studio: 'Studio22', type: 'Success Story', description: 'Photography series that defined a brand', score: 9.2, images: ['https://images.unsplash.com/photo-1536240478700-c130c5abfa72?w=800'] }
      ]);
      setRecent([
        { title: 'New Beginnings', studio: 'Fresh Start', type: 'Project', description: 'A new chapter in visual storytelling', images: ['https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800'] },
        { title: 'Summer Vibes', studio: 'Beach House', type: 'Project', description: 'Capturing the essence of summer', images: ['https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800'] },
        { title: 'Night Stories', studio: 'Midnight Crew', type: 'Project', description: 'Tales from the city after dark', images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'] },
        { title: 'Morning Light', studio: 'Dawn Productions', type: 'Project', description: 'The beauty of early hours', images: ['https://images.unsplash.com/photo-1579547621113-c130c5abfa72?w=800'] }
      ]);
      setCollections([
        { title: 'Documentary', description: 'Professional documentary filmmaking and production services', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600' },
        { title: 'Commercial', description: 'High-end commercial and advertising production', image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600' },
        { title: 'Music Video', description: 'Creative music video production and direction', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600' },
        { title: 'Film Production', description: 'Full-scale film production services', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600' },
        { title: 'Photography', description: 'Professional photography services', image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600' },
        { title: 'Animation', description: '2D and 3D animation services', image: 'https://images.unsplash.com/photo-1531297461136-82af022f5b80?w=600' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-white">
      <SEOMetaTags
        title="Studio22 - Premium Video Production Marketplace | Connect with World-Class Creators"
        description="Studio22 is the curated marketplace connecting brands and clients with the world's best independent filmmakers, video production teams, and creative studios. Find verified talent for commercials, music videos, documentaries, short films, and branded content projects across Europe and globally."
        keywords="video production marketplace, filmmakers, production teams, creative studios, commercial production, music video directors, documentary filmmakers, short film creators, branded content, video production services, film crew, cinematographers, video editors, production companies, creative talent, video production jobs"
        ogImage="https://studio22.com/og-home.jpg"
        ogType="website"
        schemaType="WebSite"
        schemaData={{
          name: "Studio22",
          url: "https://studio22.com",
          description: "Premium video production marketplace connecting clients with world-class creators and production teams",
          author: "oneplusafrica.com - OnePlusAfrica Tech Solution"
        }}
      />

      {/* Add Shot Popup */}

      {showAddShotPopup && (

        <div 

          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-6"

          onClick={() => setShowAddShotPopup(false)}

        >

          <div 

            className="bg-white rounded-xl max-w-2xl w-full p-6"

            onClick={(e) => e.stopPropagation()}

          >

            <h3 className="text-xl font-bold mb-4">Generate New Shot</h3>

            <p className="text-sm text-gray-600 mb-4">Edit the prompt to customize the shot:</p>

            <textarea

              value={addShotPrompt}

              onChange={(e) => setAddShotPrompt(e.target.value)}

              className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 outline-none resize-none"

              rows={4}

              placeholder="Describe the shot you want to generate..."

            />

            <div className="flex gap-3 mt-4">

              <Button

                onClick={() => setShowAddShotPopup(false)}

                variant="outline"

                disabled={generatingShot}

              >

                Cancel

              </Button>

              <Button

                onClick={async () => {

                  setGeneratingShot(true);

                  try {

                    const newShot = await generateSingleShot(addShotPrompt);

                    setViewingProject({ ...viewingProject, images: [...viewingProject.images, newShot] });

                    setShowAddShotPopup(false);

                  } catch (error) {

                    console.error('Failed to generate shot:', error);

                  } finally {

                    setGeneratingShot(false);

                  }

                }}

                disabled={!addShotPrompt || generatingShot}

                className="bg-blue-600 hover:bg-blue-700"

              >

                {generatingShot ? 'Generating...' : 'Generate Shot'}

              </Button>

            </div>

          </div>

        </div>

      )}



      {/* Project Viewer/Editor Modal */}

      {viewingProject && (

        <div 

          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"

          onClick={() => setViewingProject(null)}

        >

          <div 

            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"

            onClick={(e) => e.stopPropagation()}

          >

            <div className="p-8">

              <div className="flex justify-between items-start mb-6">

                <div className="flex-1">

                  {editMode && viewingProject._editIndex !== undefined ? (

                    <>

                      <input

                        value={viewingProject.title || ''}

                        onChange={(e) => setViewingProject({ ...viewingProject, title: e.target.value })}

                        className="text-3xl font-bold mb-2 w-full border-b-2 border-gray-200 focus:border-blue-500 outline-none"

                        placeholder="Project Title"

                      />

                      <textarea

                        value={viewingProject.description || ''}

                        onChange={(e) => setViewingProject({ ...viewingProject, description: e.target.value })}

                        className="text-gray-600 w-full border-b-2 border-gray-200 focus:border-blue-500 outline-none resize-none"

                        placeholder="Project Description"

                        rows={2}

                      />

                    </>

                  ) : (

                    <>

                      <h2 className="text-3xl font-bold mb-2">{viewingProject.title || 'Untitled Project'}</h2>

                      <p className="text-gray-600">{viewingProject.description || 'No description'}</p>

                    </>

                  )}

                </div>

                <button 

                  onClick={() => setViewingProject(null)}

                  className="text-gray-400 hover:text-black text-4xl leading-none ml-4"

                >

                  ×

                </button>

              </div>



              <div className="grid md:grid-cols-2 gap-4 mb-6">

                {viewingProject.images.map((img, idx) => (

                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden shadow-lg group">

                    <img src={img} alt={`Shot ${idx + 1}`} className="w-full h-full object-cover" />

                    <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded">

                      Shot {idx + 1}

                    </div>

                    {editMode && viewingProject._editIndex !== undefined && (

                      <button

                        onClick={() => {

                          const newImages = viewingProject.images.filter((_, i) => i !== idx);

                          setViewingProject({ ...viewingProject, images: newImages });

                        }}

                        className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"

                      >

                        <X className="w-4 h-4" />

                      </button>

                    )}

                  </div>

                ))}

              </div>



              {editMode && viewingProject._editIndex !== undefined && (

                <div className="flex gap-3">

                  <Button

                    onClick={() => {

                      setAddShotPrompt(viewingProject.prompt || 'Additional cinematic shot');

                      setShowAddShotPopup(true);

                    }}

                    className="bg-blue-600 hover:bg-blue-700"

                  >

                    <Sparkles className="w-4 h-4 mr-2" />

                    Add Shot

                  </Button>

                  <Button

                    onClick={async () => {

                      if (!confirm('Delete this project permanently?')) return;

                      await SavedProject.delete(viewingProject.id);

                      await loadSavedProjects();

                      setViewingProject(null);

                    }}

                    variant="outline"

                    className="border-red-500 text-red-500 hover:bg-red-50"

                  >

                    <X className="w-4 h-4 mr-2" />

                    Delete Project

                  </Button>

                  <Button

                    onClick={async () => {

                      await SavedProject.update(viewingProject.id, {

                        title: viewingProject.title,

                        description: viewingProject.description,

                        images: viewingProject.images,

                        prompt: viewingProject.prompt

                      });

                      await loadSavedProjects();

                      setViewingProject(null);

                    }}

                    className="bg-green-600 hover:bg-green-700"

                  >

                    Save Changes

                  </Button>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

      {/* Hero Section */}
      <section className="relative bg-[#F9F9F9] min-h-screen flex items-center justify-center overflow-hidden">
        {/* Main Content */}
        <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-black tracking-tighter mb-6">
            CONNECT. CREATE.
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 font-light mb-12 max-w-2xl mx-auto">
            Studio22 is the curated marketplace connecting clients with the world's best independent creators and production teams.
          </p>

          {/* Simple Form */}
          <form onSubmit={handleQuickSubmit} className="max-w-xl mx-auto space-y-4">
            <div className="relative">
              <Input
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="Paste your website or project URL (optional)"
                className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-transparent h-11"
              />
              <button
                type="button"
                onClick={handleExtract}
                disabled={!projectUrl || extracting}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                {extracting ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>

            {/* Progress Indicator */}
            {extractProgress !== null && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  {progressSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {idx < extractProgress && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                      {idx === extractProgress && (
                        <Loader className="w-4 h-4 text-blue-600 flex-shrink-0 animate-spin" />
                      )}
                      {idx > extractProgress && (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                      )}
                      <span className={idx <= extractProgress ? 'text-gray-800' : 'text-gray-500'}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description with Category Selector */}
            <div className="relative border border-gray-300 rounded-lg">
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe your project in one sentence..."
                rows={3}
                className="w-full px-4 py-4 pb-10 text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
              {/* Category Selector - Bottom Left Floating */}
              <div className="absolute bottom-2 left-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      const dropdown = document.getElementById('category-dropdown');
                      dropdown.classList.toggle('hidden');
                    }}
                    className="flex items-center gap-2 text-xs text-gray-600 bg-white border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-black cursor-pointer"
                  >
                    {(() => {
                      const selectedCategory = projectCategories.find(cat => cat.value === projectCategory);
                      const Icon = selectedCategory?.icon || Film;
                      return <Icon className="w-3 h-3 text-gray-500" />;
                    })()}
                    <span>{projectCategories.find(cat => cat.value === projectCategory)?.label}</span>
                  </button>
                  <div
                    id="category-dropdown"
                    className="hidden absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded shadow-lg z-[100] min-w-[150px]"
                  >
                    {projectCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => {
                            setProjectCategory(cat.value);
                            document.getElementById('category-dropdown').classList.add('hidden');
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"
                        >
                          <Icon className="w-3 h-3 text-gray-500" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 py-4 text-lg font-semibold"
            >
              <Send className="w-5 h-5 mr-2" />
              Submit
            </Button>
          </form>
        </div>
      </section>



      {/* IN PRODUCTION Section */}

      <section className="py-12 md:py-20 px-4 md:px-6 bg-white">

        <div className="max-w-[1800px] mx-auto">

          <div className="mb-12">

            <h2 className="text-5xl md:text-7xl font-normal uppercase mb-4 tracking-tight">

              Featured Projects

            </h2>

            <div className="flex items-center justify-between">

              <p className="text-lg text-gray-600">The most exciting projects currently active on the network.</p>

              <Link to={createPageUrl('Work')} className="text-sm font-bold uppercase tracking-wider hover:underline flex items-center gap-2">

                Browse All Projects <ArrowRight className="w-4 h-4" />

              </Link>

            </div>

          </div>



          {editMode && (

            <EditableSection 

              title="IN PRODUCTION" 

              onGenerate={(boxes) => {

                boxes.forEach(box => saveProjectToDB('inproduction', box));

              }}

            />

          )}



          {savedProjects.inproduction.length > 0 && (

            <div className="mb-8">

              <h3 className="text-lg font-bold mb-4 text-green-600">✓ Saved Projects ({savedProjects.inproduction.length})</h3>

              <div className="grid md:grid-cols-3 gap-4">

                {savedProjects.inproduction.map((project, idx) => (

                  <SavedProjectCard

                    key={idx}

                    project={project}

                    editMode={editMode}

                    onEdit={() => setViewingProject({ ...project, _editIndex: idx, _section: 'inproduction' })}

                    onView={() => setViewingProject(project)}

                  />

                ))}

              </div>

            </div>

          )}



          <div className="grid md:grid-cols-3 gap-6">

            {inProduction.slice(0, 9).map((project, i) => (

              <Link 

                key={i}

                to={createPageUrl('Work')}

                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"

              >

                <div className="relative aspect-[16/10] overflow-hidden">

                  <img 

                    src={`https://images.unsplash.com/photo-${['1579547621113', '1574267432553', '1516035069371', '1485846234645', '1492691527719', '1536240478700', '1558618666', '1574267432553', '1485846234645'][i]}-c130c5abfa72?q=80&w=900`}

                    alt={project.title}

                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"

                  />

                  

                  {/* Hover Overlay */}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">

                    <div className="flex items-center gap-4">

                      <button className="p-3 bg-white rounded-full">

                        <Play className="w-5 h-5 text-black" fill="currentColor" />

                      </button>

                      <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full">

                        <Bookmark className="w-5 h-5 text-white" />

                      </button>

                    </div>

                  </div>



                  <div className="absolute top-3 right-3">

                    <span className="px-3 py-1.5 bg-black/90 backdrop-blur-sm text-white text-xs font-bold rounded">

                      {project.type}

                    </span>

                  </div>



                  <div className="absolute bottom-3 left-3 right-3">

                    <div className="px-3 py-2 bg-white/95 backdrop-blur-sm rounded text-xs font-medium text-black">

                      In Production

                    </div>

                  </div>

                </div>



                <div className="p-5">

                  <div className="flex items-start justify-between mb-3">

                    <h3 className="text-lg font-semibold uppercase tracking-tight flex-1">{project.title}</h3>

                    <div className="flex items-center gap-1 ml-3">

                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">

                        <span className="text-[10px] font-bold">22</span>

                      </div>

                    </div>

                  </div>

                  

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">

                    <div className="w-4 h-4 rounded-full bg-gray-300" />

                    <span className="font-medium text-xs">{project.studio}</span>

                    <span className="text-xs text-[#FFD700] font-bold">PRO</span>

                  </div>

                  

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{project.description}</p>

                </div>

              </Link>

            ))}

          </div>

        </div>

      </section>



      {/* RELEASED Section */}

      <section className="py-12 md:py-20 px-4 md:px-6 bg-[#F9F9F9]">

        <div className="max-w-[1800px] mx-auto">

          <div className="mb-12">

            <h2 className="text-5xl md:text-7xl font-normal uppercase mb-4 tracking-tight">

              Success Stories

            </h2>

            <p className="text-lg text-gray-600">Incredible work delivered by creators from the Studio22 network.</p>

          </div>



          {editMode && (

            <EditableSection 

              title="RELEASED" 

              onGenerate={(boxes) => {

                boxes.forEach(box => saveProjectToDB('released', box));

              }}

            />

          )}



          {savedProjects.released.length > 0 && (

            <div className="mb-8">

              <h3 className="text-lg font-bold mb-4 text-green-600">✓ Saved Projects ({savedProjects.released.length})</h3>

              <div className="grid md:grid-cols-3 gap-4">

                {savedProjects.released.map((project, idx) => (

                  <SavedProjectCard

                    key={idx}

                    project={project}

                    editMode={editMode}

                    onEdit={() => setViewingProject({ ...project, _editIndex: idx, _section: 'released' })}

                    onView={() => setViewingProject(project)}

                  />

                ))}

              </div>

            </div>

          )}



          <div className="grid md:grid-cols-2 gap-6">

            {released.slice(0, 6).map((project, i) => (

              <Link 

                key={i}

                to={createPageUrl('Work')}

                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"

              >

                <div className="relative aspect-video overflow-hidden">

                  <img 

                    src={`https://images.unsplash.com/photo-${['1579547621113', '1574267432553', '1516035069371', '1485846234645', '1492691527719', '1536240478700'][i]}-c130c5abfa72?q=80&w=1200`}

                    alt={project.title}

                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"

                  />

                  

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">

                    <button className="p-4 bg-white rounded-full">

                      <Play className="w-6 h-6 text-black" fill="currentColor" />

                    </button>

                  </div>



                  <div className="absolute top-5 left-5">

                    <div className="inline-flex flex-col items-center px-5 py-4 bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg">

                      <div className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">POTD</div>

                      <div className="text-4xl font-black leading-none">{project.score}</div>

                      <div className="text-xs text-gray-500 mt-1">/10</div>

                    </div>

                  </div>

                </div>



                <div className="p-6">

                  <h3 className="text-xl font-semibold uppercase tracking-tight mb-3">{project.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">

                    <div className="w-5 h-5 rounded-full bg-gray-300" />

                    <span className="font-medium">{project.studio}</span>

                    <span className="text-xs text-[#FFD700] font-bold">PRO</span>

                  </div>

                  <span className="inline-block px-3 py-1 bg-gray-100 text-xs font-bold uppercase tracking-wider rounded mb-3">

                    {project.type}

                  </span>

                  <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>

                </div>

              </Link>

            ))}

          </div>



          <div className="text-center mt-12">

            <Link to={createPageUrl('Work')}>

              <button className="px-10 py-4 border-2 border-black text-black font-bold uppercase text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300 rounded-lg">

                View All Released

              </button>

            </Link>

          </div>

        </div>

      </section>



      {/* COLLECTIONS Section */}

      <section className="py-12 md:py-20 px-4 md:px-6 bg-white">

        <div className="max-w-[1800px] mx-auto">

          <div className="mb-12">

            <h2 className="text-5xl md:text-7xl font-normal uppercase mb-4 tracking-tight">

              Browse by Category

            </h2>

            <p className="text-lg text-gray-600">Find inspiration and see what's possible in different fields.</p>

          </div>



          {editMode && (

            <EditableSection 

              title="COLLECTIONS" 

              onGenerate={(boxes) => {

                boxes.forEach(box => saveProjectToDB('collections', box));

              }}

            />

          )}



          {savedProjects.collections.length > 0 && (

            <div className="mb-8">

              <h3 className="text-lg font-bold mb-4 text-green-600">✓ Saved Projects ({savedProjects.collections.length})</h3>

              <div className="grid md:grid-cols-3 gap-4">

                {savedProjects.collections.map((project, idx) => (

                  <SavedProjectCard

                    key={idx}

                    project={project}

                    editMode={editMode}

                    onEdit={() => setViewingProject({ ...project, _editIndex: idx, _section: 'collections' })}

                    onView={() => setViewingProject(project)}

                  />

                ))}

              </div>

            </div>

          )}



          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, i) => {
              const slug = collection.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              return (
                <Link
                  key={i}
                  to={`/Category/${slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-300">
                        Services
                      </div>
                      <h3 className="text-xl font-semibold uppercase tracking-tight">{collection.title}</h3>
                    </div>
                  </div>
                </Link>
              );
            })}

          </div>

          {/* Load More Categories */}
          <div className="mt-8 text-center">
            <Link to={createPageUrl('Categories')} className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">
              Load More Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </section>



      {/* WE ARE 22. CREATORS Section */}

      <section className="py-12 md:py-20 px-4 md:px-6 bg-[#F9F9F9]">

        <div className="max-w-[1800px] mx-auto">

          <div className="mb-8 text-left">

            <h2 className="text-5xl md:text-7xl font-normal uppercase mb-4 tracking-tight">

              THE NETWORK

            </h2>

            <p className="text-lg text-gray-600 max-w-3xl">

              A curated, invite-only collective of the world's best independent talent and production studios. Find your perfect match.

            </p>

          </div>



          {editMode && (

            <div className="mb-8">

              <Button

                onClick={() => setShowCreatorGenerator(true)}

                className="bg-blue-600 hover:bg-blue-700"

              >

                <Plus className="w-4 h-4 mr-2" />

                Generate Creators with AI

              </Button>

            </div>

          )}



          {showCreatorGenerator && (

            <CreatorGeneratorModal

              onClose={() => setShowCreatorGenerator(false)}

              onGenerated={loadCreators}

            />

          )}



          <CreatorFilterBar

            filters={creatorFilters}

            onFilterChange={(key, value) => setCreatorFilters({...creatorFilters, [key]: value})}

            onReset={() => setCreatorFilters({ type: 'all_types', category: 'all_categories', countries: [] })}

            allCreators={allCreators}

            view={creatorView}

            onViewChange={setCreatorView}

            categoryCounts={(() => {

              const counts = {};

              allCreators.forEach(creator => {

                creator.categories?.forEach(cat => {

                  counts[cat] = (counts[cat] || 0) + 1;

                });

              });

              return counts;

            })()}

            resultCount={(() => {

              let filtered = allCreators;

              if (creatorFilters.type !== 'all_types') {

                filtered = filtered.filter(c => c.type === creatorFilters.type);

              }

              if (creatorFilters.category !== 'all_categories') {

                filtered = filtered.filter(c => c.categories?.includes(creatorFilters.category));

              }

              if (creatorFilters.countries?.length > 0) {

                filtered = filtered.filter(c => 

                  creatorFilters.countries.includes(c.country?.toLowerCase().replace(' ', '_'))

                );

              }

              return filtered.length;

            })()}

          />



          <CreatorGrid

            creators={(() => {

              let filtered = allCreators;

              if (creatorFilters.type !== 'all_types') {

                filtered = filtered.filter(c => c.type === creatorFilters.type);

              }

              if (creatorFilters.category !== 'all_categories') {

                filtered = filtered.filter(c => c.categories?.includes(creatorFilters.category));

              }

              if (creatorFilters.countries?.length > 0) {

                filtered = filtered.filter(c => 

                  creatorFilters.countries.includes(c.country?.toLowerCase().replace(' ', '_'))

                );

              }

              return filtered.slice(0, creatorsPerPage);

            })()}

            view={creatorView}

            onDelete={editMode ? loadCreators : null}

          />



          {(() => {

            let filtered = allCreators;

            if (creatorFilters.type !== 'all_types') {

              filtered = filtered.filter(c => c.type === creatorFilters.type);

            }

            if (creatorFilters.category !== 'all_categories') {

              filtered = filtered.filter(c => c.categories?.includes(creatorFilters.category));

            }

            if (creatorFilters.countries?.length > 0) {

              filtered = filtered.filter(c => 

                creatorFilters.countries.includes(c.country?.toLowerCase().replace(' ', '_'))

              );

            }

            return filtered.length > creatorsPerPage;

          })() && (

            <div className="text-center mt-12">

              <button 

                onClick={() => setCreatorsPerPage(creatorsPerPage + 10)}

                className="px-10 py-4 border-2 border-black text-black font-bold uppercase text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300 rounded-lg"

              >

                Show More

              </button>

            </div>

          )}

        </div>

      </section>



      {/* RECENT PRODUCTIONS Section */}

      <section className="py-12 md:py-20 px-4 md:px-6 bg-white">

        <div className="max-w-[1800px] mx-auto">

          <div className="mb-12">

            <h2 className="text-5xl md:text-7xl font-normal uppercase mb-4 tracking-tight">

              Recently Posted Projects

            </h2>

            <p className="text-lg text-gray-600">New opportunities posted daily on the network.</p>

          </div>



          {editMode && (

            <EditableSection 

              title="RECENT PRODUCTIONS" 

              onGenerate={(boxes) => console.log('Generated:', boxes)}

            />

          )}



          <div className="grid md:grid-cols-4 gap-6">

            {recent.map((project, i) => (

              <Link 

                key={i}

                to={createPageUrl('Work')}

                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"

              >

                <div className="relative aspect-[4/3] overflow-hidden">

                  <img 

                    src={`https://images.unsplash.com/photo-${['1579547621113', '1574267432553', '1516035069371', '1485846234645', '1492691527719', '1536240478700', '1558618666', '1574267432553'][i]}-c130c5abfa72?q=80&w=800`}

                    alt={project.title}

                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"

                  />

                  

                  <div className="absolute top-2 right-2">

                    <span className="px-2 py-1 bg-black/90 backdrop-blur-sm text-white text-[10px] font-bold rounded">

                      {project.type}

                    </span>

                  </div>

                </div>



                <div className="p-4">

                  <h3 className="text-base font-semibold uppercase tracking-tight mb-2 line-clamp-1">{project.title}</h3>

                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">

                    <div className="w-3 h-3 rounded-full bg-gray-300" />

                    <span className="font-medium line-clamp-1">{project.studio}</span>

                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{project.description}</p>

                </div>

              </Link>

            ))}

          </div>

        </div>

      </section>



      {/* Services Section */}

      <section className="py-12 md:py-20 px-4 md:px-6 bg-[#FAFAFA]">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <h2 className="text-display uppercase mb-6 tracking-tighter">

              How It Works

            </h2>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">

              A simple, streamlined process for clients and creators to connect and produce amazing work.

            </p>

          </div>



          {editMode && (

            <div className="mb-8">

              <EditableSection 

                title="SERVICES" 

                onGenerate={(boxes) => console.log('Generated:', boxes)}

              />

            </div>

          )}



          <div className="grid md:grid-cols-3 gap-6">

            {[

              { title: 'Post a Project', desc: 'Clients post their project with a clear brief and budget. It\'s free and simple.', visual: 'commercial' },

              { title: 'Find Your Match', desc: 'Browse curated creators and teams, or let our system recommend the perfect fit.', visual: 'film' },

              { title: 'Collaborate & Create', desc: 'Connect directly, manage milestones, and create incredible work together.', visual: 'post' },

              { title: 'Secure Payments', desc: 'Transparent, milestone-based payments ensure everyone is protected.', visual: 'vfx' },

              { title: 'Deliver & Review', desc: 'Final delivery is handled through the platform, with feedback and review tools.', visual: 'sound' },

              { title: 'Join the Network', desc: 'Creators and teams apply to join our curated network to access exclusive projects.', visual: 'web' },

            ].map((service, i) => (

              <ServiceCard 

                key={i}

                title={service.title}

                desc={service.desc}

                visualType={service.visual}

              />

            ))}

          </div>

        </div>

      </section>



      {/* ── STUDIO22 MARKET SECTION — intentionally hidden, do not render ──
      <section className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-[1800px] mx-auto">
          <h2>Studio22 Market</h2>
        </div>
      </section>
      ── END HIDDEN SECTION ── */}



      {/* First Frame CTA */}

      <section className="py-12 md:py-24 bg-[#1a1a1a] text-white">

        <div className="max-w-4xl mx-auto px-6 text-center">

          <h2 className="text-4xl md:text-6xl font-normal uppercase mb-6 tracking-tight">Ready to Start?</h2>

          <p className="text-2xl mb-10 max-w-2xl mx-auto text-gray-300 font-light">

            Whether you're a client with a vision or a creator ready for your next challenge, the Studio22 network is where it happens.

          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

            <Link to={createPageUrl('SubmitProject')}>

              <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-gray-200">

                Post a Project for Free

              </Button>

            </Link>

            <Link to={createPageUrl('ApplyArtist')}>

              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-black">

                Apply to Join the Network

              </Button>

            </Link>

          </div>

        </div>

      </section>

    </div>

  );

}