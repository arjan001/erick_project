import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtistSidebar from '../components/ArtistSidebar';
import { Search, Send } from 'lucide-react';

export default function Messages() {
  const [user, setUser] = useState(null);
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
    <div className="flex h-screen bg-white">
      <ArtistSidebar />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search conversations" 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {/* Placeholder conversations */}
            <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-l-2 border-black">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-black">Aika Lau</div>
                  <div className="text-xs text-gray-600 truncate">VFX Artist needed for Branding...</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div>
              <div className="font-bold text-sm">Aika Lau</div>
              <div className="text-xs text-gray-600">Job chat: VFX Artist needed for Branding</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
              <div className="max-w-xs bg-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-900">Hi! Are you interested in the VFX position?</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="max-w-xs bg-black text-white rounded-lg p-3">
                <p className="text-sm">Yes, absolutely! I'd love to learn more about the project.</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none"
              />
              <button className="bg-black text-white p-2 rounded-lg hover:bg-gray-800">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}