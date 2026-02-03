import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const ServiceVisual = ({ type, isHovered }) => {
  const baseClasses = "w-full h-full transition-all duration-700";
  
  switch(type) {
    case 'commercial':
      return (
        <svg className={baseClasses} viewBox="0 0 200 200">
          <defs>
            <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#1a1a1a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0.1" />
              <animate attributeName="x1" values="0%;100%;0%" dur="3s" repeatCount="indefinite" />
              <animate attributeName="x2" values="100%;200%;100%" dur="3s" repeatCount="indefinite" />
            </linearGradient>
          </defs>
          <g className={`transition-all duration-700 ${isHovered ? 'opacity-100' : 'opacity-60'}`}>
            <rect x="20" y="80" width="40" height="40" fill="none" stroke="#1a1a1a" strokeWidth="2" 
                  className={isHovered ? 'animate-pulse' : ''} />
            <rect x="80" y="80" width="40" height="40" fill="none" stroke="#1a1a1a" strokeWidth="2" 
                  className={isHovered ? 'animate-pulse' : ''} style={{animationDelay: '0.2s'}} />
            <rect x="140" y="80" width="40" height="40" fill="none" stroke="#1a1a1a" strokeWidth="2" 
                  className={isHovered ? 'animate-pulse' : ''} style={{animationDelay: '0.4s'}} />
            <line x1="60" y1="100" x2="80" y2="100" stroke="url(#flow-gradient)" strokeWidth="3" />
            <line x1="120" y1="100" x2="140" y2="100" stroke="url(#flow-gradient)" strokeWidth="3" />
          </g>
        </svg>
      );
      
    case 'film':
      return (
        <svg className={baseClasses} viewBox="0 0 200 200">
          <g className={`transition-all duration-700 ${isHovered ? 'opacity-100' : 'opacity-60'}`}>
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="30"
                y1={70 + i * 15}
                x2="170"
                y2={70 + i * 15}
                stroke="#1a1a1a"
                strokeWidth="2"
                className={isHovered ? 'animate-pulse' : ''}
                style={{animationDelay: `${i * 0.15}s`}}
              />
            ))}
            <circle cx={isHovered ? "140" : "100"} cy="77" r="4" fill="#1a1a1a" 
                    className="transition-all duration-1000" />
            <circle cx={isHovered ? "150" : "110"} cy="92" r="4" fill="#1a1a1a" 
                    className="transition-all duration-1000" style={{transitionDelay: '0.1s'}} />
            <circle cx={isHovered ? "130" : "90"} cy="107" r="4" fill="#1a1a1a" 
                    className="transition-all duration-1000" style={{transitionDelay: '0.2s'}} />
          </g>
        </svg>
      );
      
    case 'post':
      return (
        <svg className={baseClasses} viewBox="0 0 200 200">
          <g className={`transition-all duration-700 ${isHovered ? 'opacity-100' : 'opacity-60'}`}>
            <path
              d="M 30 100 Q 60 60, 90 100 T 150 100"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="2"
              className={isHovered ? 'animate-pulse' : ''}
            />
            <rect x="25" y="130" width="150" height="30" fill="none" stroke="#1a1a1a" strokeWidth="2" 
                  strokeDasharray="5,5" className={isHovered ? 'animate-pulse' : ''} />
            {[40, 70, 100, 130, 160].map((x, i) => (
              <line
                key={i}
                x1={x}
                y1="95"
                x2={x}
                y2={isHovered ? "70" : "85"}
                stroke="#1a1a1a"
                strokeWidth="1.5"
                className="transition-all duration-500"
                style={{transitionDelay: `${i * 0.1}s`}}
              />
            ))}
          </g>
        </svg>
      );
      
    case 'vfx':
      return (
        <svg className={baseClasses} viewBox="0 0 200 200">
          <g className={`transition-all duration-700 ${isHovered ? 'opacity-100 scale-110' : 'opacity-60 scale-100'}`}
             style={{transformOrigin: 'center'}}>
            <polygon points="100,60 140,100 100,140 60,100" fill="none" stroke="#1a1a1a" strokeWidth="2" 
                     className={isHovered ? 'animate-spin' : ''} style={{animationDuration: '10s'}} />
            <circle cx="100" cy="60" r="3" fill="#1a1a1a" />
            <circle cx="140" cy="100" r="3" fill="#1a1a1a" />
            <circle cx="100" cy="140" r="3" fill="#1a1a1a" />
            <circle cx="60" cy="100" r="3" fill="#1a1a1a" />
            <line x1="100" y1="60" x2="140" y2="100" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="2,2" 
                  className={isHovered ? 'opacity-100' : 'opacity-0'} />
            <line x1="140" y1="100" x2="100" y2="140" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="2,2" 
                  className={isHovered ? 'opacity-100' : 'opacity-0'} />
          </g>
        </svg>
      );
      
    case 'sound':
      return (
        <svg className={baseClasses} viewBox="0 0 200 200">
          <g className={`transition-all duration-700 ${isHovered ? 'opacity-100' : 'opacity-60'}`}>
            {[50, 70, 90, 110, 130, 150].map((x, i) => {
              const height = isHovered ? Math.sin(i * 0.5) * 30 + 40 : 20;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={100 - height / 2}
                  x2={x}
                  y2={100 + height / 2}
                  stroke="#1a1a1a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                  style={{transitionDelay: `${i * 0.05}s`}}
                />
              );
            })}
            <circle cx="100" cy="100" r={isHovered ? "50" : "35"} fill="none" stroke="#1a1a1a" 
                    strokeWidth="1" strokeDasharray="3,3" className="transition-all duration-700" />
          </g>
        </svg>
      );
      
    case 'web':
      return (
        <svg className={baseClasses} viewBox="0 0 200 200">
          <g className={`transition-all duration-700 ${isHovered ? 'opacity-100' : 'opacity-60'}`}>
            <rect x="40" y="60" width={isHovered ? "50" : "120"} height="30" fill="none" stroke="#1a1a1a" 
                  strokeWidth="2" className="transition-all duration-700" />
            <rect x={isHovered ? "100" : "40"} y="100" width={isHovered ? "60" : "50"} height="30" 
                  fill="none" stroke="#1a1a1a" strokeWidth="2" className="transition-all duration-700" 
                  style={{transitionDelay: '0.1s'}} />
            <rect x={isHovered ? "110" : "100"} y="140" width={isHovered ? "50" : "60"} height="30" 
                  fill="none" stroke="#1a1a1a" strokeWidth="2" className="transition-all duration-700" 
                  style={{transitionDelay: '0.2s'}} />
            <line x1="30" y1="50" x2="170" y2="50" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="30" y1="180" x2="170" y2="180" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="2,2" />
          </g>
        </svg>
      );
      
    default:
      return null;
  }
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
      <div className="aspect-[4/3] bg-[#FAFAFA] p-12 flex items-center justify-center relative overflow-hidden">
        <ServiceVisual type={visualType} isHovered={isHovered} />
      </div>
      <div className="p-8 border-t border-gray-100">
        <h3 className="text-xl font-semibold uppercase mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-600">{desc}</p>
      </div>
    </Link>
  );
}