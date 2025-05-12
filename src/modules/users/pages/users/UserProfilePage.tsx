
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const UserProfilePage = () => {
  return (
    <PageLayout
      title="My Profile"
      description="View and manage your profile"
    >
      <Helmet>
        <title>My Profile | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">User profile management is under development.</p>
      </div>
    </PageLayout>
  );
};

export default UserProfilePage;
