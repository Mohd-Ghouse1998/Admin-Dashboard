
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const ChargingSessionDetailPage = () => {
  return (
    <PageLayout
      title="Charging Session Details"
      description="View charging session details"
      backButton
      backTo="/chargers/sessions"
    >
      <Helmet>
        <title>Charging Session Details | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Charging session details view is under development.</p>
      </div>
    </PageLayout>
  );
};

export default ChargingSessionDetailPage;
