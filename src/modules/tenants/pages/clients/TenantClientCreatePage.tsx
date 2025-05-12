
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTenantClients } from '../../hooks/useTenantClients';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ClientForm } from '../../components/ClientForm';
import { useToast } from '@/hooks/use-toast';
import { CreateClientData } from '@/types/tenant';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const TenantClientCreatePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createClient } = useTenantClients();

  const handleSubmit = async (data: CreateClientData) => {
    setIsSubmitting(true);
    
    try {
      const result = await createClient(data);
      
      toast({
        title: 'Success',
        description: 'Client created successfully',
        variant: 'default', // Changed from 'success' to 'default'
      });
      
      // Navigate to the client detail page
      navigate(`/tenants/clients/${result.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred while creating the client';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Create Tenant Client"
      description="Register a new tenant client"
      backButton
      backTo="/tenants/clients"
    >
      <Helmet>
        <title>Create Client | Admin Dashboard</title>
      </Helmet>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Creating a new tenant client will provision a new database schema and administrator account.
          This operation cannot be undone.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardContent className="p-6">
          <ClientForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default TenantClientCreatePage;
