import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const demoAccounts = {
    'artist@artist.com': { role: 'artist', name: 'Alex Chen' },
    'team@team.com': { role: 'team', name: 'Studio Team' },
    'project@project.com': { role: 'project_owner', name: 'Jane Smith' },
    'backer@backer.com': { role: 'backer', name: 'Investment Group' },
    'admin@studio22.com': { role: 'admin', name: 'Admin User' }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (demoAccounts[email] && password === email) {
        const user = demoAccounts[email];
        localStorage.setItem('studio22_user', JSON.stringify({
          email,
          full_name: user.name,
          role: user.role
        }));
        localStorage.setItem('studio22_just_logged_in', 'true');

        const redirects = {
          artist: '/artistdashboard',
          team: '/artistdashboard',
          project_owner: '/artistdashboard',
          backer: '/artistdashboard',
          admin: '/admin'
        };

        window.location.href = createPageUrl(redirects[user.role]?.replace('/', '') || 'Home');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-[100px]">
      <div className="w-full max-w-md">
        <Link to={createPageUrl('Home')} className="inline-block mb-8 hover:opacity-70">
          <span className="text-4xl font-black tracking-tighter">22.</span>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Login</h1>
        <p className="text-gray-600 mb-8">Studio22 Creative Network</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artist@artist.com"
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-800 font-medium py-2"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600 mb-3">Demo Accounts:</p>
          <div className="space-y-2 text-xs text-gray-600 font-mono">
            <div>artist@artist.com</div>
            <div>team@team.com</div>
            <div>project@project.com</div>
            <div>backer@backer.com</div>
            <div>admin@studio22.com</div>
            <p className="text-xs text-gray-500 mt-2">Password = email</p>
          </div>
        </div>
      </div>
    </div>
  );
}