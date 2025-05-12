
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';

const WalletDepositPage = () => {
  return (
    <PageLayout
      title="Wallet Deposit"
      description="Add funds to a wallet"
      backButton
      backTo="/users/wallets"
    >
      <Helmet>
        <title>Wallet Deposit | Admin Dashboard</title>
      </Helmet>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Wallet deposit functionality is under development.</p>
      </div>
    </PageLayout>
  );
};

export default WalletDepositPage;
