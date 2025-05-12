
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const ChargingSessionCreatePage = () => {
  return (
    <PageLayout
      title="Create Charging Session"
      description="Create a new charging session"
      backButton
      backTo="/chargers/sessions"
    >
      <Helmet>
        <title>Create Charging Session | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Charging session creation is under development.</p>
      </div>
    </PageLayout>
  );
};

export default ChargingSessionCreatePage;
