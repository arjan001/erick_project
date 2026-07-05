import React, { useState, useEffect } from 'react';
import { Artist, Team, Backer, ProjectOwner, Invite } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { Copy, Check, Gift, UserPlus, Share2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

export default function InviteCodeCard() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) return;
      try {
        let profile = null;
        let entity = null;
        
        if (user.role === 'artist' || user.role === 'artist_admin') {
          const artists = await Artist.filter({ email: user.email });
          profile = artists?.[0];
          entity = Artist;
        } else if (user.role === 'team' || user.role === 'team_admin') {
          const teams = await Team.filter({ contact_email: user.email });
          profile = teams?.[0];
          entity = Team;
        } else if (user.role === 'backer') {
          const backers = await Backer.filter({ contact_email: user.email });
          profile = backers?.[0];
          entity = Backer;
        } else {
          const owners = await ProjectOwner.filter({ email: user.email });
          profile = owners?.[0];
          entity = ProjectOwner;
        }

        if (profile?.invite_code) {
          setInviteCode(profile.invite_code);
        } else if (profile && entity) {
          // Generate unique invite code
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let code = 'S22-';
          for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
          
          // Check if code already exists
          let isUnique = false;
          let attempts = 0;
          while (!isUnique && attempts < 10) {
            const existing = await Invite.filter({ code });
            if (!existing || existing.length === 0) {
              isUnique = true;
            } else {
              code = 'S22-';
              for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
              attempts++;
            }
          }

          setInviteCode(code);
          
          // Save to profile
          await entity.update(profile.id, { invite_code: code });
          
          // Also save to invites table for tracking
          try {
            await Invite.create({
              code: code,
              creator_email: user.email,
              creator_type: user.role,
              uses_count: 0,
              max_uses: 100,
              status: 'active'
            });
          } catch (inviteErr) {
            console.error('Error creating invite record:', inviteErr);
            // Don't fail if invite table doesn't exist yet
          }
          
          success('Invite Code Generated', 'Your unique invite code has been created');
        }
      } catch (err) {
        console.error('Error fetching invite code:', err);
        toastError('Error', 'Failed to load invite code');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const referralLink = `${window.location.origin}/invite/${inviteCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    success('Copied', 'Invite code copied to clipboard');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    success('Copied', 'Referral link copied');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) return null;

  return (
    <div className="rounded-2xl border border-gray-100 p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Invite Friends</h3>
            <p className="text-sm text-gray-500">Share your code and grow the network</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Your Invite Code</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono font-bold text-gray-900 text-sm tracking-wider border border-gray-100">
              {inviteCode || 'Generating...'}
            </div>
            <button onClick={handleCopyCode} className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {copiedCode ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Referral Link</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 border border-gray-100 truncate">
              {referralLink}
            </div>
            <button onClick={handleCopyLink} className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <LinkIcon className="w-4 h-4 text-gray-600" />}
            </button>
          </div>
        </div>

        <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          <Share2 className="w-4 h-4" />
          Share Referral Link
        </button>
      </div>
    </div>
  );
}