import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md'
}) => {
  if (variant === 'icon') {
    const iconSizes = {
      sm: 'w-7 h-7',
      md: 'w-10 h-10',
      lg: 'w-14 h-14'
    };

    return (
      <svg
        viewBox="0 0 64 64"
        className={`${iconSizes[size]} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoIconFlame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b00" />
            <stop offset="50%" stopColor="#ff4405" />
            <stop offset="100%" stopColor="#cc2900" />
          </linearGradient>
          <linearGradient id="logoIconDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e232d" />
            <stop offset="100%" stopColor="#0e1116" />
          </linearGradient>
        </defs>
        <polygon points="32,3 59,18 59,46 32,61 5,46 5,18" fill="url(#logoIconDark)" stroke="url(#logoIconFlame)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M16 26 A 18 18 0 0 1 48 26" stroke="url(#logoIconFlame)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M21 30 A 12 12 0 0 1 43 30" stroke="url(#logoIconFlame)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
        <path d="M32 16 L42 40 L32 35 L22 40 Z" fill="url(#logoIconFlame)" />
        <circle cx="32" cy="48" r="4" fill="#ffffff" stroke="#ff4405" strokeWidth="1.8" />
        <ellipse cx="32" cy="32" rx="27" ry="11" stroke="#ff4405" strokeWidth="1.4" strokeDasharray="3 4" fill="none" transform="rotate(-20, 32, 32)" opacity="0.65" />
      </svg>
    );
  }

  const fullSizes = {
    sm: 'h-8',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-20'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${fullSizes[size]} ${className}`}>
      <svg
        viewBox="0 0 64 64"
        className="h-full w-auto shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoFullFlame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b00" />
            <stop offset="50%" stopColor="#ff4405" />
            <stop offset="100%" stopColor="#cc2900" />
          </linearGradient>
          <linearGradient id="logoFullDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e232d" />
            <stop offset="100%" stopColor="#0e1116" />
          </linearGradient>
        </defs>
        <polygon points="32,3 59,18 59,46 32,61 5,46 5,18" fill="url(#logoFullDark)" stroke="url(#logoFullFlame)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M16 26 A 18 18 0 0 1 48 26" stroke="url(#logoFullFlame)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M21 30 A 12 12 0 0 1 43 30" stroke="url(#logoFullFlame)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
        <path d="M32 16 L42 40 L32 35 L22 40 Z" fill="url(#logoFullFlame)" />
        <circle cx="32" cy="48" r="4" fill="#ffffff" stroke="#ff4405" strokeWidth="1.8" />
        <ellipse cx="32" cy="32" rx="27" ry="11" stroke="#ff4405" strokeWidth="1.4" strokeDasharray="3 4" fill="none" transform="rotate(-20, 32, 32)" opacity="0.65" />
      </svg>
      <div className="flex flex-col">
        <div className="flex items-baseline font-black tracking-tight text-xl leading-none">
          <span className="text-slate-900 dark:text-white">Terra</span>
          <span className="text-[#ff4405] bg-gradient-to-r from-[#ff6b00] via-[#ff4405] to-[#cc2900] bg-clip-text text-transparent">Sentinel</span>
        </div>
        <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase mt-0.5">
          AI Environmental Sentry
        </span>
      </div>
    </div>
  );
};
