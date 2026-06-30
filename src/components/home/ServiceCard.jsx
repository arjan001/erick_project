import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';

const SERVICE_IMAGES = {
  commercial: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/5ace6ee23_generated_image.png',
  film: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/e9a428902_generated_image.png',
  post: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/05ff39441_generated_image.png',
  vfx: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/0e9506bb0_generated_image.png',
  sound: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/21488ed1b_generated_image.png',
  web: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6968a46f6ea94ba83cd1497c/7e5680733_generated_image.png'
};

const ServiceVisual = ({ type, isHovered }) => {
  const imageUrl = SERVICE_IMAGES[type];
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      <style>{`
        @keyframes signal-reveal {
          0% {
            filter: contrast(0.3) brightness(1.2) blur(8px);
          }
          100% {
            filter: contrast(1) brightness(1) blur(0px);
          }
        }
        
        .signal-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: contrast(0.3) brightness(1.2) blur(8px) grayscale(1);
          transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .signal-image.revealed {
          filter: contrast(0.9) brightness(0.95) blur(0.5px) grayscale(1);
        }
        
        .noise-overlay {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0,0,0,0.05) 0%, transparent 50%);
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        
        .grain {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
          pointer-events: none;
        }
      `}</style>
      
      <img 
        src={imageUrl} 
        alt=""
        className={`signal-image ${isHovered ? 'revealed' : ''}`}
      />
      
      <div className="noise-overlay" />
      <div className="grain" />
    </div>
  );
};

export default function ServiceCard({ title, desc, visualType }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link
      to={createPageUrl('Services')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
    >
      <div className="aspect-[4/3] bg-white p-0 flex items-center justify-center relative overflow-hidden">
        <ServiceVisual type={visualType} isHovered={isHovered} />
      </div>
      <div className="p-8 border-t border-gray-100">
        <h3 className="text-xl font-semibold uppercase mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-600">{desc}</p>
      </div>
    </Link>
  );
}