import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Mail, Lock, Newspaper, ShieldCheck, Target } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Artist, Team, Backer, ProjectOwner, Subscription, SubscriptionPackage } from '@/lib/supabaseEntities';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
    <path d="M17.05 12.04c.03 3.12 2.74 4.16 2.77 4.18-.02.08-.43 1.49-1.43 2.94-.86 1.25-1.76 2.49-3.18 2.52-1.39.03-1.84-.82-3.43-.82-1.59 0-2.09.79-3.41.85-1.37.05-2.41-1.36-3.28-2.61-1.79-2.58-3.16-7.29-1.32-10.47.91-1.58 2.55-2.58 4.31-2.61 1.34-.03 2.6.9 3.42.9.82 0 2.36-1.12 3.98-.95.67.03 2.58.27 3.8 2.06-.1.06-2.27 1.33-2.24 3.96zM14.4 5.45c.73-.88 1.22-2.11 1.09-3.33-1.05.04-2.32.7-3.07 1.58-.67.78-1.26 2.03-1.1 3.23 1.17.09 2.36-.6 3.08-1.48z" />
  </svg>
);

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
  'admin@ericrabar.com': { role: 'admin', name: 'Admin User' },
};

const DEMO_BUTTONS = [
  { email: 'admin@ericrabar.com', label: 'Admin', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AD&backgroundColor=4f46e5' },
  { email: 'client@client.com', label: 'Client', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CL&backgroundColor=0a0b2e' },
  { email: 'artist@artist.com', label: 'Artist', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AR&backgroundColor=00a37e' },
];

const talentBenefits = [
  { icon: Newspaper, text: 'Thousands of fresh jobs every week.' },
  { icon: ShieldCheck, text: 'Jobs vetted to meet our community guidelines.' },
  { icon: Target, text: 'Visibility in the #1 Visited Database for Talent.' },
];

const trustedLogos = ['Disney', 'YouTube', 'Hulu', 'Netflix', 'HBO'];

export default function SignIn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [userType, setUserType] = useState(searchParams.get('mode') === 'employer' ? 'employer' : 'talent');
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [modeOverride, setModeOverride] = useState(null);

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setMode('signup');
    if (searchParams.get('mode') === 'employer') setUserType('employer');
  }, [searchParams]);

  // Password recovery listener — detect a reset token in the URL (Base44
  // password-reset emails link back here with a token to complete the flow).
  useEffect(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const isRecovery = hash.includes('type=recovery') || urlParams.get('type') === 'recovery';
    const hasToken = hash.includes('token') || urlParams.get('token') || hash.includes('access_token');
    if (isRecovery || hasToken) {
      setModeOverride('update_password');
    }
  }, []);

  const effectiveMode = modeOverride || mode;

  const handleGoogleLogin = () => {
    setError('');
    base44.auth.loginWithProvider('google', '/');
  };

  const handleAppleLogin = () => {
    setError('');
    base44.auth.loginWithProvider('apple', '/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Demo accounts (localStorage only — no Base44 account needed)
      if (DEMO_ACCOUNTS[email] && password === email) {
        const acc = DEMO_ACCOUNTS[email];
        login({ id: email, email, full_name: acc.name, role: acc.role });
        if (acc.role === 'team') {
          localStorage.setItem('ericrabar_team', JSON.stringify({ id: 'team_001', team_name: acc.name, contact_email: email, role: 'team_admin' }));
        }
        const redirectDest = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectDest || ROLE_REDIRECTS[acc.role] || '/';
        return;
      }

      // Real Base44 email/password login
      const { user } = await base44.auth.loginViaEmailPassword(email, password);

      // Resolve the app role from the linked entity profile
      let userRole = 'artist';
      let fullName = user.full_name || user.email?.split('@')[0] || 'User';
      try {
        const artists = await Artist.filter({ email: user.email });
        if (artists && artists.length > 0) {
          userRole = 'artist';
        } else {
          const teams = await Team.filter({ contact_email: user.email });
          if (teams && teams.length > 0) {
            userRole = 'team';
            if (teams[0].team_name) fullName = teams[0].team_name;
          } else {
            const owners = await ProjectOwner.filter({ email: user.email });
            if (owners && owners.length > 0) {
              userRole = 'client';
              if (owners[0].is_suspended) {
                base44.auth.logout();
                setError('This account has been suspended. Please contact support for assistance.');
                setLoading(false);
                return;
              }
            } else {
              const backers = await Backer.filter({ contact_email: user.email });
              if (backers && backers.length > 0) userRole = 'backer';
            }
          }
        }
      } catch (dbError) {
        console.error('Error resolving user role:', dbError);
      }

      if (user.role === 'admin') userRole = 'admin';

      login({ id: user.id, email: user.email, full_name: fullName, role: userRole });
      const redirectDest = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectDest || ROLE_REDIRECTS[userRole] || '/';
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    // The full sign-up flow (with email verification) lives on the dedicated
    // SignUp page — send the user there with their chosen role preselected.
    const role = userType === 'employer' ? 'client' : 'artist';
    navigate(`/SignUp${role === 'client' ? '?role=client' : ''}`);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
      setMessage('Password reset email sent! Check your inbox.');
      setTimeout(() => { setShowForgotPassword(false); setMessage(''); }, 6000);
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      // Base44 delivers a reset token via the email link; parse it from the URL.
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const resetToken = urlParams.get('token') || hashParams.get('token');
      if (resetToken) {
        await base44.auth.resetPassword({ resetToken, newPassword });
      } else {
        // No token — fall back to changing the password for the current session
        const me = await base44.auth.me();
        await base44.auth.changePassword({ userId: me.id, currentPassword: password, newPassword });
      }
      setMessage('Password updated successfully! You can now sign in.');
      setModeOverride(null);
      setMode('login');
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const isEmployer = userType === 'employer';

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Demo credentials banner */}
      <div className="fixed left-1/2 top-4 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/90 px-3 py-2 shadow-lg">
        <span className="hidden text-xs text-white/60 sm:inline">Quick login:</span>
        {DEMO_BUTTONS.map((d) => (
          <button
            key={d.email}
            onClick={() => {
              setEmail(d.email);
              setPassword(d.email);
              setUserType(d.email.includes('client') ? 'employer' : 'talent');
              setTimeout(() => handleLogin({ preventDefault: () => {} }), 100);
            }}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
          >
            <img src={d.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
            {d.label}
          </button>
        ))}
      </div>
      {/* LEFT PANEL */}
      <div className={`flex flex-1 flex-col justify-center px-8 py-12 lg:px-16 ${isEmployer ? 'bg-black' : 'bg-[#F7F5F0]'}`}>
        {isEmployer ? (
          /* Employer: black panel with testimonial */
          <div className="relative max-w-lg">
            <div className="mb-10">
              <p className="text-2xl font-bold leading-snug text-white md:text-3xl">
                "Each project is different, Backstage helps us cast with that flexibility in mind."
              </p>
            </div>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=80&h=80&fit=crop"
                alt="Dan Cangelosi"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-white">Dan Cangelosi</p>
                <p className="text-xs text-white/60">Senior Creative Producer at Jerry</p>
              </div>
            </div>
            <div className="mt-12">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                Trusted by these leading brands
              </p>
              <div className="mt-4 flex flex-wrap gap-6">
                {['NETFLIX', 'amazon studios', 'Disney', 'HBO', 'AMC'].map((l) => (
                  <span key={l} className="text-lg font-bold text-white/50">{l}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Talent: beige panel with value props */
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold leading-tight text-black md:text-4xl">
              Join for free.
            </h2>
            <h2 className="text-3xl font-bold leading-tight text-black md:text-4xl">
              Upgrade anytime.
            </h2>

            <div className="mt-12 space-y-6">
              {talentBenefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/[0.06]">
                      <Icon className="h-5 w-5 text-black/70" />
                    </div>
                    <p className="pt-2 text-sm text-black/70">{b.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-14">
              <p className="text-xs font-bold uppercase tracking-wider text-black/50">
                Trusted by top studios and brands
              </p>
              <div className="mt-4 flex flex-wrap gap-6">
                {trustedLogos.map((l) => (
                  <span key={l} className="text-lg font-bold text-black/30">{l}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL — Auth form */}
      <div className="flex flex-1 items-center justify-center bg-white px-8 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link to="/" className="mb-8 inline-block">
            <span className="text-xl font-extrabold uppercase tracking-tight text-black">Eric Rabar</span>
          </Link>

          {/* Mode toggle (I'm Talent / I'm Hiring) */}
          <div className="mb-8 inline-flex items-center rounded-full bg-black/[0.06] p-1">
            <button
              onClick={() => setUserType('talent')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                !isEmployer ? 'bg-black text-white' : 'text-black/70 hover:text-black'
              }`}
            >
              I'm Talent
            </button>
            <button
              onClick={() => setUserType('employer')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                isEmployer ? 'bg-black text-white' : 'text-black/70 hover:text-black'
              }`}
            >
              I'm Hiring
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          {/* Update password mode */}
          {effectiveMode === 'update_password' ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-black">Set new password</h1>
                <p className="mt-1 text-sm text-black/50">Choose a new password for your account</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-black/70">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-black/70">Confirm password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#4F46E5] py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA] disabled:opacity-50">
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          ) : showForgotPassword ? (
            /* Forgot password */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-black">Reset password</h1>
                <p className="mt-1 text-sm text-black/50">We'll send you a reset link</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-black/70">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#4F46E5] py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA] disabled:opacity-50">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <button type="button" onClick={() => { setShowForgotPassword(false); setError(''); }} className="text-sm text-black/50 hover:text-black">
                Back to sign in
              </button>
            </form>
          ) : (
            /* Main auth form */
            <>
              {/* Heading */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-black">
                  {isEmployer
                    ? 'Find the perfect creative talent for your project.'
                    : mode === 'signup'
                    ? 'Your career starts here'
                    : 'Your career starts here'}
                </h1>
              </div>

              {/* Google + Apple */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={handleAppleLogin}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  <AppleIcon />
                  Continue with Apple
                </button>
              </div>

              {/* Separator */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-black/40">or</span>
                </div>
              </div>

              {/* Email form */}
              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {isEmployer && (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-black/70">Email Address</label>
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Email"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-10 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => { setShowForgotPassword(true); setError(''); }} className="text-xs text-black/50 hover:text-black">
                      Forgot password?
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#8a85f4] py-2.5 text-sm font-semibold text-white hover:bg-[#7a75e8] disabled:opacity-50">
                    {loading ? 'Signing in...' : 'Submit'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10" />
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#8a85f4] py-2.5 text-sm font-semibold text-white hover:bg-[#7a75e8] disabled:opacity-50">
                    {loading ? 'Creating account...' : 'Submit'}
                  </button>
                </form>
              )}

              {/* Terms for employer */}
              {isEmployer && (
                <p className="mt-4 text-center text-xs text-black/40">
                  By continuing, you agree that you have read and agree to the Eric Rabar{' '}
                  <a href="#" className="text-[#4B4ACF] hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-[#4B4ACF] hover:underline">Privacy Policy</a>, and that you are currently at least 18 years old.
                </p>
              )}

              {/* Switch talent/employer link */}
              <p className="mt-6 text-center text-sm">
                {isEmployer ? (
                  <button onClick={() => setUserType('talent')} className="font-medium text-[#4B4ACF] hover:underline">
                    I want to register as talent.
                  </button>
                ) : (
                  <button onClick={() => setUserType('employer')} className="font-medium text-[#4B4ACF] hover:underline">
                    I want to register as an employer.
                  </button>
                )}
              </p>

              {/* Login / signup toggle */}
              <p className="mt-2 text-center text-sm text-black/50">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button onClick={() => { setMode('signup'); setError(''); }} className="font-semibold text-black hover:underline">
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button onClick={() => { setMode('login'); setError(''); }} className="font-semibold text-black hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Floating chat bubble */}
      <button
        aria-label="Chat"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#4F46E5] text-white shadow-lg shadow-[#4F46E5]/30 hover:scale-105"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
}
