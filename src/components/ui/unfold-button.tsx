import React from 'react';
import { cn } from '@/lib/utils';

interface UnfoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const UnfoldButton = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  icon,
  ...props
}: UnfoldButtonProps) => {
  const variantClasses = {
    primary: 'bg-primary-600 border border-transparent font-medium text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    secondary: 'bg-white text-gray-700 border border-gray-300 font-medium hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };

  return (
    <button
      className={cn(
        'rounded-md shadow-sm focus:outline-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span className="flex items-center justify-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </span>
    </button>
  );
};

export { UnfoldButton };