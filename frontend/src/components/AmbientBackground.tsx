import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
      {/* Primary Top-Right Flame Glow Spot (#ff4405) */}
      <div
        className="absolute -top-32 -right-24 w-[650px] h-[650px] rounded-full filter blur-[100px] opacity-75 dark:opacity-85 animate-pulse-slow"
        style={{
          background: 'radial-gradient(circle, #ff4405 0%, rgba(255, 68, 5, 0.45) 30%, rgba(255, 68, 5, 0.15) 60%, transparent 80%)',
        }}
      />

      {/* Bottom-Left Ambient Warmth Spot (#ff4405) */}
      <div
        className="absolute -bottom-36 -left-32 w-[720px] h-[720px] rounded-full filter blur-[120px] opacity-65 dark:opacity-80"
        style={{
          background: 'radial-gradient(circle, #ff4405 0%, rgba(255, 90, 15, 0.40) 35%, rgba(255, 68, 5, 0.12) 65%, transparent 80%)',
        }}
      />

      {/* Mid-Screen Center-Right Floating Spot (#ff4405) */}
      <div
        className="absolute top-[38%] right-[15%] w-[520px] h-[520px] rounded-full filter blur-[110px] opacity-55 dark:opacity-70 animate-pulse-slow"
        style={{
          background: 'radial-gradient(circle, #ff5518 0%, rgba(255, 68, 5, 0.35) 40%, rgba(255, 68, 5, 0.10) 65%, transparent 80%)',
        }}
      />

      {/* Upper-Left Accent Shaded Spot (#ff4405) */}
      <div
        className="absolute top-[15%] left-[18%] w-[450px] h-[450px] rounded-full filter blur-[95px] opacity-50 dark:opacity-65"
        style={{
          background: 'radial-gradient(circle, #ff4405 0%, rgba(255, 80, 0, 0.30) 35%, transparent 70%)',
        }}
      />

      {/* Lower-Right Horizon Spot (#ff4405) */}
      <div
        className="absolute bottom-[12%] right-[8%] w-[500px] h-[500px] rounded-full filter blur-[115px] opacity-60 dark:opacity-75"
        style={{
          background: 'radial-gradient(circle, #ff4405 0%, rgba(255, 100, 20, 0.35) 35%, rgba(255, 68, 5, 0.10) 60%, transparent 75%)',
        }}
      />

      {/* Subtle Noise / Micro-grid Mesh texture */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(#ff4405 1.5px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
};
