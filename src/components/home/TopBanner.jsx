import React from 'react';

export default function TopBanner() {
  const message = "The Creative Pass — Watch all courses for just €11.50/month";
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#F5F1E8] text-[#8B7355] overflow-hidden">
      <div className="py-2">
        <div className="flex animate-scroll-infinite whitespace-nowrap">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex items-center mx-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2 text-amber-600">
                <rect width="20" height="15" x="2" y="7" rx="2" ry="2"></rect>
                <polyline points="17 2 12 7 7 2"></polyline>
              </svg>
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