import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-24',
};

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  return (
    <img
      src="/logo.png"
      alt="Mizaniyti"
      className={`${sizes[size]} w-auto object-contain ${className}`}
    />
  );
};
