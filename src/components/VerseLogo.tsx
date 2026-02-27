import React from 'react';

interface VerseLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerseLogo({ className = '', size = 'md' }: VerseLogoProps) {
  const sizes = {
    sm: 'w-6 h-6 p-1',
    md: 'w-10 h-10 p-1.5',
    lg: 'w-16 h-16 p-2.5',
  };

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-[#00D1FF] via-[#A15EE3] to-[#FF00D6] flex items-center justify-center shadow-lg shadow-purple-500/30 border-2 border-white/20 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current drop-shadow-md">
        <path d="M22,32 L46,72 C48,76 52,76 54,72 L78,32 L66,32 L50,62 L34,32 Z" />
      </svg>
    </div>
  );
}
