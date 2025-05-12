
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TenantAppCreatePage = () => {
  return (
    <PageLayout
      title="Create App"
      description="Create a new tenant application"
      backButton
      backTo="/tenants/apps"
    >
      <Helmet>
        <title>Create App | Admin Dashboard</title>
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

export default TenantAppCreatePage;
