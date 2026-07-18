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
      <img 
        src={imageUrl} 
        alt=""
        className="w-full h-full object-cover transition-transform duration-500 ease-out"
        style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
      />
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