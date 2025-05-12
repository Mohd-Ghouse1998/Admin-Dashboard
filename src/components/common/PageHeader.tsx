
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

export interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  backButton?: boolean;
  backTo?: string;
  createRoute?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title,
  description,
  breadcrumbs = [],
  actions,
  backButton = false,
  backTo = '/',
  createRoute
}) => {
  return (
    <div className="flex flex-col gap-6 mb-8">
      {(breadcrumbs.length > 0 || backButton) && (
        <div className="flex items-center gap-4">
          {backButton && (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="mr-4 h-9 gap-1 pl-2.5"
            >
              <Link to={backTo}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            </Button>
          )}

          {breadcrumbs.length > 0 && (
            <Breadcrumb>
              {breadcrumbs.map((crumb, i) => (
                <BreadcrumbItem key={i}>
                  {crumb.url ? (
                    <BreadcrumbLink href={crumb.url}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          {createRoute && (
            <Button asChild>
              <Link to={createRoute}>
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Link>
            </Button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
