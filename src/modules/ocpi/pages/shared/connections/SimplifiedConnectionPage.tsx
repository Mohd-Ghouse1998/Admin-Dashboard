import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layout/PageLayout';

/**
 * A minimal version of the ConnectionRegistrationPage with no API calls or complex state
 * This helps us identify if the issue is with the component implementation or with routing
 */
const SimplifiedConnectionPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <PageLayout title="Simplified Connection Registration" description="Stripped-down version for testing">
      <Card>
        <CardHeader>
          <CardTitle>Connection Registration (Simplified)</CardTitle>
          <CardDescription>
            This is a minimal version of the connection registration page with no API calls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="font-medium text-blue-700">Test Page</p>
            <p className="text-sm text-blue-600">
              If you can see this page, then the route is working correctly. The issue is likely with the implementation of the full ConnectionRegistrationPage component.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/ocpi/connections')} variant="outline">
              Back to Connections
            </Button>
            <Link to="/ocpi/connections/diagnostic">
              <Button variant="outline" className="w-full">
                Go to Diagnostic Page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default SimplifiedConnectionPage;
