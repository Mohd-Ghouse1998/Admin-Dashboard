
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const GroupEditPage = () => {
  return (
    <PageLayout
      title="Edit Group"
      description="Edit group details"
      backButton
      backTo="/users/groups"
    >
      <Helmet>
        <title>Edit Group | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Group editing functionality is under development.</p>
      </div>
    </PageLayout>
  );
};

export default GroupEditPage;
