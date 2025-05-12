
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const GroupDetailPage = () => {
  return (
    <PageLayout
      title="Group Details"
      description="View and manage group details"
      backButton
      backTo="/users/groups"
    >
      <Helmet>
        <title>Group Details | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Group detail view is under development.</p>
      </div>
    </PageLayout>
  );
};

export default GroupDetailPage;
