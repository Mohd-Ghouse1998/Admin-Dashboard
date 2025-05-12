import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { OCPIApiService } from '@/modules/ocpi/services';
import { OCPICDR } from '@/modules/ocpi/types/cdr.types';
import { formatDateTime, formatCurrency, formatNumberWithUnit } from '@/utils/formatters';
import { useOCPIRole } from '@/modules/ocpi/contexts/OCPIRoleContext';

const CDRDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useOCPIRole();
  const { id } = useParams();
  const location = window.location;

  // Extract ID from URL if useParams fails (fallback mechanism)
  const extractIdFromPath = React.useCallback(() => {
    try {
      // Extract id from URL pattern '/ocpi/cdrs/:id' or '/ocpi/emsp/cdrs/:id'
      const pathSegments = location.pathname.split('/');
      const idFromPath = pathSegments[pathSegments.length - 1];
      console.log('CDRDetailPage - ID extracted from path:', idFromPath);
      return idFromPath;
    } catch (error) {
      console.error('CDRDetailPage - Error extracting ID from path:', error);
      return null;
    }
  }, [location.pathname]);

  // Use the extracted ID as a fallback if useParams fails
  const effectiveId = id || extractIdFromPath();

  // Fetch CDR detail
  // Determine the expected role based on the URL path
  const determineExpectedRole = React.useCallback(() => {
    if (location.pathname.includes('/ocpi/emsp/')) {
      return 'EMSP';
    } else if (location.pathname.includes('/ocpi/cdrs/')) {
      return 'CPO';
    }
    return null;
  }, [location.pathname]);

  // Fallback to expected role if context role is null
  const effectiveRole = role || determineExpectedRole();
  
  // Log the current path and ID for debugging purposes
  React.useEffect(() => {
    console.log('CDRDetailPage - Current location info:', {
      pathname: location.pathname,
      params: { id },
      effectiveId,
      contextRole: role,
      effectiveRole,
      expectedRole: determineExpectedRole()
    });

    // Log whether API calls are enabled
    console.log('CDRDetailPage - API calls enabled:', !!effectiveId && !!effectiveRole);
  }, [location, id, effectiveId, role, effectiveRole, determineExpectedRole]);
  
  const { data: cdr, isLoading, isError } = useQuery({
    queryKey: ['cdr', effectiveId, effectiveRole],
    queryFn: async () => {
      try {
        if (!effectiveId) {
          throw new Error('No CDR ID available. Cannot fetch CDR details.');
        }

        console.log('CDRDetailPage - Fetching details for ID:', effectiveId, 'with role:', effectiveRole);
        let response;
        
        // Determine which API endpoint to use based on role
        if (effectiveRole === 'CPO') {
          console.log('CDRDetailPage - Using CPO endpoint');
          response = await OCPIApiService.cpo.cdrs.getById(effectiveId);
        } else if (effectiveRole === 'EMSP') {
          console.log('CDRDetailPage - Using EMSP endpoint');
          response = await OCPIApiService.emsp.cdrs.getById(effectiveId);
        } else {
          console.error('CDRDetailPage - No valid role found for API call');
          throw new Error('No valid role (CPO or EMSP) available for fetching CDR details.');
        }
        
        // Validate response
        if (!response || !response.data) {
          throw new Error('Received empty response from API');
        }
        
        console.log('CDRDetailPage - Response received:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching CDR details:', error);
        throw error;
      }
    },
    enabled: !!effectiveId && !!effectiveRole,
    retry: 1, // Only retry once to avoid excessive API calls
  });

  // Handle generating invoice for this CDR
  const handleGenerateInvoice = async () => {
    if (!cdr) return;
    
    try {
      console.log('Generating invoice for CDR:', cdr.id);
      await OCPIApiService.cpo.cdrs.generateInvoice(cdr.id);
      toast({
        title: 'Invoice Generated',
        description: 'Invoice has been generated successfully',
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: 'Invoice Generation Failed',
        description: 'Failed to generate invoice. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle exporting this CDR
  const handleExport = async () => {
    if (!cdr) return;
    
    try {
      console.log('Exporting CDR:', cdr.cdr_id);
      let response;
      if (role === 'CPO') {
        console.log('Using CPO export endpoint');
        response = await OCPIApiService.cpo.cdrs.export({ cdr_id: cdr.cdr_id });
      } else if (role === 'EMSP') {
        console.log('Using EMSP export endpoint');
        response = await OCPIApiService.emsp.cdrs.export({ cdr_id: cdr.cdr_id });
      } else {
        console.log('Using general export endpoint');
        response = await OCPIApiService.cpo.cdrs.export({ cdr_id: cdr.cdr_id });
      }
      
      // Check if the response data is actually a Blob
      console.log('Export response type:', typeof response.data);
      if (!(response.data instanceof Blob)) {
        console.error('Expected Blob but got:', response.data);
        throw new Error('Unexpected response format from export API');
      }
      
      // Create a download link for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cdr-${cdr.cdr_id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: 'Export Successful',
        description: 'CDR has been exported successfully',
      });
    } catch (error) {
      console.error('Error exporting CDR:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export CDR. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle back button
  const handleBack = () => {
    if (role === 'CPO') {
      navigate('/ocpi/cdrs'); // CPO CDRs path
    } else if (role === 'EMSP') {
      navigate('/ocpi/emsp/cdrs'); // EMSP CDRs path
    } else {
      navigate('/ocpi/cdrs'); // Default path
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <p>Loading CDR details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError || !cdr) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-red-500 mb-4">Failed to load CDR details</p>
          <Button onClick={handleBack}>Back to CDRs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CDR Details</h1>
            <p className="text-muted-foreground">
              Detailed information for CDR ID: {cdr.cdr_id}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleGenerateInvoice} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generate Invoice
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charging">Charging Details</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>CDR Overview</CardTitle>
              <CardDescription>
                Basic information about this charge detail record
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">CDR ID</h3>
                  <p className="text-lg">{cdr.cdr_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Session ID</h3>
                  <p className="text-lg">{cdr.session_id || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Start Time</h3>
                  <p className="text-lg">{formatDateTime(cdr.start_datetime)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">End Time</h3>
                  <p className="text-lg">{formatDateTime(cdr.end_datetime)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Duration</h3>
                  <p className="text-lg">
                    {(() => {
                      const start = new Date(cdr.start_datetime);
                      const end = new Date(cdr.end_datetime);
                      const diffMs = end.getTime() - start.getTime();
                      const diffHrs = Math.floor(diffMs / 1000 / 60 / 60);
                      const diffMins = Math.floor((diffMs / 1000 / 60) % 60);
                      return `${diffHrs}h ${diffMins}m`;
                    })()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Location</h3>
                  <p className="text-lg">{cdr.location_id || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">EVSE</h3>
                  <p className="text-lg">{cdr.evse_uid || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Connector</h3>
                  <p className="text-lg">{cdr.connector_id || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Authentication Method</h3>
                  <p className="text-lg">{cdr.auth_method || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Authentication ID</h3>
                  <p className="text-lg">{cdr.auth_id || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Last Updated</h3>
                  <p className="text-lg">{formatDateTime(cdr.last_updated)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Created</h3>
                  <p className="text-lg">{formatDateTime(cdr.created)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="charging">
          <Card>
            <CardHeader>
              <CardTitle>Charging Information</CardTitle>
              <CardDescription>
                Energy consumption and charging details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Total Energy</h3>
                  <p className="text-3xl font-bold">
                    {formatNumberWithUnit(cdr.total_energy, 'kWh', 2)}
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Meter ID</h3>
                  <p className="text-xl">{cdr.meter_id || 'N/A'}</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Duration</h3>
                  <p className="text-xl">
                    {(() => {
                      const start = new Date(cdr.start_datetime);
                      const end = new Date(cdr.end_datetime);
                      const diffMs = end.getTime() - start.getTime();
                      const diffHrs = Math.floor(diffMs / 1000 / 60 / 60);
                      const diffMins = Math.floor((diffMs / 1000 / 60) % 60);
                      return `${diffHrs}h ${diffMins}m`;
                    })()}
                  </p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="rounded-md border">
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-2">Charging Period</h4>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <span>Start</span>
                      <span>{formatDateTime(cdr.start_datetime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End</span>
                      <span>{formatDateTime(cdr.end_datetime)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Cost breakdown and payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Total Cost</h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(cdr.total_cost, cdr.currency || 'USD')}
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Currency</h3>
                  <p className="text-xl">{cdr.currency || 'USD'}</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Cost per kWh</h3>
                  <p className="text-xl">
                    {formatCurrency(
                      cdr.total_energy > 0 ? cdr.total_cost / cdr.total_energy : 0, 
                      cdr.currency || 'USD'
                    )}
                  </p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="rounded-md border">
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-2">Invoice Status</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{cdr.invoice_status || 'Not Invoiced'}</Badge>
                    <Button 
                      onClick={handleGenerateInvoice} 
                      variant="outline" 
                      size="sm"
                    >
                      Generate Invoice
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md border">
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-2">Payment Information</h4>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <span>Party ID</span>
                      <span>{cdr.party_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Country Code</span>
                      <span>{cdr.country_code || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CDRDetailPage;
