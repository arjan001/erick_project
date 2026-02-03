import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, Award, MapPin, User, Play, Bookmark, Sparkles, X, Grid3x3, List, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import EditableSection from '../components/EditableSection';
import CreatorFilterBar from '../components/CreatorFilterBar';
import CreatorGrid from '../components/CreatorGrid';
import CreatorGeneratorModal from '../components/CreatorGeneratorModal';
import ServiceCard from '../components/home/ServiceCard';

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
  const response = await base44.integrations.Core.GenerateImage({
    prompt: `${prompt}\n\nCinematic style. Muted colors. Practical lights. Natural grain. In-production feel.`
  });
  return response.url;
}

export default function Home({ editMode = false }) {
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

  useEffect(() => {
    loadContent();
    loadSavedProjects();
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      const creators = await base44.entities.Creator.list();
      setAllCreators(creators);
    } catch (error) {
      console.error('Failed to load creators:', error);
    }
  };

  const loadSavedProjects = async () => {
    try {
      const projects = await base44.entities.SavedProject.list();
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
      console.error('Failed to load saved projects:', error);
    }
  };

  const saveProjectToDB = async (section, projectData) => {
    try {
      await base44.entities.SavedProject.create({
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
      const [inProdRes, releasedRes, collectionsRes, recentRes] = await Promise.all([
        base44.functions.invoke('generateContent', { section: 'inproduction' }),
        base44.functions.invoke('generateContent', { section: 'released' }),
        base44.functions.invoke('generateContent', { section: 'collections' }),
        base44.functions.invoke('generateContent', { section: 'recent' })
      ]);

      if (inProdRes.data?.success) setInProduction(inProdRes.data.data.projects || []);
      if (releasedRes.data?.success) setReleased(releasedRes.data.data.projects || []);
      if (collectionsRes.data?.success) setCollections(collectionsRes.data.data.collections || []);
      if (recentRes.data?.success) setRecent(recentRes.data.data.projects || []);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white">
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
                      await base44.entities.SavedProject.delete(viewingProject.id);
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
                      await base44.entities.SavedProject.update(viewingProject.id, {
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
      <section className="relative bg-[#F9F9F9] py-12 md:py-20 overflow-hidden">
        {/* Main Title */}
        <div className="text-center px-4 md:px-6 max-w-6xl mx-auto mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 md:mb-6">CONNECT. CREATE.</h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 font-light mb-6 md:mb-8 max-w-3xl mx-auto">
            Studio22 is the curated marketplace connecting clients with the world's best independent creators and production teams. Post a project, find your crew, create incredible work.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={createPageUrl('SubmitProject')}>
              <Button size="lg" className="w-full sm:w-auto bg-black text-white hover:bg-gray-800">
                Post a Project for Free
              </Button>
            </Link>
            <Link to={createPageUrl('ApplyArtist')}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Apply to Join the Network
              </Button>
            </Link>
          </div>
        </div>

        {/* Background Image (smaller, positioned lower) */}
        <div className="relative max-w-5xl mx-auto px-6 mb-16">
          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            {loading ? (
              <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&amp;w=2000"
                alt="Cinematic production"
                className="w-full aspect-video object-cover"
                loading="eager"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>

      </section>

      {/* IN PRODUCTION Section */}
      <section className="py-20 px-6 bg-white">
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
      <section className="py-20 px-6 bg-[#F9F9F9]">
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
      <section className="py-20 px-6 bg-white">
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
            {[
              {
                title: 'Automotive Excellence',
                description: 'High-octane car commercials with dynamic camera work, precision lighting, and cinematic storytelling.',
                image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200',
                count: 24
              },
              {
                title: 'Fashion & Lifestyle',
                description: 'Elegant fashion films showcasing collections through artful composition and sophisticated visual narratives.',
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200',
                count: 31
              },
              {
                title: 'Tech & Innovation',
                description: 'Sleek product reveals and tech launches with modern aesthetics and cutting-edge visual effects.',
                image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200',
                count: 18
              },
              {
                title: 'Food & Beverage',
                description: 'Mouthwatering culinary cinematography with macro shots, steam effects, and appetizing color grading.',
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200',
                count: 27
              },
              {
                title: 'Documentary Stories',
                description: 'Authentic human stories captured through intimate interviews, natural lighting, and real-world settings.',
                image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1200',
                count: 15
              },
              {
                title: 'Music Videos',
                description: 'Bold artistic expressions combining narrative storytelling with dynamic performance cinematography.',
                image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200',
                count: 22
              }
            ].map((collection, i) => (
              <Link 
                key={i}
                to={createPageUrl('Services')}
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
                      {collection.count} Productions
                    </div>
                    <h3 className="text-xl font-semibold uppercase tracking-tight">{collection.title}</h3>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-gray-600 leading-relaxed">{collection.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WE ARE 22. CREATORS Section */}
      <section className="py-20 px-6 bg-[#F9F9F9]">
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
      <section className="py-20 px-6 bg-white">
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
      <section className="py-20 px-6 bg-[#FAFAFA]">
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

      {/* Studio22 Market Section */}
      <section className="py-24 bg-[#F9F9F9]">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-normal uppercase mb-6 tracking-tight">
              STUDIO22 MARKET
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Professional network for sharing cameras, lenses, lighting, audio gear, locations, studios, and special equipment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { title: 'Cinema Cameras', count: '127 items', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/dbce8126d_generated_image.png' },
              { title: 'Lenses & Optics', count: '243 items', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/f31ed2366_generated_image.png' },
              { title: 'Lighting', count: '189 items', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/b56a3259c_generated_image.png' },
              { title: 'Audio Equipment', count: '156 items', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/f53fffda7_generated_image.png' },
              { title: 'Locations', count: '89 spaces', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/460bb9ffb_generated_image.png' },
              { title: 'Studios', count: '34 facilities', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/481ecbf61_generated_image.png' },
            ].map((category, i) => (
              <Link 
                key={i}
                to={createPageUrl('ApplyTeam')}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-square bg-white p-8 flex items-center justify-center">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold uppercase tracking-tight mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-500 font-medium">{category.count}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link to={createPageUrl('ApplyTeam')}>
              <button className="px-10 py-4 bg-[#1a1a1a] text-white font-bold uppercase text-sm tracking-wider hover:bg-black transition-all duration-300 rounded-lg">
                Browse Market <ArrowRight className="inline-block ml-2 w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* First Frame CTA */}
      <section className="py-24 bg-[#1a1a1a] text-white">
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