import React from 'react';

interface LogoAnimatedProps {
  variant?: 'full' | 'icon';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  animated?: boolean;
}

export const LogoAnimated: React.FC<LogoAnimatedProps> = ({
  variant = 'full',
  className = '',
  size = 'lg',
  animated = true,
}) => {
  const sizeStyles = {
    sm: variant === 'icon' ? 'h-8 w-8' : 'h-10 w-auto',
    md: variant === 'icon' ? 'h-11 w-11' : 'h-13 sm:h-14 w-auto',
    lg: variant === 'icon' ? 'h-13 w-13' : 'h-16 sm:h-18 w-auto',
    xl: variant === 'icon' ? 'h-18 w-18' : 'h-20 sm:h-24 w-auto',
    '2xl': variant === 'icon' ? 'h-24 w-24' : 'h-28 sm:h-32 w-auto',
    custom: '',
  }[size];

  const src = variant === 'icon'
    ? (animated ? '/logo-icon-animated.svg' : '/logo-icon.svg')
    : (animated ? '/logo-animated.svg' : '/logo.svg');

  const alt = variant === 'icon' ? 'TerraSentinel Crest' : 'TerraSentinel Logo';

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeStyles} ${className} shrink-0 select-none object-contain`}
      draggable={false}
    />
  );
};
