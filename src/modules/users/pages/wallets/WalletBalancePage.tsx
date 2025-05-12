
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const WalletBalancePage = () => {
  return (
    <PageLayout
      title="Wallet Balance"
      description="View wallet balance"
      backButton
      backTo="/users/wallets"
    >
      <Helmet>
        <title>Wallet Balance | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Wallet balance view is under development.</p>
      </div>
    </PageLayout>
  );
};

export default WalletBalancePage;
