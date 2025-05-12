
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const FavoriteChargerEditPage = () => {
  return (
    <PageLayout
      title="Edit Favorite Charger"
      description="Edit favorite charger"
      backButton
      backTo="/chargers/favorites"
    >
      <Helmet>
        <title>Edit Favorite Charger | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Favorite charger editing is under development.</p>
      </div>
    </PageLayout>
  );
};

export default FavoriteChargerEditPage;
