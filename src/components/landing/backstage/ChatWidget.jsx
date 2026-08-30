import React, { useState } from 'react';
import { MessageCircle, X, Search, ChevronRight, Home, HelpCircle, Grid3x3 } from 'lucide-react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        aria-label="Chat"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#5050FF] text-white shadow-lg shadow-[#5050FF]/30 transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="text-sm font-bold uppercase tracking-tight text-black">Eric Rabar</span>
        <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
          <X className="h-4 w-4 text-black" />
        </button>
      </div>

      <div className="px-5 pt-3 pb-4">
        <h3 className="text-sm font-medium text-black/60">Hi there! 👋</h3>
        <h2 className="mt-1 text-xl font-semibold text-black">How can we help you today?</h2>
      </div>

      {/* Search bar */}
      <div className="px-5">
        <div className="flex items-center gap-2 rounded-xl bg-[#F4F4F4] px-4 py-3">
          <input
            type="text"
            placeholder="Search for help"
            className="w-full bg-transparent text-sm text-black placeholder:text-[#808080] focus:outline-none"
          />
          <Search className="h-4 w-4 shrink-0 text-[#808080]" />
        </div>
      </div>

      {/* List items */}
      <div className="mt-4 px-3">
        <button className="flex w-full items-center justify-between rounded-xl bg-[#F0F0FF] px-4 py-3 text-left">
          <span className="text-sm font-medium text-black">Contact Us</span>
          <ChevronRight className="h-4 w-4 text-black/40" />
        </button>
        {['Self-Tape Audition Requests', 'Working with Minors', 'Mandy Subscriptions & Benefits'].map((item) => (
          <button key={item} className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left hover:bg-gray-50">
            <span className="text-sm font-medium text-black">{item}</span>
            <ChevronRight className="h-4 w-4 text-black/40" />
          </button>
        ))}
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

      {/* Footer navigation */}
      <div className="flex items-center justify-around border-t border-gray-100 py-3">
        <button className="flex flex-col items-center gap-1">
          <Home className="h-5 w-5 text-[#5050FF]" />
          <span className="text-xs font-medium text-[#5050FF]">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <MessageCircle className="h-5 w-5 text-gray-400" />
          <span className="text-xs font-medium text-gray-400">Messages</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <HelpCircle className="h-5 w-5 text-gray-400" />
          <span className="text-xs font-medium text-gray-400">Help</span>
        </button>
      </div>
    </div>
  );
}
