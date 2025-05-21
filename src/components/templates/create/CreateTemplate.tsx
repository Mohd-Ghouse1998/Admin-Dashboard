import React, { ReactNode, FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CreateTemplateProps {
  // Page metadata
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  entityName?: string;
  
  // Navigation
  backPath?: string;
  backLabel?: string;
  onBack?: () => void;
  
  // Form handling
  isSubmitting?: boolean;
  error?: Error | string | null;
  onSubmit?: (e: FormEvent) => void;
  
  // Content
  children: ReactNode;
  actions?: ReactNode;
  
  // Classes
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  formClassName?: string;
}

// Helper components for consistent styling
export const CreateSectionHeader: React.FC<{ title: string; description?: string; icon?: ReactNode }> = ({ 
  title, 
  description, 
  icon 
}) => {
  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-6 border-b border-primary/10">
      <h3 className="font-medium flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        {title}
      </h3>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  );
};

export function CreateTemplate({
  // Page metadata
  title,
  subtitle,
  description,
  icon,
  entityName,
  
  // Navigation
  backPath,
  backLabel,
  onBack,
  
  // Form handling
  isSubmitting = false,
  error,
  onSubmit,
  
  // Content
  children,
  actions,
  
  // Classes
  className,
  headerClassName,
  contentClassName,
  formClassName,
}: CreateTemplateProps) {
  // Generate default values
  const finalEntityName = entityName || (title.endsWith('s') ? title.slice(0, -1) : title);
  const finalBackLabel = backLabel || `Back to ${title}`;
  
  // Default form submission handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };
  
  // Default form actions
  const defaultActions = (
    <div className="flex items-center justify-end gap-3 mt-6">
      {backPath ? (
        <Button type="button" variant="outline" asChild className="border-border hover:border-primary/20 hover:bg-background">
          <Link to={backPath}>Cancel</Link>
        </Button>
      ) : onBack ? (
        <Button type="button" variant="outline" onClick={onBack} className="border-border hover:border-primary/20 hover:bg-background">
          Cancel
        </Button>
      ) : null}
      
      <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 border-primary/20 text-primary-foreground">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating {finalEntityName}...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Create {finalEntityName}
          </>
        )}
      </Button>
    </div>
  );
  
  return (
    <div className={cn("container py-6 space-y-6", className)}>
      <Helmet>
        <title>Create {finalEntityName} | Admin Dashboard</title>
      </Helmet>
      
      {/* Header with back button, title and description */}
      <div className={cn("space-y-1.5", headerClassName)}>
        {/* Back button */}
        {(backPath || onBack) && (
          <div className="mb-2">
            {backPath ? (
              <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-muted-foreground hover:text-primary">
                <Link to={backPath} className="flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  {finalBackLabel}
                </Link>
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="p-0 h-auto text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {finalBackLabel}
              </Button>
            )}
          </div>
        )}
        
        {/* Title and subtitle */}
        <div className="flex items-center gap-3">
          {icon && (
            <div className="hidden sm:flex h-10 w-10 rounded-md bg-primary/10 items-center justify-center text-primary">
              {icon}
            </div>
          )}
          
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {icon && <span className="sm:hidden">{icon}</span>}
              {title}
            </h1>
            {subtitle && <p className="text-base text-muted-foreground">{subtitle}</p>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className={cn("space-y-6", contentClassName)}>
        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : String(error)}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className={formClassName}>
          <div className="space-y-8">
            {children}
            {/* Actions row at the bottom */}
            <div className="pt-4 border-t">
              {actions || defaultActions}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
