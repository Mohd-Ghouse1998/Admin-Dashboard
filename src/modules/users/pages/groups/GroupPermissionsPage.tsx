
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const GroupPermissionsPage = () => {
  return (
    <PageLayout
      title="Group Permissions"
      description="Manage permissions for this group"
      backButton
      backTo="/users/groups"
    >
      <Helmet>
        <title>Group Permissions | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Group permissions management is under development.</p>
      </div>
    </PageLayout>
  );
};

export default GroupPermissionsPage;
