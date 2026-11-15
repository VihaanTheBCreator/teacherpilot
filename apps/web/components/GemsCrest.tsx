import React from 'react';

interface GemsCrestProps {
  size?: number;
  className?: string;
  variant?: 'light' | 'dark' | 'gold';
}

export default function GemsCrest({ size = 36, className = '', variant = 'gold' }: GemsCrestProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#005a36" />
            <stop offset="0.6" stopColor="#004328" />
            <stop offset="1" stopColor="#022c22" />
          </linearGradient>
          <linearGradient id="goldBorder" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde047" />
            <stop offset="0.3" stopColor="#f59e0b" />
            <stop offset="0.7" stopColor="#d97706" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="quillGrad" x1="16" y1="12" x2="32" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#fef3c7" />
          </linearGradient>
        </defs>

        {/* Outer Shield with Gold Accent */}
        <path
          d="M24 3L40 9V22C40 32.5 33.2 41.8 24 45C14.8 41.8 8 32.5 8 22V9L24 3Z"
          fill="url(#shieldGrad)"
          stroke="url(#goldBorder)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Inner Shield Inset */}
        <path
          d="M24 6L37 11V22C37 30.8 31.4 38.6 24 41.5C16.6 38.6 11 30.8 11 22V11L24 6Z"
          stroke="#f59e0b"
          strokeWidth="0.8"
          strokeOpacity="0.5"
          fill="none"
        />

        {/* Education Compass / Star of Excellence at Top */}
        <circle cx="24" cy="13" r="2" fill="#fbbf24" />
        <path d="M24 9.5V11M24 15V16.5M20.5 13H22M26 13H27.5" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />

        {/* Open Book of Knowledge */}
        <path
          d="M16 26.5C18.5 25.5 21 25.8 24 27.2C27 25.8 29.5 25.5 32 26.5V34C29.5 33 27 33.2 24 34.5C21 33.2 18.5 33 16 34V26.5Z"
          fill="url(#quillGrad)"
          stroke="#d97706"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <path d="M24 27.2V34.5" stroke="#92400e" strokeWidth="0.8" />

        {/* Graduation Quill / Torch Flame */}
        <path
          d="M24 16C22.2 18.5 22.8 21.5 24 24C25.2 21.5 25.8 18.5 24 16Z"
          fill="#f59e0b"
        />
        <path
          d="M24 18C23.2 19.5 23.5 21 24 22.5C24.5 21 24.8 19.5 24 18Z"
          fill="#fef08a"
        />
      </svg>
    </div>
  );
}
