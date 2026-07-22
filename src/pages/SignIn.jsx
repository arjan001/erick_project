import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Mail, Lock, Gift, Sparkles, X, Key } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Artist, Team, Backer, ProjectOwner, Subscription, SubscriptionPackage } from '@/lib/supabaseEntities';

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
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'update_password'
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' | 'password'
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [signupStep, setSignupStep] = useState(1); // 1: name, 2: email, 3: password, 4: role, 5: success
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('artist');
  const [userType, setUserType] = useState('looking_for_job'); // 'looking_for_job', 'looking_to_hire', 'looking_to_back', 'team'
  const [teamOrgName, setTeamOrgName] = useState('');
  const [teamContactName, setTeamContactName] = useState('');
  const [teamPhone, setTeamPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [modalInviteCode, setModalInviteCode] = useState('');
  const [claimingInvite, setClaimingInvite] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Capture invite/referral code from URL (?ref=CODE)
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setInviteCode(ref);
    if (searchParams.get('mode') === 'signup') setMode('signup');
  }, [searchParams]);

  // If the user arrived via a "reset password" email link, Supabase fires a
  // PASSWORD_RECOVERY event — switch to the "set a new password" form.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update_password');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const { error: supaError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/SignIn?mode=reset`,
    });
    if (supaError) throw supaError;
    setMessage('Password reset email sent! Check your inbox (including spam folder).');
    setTimeout(() => {
      setShowForgotPassword(false);
      setMessage('');
    }, 4000);
  } catch (err) {
    console.error('Password reset error:', err);
    setError(err.message || 'Failed to send reset email. Please check your email address.');
  } finally {
    setLoading(false);
  }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: supaError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/SignIn`,
        },
      });
      if (supaError) throw supaError;
      setOtpSent(true);
      setMessage('Magic link sent! Check your email to sign in.');
    } catch (err) {
      console.error('OTP error:', err);
      setError(err.message || 'Failed to send magic link. Please check your email address.');
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
      const { error: supaError } = await supabase.auth.updateUser({ password: newPassword });
      if (supaError) throw supaError;
      setMessage('Password updated! You can now sign in with your new password.');
      setMode('login');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/SignIn`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

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
        window.location.href = ROLE_REDIRECTS[acc.role] || '/';
        return;
      }
      // 2. Supabase auth
      const { data, error: supaError } = await supabase.auth.signInWithPassword({ email, password });
      if (supaError) throw supaError;
      const userRole = data.user?.user_metadata?.role || 'artist';
      const fullName = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'User';
      
      // Check account status for clients/project_owners
      if (userRole === 'client' || userRole === 'project_owner') {
        try {
          const owners = await ProjectOwner.filter({ email: data.user.email });
          if (owners.length > 0) {
            const owner = owners[0];
            if (owner.is_suspended) {
              await supabase.auth.signOut();
              setError('This account has been suspended. Please contact support for assistance.');
              setLoading(false);
              return;
            }
            if (owner.deletion_requested_at) {
              await supabase.auth.signOut();
              setError('This account has been requested for deletion and no longer exists. Please contact support if this is an error.');
              setLoading(false);
              return;
            }
          }
        } catch (dbError) {
          console.error('Error checking account status:', dbError);
          // Continue with login even if status check fails
        }
      }
      
      const userData = { id: data.user.id, email: data.user.email, full_name: fullName, role: userRole };
      login(userData);
      window.location.href = ROLE_REDIRECTS[userRole] || '/';
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (signupStep === 1) {
      if (!firstName || !lastName) { setError('Please fill in your name'); return; }
      setSignupStep(2);
      return;
    }
    
    if (signupStep === 2) {
      if (!email || !email.includes('@')) { setError('Please enter a valid email'); return; }
      setSignupStep(3);
      return;
    }
    
    if (signupStep === 3) {
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
      setSignupStep(4);
      return;
    }
    
    if (signupStep === 4) {
      setLoading(true);
      try {
        // Map userType to role
        let finalRole = 'artist';
        if (userType === 'looking_for_job') {
          finalRole = 'artist';
        } else if (userType === 'looking_to_hire') {
          finalRole = 'client';
        } else if (userType === 'looking_to_back') {
          finalRole = 'backer';
        } else if (userType === 'team') {
          finalRole = 'team';
        }
        
        const fullName = `${firstName} ${lastName}`.trim();
        const { data, error: supaError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            emailConfirm: false, // Disable email verification
            data: { 
              full_name: fullName, 
              role: finalRole, 
              referred_by: inviteCode || undefined,
              ...(finalRole === 'team' ? { team_name: teamOrgName || fullName } : {}) 
            } 
          },
        });
        if (supaError) throw supaError;
        
        // Create role-specific record in database
        const userData = {
          email: email,
          full_name: fullName,
          invite_code: inviteCode || null,
          referred_by: inviteCode || null
        };

        switch (finalRole) {
          case 'artist':
            await Artist.create({
              ...userData,
              role: 'artist'
            });
            break;
          case 'team':
            await Team.create({
              ...userData,
              contact_email: email,
              team_name: teamOrgName || fullName,
              specialties: []
            });
            break;
          case 'client':
            await ProjectOwner.create({
              ...userData,
              company: fullName
            });
            break;
          case 'backer':
            await Backer.create({
              ...userData,
              contact_email: email,
              organization_name: fullName,
              interests: []
            });
            break;
        }

        if (data.user && !data.session) {
          // Auto-login since email verification is disabled
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (!signInError && signInData.user) {
            const userRole = signInData.user?.user_metadata?.role || finalRole;
            const fullName = signInData.user?.user_metadata?.full_name || fullName;
            const userData = { id: signInData.user.id, email: signInData.user.email, full_name: fullName, role: userRole };
            login(userData);
            navigate(ROLE_REDIRECTS[userRole] || '/');
            return;
          }
          setSignupStep(5);
        } else {
          setSignupStep(5);
        }
      } catch (err) {
        setError(err.message || 'Sign up failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const claimInvite = async () => {
    if (!modalInviteCode.trim()) { navigate(ROLE_REDIRECTS[role] || '/'); return; }
    setClaimingInvite(true);
    try {
      // Save referred_by to Supabase user metadata
      await supabase.auth.updateUser({ data: { referred_by: modalInviteCode.trim() } });
      // Update profile entity
      const entity = role === 'artist' ? Artist : role === 'team' ? Team : role === 'backer' ? Backer : ProjectOwner;
      const filterKey = (role === 'artist' || role === 'client') ? { email } : { contact_email: email };
      const profiles = await entity.filter(filterKey);
      if (profiles?.[0]) await entity.update(profiles[0].id, { referred_by: modalInviteCode.trim() });
      // Grant Pro subscription
      const pkgs = await SubscriptionPackage.filter({ name: 'Pro' });
      if (pkgs?.[0]) {
        const existing = await Subscription.filter({ user_email: email, status: 'active' });
        if (!existing?.length) {
          await Subscription.create({ user_email: email, package_id: pkgs[0].id, package_name: pkgs[0].name, status: 'active', started_at: new Date().toISOString() });
        }
      }
      navigate(ROLE_REDIRECTS[role] || '/');
    } catch (err) {
      setError(err.message || 'Failed to apply invite code');
      setClaimingInvite(false);
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
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : mode === 'update_password' ? 'Set new password' : 'Reset password'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login' ? 'Sign in to Studio22' : mode === 'signup' ? 'Join the creative network' : mode === 'update_password' ? 'Choose a new password for your account' : 'We\'ll send you a reset link'}
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
            <div className="space-y-4">
              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-md flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                <span>Sign in with Google</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#fafafa] text-gray-500">Or continue with email</span>
                </div>
              </div>

              {/* Login Method Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('otp'); setOtpSent(false); setMessage(''); setError(''); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'otp' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Key className="w-4 h-4 inline mr-1" />
                  OTP Login
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setOtpSent(false); setMessage(''); setError(''); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'password' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Lock className="w-4 h-4 inline mr-1" />
                  Password
                </button>
              </div>

              {/* OTP Login Form */}
              {loginMethod === 'otp' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="you@example.com" disabled={loading || otpSent}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
                    </div>
                  </div>
                  {otpSent ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">OTP sent! Check your email to sign in. No password needed.</p>
                    </div>
                  ) : (
                    <button type="submit" disabled={loading}
                      className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  )}
                </form>
              )}

              {/* Password Login Form */}
              {loginMethod === 'password' && (
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
                    <button type="button" onClick={() => { setShowForgotPassword(true); setError(''); setMessage(''); }}
                      className="text-xs text-gray-500 hover:text-black transition-colors">Forgot password?</button>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Sign Up Form - Step by Step Wizard */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Step 1: Name */}
              {signupStep === 1 && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">What's your name?</h2>
                    <p className="text-sm text-gray-500 mt-1">Let us know how to address you</p>
                  </div>
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
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
                    Continue
                  </button>
                </>
              )}

              {/* Step 2: Email */}
              {signupStep === 2 && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">What's your email?</h2>
                    <p className="text-sm text-gray-500 mt-1">We'll use this to contact you</p>
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
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
                    Continue
                  </button>
                </>
              )}

              {/* Step 3: Password */}
              {signupStep === 3 && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Create a password</h2>
                    <p className="text-sm text-gray-500 mt-1">Min 6 characters</p>
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
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
                    Continue
                  </button>
                </>
              )}

              {/* Step 4: Role Selection */}
              {signupStep === 4 && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Who are you?</h2>
                    <p className="text-sm text-gray-500 mt-1">Select your role to get started</p>
                  </div>
                  <div className="space-y-3">
                    <button type="button" onClick={() => setUserType('looking_for_job')}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-all ${userType === 'looking_for_job' ? 'border-black bg-black/5' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="font-semibold text-gray-900">Artist looking for a job</div>
                      <div className="text-xs text-gray-500 mt-1">Filmmakers, editors, designers, and creative professionals</div>
                    </button>
                    <button type="button" onClick={() => setUserType('looking_to_hire')}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-all ${userType === 'looking_to_hire' ? 'border-black bg-black/5' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="font-semibold text-gray-900">Client looking to hire</div>
                      <div className="text-xs text-gray-500 mt-1">Brands, agencies, and project commissioners</div>
                    </button>
                    <button type="button" onClick={() => setUserType('looking_to_back')}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-all ${userType === 'looking_to_back' ? 'border-black bg-black/5' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="font-semibold text-gray-900">Backer looking to back</div>
                      <div className="text-xs text-gray-500 mt-1">Investors and funding partners</div>
                    </button>
                    <button type="button" onClick={() => setUserType('team')}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-all ${userType === 'team' ? 'border-black bg-black/5' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="font-semibold text-gray-900">Team / Studio</div>
                      <div className="text-xs text-gray-500 mt-1">Production companies and creative studios</div>
                    </button>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>
                </>
              )}

              {/* Step 5: Success */}
              {signupStep === 5 && (
                <>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Account created!</h2>
                    <p className="text-sm text-gray-500 mb-6">Your account is ready. You can now sign in.</p>
                    <button type="button" onClick={() => { setMode('login'); setSignupStep(1); setError(''); setMessage(''); }}
                      className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all">
                      Go to sign in
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Update Password Form (after clicking reset link in email) */}
          {mode === 'update_password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                    placeholder="Min 6 characters" disabled={loading}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm new password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required
                    placeholder="Repeat password" disabled={loading}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}

          {/* Toggle */}
          {mode !== 'update_password' && (
            <p className="mt-5 text-center text-sm text-gray-500">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setSignupStep(1); setError(''); setMessage(''); }}
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button onClick={() => { setShowForgotPassword(false); setError(''); setMessage(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">Forgot Password</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your email address and we'll send you a link to reset your password.</p>
            </div>
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
            </form>
            <button onClick={() => { setShowForgotPassword(false); setError(''); setMessage(''); }}
              className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Back to sign in
            </button>
          </div>
        </div>
      )}

      {/* Post-registration Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button onClick={() => navigate(ROLE_REDIRECTS[role] || '/')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Have an invite code?</h2>
              <p className="text-sm text-gray-500 mt-1">Unlock the <span className="font-semibold text-yellow-600">Pro Beta Release</span> plan at no cost — more messages, more projects, priority access.</p>
            </div>
            <input type="text" value={modalInviteCode} onChange={e => setModalInviteCode(e.target.value)} placeholder="Enter your invite code"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500 transition-all bg-white mb-4" />
            <button onClick={claimInvite} disabled={claimingInvite}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg text-sm font-semibold hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 transition-all mb-2">
              {claimingInvite ? 'Activating Pro...' : 'Claim Free Pro Access'}
            </button>
            <button onClick={() => navigate(ROLE_REDIRECTS[role] || '/')}
              className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Visual Side — hidden on mobile */}
      <div className="hidden lg:flex lg:w-2/5 items-center justify-center relative overflow-hidden bg-gradient-to-br from-black via-[#2a2a2a] to-[#B8860B]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full border border-yellow-500/10" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="text-center relative z-10 flex flex-col items-center">
          <span className="text-[180px] leading-none font-black tracking-tighter bg-gradient-to-br from-white via-gray-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl">
            22.
          </span>
          <p className="text-white/50 text-sm mt-4 uppercase tracking-widest">Studio22 Creative Network</p>
        </div>
      </div>
    </div>
  );
}