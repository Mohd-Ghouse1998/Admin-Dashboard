import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageLayout } from '@/components/layout/PageLayout';

// Import the actual ConnectionRegistrationPage to test direct rendering
import ConnectionRegistrationPageOriginal from './ConnectionRegistrationPage';

/**
 * DiagnosticPage
 * This page helps diagnose issues with the ConnectionRegistrationPage
 * It attempts to directly render the component and displays any errors
 */
const DiagnosticPage: React.FC = () => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  
  // Test direct component rendering
  const TestRenderer = () => {
    try {
      return <ConnectionRegistrationPageOriginal />;
    } catch (error: any) {
      console.error('Error rendering ConnectionRegistrationPage:', error);
      setRenderError(error.message || 'Unknown error rendering component');
      return null;
    }
  };
  
  return (
    <PageLayout title="Connection Registration Diagnostic" description="Diagnose issues with the connection registration page">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Registration Diagnostic</CardTitle>
            <CardDescription>
              Testing the connection registration page to identify rendering issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Navigation Tests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Test different navigation methods:
                      </p>
                      <div className="flex flex-col space-y-2">
                        <Link to="/ocpi/connections/register">
                          <Button variant="outline" className="w-full justify-start">
                            <span className="truncate">Direct Link to /ocpi/connections/register</span>
                          </Button>
                        </Link>
                        
                        <Link to="../register" relative="path">
                          <Button variant="outline" className="w-full justify-start">
                            <span className="truncate">Relative Link to ../register</span>
                          </Button>
                        </Link>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => window.location.href = '/ocpi/connections/register'}
                        >
                          <span className="truncate">Using window.location.href</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Component Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Test direct component rendering:
                    </p>
                    
                    <Button
                      variant={showOriginal ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setShowOriginal(!showOriginal)}
                    >
                      <span className="truncate">
                        {showOriginal ? "Hide Component" : "Render Component Directly"}
                      </span>
                    </Button>
                    
                    {renderError && (
                      <Alert variant="destructive">
                        <AlertTitle>Render Error</AlertTitle>
                        <AlertDescription>{renderError}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Troubleshooting Steps</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Check browser console for JavaScript errors</li>
                  <li>Verify the route is correctly defined in ocpiRoutes.tsx</li>
                  <li>Ensure all imports/exports are correctly set up</li>
                  <li>Check that the useEffect in ConnectionRegistrationPage isn't causing an early return</li>
                  <li>Verify React Router is correctly handling nested routes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {showOriginal && (
          <div className="border-2 border-dashed border-blue-300 p-4 rounded-md">
            <div className="bg-blue-50 p-2 mb-4 rounded-md">
              <p className="text-blue-800 font-medium">Direct Component Rendering Test</p>
            </div>
            <TestRenderer />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default DiagnosticPage;
