import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Search, ChevronRight, Home, HelpCircle, Grid3x3, Mail, Phone, MapPin } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';

const HELP_ARTICLES = [
  { title: 'Self-Tape Audition Requests', desc: 'How to submit and manage self-tape requests.' },
  { title: 'Working with Minors', desc: 'Guidelines and requirements for minor performers.' },
  { title: 'Subscriptions & Benefits', desc: 'Plans, connects, and premium features.' },
  { title: 'Posting a Project', desc: 'How to post a job and find talent.' },
  { title: 'Payment & Invoicing', desc: 'M-Pesa and payment processing details.' },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedArticle(null);
    if (tab === 'messages') {
      // Navigate to messages page (or login if not authenticated)
      navigate(createPageUrl('SignIn'));
      setOpen(false);
    } else if (tab === 'home') {
      // Stay on home view
    }
  };

  const handleContactUs = () => {
    navigate(createPageUrl('Contact'));
    setOpen(false);
  };

  const filteredArticles = HELP_ARTICLES.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!open) {
    return (
      <button
        aria-label="Chat"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A962] text-black shadow-lg shadow-[#C9A962]/30 transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col" style={{ maxHeight: '70vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="text-sm font-bold uppercase tracking-tight text-black">Eric Rabar</span>
        <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
          <X className="h-4 w-4 text-black" />
        </button>
      </div>

      {activeTab === 'help' && selectedArticle ? (
        /* Article detail view */
        <div className="flex-1 overflow-y-auto px-5 pt-3 pb-4">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-1 text-sm text-[#C9A962] hover:underline mb-3"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back
          </button>
          <h2 className="text-xl font-semibold text-black mb-2">{selectedArticle.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{selectedArticle.desc}</p>
          <div className="mt-4 rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-bold text-black">Need more help?</p>
            <p className="mt-0.5 text-xs text-gray-400">Reach out to our team directly.</p>
            <button
              onClick={handleContactUs}
              className="mt-3 w-full rounded-lg bg-[#C9A962] px-4 py-2 text-sm font-semibold text-black hover:bg-[#D4B575] transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="px-5 pt-3 pb-4">
            <h3 className="text-sm font-medium text-black/60">Hi there! 👋</h3>
            <h2 className="mt-1 text-xl font-semibold text-black">How can we help you today?</h2>
          </div>

          {/* Search bar */}
          <div className="px-5">
            <div className="flex items-center gap-2 rounded-xl bg-[#F4F4F4] px-4 py-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help"
                className="w-full bg-transparent text-sm text-black placeholder:text-[#808080] focus:outline-none"
              />
              <Search className="h-4 w-4 shrink-0 text-[#808080]" />
            </div>
          </div>

          {/* List items */}
          <div className="mt-4 px-3 flex-1 overflow-y-auto">
            <button
              onClick={handleContactUs}
              className="flex w-full items-center justify-between rounded-xl bg-[#FAF8F0] px-4 py-3 text-left hover:bg-[#F5F2E5] transition-colors"
            >
              <span className="text-sm font-medium text-black">Contact Us</span>
              <ChevronRight className="h-4 w-4 text-black/40" />
            </button>
            {filteredArticles.map((item) => (
              <button
                key={item.title}
                onClick={() => { setActiveTab('help'); setSelectedArticle(item); }}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-black">{item.title}</span>
                <ChevronRight className="h-4 w-4 text-black/40" />
              </button>
            ))}
            {filteredArticles.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">No results found. Try contacting us directly.</p>
            )}
          </div>

          {/* Ask a question block */}
          <div className="mx-5 mt-4 mb-4 rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-bold text-black">Ask a question</p>
            <p className="mt-0.5 text-xs text-gray-400">AI Agent and team can help</p>
            <div className="mt-3 flex items-center gap-1">
              <img src="https://images.unsplash.com/photo-1500648766835-5ccbb910d572?w=40&h=40&fit=crop" alt="" className="h-7 w-7 rounded-full border-2 border-white object-cover" />
              <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=40&h=40&fit=crop" alt="" className="-ml-2 h-7 w-7 rounded-full border-2 border-white object-cover" />
              <img src="https://images.unsplash.com/photo-1573496359142-22f9f5c0f57e?w=40&h=40&fit=crop" alt="" className="-ml-2 h-7 w-7 rounded-full border-2 border-white object-cover" />
              <div className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-black">
                <Grid3x3 className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer navigation */}
      <div className="flex items-center justify-around border-t border-gray-100 py-3">
        <button
          onClick={() => { setActiveTab('home'); setSelectedArticle(null); }}
          className="flex flex-col items-center gap-1"
        >
          <Home className={`h-5 w-5 ${activeTab === 'home' ? 'text-[#C9A962]' : 'text-gray-400'}`} />
          <span className={`text-xs font-medium ${activeTab === 'home' ? 'text-[#C9A962]' : 'text-gray-400'}`}>Home</span>
        </button>
        <button
          onClick={() => handleTabClick('messages')}
          className="flex flex-col items-center gap-1"
        >
          <MessageCircle className={`h-5 w-5 ${activeTab === 'messages' ? 'text-[#C9A962]' : 'text-gray-400'}`} />
          <span className={`text-xs font-medium ${activeTab === 'messages' ? 'text-[#C9A962]' : 'text-gray-400'}`}>Messages</span>
        </button>
        <button
          onClick={() => { setActiveTab('help'); setSelectedArticle(null); }}
          className="flex flex-col items-center gap-1"
        >
          <HelpCircle className={`h-5 w-5 ${activeTab === 'help' ? 'text-[#C9A962]' : 'text-gray-400'}`} />
          <span className={`text-xs font-medium ${activeTab === 'help' ? 'text-[#C9A962]' : 'text-gray-400'}`}>Help</span>
        </button>
      </div>
    </div>
  );
}
