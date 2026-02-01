import React from 'react';

export default function AnimatedBanner() {
  const message = "Studio22 First Frame — Experience one complimentary production day";
  
  return (
    <div className="fixed top-[73px] left-0 right-0 z-40 bg-black text-white overflow-hidden">
      <div className="py-2">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center mx-8">
              <span className="text-sm font-medium">{message}</span>
              <span className="mx-8 text-amber-500">★</span>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}