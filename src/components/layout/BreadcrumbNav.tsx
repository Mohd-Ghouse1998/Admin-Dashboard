import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: Breadcrumb[];
  className?: string;
}

/**
 * BreadcrumbNav component for consistent navigation breadcrumbs
 */
export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  return (
    <nav className={cn('flex items-center text-sm text-muted-foreground', className)}>
      <ol className="flex items-center space-x-2">
        <li>
          <Link to="/" className="flex items-center hover:text-foreground">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4" />
            {item.href ? (
              <Link to={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default BreadcrumbNav;
