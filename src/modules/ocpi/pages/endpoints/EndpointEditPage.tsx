
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const EndpointEditPage = () => {
  return (
    <PageLayout
      title="Edit OCPI Endpoint"
      description="Edit OCPI endpoint details"
      backButton
      backTo="/ocpi/endpoints"
    >
      <Helmet>
        <title>Edit OCPI Endpoint | Admin Dashboard</title>
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

export default EndpointEditPage;
