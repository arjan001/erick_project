import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Artist, Team, Backer, ProjectOwner } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { Copy, Check, Gift, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

export default function InviteCodeCard() {
  const { user } = useAuth();
  const { success } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) return;
      try {
        let profile = null;
        if (user.role === 'artist' || user.role === 'artist_admin') {
          const artists = await Artist.filter({ email: user.email });
          profile = artists?.[0];
        } else if (user.role === 'team' || user.role === 'team_admin') {
          const teams = await Team.filter({ contact_email: user.email });
          profile = teams?.[0];
        } else if (user.role === 'backer') {
          const backers = await Backer.filter({ contact_email: user.email });
          profile = backers?.[0];
        } else {
          const owners = await ProjectOwner.filter({ email: user.email });
          profile = owners?.[0];
        }

        if (profile?.invite_code) {
          setInviteCode(profile.invite_code);
        } else if (profile) {
          // Generate one if missing
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let code = 'S22-';
          for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
          setInviteCode(code);
          // Save it to the profile
          const entity = user.role === 'artist' || user.role === 'artist_admin' ? Artist
            : user.role === 'team' || user.role === 'team_admin' ? Team
            : user.role === 'backer' ? Backer
            : ProjectOwner;
          await entity.update(profile.id, { invite_code: code });
        }
      } catch (err) {
        console.error('Error fetching invite code:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    success('Copied', 'Invite code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLink = `${window.location.origin}/invite/${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    success('Copied', 'Referral link copied');
  };

  if (loading) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Your Invite Code</h3>
          <p className="text-xs text-gray-600">Share with friends to grow the network</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-indigo-200 font-mono font-bold text-indigo-700 text-sm tracking-wider">
          {inviteCode || 'Generating...'}
        </div>
        <button onClick={handleCopy} className="p-2 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

      <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
        <UserPlus className="w-3.5 h-3.5" />
        Copy Referral Link
      </button>
    </div>
  );
}