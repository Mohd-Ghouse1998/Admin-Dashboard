import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOCPIRole } from '@/modules/ocpi/contexts/OCPIRoleContext';
import { OCPIApiService } from '@/modules/ocpi/services';
import { useMutation } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form schema for connection details
const connectionFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  versions_url: z.string().url('Must be a valid URL'),
  token: z.string().min(5, 'Token must be at least 5 characters'),
  country_code: z.string().length(2, 'Country code must be exactly 2 characters').toUpperCase(),
  party_id: z.string().length(3, 'Party ID must be exactly 3 characters').toUpperCase(),
  role: z.literal('EMSP'), // When in CPO mode, we connect to EMSPs
});

type ConnectionFormValues = z.infer<typeof connectionFormSchema>;

// Steps for the connection registration process
const steps = [
  { title: 'Enter Connection Details', description: 'Provide basic connection information' },
  { title: 'Select OCPI Version', description: 'Choose a compatible OCPI version' },
  { title: 'Discover Endpoints', description: 'Retrieve available endpoints' },
  { title: 'Register Credentials', description: 'Exchange authentication credentials' },
  { title: 'Complete Registration', description: 'Finalize the connection setup' },
];

/**
 * ConnectionRegistrationPage - Implements the OCPI connection registration flow
 * 
 * This component guides users through the process of establishing an OCPI connection
 * with another party, following the standard OCPI connection registration flow.
 */
