
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TenantGroupDetailPage = () => {
  return (
    <PageLayout
      title="Group Details"
      description="View tenant group details"
      backButton
      backTo="/tenants/groups"
    >
      <Helmet>
        <title>Group Details | Admin Dashboard</title>
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

export default TenantGroupDetailPage;
