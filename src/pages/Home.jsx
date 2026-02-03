import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight, Award, MapPin, User, Play, Bookmark, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import EditableSection from '../components/EditableSection';

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
  const [creators, setCreators] = useState([]);
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

  useEffect(() => {
    loadContent();
    loadSavedProjects();
  }, []);

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
      const [inProdRes, releasedRes, creatorsRes, collectionsRes, recentRes] = await Promise.all([
        base44.functions.invoke('generateContent', { section: 'inproduction' }),
        base44.functions.invoke('generateContent', { section: 'released' }),
        base44.functions.invoke('generateContent', { section: 'creators' }),
        base44.functions.invoke('generateContent', { section: 'collections' }),
        base44.functions.invoke('generateContent', { section: 'recent' })
      ]);

      if (inProdRes.data?.success) setInProduction(inProdRes.data.data.projects || []);
      if (releasedRes.data?.success) setReleased(releasedRes.data.data.projects || []);
      if (creatorsRes.data?.success) setCreators(creatorsRes.data.data.creators || []);
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
      <section className="relative bg-[#F9F9F9] py-20 overflow-hidden">
        {/* Main Title */}
        <div className="text-center px-6 max-w-6xl mx-auto mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/1fb910d51_IMG_5196.jpg" 
              alt="Studio22" 
              className="w-full max-w-[800px] h-auto"
              loading="eager"
            />
          </div>
          
          <p className="text-lg md:text-xl text-gray-600 font-light mb-8">
            Creators of cinematic worlds.
          </p>
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
              IN PRODUCTION
            </h2>
            <div className="flex items-center justify-between">
              <p className="text-lg text-gray-600">Projects currently in development</p>
              <Link to={createPageUrl('Work')} className="text-sm font-bold uppercase tracking-wider hover:underline flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
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
              RELEASED
            </h2>
            <p className="text-lg text-gray-600">Completed and delivered productions</p>
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
              COLLECTIONS
            </h2>
            <p className="text-lg text-gray-600">Curated production showcases</p>
          </div>

          {editMode && (
            <EditableSection 
              title="COLLECTIONS" 
              onGenerate={(boxes) => console.log('Generated:', boxes)}
            />
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, i) => (
              <Link 
                key={i}
                to={createPageUrl('Services')}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${['1574267432553', '1492691527719', '1516035069371', '1485846234645', '1579547621113', '1536240478700'][i]}-c130c5abfa72?q=80&w=800`}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-300">
                      {collection.project_count} Productions
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
          <div className="mb-12">
            <h2 className="text-5xl md:text-7xl font-normal uppercase mb-4 tracking-tight">
              WE ARE 22. CREATORS
            </h2>
            <p className="text-lg text-gray-600">The people behind our productions</p>
          </div>

          {editMode && (
            <EditableSection 
              title="WE ARE 22. CREATORS" 
              onGenerate={(boxes) => console.log('Generated:', boxes)}
            />
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {creators.map((creator, i) => (
              <Link 
                key={i}
                to={createPageUrl('ApplyArtist')}
                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-tight mb-1 line-clamp-1">{creator.name}</h3>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{creator.city}</span>
                  </div>
                  
                  <p className="text-xs font-bold text-gray-700 mb-2">{creator.role}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{creator.specialty}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl('ApplyArtist')}>
              <button className="px-10 py-4 border-2 border-black text-black font-bold uppercase text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300 rounded-lg">
                View All Creators
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* RECENT PRODUCTIONS Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-12">
            <h2 className="text-5xl md:text-7xl font-normal uppercase mb-4 tracking-tight">
              RECENT PRODUCTIONS
            </h2>
            <p className="text-lg text-gray-600">Recently updated and completed</p>
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
              Full-Service
              <br />
              Production
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From concept to delivery, we handle every aspect with curated teams across Europe
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
              { title: 'Commercial', desc: 'High-end commercial production from concept to delivery' },
              { title: 'Film & Docs', desc: 'Feature films, shorts, and documentaries' },
              { title: 'Post Production', desc: 'Editing, color grading, and finishing' },
              { title: 'VFX & 3D', desc: 'Visual effects and 3D animation' },
              { title: 'Sound & Music', desc: 'Sound design, mixing, and composition' },
              { title: 'Web Dev', desc: 'Marketing websites and digital experiences' },
            ].map((service, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-black rounded-lg mb-4" />
                <h3 className="text-xl font-semibold uppercase mb-3 tracking-tight">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
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
              { title: 'Cinema Cameras', count: '127 items', icon: '📹' },
              { title: 'Lenses & Optics', count: '243 items', icon: '🎥' },
              { title: 'Lighting', count: '189 items', icon: '💡' },
              { title: 'Audio Equipment', count: '156 items', icon: '🎤' },
              { title: 'Locations', count: '89 spaces', icon: '📍' },
              { title: 'Studios', count: '34 facilities', icon: '🏢' },
            ].map((category, i) => (
              <Link 
                key={i}
                to={createPageUrl('ApplyTeam')}
                className="group bg-[#FAFAFA] rounded-lg p-8 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold uppercase tracking-tight mb-2">{category.title}</h3>
                <p className="text-sm text-gray-500 font-medium">{category.count}</p>
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
          <Award className="w-20 h-20 mx-auto mb-8 text-[#FFD700]" />
          <h2 className="text-4xl md:text-6xl font-normal uppercase mb-6 tracking-tight">STUDIO22 FIRST FRAME</h2>
          <p className="text-2xl mb-10 max-w-2xl mx-auto text-gray-300 font-light">
            Experience our quality with one complimentary production day for verified projects
          </p>
          <Link to={createPageUrl('FirstFrame')}>
            <button className="px-12 py-5 bg-[#FFD700] text-black font-bold uppercase text-sm tracking-wider hover:bg-[#FFC700] transition-all duration-300 rounded-lg shadow-2xl">
              Learn More <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}