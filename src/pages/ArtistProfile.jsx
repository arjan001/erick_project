import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtistSidebar from '../components/ArtistSidebar';
import { Button } from '@/components/ui/button';
import { Edit2, MapPin } from 'lucide-react';

export default function ArtistProfile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('work');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="h-screen bg-white">
      <ArtistSidebar />
      
      <main className="w-full h-full overflow-auto">
        <div className="bg-gray-100 h-40" />
        
        <div className="px-8 pb-8">
          {/* Profile Header */}
          <div className="flex items-start gap-6 -mt-20 relative z-10 mb-8">
            <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white" />
            <div className="flex-1 pt-4">
              <h1 className="text-4xl font-bold text-black mb-2">Alex Chen</h1>
              <p className="text-gray-600 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Los Angeles, CA
              </p>
              <p className="text-gray-600">VFX Artist & Motion Designer</p>
            </div>
            <Button className="bg-black text-white hover:bg-gray-800">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('work')}
                className={`py-3 px-1 font-bold border-b-2 transition-colors ${
                  activeTab === 'work'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Work
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-3 px-1 font-bold border-b-2 transition-colors ${
                  activeTab === 'about'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                About
              </button>
            </div>
          </div>

          {/* Work Tab */}
          {activeTab === 'work' && (
            <div>
              <h2 className="text-2xl font-bold text-black mb-6">Portfolio</h2>
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="bg-gray-300 aspect-video rounded-lg mb-3 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 group-hover:opacity-80 transition-opacity" />
                    </div>
                    <h3 className="font-bold text-black text-sm mb-1">Project {i}</h3>
                    <p className="text-xs text-gray-600">VFX & Motion Design</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-black mb-4">About Me</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                I'm a VFX artist and motion designer with 5+ years of experience in creating stunning visual effects for commercials, music videos, and corporate content. Specializing in particle effects, 3D compositing, and motion graphics.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-black mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {['After Effects', 'Cinema 4D', 'Maya', 'Nuke', 'Color Grading', 'Motion Design'].map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">Experience</h3>
                  <p className="text-gray-700">5+ years in visual effects and motion design</p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">Languages</h3>
                  <p className="text-gray-700">English, Mandarin</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}