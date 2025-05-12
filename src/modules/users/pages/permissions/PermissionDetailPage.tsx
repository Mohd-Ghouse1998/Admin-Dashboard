
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { permissionService } from '@/services/permissionService';

const PermissionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  
  const {
    data: permission,
    isLoading,
    error
  } = useQuery({
    queryKey: ['permission', id],
    queryFn: () => {
      if (!accessToken || !id) {
        throw new Error("Missing authorization or permission ID");
      }
      
      return permissionService.getPermissionById(accessToken, id);
    },
    enabled: !!accessToken && !!id,
  });
  
  return (
    <PageLayout
      title="Permission Details"
      description="View permission information"
      backButton
      backTo="/users/permissions"
    >
      <Helmet>
        <title>Permission Details | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load permission details'}
          </AlertDescription>
        </Alert>
      )}
      
      <Button variant="outline" asChild className="mb-4">
        <Link to="/users/permissions">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Permissions
        </Link>
      </Button>
      
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      ) : permission ? (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="text-lg font-semibold">{permission.name}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Code</h3>
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  {permission.codename}
                </code>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Content Type</h3>
                <p>{permission.content_type_name}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">App Label</h3>
                <Badge variant="outline">{permission.content_type_app}</Badge>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Model</h3>
                <Badge variant="outline">{permission.content_type_model}</Badge>
              </div>
              
              {permission.user_count !== undefined && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Used By</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{permission.user_count || 0} Users</Badge>
                      <Badge variant="secondary">{permission.group_count || 0} Groups</Badge>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Permission not found or you don't have access to view it.</AlertDescription>
        </Alert>
      )}
    </PageLayout>
  );
};

export default PermissionDetailPage;
