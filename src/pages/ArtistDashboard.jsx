import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtistSidebar from '../components/ArtistSidebar';

export default function ArtistDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="h-screen bg-white">
      <ArtistSidebar />
      <main className="w-full h-full overflow-auto">
        <div className="p-12">
          <h1 className="text-4xl font-bold mb-4">Welcome, {user.full_name}</h1>
          <p className="text-gray-600 mb-12">Find your next project opportunity</p>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="text-3xl font-bold text-black mb-2">12</div>
              <div className="text-sm text-gray-600">Job Applications</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="text-3xl font-bold text-black mb-2">3</div>
              <div className="text-sm text-gray-600">Pending Invitations</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="text-3xl font-bold text-black mb-2">5</div>
              <div className="text-sm text-gray-600">Active Chats</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}