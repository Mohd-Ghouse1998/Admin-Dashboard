import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  readOnly?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  className,
  readOnly = false,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        {readOnly && (
          <span className="px-2.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
            Read only
          </span>
        )}
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
  readOnly?: boolean;
}

export function FormGroup({
  title,
  description,
  children,
  className,
  readOnly = false,
}: FormGroupProps) {
  return (
    <Card className={cn(
      "overflow-hidden border rounded-lg p-5", 
      readOnly && "bg-gray-50/50", 
      className
    )}>
      {(title || description) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
          {readOnly && (
            <span className="px-2.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
              Read only
            </span>
          )}
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
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
}

export function FormRow({
  children,
  className,
  fullWidth = false,
  label,
  description,
  required = false,
  error,
}: FormRowProps) {
  return (
    <div className={cn(
      "space-y-1.5",
      fullWidth && "md:col-span-2",
      className
    )}>
      {label && (
        <div className="flex items-center gap-1">
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {description && (
            <div className="group relative">
              <div className="cursor-help w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">?</div>
              <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-black bg-opacity-80 text-white text-xs rounded">
                {description}
              </div>
            </div>
          )}
        </div>
      )}
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
