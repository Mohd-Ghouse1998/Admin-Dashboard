
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const FavoriteChargersListPage = () => {
  return (
    <PageLayout
      title="Favorite Chargers"
      description="Manage your favorite chargers"
      createRoute="/chargers/favorites/create"
    >
      <Helmet>
        <title>Favorite Chargers | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Favorite charger management is under development.</p>
      </div>
    </PageLayout>
  );
};

export default FavoriteChargersListPage;
