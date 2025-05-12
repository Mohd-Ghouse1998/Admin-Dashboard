import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { OCPIApiService } from '@/modules/ocpi/services';
import { OCPICDR } from '@/modules/ocpi/types/ocpiTypes';
// Define CDRQueryParams here since it's no longer available from the removed file
interface CDRQueryParams {
  page?: number;
  page_size?: number;
  from_date?: string;
  to_date?: string;
  search?: string;
  ordering?: string;
  session_id?: string;
  cdr_id?: string;
  status?: string;
  format?: string;
  location_id?: string;
  start_date?: string;
  end_date?: string;
}
import { formatDateTime, formatCurrency, formatNumberWithUnit } from '@/utils/formatters';
import { useOCPIRole } from '@/modules/ocpi/contexts/OCPIRoleContext';

const EnhancedCPOCDRsPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { role } = useOCPIRole();
  
  // State for filters
  const [filters, setFilters] = useState<CDRQueryParams>({
    page: 1,
    page_size: 10,
  });
  
  // Handle filter changes
  const handleFilterChange = (key: keyof CDRQueryParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      page: 1,
      page_size: 10,
    });
  };
  
  // Fetch CDRs based on role and filters
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cdrs', filters, role],
    queryFn: async () => {
      try {
        let response;
        if (role === 'CPO') {
          response = await OCPIApiService.cpo.cdrs.getAll(filters);
        } else if (role === 'EMSP') {
          response = await OCPIApiService.emsp.cdrs.getAll(filters);
        } else {
          response = await OCPIApiService.cpo.cdrs.getAll(filters);
        }
        return response.data;
      } catch (error) {
        console.error('Error fetching CDRs:', error);
        throw error;
      }
    },
    enabled: true,
  });

  // Handle exporting CDRs
  const handleExport = async () => {
    try {
      let response;
      if (role === 'CPO') {
        response = await OCPIApiService.cpo.cdrs.export(filters);
      } else if (role === 'EMSP') {
        response = await OCPIApiService.emsp.cdrs.export(filters);
      } else {
        response = await OCPIApiService.cpo.cdrs.export(filters);
      }
      
      // Create a download link for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cdrs-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: 'Export Successful',
        description: 'CDRs have been exported successfully',
      });
    } catch (error) {
      console.error('Error exporting CDRs:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export CDRs. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle generating invoice for a CDR
  const handleGenerateInvoice = async (cdrId: string | number) => {
    try {
      await OCPIApiService.cpo.cdrs.generateInvoice(cdrId);
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

  // Define columns for the data table
  // Helper to safely access properties
  const safeGet = (obj: any, path: string, fallback: any = 'N/A') => {
    if (!obj) return fallback;
    const props = path.split('.');
    let result = obj;
    for (const prop of props) {
      if (result === undefined || result === null) return fallback;
      result = result[prop];
    }
    return result !== undefined && result !== null ? result : fallback;
  };
  
  // Log the first result for debugging
  if (data?.results && data.results.length > 0) {
    console.log('Sample CDR data structure:', data.results[0]);
  }
  
  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (data: any) => <span>{data?.id || 'N/A'}</span>,
    },
    {
      accessorKey: 'cdr_id',
      header: 'CDR ID',
      cell: (data: any) => <span>{data?.cdr_id || 'N/A'}</span>,
    },
    {
      accessorKey: 'session_id',
      header: 'Session ID',
      cell: (data: any) => <span>{data?.session_id || 'N/A'}</span>,
    },
    {
      accessorKey: 'start_datetime',
      header: 'Start Time',
      cell: (data: any) => (
        <span>{formatDateTime(data?.start_datetime || '')}</span>
      ),
    },
    {
      accessorKey: 'end_datetime',
      header: 'End Time',
      cell: (data: any) => (
        <span>{formatDateTime(data?.end_datetime || '')}</span>
      ),
    },
    {
      accessorKey: 'total_energy',
      header: 'Energy (kWh)',
      cell: (data: any) => (
        <span>{formatNumberWithUnit(data?.total_energy || 0, 'kWh', 2)}</span>
      ),
    },
    {
      accessorKey: 'total_cost',
      header: 'Total Cost',
      cell: (data: any) => {
        const cost = data?.total_cost;
        const currency = data?.currency || 'USD';
        return (
          <span>
            {typeof cost === 'number' 
              ? formatCurrency(cost, currency) 
              : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'cdr_location',
      header: 'Location',
      cell: (data: any) => <span>{data?.cdr_location?.name || 'N/A'}</span>,
    },
    {
      accessorKey: 'auth_method',
      header: 'Auth Method',
      cell: (data: any) => <span>{data?.auth_method || 'N/A'}</span>,
    },
    {
      accessorKey: 'actions', // Add an accessorKey to fix the type error
      id: 'actions',
      header: 'Actions',
      cell: (data: any) => {
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                if (!data?.id) {
                  console.error('Cannot navigate: CDR ID is missing');
                  toast({
                    title: 'Navigation Error',
                    description: 'Could not view CDR details: ID is missing',
                    variant: 'destructive'
                  });
                  return;
                }
                
                console.log('Navigating to CPO CDR detail:', data.id);
                // Ensure we use the correct role-specific path
                navigate(`/ocpi/cdrs/${data.id}`);
              }}
              title="View CDR Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleGenerateInvoice(data?.id)}
              title="Generate Invoice"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const params: CDRQueryParams = { cdr_id: data?.cdr_id };
                if (role === 'CPO') {
                  OCPIApiService.cpo.cdrs.export(params);
                } else if (role === 'EMSP') {
                  OCPIApiService.emsp.cdrs.export(params);
                } else {
                  OCPIApiService.cpo.cdrs.export(params);
                }
              }}
              title="Export CDR"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ] as any[];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CDR Management</h1>
          <p className="text-muted-foreground">
            View and manage Charge Detail Records
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CDRs
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">CDR List</TabsTrigger>
          <TabsTrigger value="filter">Filters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="filter">
          <Card>
            <CardHeader>
              <CardTitle>Filter CDRs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by CDR ID, Session ID, etc."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cdr_id">CDR ID</Label>
                <Input
                  id="cdr_id"
                  placeholder="Enter CDR ID"
                  value={filters.cdr_id || ''}
                  onChange={(e) => handleFilterChange('cdr_id', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="session_id">Session ID</Label>
                <Input
                  id="session_id"
                  placeholder="Enter Session ID"
                  value={filters.session_id || ''}
                  onChange={(e) => handleFilterChange('session_id', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location_id">Location ID</Label>
                <Input
                  id="location_id"
                  placeholder="Enter Location ID"
                  value={filters.location_id || ''}
                  onChange={(e) => handleFilterChange('location_id', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <DatePicker
                  date={filters.start_date ? new Date(filters.start_date) : undefined}
                  onSelect={(date) => handleFilterChange('start_date', date ? date.toISOString().split('T')[0] : undefined)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>End Date</Label>
                <DatePicker
                  date={filters.end_date ? new Date(filters.end_date) : undefined}
                  onSelect={(date) => handleFilterChange('end_date', date ? date.toISOString().split('T')[0] : undefined)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="ordering">Sort By</Label>
                <select
                  id="ordering"
                  className="p-2 border rounded-md"
                  value={filters.ordering || ''}
                  onChange={(e) => handleFilterChange('ordering', e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="start_datetime">Start Time (Asc)</option>
                  <option value="-start_datetime">Start Time (Desc)</option>
                  <option value="end_datetime">End Time (Asc)</option>
                  <option value="-end_datetime">End Time (Desc)</option>
                  <option value="total_cost">Total Cost (Asc)</option>
                  <option value="-total_cost">Total Cost (Desc)</option>
                  <option value="total_energy">Total Energy (Asc)</option>
                  <option value="-total_energy">Total Energy (Desc)</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="page_size">Items Per Page</Label>
                <select
                  id="page_size"
                  className="p-2 border rounded-md"
                  value={filters.page_size || 10}
                  onChange={(e) => handleFilterChange('page_size', parseInt(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              
              <div className="grid gap-2 items-end">
                <Button onClick={resetFilters} variant="outline">Reset Filters</Button>
              </div>
              
              <div className="grid gap-2 items-end">
                <Button onClick={() => refetch()}>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardContent className="p-6">
              {/* Add debugging to check what data we're getting */}
              {(() => { data?.results && console.log('CDRs data received:', data.results); return null; })()}
              <DataTable
                columns={columns}
                data={data?.results || []}
                isLoading={isLoading}
                keyField={(row) => row?.id?.toString() || Math.random().toString()}
                pagination={{
                  currentPage: (filters.page || 1),
                  totalPages: data ? Math.ceil(data.count / (filters.page_size || 10)) : 1,
                  pageSize: filters.page_size || 10,
                  onPageChange: (page) => handleFilterChange('page', page),
                  onPageSizeChange: (size) => handleFilterChange('page_size', size),
                }}
              />
              {isError && (
                <div className="text-center p-4 text-red-500">
                  Failed to load CDRs. Please try again.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCPOCDRsPage;
