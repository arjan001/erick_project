import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function SignIn() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('artist');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const demoAccounts = {
    'artist@artist.com': { role: 'artist', name: 'Alex Chen' },
    'team@team.com': { role: 'team', name: 'Studio Team' },
    'client@client.com': { role: 'client', name: 'Client User' },
    'backer@backer.com': { role: 'backer', name: 'Investment Group' },
    'admin@studio22.com': { role: 'admin', name: 'Admin User' }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (demoAccounts[email] && password === email) {
        const account = demoAccounts[email];
        const userData = { email, full_name: account.name, role: account.role };

        // Use AuthContext login to properly set state
        login(userData);

        // Set team session for team users
        if (account.role === 'team') {
          localStorage.setItem('studio22_team', JSON.stringify({
            id: 'team_001',
            team_name: account.name,
            contact_email: email,
            role: 'team_admin'
          }));
        }

        const redirects = {
          artist: '/artistdashboard',
          team: '/teamdashboard',
          client: '/clientdashboard',
          backer: '/backerdashboard',
          admin: '/Admin'
        };

        navigate(redirects[account.role] || '/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const newUser = {
        id: email,
        email,
        full_name: `${firstName} ${lastName}`,
        role
      };
      localStorage.removeItem('studio22_user');
      localStorage.setItem('studio22_user', JSON.stringify(newUser));
      sessionStorage.setItem('studio22_just_logged_in', 'true');

      const redirects = {
        artist: '/artistdashboard',
        team: '/teamdashboard',
        client: '/clientdashboard',
        backer: '/backerdashboard',
        admin: '/Admin'
      };

      window.location.href = redirects[role] || '/';
    } catch (err) {
      setError('Sign up error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="mb-8">
            <Link to={createPageUrl('Home')} className="inline-block hover:opacity-70">
              <span className="text-5xl font-black tracking-tighter text-black">22.</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create account' : 'Sign in'}
            </h1>
            <p className="text-gray-600">
              {isSignUp ? 'Join Studio22 Creative Network' : 'Sign in to your Studio22 account'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-5">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">First Name</label>
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Last Name</label>
                    <Input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Min 6 characters' : 'Enter your password'}
                disabled={loading}
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">I am a...</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={loading}
                >
                  <option value="artist">Artist (Creator)</option>
                  <option value="team">Team/Studio</option>
                  <option value="client">Client (Project Owner)</option>
                  <option value="backer">Backer (Investor)</option>
                </select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 font-medium py-3"
              disabled={loading}
            >
              {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create account' : 'Sign in')}
            </Button>

            {/* Google Button */}
            <button
              type="button"
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-md flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              onClick={() => {
                alert('Google OAuth with Clerk - Coming soon');
              }}
            >
              <GoogleIcon />
              <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-black font-medium hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          {!isSignUp && (
            <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-3">Demo Accounts (password = email):</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="bg-gray-50 px-3 py-2 rounded cursor-pointer hover:bg-gray-100" onClick={() => { setEmail('artist@artist.com'); setPassword('artist@artist.com'); }}>artist@artist.com</div>
              <div className="bg-gray-50 px-3 py-2 rounded cursor-pointer hover:bg-gray-100" onClick={() => { setEmail('team@team.com'); setPassword('team@team.com'); }}>team@team.com</div>
              <div className="bg-gray-50 px-3 py-2 rounded cursor-pointer hover:bg-gray-100" onClick={() => { setEmail('client@client.com'); setPassword('client@client.com'); }}>client@client.com</div>
              <div className="bg-gray-50 px-3 py-2 rounded cursor-pointer hover:bg-gray-100" onClick={() => { setEmail('backer@backer.com'); setPassword('backer@backer.com'); }}>backer@backer.com</div>
              <div className="bg-black text-white px-3 py-2 rounded col-span-2 cursor-pointer hover:bg-gray-800 flex items-center justify-between" onClick={() => { setEmail('admin@studio22.com'); setPassword('admin@studio22.com'); }}>
                <span>admin@studio22.com</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Admin</span>
              </div>
            </div>
          </div>
          )}

          <div className="mt-6">
            <Link to={createPageUrl('Home')} className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Visual */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-9xl font-black tracking-tighter text-white/20">22.</span>
            <p className="text-white/60 text-lg mt-4">Studio22 Creative Network</p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}