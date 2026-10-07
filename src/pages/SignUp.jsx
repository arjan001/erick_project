import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Artist, Team, Backer, ProjectOwner, Invite, Connection } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import MultiSelectAutocomplete from '@/components/MultiSelectAutocomplete';
import { ALL_FILM_ROLES } from '@/lib/filmRoles';
import skillsAndRoles from '@/lib/skillsAndRoles.json';

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
  backer: '/backerdashboard',
  admin: '/admin',
};

export default function SignUp() {
  const { login } = useAuth();
  const [formData, setFormData] = useState(() => {
    const roleParam = new URLSearchParams(window.location.search).get('role');
    return {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ['artist', 'client'].includes(roleParam) ? roleParam : 'artist',
      inviteCode: '',
      selectedRoles: [],
      selectedSkills: [],
    };
  });

  const ALL_SKILLS = Object.values(skillsAndRoles.film_roles_by_category || {}).flat();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCodeValid, setInviteCodeValid] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  // OTP verification step (Base44 registration sends a code to the user's email)
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignUp = () => {
    setError('');
    base44.auth.loginWithProvider('google', '/SignUp');
  };

  // Check for invite code in URL query params or from invite landing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('ref') || urlParams.get('code');
    if (code) {
      setFormData(prev => ({ ...prev, inviteCode: code }));
      validateInviteCode(code);
    }
  }, []);

  const validateInviteCode = async (code) => {
    if (!code) {
      setInviteCodeValid(null);
      return;
    }
    try {
      const invites = await Invite.filter({ code: code });
      const validInvite = invites?.find(i =>
        i.status === 'active' &&
        (i.max_uses === null || i.uses_count < i.max_uses)
      );
      setInviteCodeValid(!!validInvite);
    } catch (err) {
      console.error('Error validating invite code:', err);
      setInviteCodeValid(null);
    }
  };

  const handleInviteCodeChange = (e) => {
    const code = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, inviteCode: code }));
    if (code) {
      validateInviteCode(code);
    } else {
      setInviteCodeValid(null);
    }
  };

  // Step 1: register the account with Base44 (sends an OTP to the user's email)
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await base44.auth.register({
        email: formData.email,
        password: formData.password,
        referral_code: formData.inviteCode || null,
      });
      setOtpSent(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the OTP code, then log in and create the profile entity
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the verification code sent to your email');
      return;
    }
    setLoading(true);
    try {
      // Verify the email — this authenticates the user (token stored by the SDK)
      await base44.auth.verifyOtp({
        email: formData.email,
        otpCode: otpCode,
      });

      const me = await base44.auth.me();
      const fullName = `${formData.firstName} ${formData.lastName}`.trim() || formData.email.split('@')[0];
      const appUser = {
        id: me.id,
        email: me.email,
        full_name: fullName,
        username: formData.username || `${formData.firstName}${formData.lastName}`.toLowerCase(),
        role: formData.role,
        referred_by: formData.inviteCode || null,
      };

      // Create the role-specific profile record in the Base44 database
      const profileData = {
        email: formData.email,
        full_name: fullName,
        invite_code: formData.inviteCode || null,
        referred_by: formData.inviteCode || null,
      };
      try {
        if (formData.role === 'artist') {
          await Artist.create({ ...profileData, username: formData.username, role: 'artist', secondary_roles: formData.selectedRoles, skills: formData.selectedSkills });
        } else if (formData.role === 'team') {
          await Team.create({
            ...profileData,
            contact_email: formData.email,
            team_name: fullName,
            specialties: [],
          });
        } else if (formData.role === 'client') {
          await ProjectOwner.create({ ...profileData, company: fullName });
        } else if (formData.role === 'backer') {
          await Backer.create({
            ...profileData,
            contact_email: formData.email,
            organization_name: fullName,
            interests: [],
          });
        }
      } catch (profileErr) {
        console.error('Profile creation error:', profileErr);
        // Don't block the user — the auth account exists, profile can be retried
      }

      // Mark invite as used if valid and auto-connect users
      if (formData.inviteCode && inviteCodeValid) {
        try {
          const invites = await Invite.filter({ code: formData.inviteCode });
          const validInvite = invites?.[0];
          if (validInvite) {
            await Invite.update(validInvite.id, {
              used_by_email: formData.email,
              uses_count: (validInvite.uses_count || 0) + 1,
            });
            if (validInvite.creator_email) {
              try {
                await Connection.create({
                  requester_email: validInvite.creator_email,
                  requester_type: validInvite.creator_type || 'artist',
                  recipient_email: formData.email,
                  recipient_type: formData.role,
                  status: 'accepted',
                });
              } catch (connErr) {
                console.error('Error creating auto-connection:', connErr);
              }
            }
          }
        } catch (err) {
          console.error('Error processing invite:', err);
        }
      }

      // Persist the session locally and redirect
      await login(appUser);
      sessionStorage.setItem('ericrabar_just_logged_in', 'true');

      if (formData.inviteCode && inviteCodeValid) {
        setShowInviteModal(true);
        return;
      }
      window.location.href = createPageUrl(ROLE_REDIRECTS[formData.role]?.replace('/', '') || 'Home');
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      await base44.auth.resendOtp(formData.email);
    } catch (err) {
      setError(err.message || 'Could not resend the code. Please try again.');
    }
  };

  const handleInviteModalClose = () => {
    setShowInviteModal(false);
    window.location.href = createPageUrl(ROLE_REDIRECTS[formData.role]?.replace('/', '') || 'Home');
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

          {otpSent ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify your email</h1>
                <p className="text-gray-600">
                  We sent a verification code to <span className="font-semibold">{formData.email}</span>. Enter it below to activate your account.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Verification code</label>
                  <Input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.trim())}
                    placeholder="Enter code"
                    className="w-full tracking-widest"
                    disabled={loading}
                    autoFocus
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800 font-medium py-3"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify & continue'}
                </Button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="w-full text-sm text-gray-600 hover:text-black"
                  disabled={loading}
                >
                  Didn't get a code? Resend
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); }}
                  className="w-full text-sm text-gray-500 hover:text-black"
                >
                  Back to sign up
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
                <p className="text-gray-600">Join Eric Rabar Creative Network</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-5">
                {/* Google Sign Up Button */}
                <button
                  type="button"
                  className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-md flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  onClick={handleGoogleSignUp}
                >
                  <GoogleIcon />
                  <span>Sign up with Google</span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">First Name</label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Last Name</label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {formData.role === 'artist' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Username <span className="text-gray-500">(for profile sharing)</span></label>
                    <Input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                      placeholder="johndoe"
                      className="w-full"
                      disabled={loading}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Your profile will be accessible at ericrabar.com/username</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full"
                    disabled={loading}
                    required
                    d
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Confirm Password</label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="w-full"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">I am a...</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    disabled={loading}
                  >
                    <option value="artist">Actor</option>
                    <option value="client">Producer</option>
                  </select>
                </div>

                {formData.role === 'artist' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Select Your Roles <span className="text-gray-500">(multi-select)</span></label>
                      <MultiSelectAutocomplete
                        options={ALL_FILM_ROLES}
                        selected={formData.selectedRoles}
                        onChange={(selected) => setFormData({ ...formData, selectedRoles: selected })}
                        placeholder="Search and select your roles..."
                        searchable={true}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Select Your Skills <span className="text-gray-500">(multi-select)</span></label>
                      <MultiSelectAutocomplete
                        options={ALL_SKILLS}
                        selected={formData.selectedSkills}
                        onChange={(selected) => setFormData({ ...formData, selectedSkills: selected })}
                        placeholder="Search and select your skills..."
                        searchable={true}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Invite Code (optional)</label>
                  <Input
                    type="text"
                    value={formData.inviteCode}
                    onChange={handleInviteCodeChange}
                    placeholder="e.g., ER-ABC123"
                    className="w-full uppercase"
                    disabled={loading}
                    maxLength={10}
                  />
                  {inviteCodeValid === true && (
                    <p className="text-xs text-green-600 mt-1">✓ Valid invite code - you'll get a free Pro subscription!</p>
                  )}
                  {inviteCodeValid === false && (
                    <p className="text-xs text-red-600 mt-1">✗ Invalid invite code</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800 font-medium py-3"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600">Already have an account? </span>
                <Link to={createPageUrl('SignIn')} className="text-sm text-black font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Image/Visual */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-9xl font-black tracking-tighter text-white/20">22.</span>
            <p className="text-white/60 text-lg mt-4">Eric Rabar Creative Network</p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Invite Acceptance Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Code Accepted!</h2>
            <p className="text-gray-600 mb-6">Your Pro plan begins now. Welcome to Eric Rabar!</p>
            <button
              onClick={handleInviteModalClose}
              className="w-full bg-black text-white hover:bg-gray-800 font-medium py-3 rounded-xl transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
