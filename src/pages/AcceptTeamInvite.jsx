import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

// Invited team members land here from the invite email. Setting a password
// here creates their own login, tagged with the exact team_id they were
// invited to — so they always land in that team's workspace, never a blank
// one of their own and never mixed up with another team.
export default function AcceptTeamInvite() {
  const urlParams = new URLSearchParams(window.location.search);
  const inviteId = urlParams.get('invite');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInvite = async () => {
      if (!inviteId) { setLoading(false); return; }
      try {
        const rows = await base44.entities.Invite.filter({ id: inviteId });
        setInvite(rows?.[0] || null);
      } catch (err) {
        console.error('Error loading invite:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInvite();
  }, [inviteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setSubmitting(true);
    try {
      const { data, error: supaError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: { data: { full_name: invite.member_name, role: 'team', team_id: invite.team_id } },
      });
      if (supaError) throw supaError;

      await base44.entities.Invite.update(invite.id, { status: 'accepted' });

      if (data.session) {
        login({ id: data.user.id, email: data.user.email, full_name: invite.member_name, role: 'team', team_id: invite.team_id });
        navigate('/teamdashboard');
      } else {
        navigate('/SignIn');
      }
    } catch (err) {
      setError(err.message || 'Failed to set up your account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!invite || invite.status !== 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
        <div className="max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invite not found</h1>
          <p className="text-sm text-gray-500 mb-6">This invite link is invalid or has already been used.</p>
          <Link to="/SignIn" className="text-black font-semibold hover:underline text-sm">Go to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-block mb-8 hover:opacity-70 transition-opacity">
          <span className="text-4xl font-black tracking-tighter text-black">22.</span>
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">Join {invite.team_name}</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Set a password to activate your account as <span className="font-medium text-gray-700">{invite.member_role}</span>.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Name</label>
            <input type="text" value={invite.member_name} disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={invite.email} disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Create password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Min 6 characters" disabled={submitting}
                className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm password</label>
            <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
              placeholder="Repeat password" disabled={submitting}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
            {submitting ? 'Setting up...' : 'Activate account'}
          </button>
        </form>
      </div>
    </div>
  );
}