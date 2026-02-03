import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const ServiceVisual = ({ type, isHovered }) => {
  switch(type) {
    case 'commercial':
      return (
        <svg className="w-full h-full" viewBox="0 0 400 300" style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a1a, #000)' }}>
          <defs>
            <filter id="glow-commercial">
              <feGaussianBlur stdDeviation={isHovered ? "4" : "2"} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="energy-flow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A90E2" stopOpacity="0">
                <animate attributeName="offset" values="0;1;0" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#4A90E2" stopOpacity="1">
                <animate attributeName="offset" values="0.5;1.5;0.5" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#4A90E2" stopOpacity="0">
                <animate attributeName="offset" values="1;2;1" dur="4s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <g className="transition-all duration-1000" style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}>
            <rect x="60" y="120" width="70" height="60" fill="#0a0a0a" stroke="#4A90E2" strokeWidth="2" 
                  filter="url(#glow-commercial)" opacity={isHovered ? 1 : 0.7} />
            <rect x="165" y="120" width="70" height="60" fill="#0a0a0a" stroke="#4A90E2" strokeWidth="2" 
                  filter="url(#glow-commercial)" opacity={isHovered ? 1 : 0.7} />
            <rect x="270" y="120" width="70" height="60" fill="#0a0a0a" stroke="#4A90E2" strokeWidth="2" 
                  filter="url(#glow-commercial)" opacity={isHovered ? 1 : 0.7} />
            <line x1="130" y1="150" x2="165" y2="150" stroke="url(#energy-flow)" strokeWidth="3" />
            <line x1="235" y1="150" x2="270" y2="150" stroke="url(#energy-flow)" strokeWidth="3" />
            {isHovered && [140, 245].map((x, i) => (
              <circle key={i} cx={x} cy="150" r="3" fill="#4A90E2" filter="url(#glow-commercial)">
                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        </svg>
      );
      
    case 'film':
      return (
        <svg className="w-full h-full" viewBox="0 0 400 300" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
          <defs>
            <filter id="depth-blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            </filter>
            <filter id="glow-film">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <g className="transition-all duration-1000">
            {[0, 1, 2, 3, 4].map((i) => {
              const y = 90 + i * 25;
              const opacity = 1 - (i * 0.15);
              const width = 340 - (i * 20);
              return (
                <g key={i}>
                  <line x1="30" y1={y} x2={30 + width} y2={y} 
                        stroke="#6B8CAE" strokeWidth="2" 
                        opacity={opacity * (isHovered ? 1 : 0.6)}
                        filter={i > 2 ? "url(#depth-blur)" : undefined} />
                  <circle cx={isHovered ? (30 + width - 40) : (30 + width / 2)} cy={y} r="4" 
                          fill="#6B8CAE" opacity={opacity} 
                          filter="url(#glow-film)"
                          className="transition-all duration-1000"
                          style={{ transitionDelay: `${i * 0.1}s` }}>
                    {isHovered && <animate attributeName="opacity" values={`${opacity};${opacity * 1.5};${opacity}`} dur="2s" repeatCount="indefinite" />}
                  </circle>
                </g>
              );
            })}
          </g>
        </svg>
      );
      
    case 'post':
      return (
        <svg className="w-full h-full" viewBox="0 0 400 300" style={{ background: 'radial-gradient(ellipse at center, #1a1a1a, #000)' }}>
          <defs>
            <filter id="glow-post">
              <feGaussianBlur stdDeviation={isHovered ? "4" : "2"} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="waveform-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E24A90" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#E24A90" stopOpacity="1" />
              <stop offset="100%" stopColor="#E24A90" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <g className="transition-all duration-1000">
            <path d="M 40 150 Q 100 100, 160 150 T 280 150 T 360 150" 
                  fill="none" stroke="url(#waveform-grad)" strokeWidth="3" 
                  filter="url(#glow-post)" opacity={isHovered ? 1 : 0.7} />
            <rect x="50" y="190" width="300" height="60" fill="none" stroke="#E24A90" 
                  strokeWidth="1" strokeDasharray="10,5" opacity={isHovered ? 0.8 : 0.4} />
            {[80, 140, 200, 260, 320].map((x, i) => {
              const height = isHovered ? (30 + Math.sin(i) * 20) : 20;
              return (
                <line key={i} x1={x} y1={150 - height} x2={x} y2={150 + height} 
                      stroke="#E24A90" strokeWidth="2" 
                      filter="url(#glow-post)"
                      opacity={isHovered ? 1 : 0.6}
                      className="transition-all duration-500"
                      style={{ transitionDelay: `${i * 0.1}s` }} />
              );
            })}
          </g>
        </svg>
      );
      
    case 'vfx':
      return (
        <svg className="w-full h-full" viewBox="0 0 400 300" style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a2a, #000)' }}>
          <defs>
            <filter id="glow-vfx">
              <feGaussianBlur stdDeviation={isHovered ? "5" : "2"} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <g className="transition-all duration-1000" style={{ 
            transformOrigin: 'center',
            transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)'
          }}>
            {[0, 1, 2].map((ring) => (
              <g key={ring}>
                <polygon points="200,80 280,150 200,220 120,150" 
                         fill="none" stroke="#9B4AE2" strokeWidth="2" 
                         opacity={0.8 - ring * 0.2}
                         filter="url(#glow-vfx)"
                         style={{ 
                           transform: `scale(${1 + ring * 0.3})`,
                           transformOrigin: 'center'
                         }}>
                  {isHovered && <animateTransform attributeName="transform" type="rotate" 
                        from="0 200 150" to="360 200 150" dur={`${15 - ring * 3}s`} repeatCount="indefinite" />}
                </polygon>
              </g>
            ))}
            {[[200, 80], [280, 150], [200, 220], [120, 150]].map((pos, i) => (
              <circle key={i} cx={pos[0]} cy={pos[1]} r="4" fill="#9B4AE2" filter="url(#glow-vfx)">
                {isHovered && <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" 
                      begin={`${i * 0.2}s`} />}
              </circle>
            ))}
            {isHovered && [[200, 80], [280, 150], [200, 220], [120, 150]].map((pos, i) => {
              const next = i < 3 ? i + 1 : 0;
              const nextPos = [[200, 80], [280, 150], [200, 220], [120, 150]][next];
              return (
                <line key={`conn-${i}`} x1={pos[0]} y1={pos[1]} x2={nextPos[0]} y2={nextPos[1]} 
                      stroke="#9B4AE2" strokeWidth="1" strokeDasharray="5,5" 
                      opacity="0.6" filter="url(#glow-vfx)" />
              );
            })}
          </g>
        </svg>
      );
      
    case 'sound':
      return (
        <svg className="w-full h-full" viewBox="0 0 400 300" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
          <defs>
            <filter id="glow-sound">
              <feGaussianBlur stdDeviation={isHovered ? "6" : "3"} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="sound-field">
              <stop offset="0%" stopColor="#4AE290" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4AE290" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="transition-all duration-1000">
            <circle cx="200" cy="150" r={isHovered ? "100" : "70"} 
                    fill="url(#sound-field)" opacity={isHovered ? 0.4 : 0.2}
                    className="transition-all duration-1000" />
            <circle cx="200" cy="150" r={isHovered ? "70" : "50"} 
                    fill="none" stroke="#4AE290" strokeWidth="1" strokeDasharray="5,5"
                    opacity={isHovered ? 0.8 : 0.4}
                    className="transition-all duration-1000" />
            {[100, 130, 160, 190, 220, 250, 280, 310].map((x, i) => {
              const height = isHovered ? (20 + Math.sin(i * 0.8 + Date.now() * 0.001) * 30) : (10 + Math.sin(i * 0.5) * 15);
              return (
                <line key={i} x1={x} y1={150 - height} x2={x} y2={150 + height} 
                      stroke="#4AE290" strokeWidth="3" strokeLinecap="round"
                      filter="url(#glow-sound)"
                      opacity={isHovered ? 1 : 0.6}
                      className="transition-all duration-300"
                      style={{ transitionDelay: `${i * 0.05}s` }}>
                  {isHovered && <animate attributeName="y1" values={`${150 - height};${150 - height - 20};${150 - height}`} 
                        dur="1.5s" repeatCount="indefinite" begin={`${i * 0.1}s`} />}
                  {isHovered && <animate attributeName="y2" values={`${150 + height};${150 + height + 20};${150 + height}`} 
                        dur="1.5s" repeatCount="indefinite" begin={`${i * 0.1}s`} />}
                </line>
              );
            })}
          </g>
        </svg>
      );
      
    case 'web':
      return (
        <svg className="w-full h-full" viewBox="0 0 400 300" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)' }}>
          <defs>
            <filter id="glow-web">
              <feGaussianBlur stdDeviation={isHovered ? "4" : "2"} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <g className="transition-all duration-1000" style={{ 
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}>
            <line x1="50" y1="60" x2="350" y2="60" stroke="#E2904A" strokeWidth="1" 
                  strokeDasharray="5,5" opacity="0.3" />
            <line x1="50" y1="240" x2="350" y2="240" stroke="#E2904A" strokeWidth="1" 
                  strokeDasharray="5,5" opacity="0.3" />
            <rect x={isHovered ? "70" : "80"} y="80" 
                  width={isHovered ? "100" : "240"} height="50" 
                  fill="#0a0a0a" stroke="#E2904A" strokeWidth="2"
                  filter="url(#glow-web)" opacity={isHovered ? 1 : 0.7}
                  className="transition-all duration-700" />
            <rect x={isHovered ? "190" : "80"} y="145" 
                  width={isHovered ? "140" : "110"} height="50" 
                  fill="#0a0a0a" stroke="#E2904A" strokeWidth="2"
                  filter="url(#glow-web)" opacity={isHovered ? 1 : 0.7}
                  className="transition-all duration-700"
                  style={{ transitionDelay: '0.1s' }} />
            <rect x={isHovered ? "210" : "210"} y="210" 
                  width={isHovered ? "120" : "110"} height="50" 
                  fill="#0a0a0a" stroke="#E2904A" strokeWidth="2"
                  filter="url(#glow-web)" opacity={isHovered ? 1 : 0.7}
                  className="transition-all duration-700"
                  style={{ transitionDelay: '0.2s' }} />
            {isHovered && [[95, 105], [260, 170], [270, 235]].map((pos, i) => (
              <circle key={i} cx={pos[0]} cy={pos[1]} r="3" fill="#E2904A" filter="url(#glow-web)">
                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
              </circle>
            ))}
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
      <div className="aspect-[4/3] bg-black p-0 flex items-center justify-center relative overflow-hidden">
        <ServiceVisual type={visualType} isHovered={isHovered} />
      </div>
      <div className="p-8 border-t border-gray-100">
        <h3 className="text-xl font-semibold uppercase mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-600">{desc}</p>
      </div>
    </Link>
  );
}