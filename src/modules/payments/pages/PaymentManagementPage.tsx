
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentTable } from '@/components/payments/PaymentTable';
import { SessionBillingTable } from '@/components/payments/SessionBillingTable';

const PaymentManagementPage = () => {
  return (
    <PageLayout
      title="Payment Management"
      description="View and manage payment transactions and session billings"
    >
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="session-billings">Session Billings</TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="pt-4">
          <PaymentTable />
        </TabsContent>
        <TabsContent value="session-billings" className="pt-4">
          <SessionBillingTable />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default PaymentManagementPage;
