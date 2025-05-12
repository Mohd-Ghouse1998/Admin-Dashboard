
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const MyPermissionsPage = () => {
  const { accessToken } = useAuth();
  
  const {
    data: permissions,
    isLoading,
    error
  } = useQuery({
    queryKey: ['myPermissions'],
    queryFn: () => permissionService.getMyPermissions(accessToken),
    enabled: !!accessToken,
  });
  
  return (
    <PageLayout
      title="My Permissions"
      description="View your current permissions in the system"
    >
      <Helmet>
        <title>My Permissions | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load permissions'}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Your Permissions</h3>
          
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : permissions?.permissions && permissions.permissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {permissions.permissions.map((permission, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {permission}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">You don't have any specific permissions assigned.</p>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default MyPermissionsPage;
