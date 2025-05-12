
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';

const TenantClientEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <PageLayout
      title="Edit Tenant"
      description={`Edit tenant details for ID: ${id}`}
      backButton
      backTo={`/tenants/clients/${id}`}
    >
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">This page is under development.</p>
        <Button asChild>
          <Link to={`/tenants/clients/${id}`}>Back to Details</Link>
        </Button>
      </div>
    </PageLayout>
  );
};

export default TenantClientEditPage;
