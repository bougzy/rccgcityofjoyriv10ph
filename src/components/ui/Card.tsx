import { cn } from '@/lib/utils/cn';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'solid';
  hover?: boolean;
}

export default function Card({ className, variant = 'default', hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        {
          'glass-card': variant === 'default' || variant === 'glass',
          'bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700': variant === 'solid',
        },
        hover && 'hover-lift',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
