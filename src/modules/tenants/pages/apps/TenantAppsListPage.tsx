
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TenantAppsListPage = () => {
  return (
    <PageLayout
      title="Tenant Apps"
      description="Manage tenant applications"
      actions={
        <div className="flex gap-2">
          {/* Add actions here */}
        </div>
      }
    >
      <Helmet>
        <title>Tenant Apps | Admin Dashboard</title>
      </Helmet>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full max-w-sm" />
            <Skeleton className="h-96 w-full" />
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default TenantAppsListPage;