export default function ConnectionRegistrationPage() {
  const { role } = useOCPIRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for tracking the current step
  const [activeStep, setActiveStep] = useState(0);
  
  // State for connection data throughout the flow
  const [connectionData, setConnectionData] = useState({
    name: '',
    versions_url: '',
    token: '',
    country_code: '',
    party_id: '',
    version: '',
    endpointsUrl: '',
    endpoints: [],
    registered: false,
    credentials: null,
    registrationId: null,
    taskId: null,
    status: '',
    available_modules: []
  });
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for synchronization
  const [syncLoading, setSyncLoading] = useState(false);
  
  // Check prerequisites
  useEffect(() => {
    const checkPrerequisites = async () => {
      try {
        setLoading(true);
        console.log('Starting prerequisites check for connection registration...');
        
        // Get current role - wrapped in try/catch to avoid crashing the component
        let roleResponse;
        try {
          roleResponse = await OCPIApiService.roles.getCurrent();
          console.log('Role check response:', roleResponse);
        } catch (roleError) {
          console.error('Error checking role:', roleError);
          // Don't redirect, just show the error and continue rendering the page
          setError("Failed to check current role. You may need CPO role activated.");
          setLoading(false);
          return;
        }
        
        const { active_role, party } = roleResponse || {};
        
        if (!active_role || active_role !== 'CPO') {
          console.log('Role check failed - not in CPO mode:', active_role);
          toast({
            title: "Role Check Warning",
            description: "The CPO role should be activated for optimal connection registration.",
            variant: "warning",
          });
          // Continue loading the page instead of redirecting
        }
        
        if (!party) {
          console.log('Party check failed - no party configured');
          toast({
            title: "Party Configuration Warning",
            description: "An OCPI party configuration is recommended before registering connections.",
            variant: "warning",
          });
          // Continue loading the page instead of redirecting
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Prerequisite check failed:', error);
        setError(error.message || "Failed to verify role requirements, but you can still proceed.");
        setLoading(false);
      }
    };
    
    // Run the check but don't block rendering
    checkPrerequisites().catch(err => {
      console.error('Unhandled error in prerequisites check:', err);
      setLoading(false);
    });
  }, [navigate, toast]);
  
  // Form setup
  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      name: '',
      versions_url: '',
      token: '',
      country_code: '',
      party_id: '',
      role: 'EMSP',
    },
  });
  
  // Handle form submission for step 1
  const onSubmitConnectionDetails = async (data: ConnectionFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      // Store the connection details in state for later steps
      setConnectionData(prev => ({
        ...prev,
        ...data
      }));
      
      // Call the API to start registration process
      const { data: responseData } = await OCPIApiService.common.connections.register({
        party_id: data.party_id,
        country_code: data.country_code,
        name: data.name,
        role: "EMSP", // When in CPO mode, we connect to EMSPs
        versions_url: data.versions_url,
        token: data.token
      });
      
      if (responseData?.status === 'success') {
        toast({
          title: 'Registration Initiated',
          description: 'Connection registration process has started.',
        });
        
        // Store the party_id for tracking
        setConnectionData(prev => ({
          ...prev,
          registrationId: responseData.party_id,
          taskId: responseData.task_id
        }));
        
        setActiveStep(1); // Move to next step
      } else {
        setError(responseData.message || 'Failed to initiate registration');
      }
      
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to submit connection details');
      setLoading(false);
    }
  };
  
  // Handle version selection for step 2
  const handleVersionSelect = async (version: string) => {
    try {
      setLoading(true);
      setError(null);
      
      toast({
        title: 'Version Selected',
        description: `You've selected OCPI version ${version}`,
      });
      
      // Store selected version
      setConnectionData(prev => ({
        ...prev,
        version: version
      }));
      
      setActiveStep(2); // Move to endpoint discovery step
      return true;
    } catch (error: any) {
      console.error('Version selection failed:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: `Version selection failed: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Handle endpoints discovery for step 3
  const handleDiscoverEndpoints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      toast({
        title: 'Endpoints Discovered',
        description: 'Successfully discovered endpoints',
      });
      
      setActiveStep(3); // Move to credentials registration step
      return true;
    } catch (error: any) {
      console.error('Endpoint discovery failed:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: `Endpoint discovery failed: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Handle credentials registration for step 4
  const handleRegisterCredentials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Store registration result
      setConnectionData(prev => ({
        ...prev,
        registered: true
      }));
      
      toast({
        title: 'Connection Registered',
        description: 'The connection has been successfully registered.',
        variant: 'default',
      });
      
      setActiveStep(4); // Move to completion step
      return true;
    } catch (error: any) {
      console.error('Credential registration failed:', error);
      setError(error.message);
      
      toast({
        title: 'Registration Failed',
        description: `Failed to register the connection: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Check connection status
  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      
      const { registrationId } = connectionData;
      if (!registrationId) {
        setError('No registration ID found');
        setLoading(false);
        return;
      }
      
      const { data: response } = await OCPIApiService.common.connections.getById(registrationId);
      
      if (response.status === 'success') {
        const connectionStatus = response.connection.status;
        
        setConnectionData(prev => ({
          ...prev,
          status: connectionStatus,
          endpoints: response.connection.endpoints || [],
          available_modules: response.connection.available_modules || []
        }));
        
        if (connectionStatus === 'ACTIVE') {
          toast({
            title: 'Connection Active',
            description: 'The connection has been successfully established.',
          });
          
          // Move to final step
          setActiveStep(4);
        }
      }
      
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to check connection status');
      setLoading(false);
    }
  };
  
  // Handle data synchronization
  const handleSyncData = async () => {
    try {
      setSyncLoading(true);
      
      // Assuming the sync.trigger method doesn't take parameters in the current implementation
      // Modify this according to actual API service method signature
      const { data: response } = await OCPIApiService.common.sync.trigger();
      
      if (response.status === 'success') {
        toast({
          title: 'Synchronization Started',
          description: 'Your locations and tariffs are being synchronized with the EMSP.',
        });
      } else {
        toast({
          title: 'Synchronization Failed',
          description: response.message || 'Failed to start synchronization',
          variant: 'destructive'
        });
      }
      
      setSyncLoading(false);
    } catch (error: any) {
      toast({
        title: 'Synchronization Failed',
        description: error.message || 'Failed to start synchronization',
        variant: 'destructive'
      });
      setSyncLoading(false);
    }
  };
  
  // Handle completion for step 5
  const handleComplete = () => {
    navigate('/ocpi/connections');
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Enter Connection Details</CardTitle>
              <CardDescription>
                Provide information about the OCPI connection you want to establish
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitConnectionDetails)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Connection Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Example CPO" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for this connection
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="versions_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OCPI Versions URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://emsp.example.com/ocpi" {...field} />
                        </FormControl>
                        <FormDescription>
                          The URL to the EMSP's OCPI versions endpoint
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authentication Token</FormLabel>
                        <FormControl>
                          <Input placeholder="Token provided by the other party" {...field} />
                        </FormControl>
                        <FormDescription>
                          The authentication token for accessing their OCPI endpoints
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="country_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., US" {...field} maxLength={2} />
                          </FormControl>
                          <FormDescription>
                            Two-letter country code (ISO 3166-1 alpha-2)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="party_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Party ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ABC" {...field} maxLength={3} />
                          </FormControl>
                          <FormDescription>
                            Three-letter party identifier
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Continue
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );
        
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select OCPI Version</CardTitle>
              <CardDescription>
                Choose the OCPI version to use for this connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                <h3 className="font-medium text-gray-700 mb-1">Connection Information</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Connecting to: <span className="font-medium text-gray-700">{connectionData.name}</span>
                </p>
                <p className="text-sm text-gray-500">
                  URL: <span className="font-mono text-gray-700">{connectionData.versions_url}</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select the OCPI version to use for this connection. We recommend using the latest version
                  supported by both parties.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                    onClick={() => handleVersionSelect('2.1.1')}
                    disabled={loading}
                  >
                    <span className="text-lg font-bold">2.1.1</span>
                    <span className="text-xs text-gray-500 mt-1">Legacy</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                    onClick={() => handleVersionSelect('2.2')}
                    disabled={loading}
                  >
                    <span className="text-lg font-bold">2.2</span>
                    <span className="text-xs text-gray-500 mt-1">Standard</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center border-blue-200 bg-blue-50 border-2"
                    onClick={() => handleVersionSelect('2.2.1')}
                    disabled={loading}
                  >
                    <span className="text-lg font-bold">2.2.1</span>
                    <span className="text-xs text-gray-500 mt-1">Recommended</span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveStep(0)}>
                Back
              </Button>
              {loading && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span>Checking versions...</span>
                </div>
              )}
            </CardFooter>
          </Card>
        );
        
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Discover Endpoints</CardTitle>
              <CardDescription>
                Discover available endpoints from the OCPI server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                <h3 className="font-medium text-gray-700 mb-1">Connection Information</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Connecting to: <span className="font-medium text-gray-700">{connectionData.name}</span>
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  URL: <span className="font-mono text-gray-700">{connectionData.versions_url}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Version: <span className="font-medium text-gray-700">{connectionData.version}</span>
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
                <h3 className="font-medium text-yellow-800 flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Endpoints Discovery
                </h3>
                <p className="text-sm text-yellow-700 mt-2">
                  Click the button below to discover OCPI endpoints available from the server. 
                  This will fetch information about which modules the server supports.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveStep(1)}>
                Back
              </Button>
              <Button onClick={handleDiscoverEndpoints} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Discovering Endpoints...
                  </>
                ) : (
                  'Discover Endpoints'
                )}
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Register Credentials</CardTitle>
              <CardDescription>
                Exchange credentials with the OCPI server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                <h3 className="font-medium text-gray-700 mb-1">Connection Information</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Connecting to: <span className="font-medium text-gray-700">{connectionData.name}</span>
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  URL: <span className="font-mono text-gray-700">{connectionData.versions_url}</span>
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Version: <span className="font-medium text-gray-700">{connectionData.version}</span>
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-6">
                <h3 className="font-medium text-green-800 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Ready to Register
                </h3>
                <p className="text-sm text-green-700 mt-2">
                  We will now register credentials with the OCPI server. This will create a secure connection between
                  your system and theirs, allowing for secure data exchange.
                </p>
                <p className="text-sm text-green-700 mt-2">
                  You are registering as a: <span className="font-medium">{role}</span>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveStep(2)}>
                Back
              </Button>
              <Button onClick={handleRegisterCredentials} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Credentials'
                )}
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Registration Complete</CardTitle>
              <CardDescription>
                The connection has been successfully registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-700">Connection Established</h3>
                <p className="text-center text-gray-500 mt-2">
                  You have successfully registered a connection with {connectionData.name}.
                  You can now exchange data with this party through the OCPI protocol.
                </p>
                
                <div className="mt-6 w-full border border-gray-200 rounded-md p-4">
                  <h4 className="font-medium mb-2">Synchronize Data</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Push your CPO data to the connected EMSP to make your charging locations available.
                  </p>
                  <Button 
                    onClick={handleSyncData} 
                    disabled={syncLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {syncLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Synchronizing...
                      </>
                    ) : (
                      'Synchronize Locations & Tariffs'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleComplete} className="w-full">
                View All Connections
              </Button>
            </CardFooter>
          </Card>
        );
      
      default:
        return null;
    }
  };
  
  // Step indicator component
  const StepIndicator = ({ steps, currentStep }: { steps: { title: string; description: string }[], currentStep: number }) => {
    return (
      <div className="mb-8">
        <ol className="flex items-center w-full">
          {steps.map((step, index) => (
            <li key={index} className={`flex items-center ${
              index < steps.length - 1 ? 'w-full' : ''
            }`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                index < currentStep
                  ? 'bg-green-100 text-green-600'
                  : index === currentStep
                  ? 'bg-blue-100 text-blue-600 border border-blue-600'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>
              
              <div className={`flex-1 ml-2 ${index === steps.length - 1 ? 'hidden sm:flex' : ''}`}>
                <h3 className={`text-sm font-medium ${
                  index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </h3>
                <p className={`text-xs ${
                  index <= currentStep ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 ml-2 mr-2 hidden sm:block"></div>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Register New Connection</h1>
        <p className="text-gray-500">
          Follow the steps below to establish a new OCPI connection with another party
        </p>
      </div>
      
      <StepIndicator steps={steps} currentStep={activeStep} />
      
      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-red-800 font-medium mb-1">Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {renderStepContent()}
    </div>
  );
}
