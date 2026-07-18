import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'purple';
  size?: 'sm' | 'default';
}

export function Badge({ 
  className, 
  variant = 'default', 
  size = 'default',
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-orange-100 text-orange-800 border border-orange-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    outline: 'border border-gray-200 text-gray-800 bg-white',
    purple: 'bg-[var(--color-brand-100)] text-[var(--color-brand-700)] border border-[var(--color-brand-200)]',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    default: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
