
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const FavoriteChargerCreatePage = () => {
  return (
    <PageLayout
      title="Add Favorite Charger"
      description="Add a new charger to favorites"
      backButton
      backTo="/chargers/favorites"
    >
      <Helmet>
        <title>Add Favorite Charger | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Favorite charger creation is under development.</p>
      </div>
    </PageLayout>
  );
};

export default FavoriteChargerCreatePage;
