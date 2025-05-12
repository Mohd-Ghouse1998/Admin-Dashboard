
import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  htmlFor?: string
  description?: string
  error?: string
  required?: boolean
}

const UnfoldFormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, label, htmlFor, description, error, required, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2 mb-4", className)} {...props}>
        {label && (
          <Label 
            htmlFor={htmlFor} 
            className={cn(
              "text-sm font-medium block", 
              error ? "text-destructive" : "text-foreground"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <div className="space-y-1">
          {children}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    )
  }
)

UnfoldFormGroup.displayName = "UnfoldFormGroup"

interface UnfoldFormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

const UnfoldFormSection = React.forwardRef<HTMLDivElement, UnfoldFormSectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-4 mb-6", className)} {...props}>
        {(title || description) && (
          <div className="space-y-1">
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    )
  }
)

UnfoldFormSection.displayName = "UnfoldFormSection"

export { UnfoldFormGroup, UnfoldFormSection }
