import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { Message, Artist, Team, ProjectOwner, Backer } from '@/lib/supabaseEntities';
import { MessageCircle } from 'lucide-react';

async function lookupName(email) {
  try {
    const artists = await Artist.filter({ email });
    if (artists[0]) return { name: artists[0].full_name, avatar: artists[0].profile_photo_url };
    const owners = await ProjectOwner.filter({ email });
    if (owners[0]) return { name: owners[0].full_name, avatar: owners[0].profile_photo_url };
    const teams = await Team.filter({ contact_email: email });
    if (teams[0]) return { name: teams[0].team_name, avatar: teams[0].team_logo_url };
    const backers = await Backer.filter({ contact_email: email });
    if (backers[0]) return { name: backers[0].organization_name, avatar: backers[0].logo_url };
  } catch {
    // ignore lookup failures
  }
  return { name: email, avatar: null };
}

export default function RecentConversations({ userEmail }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    (async () => {
      try {
        const [sent, received] = await Promise.all([
          Message.filter({ sender_email: userEmail }, '-created_date', 100),
          Message.filter({ recipient_email: userEmail }, '-created_date', 100),
        ]);
        const grouped = {};
        [...sent, ...received].forEach(m => {
          const existing = grouped[m.conversation_id];
          if (!existing || new Date(m.created_date) > new Date(existing.created_date)) grouped[m.conversation_id] = m;
        });
        const top = Object.values(grouped)
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
          .slice(0, 3);
        const enriched = await Promise.all(top.map(async m => {
          const otherEmail = m.sender_email === userEmail ? m.recipient_email : m.sender_email;
          const info = await lookupName(otherEmail);
          return { ...m, otherEmail, ...info };
        }));
        setConversations(enriched);
      } catch (err) {
        console.error('Error loading recent conversations:', err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userEmail]);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Recent Conversations</h2>
        <Link to={createPageUrl('Messages')} className="w-8 h-8 rounded-xl bg-[#2A9D8F]/12 flex items-center justify-center hover:bg-[#2A9D8F]/20 transition-colors">
          <MessageCircle className="w-3.5 h-3.5 text-[#2A9D8F]" />
        </Link>
      </div>
      {loading ? (
        <p className="text-xs text-gray-400 text-center py-6">Loading...</p>
      ) : conversations.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">No conversations yet</p>
      ) : (
        <div className="space-y-1">
          {conversations.map(c => (
            <Link key={c.conversation_id} to={createPageUrl('Messages')} className="flex items-center gap-2.5 p-2 -mx-1 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" loading="lazy" decoding="async" /> : <span className="text-xs font-bold text-gray-600">{c.name?.[0]?.toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-500 truncate">{c.text || c.file_name || 'Attachment'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}