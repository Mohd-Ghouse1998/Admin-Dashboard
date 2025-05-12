
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';

const RemoteControlPage = () => {
  return (
    <PageLayout
      title="Remote Control"
      description="Remote control for chargers"
    >
      <Helmet>
        <title>Remote Control | Admin Dashboard</title>
      </Helmet>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Remote control functionality is under development.</p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default RemoteControlPage;
