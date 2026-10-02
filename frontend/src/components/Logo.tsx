import React from 'react';
import { LogoAnimated } from './LogoAnimated';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  return (
    <LogoAnimated
      variant={variant}
      className={className}
      size={size}
    />
  );
};

export { LogoAnimated };

