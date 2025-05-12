
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const GroupUsersPage = () => {
  return (
    <PageLayout
      title="Group Users"
      description="Manage users in this group"
      backButton
      backTo="/users/groups"
    >
      <Helmet>
        <title>Group Users | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Group user management is under development.</p>
      </div>
    </PageLayout>
  );
};

export default GroupUsersPage;
