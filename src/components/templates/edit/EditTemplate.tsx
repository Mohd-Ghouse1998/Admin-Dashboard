import React, { ReactNode, FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EditTemplateProps {
  // Page metadata
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  entityName?: string;
  entityId?: string | number;
  
  // Navigation
  backPath?: string;
  backLabel?: string;
  onBack?: () => void;
  detailPath?: string;
  
  // Form handling
  isLoading?: boolean;
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

export function EditTemplate({
  // Page metadata
  title,
  subtitle,
  description,
  icon,
  entityName,
  entityId,
  
  // Navigation
  backPath,
  backLabel,
  onBack,
  detailPath,
  
  // Form handling
  isLoading = false,
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
}: EditTemplateProps) {
  // Generate default values
  const finalEntityName = entityName || (title.endsWith('s') ? title.slice(0, -1) : title);
  const finalBackLabel = backLabel || `Back to ${finalEntityName} Details`;
  
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
        <Button type="button" variant="outline" asChild>
          <Link to={backPath}>Cancel</Link>
        </Button>
      ) : detailPath ? (
        <Button type="button" variant="outline" asChild>
          <Link to={detailPath}>Cancel</Link>
        </Button>
      ) : onBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          Cancel
        </Button>
      ) : null}
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
      </Button>
    </div>
  );
  
  return (
    <div className={cn("container py-6 space-y-6", className)}>
      <Helmet>
        <title>Edit {finalEntityName} | Admin Dashboard</title>
      </Helmet>
      
      {/* Header with back button, title and description */}
      <div className={cn("space-y-1.5", headerClassName)}>
        {/* Back button */}
        {(backPath || detailPath || onBack) && (
          <div className="mb-2">
            {backPath ? (
              <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-muted-foreground hover:text-foreground">
                <Link to={backPath} className="flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  {finalBackLabel}
                </Link>
              </Button>
            ) : detailPath ? (
              <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-muted-foreground hover:text-foreground">
                <Link to={detailPath} className="flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  {finalBackLabel}
                </Link>
              </Button>
            ) : onBack ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="p-0 h-auto text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {finalBackLabel}
              </Button>
            ) : null}
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
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading {finalEntityName.toLowerCase()} data...</p>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className={formClassName}>
            <Card className="border rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {children}
                </div>
                
                {actions || defaultActions}
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
