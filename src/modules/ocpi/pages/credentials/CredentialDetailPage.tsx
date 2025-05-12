
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CredentialDetailPage = () => {
  return (
    <PageLayout
      title="OCPI Credential Details"
      description="View OCPI credential details"
      backButton
      backTo="/ocpi/credentials"
    >
      <Helmet>
        <title>OCPI Credential Details | Admin Dashboard</title>
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

export default CredentialDetailPage;
