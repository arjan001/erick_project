import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';

const SERVICE_IMAGES = {
  commercial: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  film: 'https://images.unsplash.com/photo-1485846234645-614d22381569?w=800&q=80',
  post: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80',
  vfx: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
  sound: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
  web: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
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