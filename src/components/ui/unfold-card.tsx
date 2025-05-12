
import * as React from "react"
import { cn } from "@/lib/utils"

interface UnfoldCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  footer?: React.ReactNode
  headerAction?: React.ReactNode
  defaultOpen?: boolean
}

const UnfoldCard = React.forwardRef<HTMLDivElement, UnfoldCardProps>(
  ({ className, title, description, footer, headerAction, children, defaultOpen, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card text-card-foreground rounded-lg border shadow-sm overflow-hidden",
          className
        )}
        {...props}
      >
        {(title || description || headerAction) && (
          <div className="border-b border-border p-4 flex justify-between items-center">
            <div>
              {title && <h3 className="text-lg font-medium leading-6">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
        {footer && (
          <div className="bg-muted/50 border-t border-border p-4">
            {footer}
          </div>
        )}
      </div>
    )
  }
)

UnfoldCard.displayName = "UnfoldCard"

export { UnfoldCard }
