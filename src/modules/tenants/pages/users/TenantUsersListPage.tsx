
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TenantUsersListPage = () => {
  return (
    <PageLayout
      title="Tenant Users"
      description="Manage tenant users"
      actions={
        <div className="flex gap-2">
          {/* Add actions here */}
        </div>
      }
    >
      <Helmet>
        <title>Tenant Users | Admin Dashboard</title>
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

export default TenantUsersListPage;
