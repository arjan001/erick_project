import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function ChatWidget() {
  return (
    <button
      aria-label="Chat"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#4F46E5] text-white shadow-lg shadow-[#4F46E5]/30 transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" />
    </button>
  );
}
