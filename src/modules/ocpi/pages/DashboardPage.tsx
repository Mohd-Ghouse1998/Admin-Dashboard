
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid } from '@/components/ui/grid';

const OCPIDashboardPage = () => {
  const navigate = useNavigate();
  
  const modules = [
    {
      title: 'Parties',
      description: 'Manage OCPI parties for integration with other systems',
      route: '/ocpi/parties',
    },
    {
      title: 'Locations',
      description: 'Manage OCPI locations and their details',
      route: '/ocpi/locations',
    },
    {
      title: 'EVSEs',
      description: 'Manage EVSE stations at your locations',
      route: '/ocpi/evses',
    },
    {
      title: 'Connectors',
      description: 'Manage connectors attached to EVSEs',
      route: '/ocpi/connectors',
    },
    {
      title: 'Sessions',
      description: 'View and manage OCPI charging sessions',
      route: '/ocpi/sessions',
    },
    {
      title: 'CDRs',
      description: 'View and manage Charge Detail Records',
      route: '/ocpi/cdrs',
    },
    {
      title: 'Tokens',
      description: 'Manage OCPI tokens for authentication',
      route: '/ocpi/tokens',
    },
    {
      title: 'Credentials',
      description: 'Manage credentials for OCPI connections',
      route: '/ocpi/credentials',
    },
  ];
  
  return (
    <PageLayout
      title="OCPI Management"
      description="Manage your OCPI integrations and data"
      breadcrumbs={[{ label: 'OCPI Management' }]}
      noCard
    >
      <Helmet>
        <title>OCPI Management</title>
      </Helmet>
      
      <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap={4}>
        {modules.map((module, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={() => navigate(module.route)} 
                variant="outline" 
                className="w-full"
              >
                View {module.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </PageLayout>
  );
};

export default OCPIDashboardPage;
