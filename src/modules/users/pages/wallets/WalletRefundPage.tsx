
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const WalletRefundPage = () => {
  return (
    <PageLayout
      title="Wallet Refund"
      description="Process refund from a wallet"
      backButton
      backTo="/users/wallets"
    >
      <Helmet>
        <title>Wallet Refund | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Wallet refund functionality is under development.</p>
      </div>
    </PageLayout>
  );
};

export default WalletRefundPage;
