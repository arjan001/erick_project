import React from 'react';
import { Smile } from 'lucide-react';

export default function AnimatedBanner() {
  const message = "First Frame Offer — One complimentary production day for verified projects";
  
  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-black text-white overflow-hidden">
      <div className="py-2.5">
        <div className="flex animate-scroll-infinite whitespace-nowrap">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex items-center mx-6">
              <Smile className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm font-medium tracking-wide">{message}</span>
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