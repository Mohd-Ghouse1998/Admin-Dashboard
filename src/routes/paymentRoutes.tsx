import React from "react";
import { Route } from "react-router-dom";
import PaymentManagementPage from "@/modules/payments/pages/PaymentManagementPage";
import SessionBillingsPage from "@/modules/payments/pages/SessionBillingsPage";
import SessionBillingDetailPage from "@/modules/payments/pages/SessionBillingDetailPage";
import PricingPlansPage from "@/modules/payments/pages/pricing/PricingPlansPage";
import PricingPlanDetailPage from "@/modules/payments/pages/pricing/PricingPlanDetailPage";
import PricingPlanCreatePage from "@/modules/payments/pages/pricing/PricingPlanCreatePage";
import PricingPlanEditPage from "@/modules/payments/pages/pricing/PricingPlanEditPage";
import PromotionsPage from "@/modules/payments/pages/promotions/PromotionsPage";
import PromotionDetailPage from "@/modules/payments/pages/promotions/PromotionDetailPage";
import PromotionCreatePage from "@/modules/payments/pages/promotions/PromotionCreatePage";
import PromotionEditPage from "@/modules/payments/pages/promotions/PromotionEditPage";
import { WalletsPage, WalletDetailPage } from "@/modules/payments/pages/wallets";
import PaymentsPage from "@/modules/payments/pages/payments/PaymentsPage";
import PaymentDetailPage from "@/modules/payments/pages/payments/PaymentDetailPage";
import TaxTemplatesPage from "@/modules/payments/pages/taxTemplates/TaxTemplatesPage";
import TaxTemplateDetailPage from "@/modules/payments/pages/taxTemplates/TaxTemplateDetailPage";
import TaxTemplateCreatePage from "@/modules/payments/pages/taxTemplates/TaxTemplateCreatePage";
import TaxTemplateEditPage from "@/modules/payments/pages/taxTemplates/TaxTemplateEditPage";
import InvoicesPage from "@/modules/payments/pages/invoices/InvoicesPage";
import InvoiceDetailPage from "@/modules/payments/pages/invoices/InvoiceDetailPage";
import InvoiceCreatePage from "@/modules/payments/pages/invoices/InvoiceCreatePage";
import InvoiceEditPage from "@/modules/payments/pages/invoices/InvoiceEditPage";
import OrdersPage from "@/modules/payments/pages/orders/OrdersPage";
import OrderDetailPage from "@/modules/payments/pages/orders/OrderDetailPage";
import OrderCreatePage from "@/modules/payments/pages/orders/OrderCreatePage";
import OrderEditPage from "@/modules/payments/pages/orders/OrderEditPage";
// Removing imports for APIs that don't exist in the backend
import NotFound from "@/modules/common/pages/NotFoundPage";

export const paymentRoutes = (
  <Route path="/payment">
    {/* Dashboard */}
    <Route index element={<PaymentManagementPage />} />
    
    {/* Session Billings */}
    <Route path="session-billings">
      <Route index element={<SessionBillingsPage />} />
      <Route path=":id" element={<SessionBillingDetailPage />} />
    </Route>
    
    {/* Pricing Plans */}
    <Route path="plans">
      <Route index element={<PricingPlansPage />} />
      <Route path=":id" element={<PricingPlanDetailPage />} />
      <Route path="create" element={<PricingPlanCreatePage />} />
      <Route path=":id/edit" element={<PricingPlanEditPage />} />
    </Route>
    
    {/* Promotions */}
    <Route path="promotions">
      <Route index element={<PromotionsPage />} />
      <Route path=":id" element={<PromotionDetailPage />} />
      <Route path="create" element={<PromotionCreatePage />} />
      <Route path=":id/edit" element={<PromotionEditPage />} />
    </Route>
    
    {/* Wallets */}
    <Route path="wallets">
      <Route index element={<WalletsPage />} />
      <Route path=":id" element={<WalletDetailPage />} />
    </Route>
    
    {/* Payments */}
    <Route path="payments">
      <Route index element={<PaymentsPage />} />
      <Route path=":id" element={<PaymentDetailPage />} />
      <Route path=":id/refund" element={<PaymentDetailPage />} />
    </Route>
    
    {/* Legacy route - redirect to new payments page */}
    <Route path="transactions" element={<PaymentsPage />} />
    
    {/* Tax Templates */}
    <Route path="tax-templates">
      <Route index element={<TaxTemplatesPage />} />
      <Route path=":id" element={<TaxTemplateDetailPage />} />
      <Route path="create" element={<TaxTemplateCreatePage />} />
      <Route path=":id/edit" element={<TaxTemplateEditPage />} />
    </Route>
    
    {/* Invoices */}
    <Route path="invoices">
      <Route index element={<InvoicesPage />} />
      <Route path=":id" element={<InvoiceDetailPage />} />
      <Route path="create" element={<InvoiceCreatePage />} />
      <Route path=":id/edit" element={<InvoiceEditPage />} />
    </Route>
    
    {/* Orders */}
    <Route path="orders">
      <Route index element={<OrdersPage />} />
      <Route path=":id" element={<OrderDetailPage />} />
      <Route path="create" element={<OrderCreatePage />} />
      <Route path=":id/edit" element={<OrderEditPage />} />
    </Route>
    
    {/* Removed routes for APIs that don't exist in the backend */}
  </Route>
);
