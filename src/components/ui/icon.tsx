import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xxs: 'text-[14px]', // Very small text (badges): 11px/14px
  xs: 'text-[16px]',  // Extra small text (captions): 12px/1rem
  sm: 'text-[18px]',  // Small text (primary UI text): 14px/1.25rem
  md: 'text-[24px]',  // Default size
  lg: 'text-[28px]',  // Larger size for emphasis
};

/**
 * Icon component using Material Symbols
 * 
 * Usage examples:
 * - Navigation icons: <Icon name="dashboard" className="mr-3 text-gray-500 dark:text-gray-400" />
 * - Button icons: <Icon name="add" className="mr-2" />
 * - Status icons: <Icon name="check_circle" className="text-green-500" />
 */
const Icon = ({ name, size = 'md', className, ...props }: IconProps) => {
  return (
    <span 
      className={cn(
        'material-symbols-outlined',
        sizeClasses[size],
        className
      )} 
      {...props}
    >
      {name}
    </span>
  );
};

export { Icon };