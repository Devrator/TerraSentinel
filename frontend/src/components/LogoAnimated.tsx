import React from 'react';

interface LogoAnimatedProps {
  variant?: 'full' | 'icon';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showSubtitle?: boolean;
}

export const LogoAnimated: React.FC<LogoAnimatedProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const sizeStyles = {
    sm: variant === 'icon' ? 'h-7 w-7' : 'h-7 w-auto',
    md: variant === 'icon' ? 'h-9 w-9' : 'h-9 w-auto',
    lg: variant === 'icon' ? 'h-12 w-12' : 'h-12 w-auto',
    xl: variant === 'icon' ? 'h-16 w-16' : 'h-16 w-auto',
    custom: '',
  }[size];

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 280 290"
        className={`${sizeStyles} ${className} shrink-0 select-none`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="TerraSentinel Crest Icon"
      >
        <defs>
          <linearGradient id="reactShieldLeftSlope" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#183123" />
            <stop offset="100%" stopColor="#0f2016" />
          </linearGradient>

          <linearGradient id="reactShieldRightSlope" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#558162" />
            <stop offset="100%" stopColor="#3d6349" />
          </linearGradient>

          <linearGradient id="reactMountainTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5a8668" />
            <stop offset="100%" stopColor="#466f53" />
          </linearGradient>

          <linearGradient id="reactFlameDot" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6a22" />
            <stop offset="100%" stopColor="#e63e00" />
          </linearGradient>

          <clipPath id="reactIconShieldClip">
            <path d="M 46 142 C 46 195, 88 238, 140 258 C 192 238, 234 195, 234 142 Z" />
          </clipPath>
        </defs>

        <style>{`
          @keyframes tsPulseWave1 {
            0%, 100% { opacity: 0.35; transform: translateY(0px) scale(0.97); }
            50% { opacity: 1; transform: translateY(-2px) scale(1.03); stroke: #25a244; }
          }
          @keyframes tsPulseWave2 {
            0%, 100% { opacity: 0.2; transform: translateY(0px) scale(0.95); }
            50% { opacity: 0.95; transform: translateY(-4px) scale(1.05); stroke: #2ec4b6; }
          }
          @keyframes tsBeacon {
            0%, 100% { r: 4.5; opacity: 0.8; fill: #ffffff; }
            50% { r: 6.5; opacity: 1; fill: #ffb703; filter: drop-shadow(0 0 6px #ffb703); }
          }
          @keyframes tsFlameOrbitPulse {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 3px rgba(255, 68, 5, 0.4)); }
            50% { transform: scale(1.22); filter: drop-shadow(0 0 10px rgba(255, 68, 5, 0.95)); }
          }
          @keyframes tsGreenOrbitPulse {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(80, 124, 93, 0.3)); }
            50% { transform: scale(1.18); filter: drop-shadow(0 0 8px rgba(46, 196, 182, 0.8)); }
          }
          @keyframes tsRiverShimmer {
            0% { stroke-dashoffset: 60; opacity: 0.6; }
            50% { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 0.6; }
          }
          .ts-wave-inner { transform-origin: 140px 44px; animation: tsPulseWave1 2.2s ease-in-out infinite; }
          .ts-wave-outer { transform-origin: 140px 28px; animation: tsPulseWave2 2.2s ease-in-out infinite 0.35s; }
          .ts-beacon-light { animation: tsBeacon 1.8s ease-in-out infinite; }
          .ts-node-flame { transform-origin: 224px 116px; animation: tsFlameOrbitPulse 2s ease-in-out infinite; }
          .ts-node-green { transform-origin: 54px 116px; animation: tsGreenOrbitPulse 2s ease-in-out infinite 1s; }
          .ts-river-flow { stroke-dasharray: 12 8; animation: tsRiverShimmer 2.8s linear infinite; }
        `}</style>

        {/* Shield Basin */}
        <g clipPath="url(#reactIconShieldClip)">
          <path d="M 46 142 L 140 142 L 140 258 C 88 238, 46 195, 46 142 Z" fill="url(#reactShieldLeftSlope)" />
          <path d="M 140 142 L 234 142 C 234 195, 192 238, 140 258 Z" fill="url(#reactShieldRightSlope)" />
          
          {/* Main River */}
          <path
            d="M 140 152 C 175 168, 185 188, 160 210 C 135 230, 155 248, 140 258 C 128 248, 115 228, 142 206 C 168 186, 152 168, 135 152 Z"
            fill="#ffffff"
          />
          {/* Animated River Current */}
          <path
            d="M 138 152 C 170 170, 178 190, 155 210 C 132 230, 150 248, 138 258"
            stroke="#a7f3d0"
            strokeWidth="2"
            fill="none"
            className="ts-river-flow"
          />
          <path d="M 40 162 Q 140 138 240 162" stroke="#ffffff" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </g>

        {/* Lower Shield Outline */}
        <path
          d="M 48 142 C 48 193, 89 235, 140 254 C 191 235, 232 193, 232 142"
          stroke="#1b3224"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Left Mountain Prism */}
        <polygon points="50,165 92,130 92,160 50,180" fill="#172e21" />
        <polygon points="50,165 92,130 120,154 78,185" fill="url(#reactMountainTop)" />
        <polygon points="92,130 120,154 120,172 92,160" fill="#0f2016" />

        {/* Right Mountain Prism */}
        <polygon points="230,165 188,130 188,160 230,180" fill="#172e21" />
        <polygon points="230,165 188,130 160,154 202,185" fill="url(#reactMountainTop)" />
        <polygon points="188,130 160,154 160,172 188,160" fill="#0f2016" />

        {/* Central Watchtower */}
        <polygon points="135,76 140,76 140,162 131,162" fill="#162d1f" />
        <polygon points="140,76 145,76 149,162 140,162" fill="#1d3827" />
        <polygon points="140,54 154,68 147,78 133,78 126,68" fill="#183223" />
        <circle cx="140" cy="67" r="4.5" fill="#ffffff" className="ts-beacon-light" />

        {/* Radio Telemetry Waves */}
        <path d="M 120 44 A 24 24 0 0 1 160 44" stroke="#1b3224" strokeWidth="5.5" strokeLinecap="round" fill="none" className="ts-wave-inner" />
        <path d="M 108 28 A 38 38 0 0 1 172 28" stroke="#1b3224" strokeWidth="5.5" strokeLinecap="round" fill="none" className="ts-wave-outer" />

        {/* Orbit Ring & Nodes */}
        <path d="M 68 95 A 92 92 0 0 1 118 52" stroke="#1b3224" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M 162 52 A 92 92 0 0 1 202 88" stroke="#1b3224" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M 48 142 A 92 92 0 0 1 54 116" stroke="#1b3224" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <circle cx="54" cy="116" r="9" fill="#507c5d" stroke="#ffffff" strokeWidth="1.8" className="ts-node-green" />

        <path d="M 204 90 A 92 92 0 0 1 216 104" stroke="#ff5722" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M 232 142 A 92 92 0 0 1 228 126" stroke="#1b3224" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <circle cx="224" cy="116" r="9" fill="url(#reactFlameDot)" stroke="#ffffff" strokeWidth="1.8" className="ts-node-flame" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 780 290"
      className={`${sizeStyles} ${className} shrink-0 select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="TerraSentinel Logo"
    >
      <defs>
        <linearGradient id="fullReactShieldLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#183123" />
          <stop offset="100%" stopColor="#0f2016" />
        </linearGradient>

        <linearGradient id="fullReactShieldRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#558162" />
          <stop offset="100%" stopColor="#3d6349" />
        </linearGradient>

        <linearGradient id="fullReactMountainTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5a8668" />
          <stop offset="100%" stopColor="#466f53" />
        </linearGradient>

        <linearGradient id="fullReactFlameDot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6a22" />
          <stop offset="100%" stopColor="#e63e00" />
        </linearGradient>

        <clipPath id="fullReactShieldClip">
          <path d="M 46 142 C 46 195, 88 238, 140 258 C 192 238, 234 195, 234 142 Z" />
        </clipPath>
      </defs>

      <style>{`
        @keyframes fullTsPulseWave1 {
          0%, 100% { opacity: 0.35; transform: translateY(0px) scale(0.97); }
          50% { opacity: 1; transform: translateY(-2px) scale(1.03); stroke: #25a244; }
        }
        @keyframes fullTsPulseWave2 {
          0%, 100% { opacity: 0.2; transform: translateY(0px) scale(0.95); }
          50% { opacity: 0.95; transform: translateY(-4px) scale(1.05); stroke: #2ec4b6; }
        }
        @keyframes fullTsBeacon {
          0%, 100% { r: 4.5; opacity: 0.8; fill: #ffffff; }
          50% { r: 6.5; opacity: 1; fill: #ffb703; filter: drop-shadow(0 0 6px #ffb703); }
        }
        @keyframes fullTsFlameOrbitPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 3px rgba(255, 68, 5, 0.4)); }
          50% { transform: scale(1.22); filter: drop-shadow(0 0 10px rgba(255, 68, 5, 0.95)); }
        }
        @keyframes fullTsGreenOrbitPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(80, 124, 93, 0.3)); }
          50% { transform: scale(1.18); filter: drop-shadow(0 0 8px rgba(46, 196, 182, 0.8)); }
        }
        @keyframes fullTsRiverShimmer {
          0% { stroke-dashoffset: 60; opacity: 0.6; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.6; }
        }
        .full-ts-wave-inner { transform-origin: 140px 44px; animation: fullTsPulseWave1 2.2s ease-in-out infinite; }
        .full-ts-wave-outer { transform-origin: 140px 28px; animation: fullTsPulseWave2 2.2s ease-in-out infinite 0.35s; }
        .full-ts-beacon { animation: fullTsBeacon 1.8s ease-in-out infinite; }
        .full-ts-flame { transform-origin: 224px 116px; animation: fullTsFlameOrbitPulse 2s ease-in-out infinite; }
        .full-ts-green { transform-origin: 54px 116px; animation: fullTsGreenOrbitPulse 2s ease-in-out infinite 1s; }
        .full-ts-river { stroke-dasharray: 12 8; animation: fullTsRiverShimmer 2.8s linear infinite; }
      `}</style>

      {/* ==========================================
           1. EMBLEM CREST (Left)
           ========================================== */}
      <g transform="translate(15, 0)">
        <g clipPath="url(#fullReactShieldClip)">
          <path d="M 46 142 L 140 142 L 140 258 C 88 238, 46 195, 46 142 Z" fill="url(#fullReactShieldLeft)" />
          <path d="M 140 142 L 234 142 C 234 195, 192 238, 140 258 Z" fill="url(#fullReactShieldRight)" />
          <path
            d="M 140 152 C 175 168, 185 188, 160 210 C 135 230, 155 248, 140 258 C 128 248, 115 228, 142 206 C 168 186, 152 168, 135 152 Z"
            fill="#ffffff"
          />
          <path
            d="M 138 152 C 170 170, 178 190, 155 210 C 132 230, 150 248, 138 258"
            stroke="#a7f3d0"
            strokeWidth="2"
            fill="none"
            className="full-ts-river"
          />
          <path d="M 40 162 Q 140 138 240 162" stroke="#ffffff" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </g>

        <path
          d="M 48 142 C 48 193, 89 235, 140 254 C 191 235, 232 193, 232 142"
          stroke="#1b3224"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Mountain Prisms */}
        <polygon points="50,165 92,130 92,160 50,180" fill="#172e21" />
        <polygon points="50,165 92,130 120,154 78,185" fill="url(#fullReactMountainTop)" />
        <polygon points="92,130 120,154 120,172 92,160" fill="#0f2016" />

        <polygon points="230,165 188,130 188,160 230,180" fill="#172e21" />
        <polygon points="230,165 188,130 160,154 202,185" fill="url(#fullReactMountainTop)" />
        <polygon points="188,130 160,154 160,172 188,160" fill="#0f2016" />

        {/* Central Watchtower */}
        <polygon points="135,76 140,76 140,162 131,162" fill="#162d1f" />
        <polygon points="140,76 145,76 149,162 140,162" fill="#1d3827" />
        <polygon points="140,54 154,68 147,78 133,78 126,68" fill="#183223" />
        <circle cx="140" cy="67" r="4.5" fill="#ffffff" className="full-ts-beacon" />

        {/* Telemetry Radar Waves */}
        <path d="M 120 44 A 24 24 0 0 1 160 44" stroke="#1b3224" strokeWidth="5.5" strokeLinecap="round" fill="none" className="full-ts-wave-inner" />
        <path d="M 108 28 A 38 38 0 0 1 172 28" stroke="#1b3224" strokeWidth="5.5" strokeLinecap="round" fill="none" className="full-ts-wave-outer" />

        {/* Orbit Ring & Looping Nodes */}
        <path d="M 68 95 A 92 92 0 0 1 118 52" stroke="#1b3224" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M 162 52 A 92 92 0 0 1 202 88" stroke="#1b3224" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M 48 142 A 92 92 0 0 1 54 116" stroke="#1b3224" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <circle cx="54" cy="116" r="9" fill="#507c5d" stroke="#ffffff" strokeWidth="1.8" className="full-ts-green" />

        <path d="M 204 90 A 92 92 0 0 1 216 104" stroke="#ff5722" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M 232 142 A 92 92 0 0 1 228 126" stroke="#1b3224" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <circle cx="224" cy="116" r="9" fill="url(#fullReactFlameDot)" stroke="#ffffff" strokeWidth="1.8" className="full-ts-flame" />
      </g>

      {/* ==========================================
           2. VERTICAL DIVIDER SEPARATOR
           ========================================== */}
      <line x1="335" y1="110" x2="335" y2="225" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />

      {/* ==========================================
           3. TYPOGRAPHY
           ========================================== */}
      <g fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, Inter, sans-serif">
        <text x="360" y="172" fontSize="58" fontWeight="900" letterSpacing="-1.5">
          <tspan fill="#0f172a" className="dark:fill-slate-100">Terra</tspan>
          <tspan fill="#2d583b">Sentinel</tspan>
        </text>

        {showSubtitle && (
          <text x="388" y="210" fontSize="14.5" fontWeight="700" fill="#1b3224" letterSpacing="5.5" opacity="0.9" className="dark:fill-emerald-400">
            WATCH &#160;&#8226;&#160; ANALYZE &#160;&#8226;&#160; ALERT
          </text>
        )}
      </g>
    </svg>
  );
};
