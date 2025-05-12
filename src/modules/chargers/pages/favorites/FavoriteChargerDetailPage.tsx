
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const FavoriteChargerDetailPage = () => {
  return (
    <PageLayout
      title="Favorite Charger Details"
      description="View favorite charger details"
      backButton
      backTo="/chargers/favorites"
    >
      <Helmet>
        <title>Favorite Charger Details | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Favorite charger details view is under development.</p>
      </div>
    </PageLayout>
  );
};

export default FavoriteChargerDetailPage;
