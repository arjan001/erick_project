import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtistSidebar from '../components/ArtistSidebar';

export default function JobInvitations() {
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
      
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">Invitations</h1>
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-gray-400">📬</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Invitations Yet</h2>
              <p className="text-gray-600 max-w-sm mx-auto">
                When clients invite you to apply for jobs, they'll appear here. Keep building your portfolio!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}