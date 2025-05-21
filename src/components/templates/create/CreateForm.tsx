import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

interface FormGroupProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormGroup({
  title,
  description,
  children,
  className,
}: FormGroupProps) {
  return (
    <Card className={cn("overflow-hidden border rounded-lg p-5", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {children}
      </div>
    </Card>
  );
}

interface FormRowProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function FormRow({
  children,
  className,
  fullWidth = false,
}: FormRowProps) {
  return (
    <div className={cn(
      "space-y-1",
      fullWidth && "md:col-span-2",
      className
    )}>
      {children}
    </div>
  );
}
