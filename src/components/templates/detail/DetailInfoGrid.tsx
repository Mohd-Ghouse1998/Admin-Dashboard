import React, { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface DetailInfoItemProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
  copyable?: boolean;
}

export const DetailInfoItem: React.FC<DetailInfoItemProps> = ({
  label,
  value,
  icon,
  badge,
  action,
  className,
  copyable = false
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
        {icon && <span className="text-primary">{icon}</span>}
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="font-medium text-gray-900">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </p>
        {badge && <div>{badge}</div>}
        
        {copyable && typeof value === 'string' && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="h-6 w-6 p-0 ml-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </Button>
        )}
        
        {action && <div className="ml-auto">{action}</div>}
      </div>
    </div>
  );
};

interface DetailInfoGridProps {
  children: ReactNode;
  className?: string;
}

export const DetailInfoGrid: React.FC<DetailInfoGridProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-6 border border-gray-100", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {children}
      </div>
    </div>
  );
};

interface DetailInfoSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const DetailInfoSection: React.FC<DetailInfoSectionProps> = ({
  title,
  description,
  icon,
  children,
  className
}) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden", className)}>
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
        <h2 className="flex items-center text-lg font-semibold gap-2 text-gray-800">
          {icon && <span className="text-primary">{icon}</span>}
          <span>{title}</span>
        </h2>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

// DetailInfoItem is already exported above
