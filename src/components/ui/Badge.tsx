import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'yaya';
  className?: string;
}

export default function Badge({ children, variant = 'primary', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': variant === 'primary',
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300': variant === 'accent',
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': variant === 'success',
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': variant === 'danger',
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': variant === 'warning',
          'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300': variant === 'info',
          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300': variant === 'yaya',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
