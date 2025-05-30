
import React, { ReactNode } from 'react';
import PageHeader, { BreadcrumbItem } from '@/components/common/PageHeader';

interface PageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  backButton?: boolean;
  backTo?: string;
  createRoute?: string;
  noCard?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  children,
  breadcrumbs = [],
  actions,
  backButton = false,
  backTo = '/',
  createRoute,
  noCard = false
}) => {
  return (
    <div className="container mx-auto px-2 py-3">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
        backButton={backButton}
        backTo={backTo}
        createRoute={createRoute}
      />
      <div className={`mt-3 ${noCard ? '' : 'bg-card rounded-lg border p-4'}`}>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
