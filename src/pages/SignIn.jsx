import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

const ROLE_REDIRECTS = {
  artist: '/artistdashboard',
  team: '/teamdashboard',
  client: '/clientdashboard',
  project_owner: '/clientdashboard',
  backer: '/backerdashboard',
  admin: '/Admin',
};

const DEMO_ACCOUNTS = {
  'artist@artist.com': { role: 'artist', name: 'Alex Chen' },
  'team@team.com': { role: 'team', name: 'Studio Team' },
  'client@client.com': { role: 'client', name: 'Client User' },
  'backer@backer.com': { role: 'backer', name: 'Investment Group' },
  'admin@studio22.com': { role: 'admin', name: 'Admin User' },
};

export default function SignIn() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('artist');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Try demo accounts first
      if (DEMO_ACCOUNTS[email] && password === email) {
        const acc = DEMO_ACCOUNTS[email];
        const userData = { id: email, email, full_name: acc.name, role: acc.role };
        login(userData);
        if (acc.role === 'team') {
          localStorage.setItem('studio22_team', JSON.stringify({ id: 'team_001', team_name: acc.name, contact_email: email, role: 'team_admin' }));
        }
        navigate(ROLE_REDIRECTS[acc.role] || '/');
        return;
      }
      // 2. Supabase auth
      const { data, error: supaError } = await supabase.auth.signInWithPassword({ email, password });
      if (supaError) throw supaError;
      const userRole = data.user?.user_metadata?.role || 'artist';
      const fullName = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'User';
      const userData = { id: data.user.id, email: data.user.email, full_name: fullName, role: userRole };
      login(userData);
      navigate(ROLE_REDIRECTS[userRole] || '/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const { data, error: supaError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      });
      if (supaError) throw supaError;
      if (data.user && !data.session) {
        setMessage('Check your email to confirm your account, then sign in.');
        setMode('login');
      } else {
        navigate(ROLE_REDIRECTS[role] || '/');
      }
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: supaError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/SignIn`,
      });
      if (supaError) throw supaError;
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col lg:flex-row">
      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 lg:py-0">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8 hover:opacity-70 transition-opacity">
            <span className="text-4xl font-black tracking-tighter text-black">22.</span>
          </Link>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login' ? 'Sign in to Studio22' : mode === 'signup' ? 'Join the creative network' : 'We\'ll send you a reset link'}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@example.com" disabled={loading}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="Your password" disabled={loading}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
                  className="text-xs text-gray-500 hover:text-black transition-colors">Forgot password?</button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button type="button" disabled
                onClick={() => setMessage('Google sign-in is coming soon.')}
                title="Google sign-in coming soon"
                className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.41 3.62v3h3.9c2.28-2.1 3.53-5.2 3.53-8.65z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.9-3c-1.08.73-2.46 1.16-4.03 1.16-3.1 0-5.73-2.09-6.67-4.9H1.3v3.09C3.27 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.33 14.36c-.24-.73-.38-1.5-.38-2.36s.14-1.63.38-2.36V6.55H1.3A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.3 5.45l4.03-3.09z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.18 15.24 0 12 0 7.31 0 3.27 2.7 1.3 6.55l4.03 3.09c.94-2.81 3.57-4.89 6.67-4.89z" />
                </svg>
                Continue with Google
                <span className="text-[10px] text-gray-400 font-normal">(soon)</span>
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">First name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
                    placeholder="John" disabled={loading}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Last name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required
                    placeholder="Doe" disabled={loading}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@example.com" disabled={loading}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="Min 6 characters" disabled={loading}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">I am a...</label>
                <select value={role} onChange={e => setRole(e.target.value)} disabled={loading}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white">
                  <option value="artist">Artist / Creator</option>
                  <option value="team">Team / Studio</option>
                  <option value="client">Client / Project Owner</option>
                  <option value="backer">Backer / Investor</option>
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@example.com" disabled={loading}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <button type="button" onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="w-full text-sm text-gray-500 hover:text-black transition-colors">← Back to sign in</button>
            </form>
          )}

          {/* Toggle */}
          {mode !== 'reset' && (
            <p className="mt-5 text-center text-sm text-gray-500">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}
                className="text-black font-semibold hover:underline">
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          )}

          {/* Demo Accounts */}
          {mode === 'login' && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Demo accounts (password = email)</p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(DEMO_ACCOUNTS).map(([e, acc]) => (
                  <button key={e} type="button"
                    onClick={() => { setEmail(e); setPassword(e); }}
                    className={`text-left px-3 py-2 rounded-lg text-xs transition-colors ${acc.role === 'admin' ? 'bg-black text-white col-span-2' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                    <span className="font-medium">{acc.name}</span>
                    <span className={`ml-1 ${acc.role === 'admin' ? 'text-gray-300' : 'text-gray-400'}`}>({acc.role})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">← Back to home</Link>
          </div>
        </div>
      </div>

      {/* Visual Side — hidden on mobile */}
      <div className="hidden lg:flex lg:w-2/5 bg-black items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-white" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full border border-white" />
        </div>
        <div className="text-center relative z-10 flex flex-col items-center">
          <img
            src="https://media.base44.com/images/public/6968a46f6ea94ba83cd1497c/5149728c8_image.png"
            alt="Studio22"
            className="w-56 h-56 object-contain drop-shadow-2xl"
          />
          <p className="text-white/40 text-sm mt-6 uppercase tracking-widest">Studio22 Creative Network</p>
        </div>
      </div>
    </div>
  );
}