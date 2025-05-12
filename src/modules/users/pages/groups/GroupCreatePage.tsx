
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const GroupCreatePage = () => {
  return (
    <PageLayout
      title="Create Group"
      description="Create a new user group"
      backButton
      backTo="/users/groups"
    >
      <Helmet>
        <title>Create Group | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Group creation functionality is under development.</p>
      </div>
    </PageLayout>
  );
};

export default GroupCreatePage;
