import React from 'react';
import { Smile } from 'lucide-react';

export default function TopBanner() {
  const message = "The Creative Pass — Watch all courses for just €11.50/month";
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black text-white overflow-hidden">
      <div className="py-2">
        <div className="flex animate-scroll-infinite whitespace-nowrap">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex items-center mx-8">
              <Smile className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm font-medium">{message}</span>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll-infinite {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-infinite {
          animation: scroll-infinite 40s linear infinite;
        }
      `}</style>
    </div>
  );
}