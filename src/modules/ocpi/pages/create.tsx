
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PartyForm from './PartyForm';

const CreateParty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleCreateSuccess = () => {
    toast({
      title: "Party created",
      description: "The party was created successfully.",
    });
    navigate('/ocpi-management/parties');
  };

  return (
    <PageLayout
      title="Create New Party"
      description="Create a new OCPI party to connect with"
      backButton
      backTo="/ocpi-management/parties"
    >
      <Helmet>
        <title>Create OCPI Party</title>
      </Helmet>
      
      <Card>
        <CardHeader>
          <CardTitle>Party Information</CardTitle>
          <CardDescription>
            Enter the details of the new OCPI party
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PartyForm onSuccess={handleCreateSuccess} />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default CreateParty;
