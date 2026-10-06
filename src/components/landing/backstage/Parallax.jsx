import React from 'react';

export function ParallaxBackground({ src, overlay = 'bg-black/50', children }) {
  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${src})` }}
      />
      <div className={`absolute inset-0 ${overlay}`} />
      <div className="relative">{children}</div>
    </div>
  );
}

export function ParallaxLayer({ speed = 0.1, children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
