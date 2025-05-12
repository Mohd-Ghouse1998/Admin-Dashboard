import * as React from "react";
import { cn } from "@/lib/utils";

export interface UnfoldInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const UnfoldInput = React.forwardRef<HTMLInputElement, UnfoldInputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const id = React.useId();
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={id} 
            className="block font-medium mb-2 text-gray-900 text-sm dark:text-gray-200"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          className={cn(
            "bg-white border border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 px-3 py-2 rounded-md shadow-sm text-sm w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

UnfoldInput.displayName = "UnfoldInput";

export { UnfoldInput };