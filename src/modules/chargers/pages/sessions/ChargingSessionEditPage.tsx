
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const ChargingSessionEditPage = () => {
  return (
    <PageLayout
      title="Edit Charging Session"
      description="Edit charging session details"
      backButton
      backTo="/chargers/sessions"
    >
      <Helmet>
        <title>Edit Charging Session | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Charging session editing is under development.</p>
      </div>
    </PageLayout>
  );
};

export default ChargingSessionEditPage;
