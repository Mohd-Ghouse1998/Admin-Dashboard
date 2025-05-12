
import React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  className 
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FormRow({ children, className }: FormRowProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", className)}>
      {children}
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function FormActions({ 
  children, 
  className, 
  align = "right"
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "mt-6 flex items-center space-x-2",
        {
          "justify-start": align === "left",
          "justify-center": align === "center",
          "justify-end": align === "right",
        },
        className
      )}
    >
      {children}
    </div>
  );
}

interface FormLayoutProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  id?: string;
}

export function FormLayout({ 
  children, 
  className, 
  onSubmit, 
  id 
}: FormLayoutProps) {
  const Wrapper = onSubmit ? "form" : "div";
  
  return (
    <Wrapper
      id={id}
      className={cn("space-y-6", className)}
      onSubmit={onSubmit as any}
    >
      {children}
    </Wrapper>
  );
}
