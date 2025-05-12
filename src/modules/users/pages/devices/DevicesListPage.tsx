import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Search, Eye, Edit, Plus, Smartphone, Tablet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Column } from '@/components/ui/data-table/types';

// Import the userApi service
import { userApi } from '@/services/api';

// Define the device interface
interface Device {
  id: number;
  device_id: string;
  registration_id: string;
  device_type: string;
}

const DevicesListPage = () => {
  const { accessToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Create a function for debug logging
  const logDebug = (message: string, data?: any) => {
    console.log(`🔹 ${message}`, data || '');
  };
  
  const {
    data: devices,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['devices', searchQuery, currentPage],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      try {
        logDebug('Fetching devices with token', accessToken ? `${accessToken.substring(0, 10)}...` : 'No token');
        
        // Use the userApi service to get devices
        const response = await userApi.getDevices(accessToken);
        logDebug('API Response for devices', response);
        
        // If the API doesn't return data in the expected format, provide a default
        return {
          count: response?.count || 0,
          next: response?.next || null,
          previous: response?.previous || null,
          results: response?.results || []
        };
      } catch (err) {
        console.error('Failed to fetch devices:', err);
        
        // For development purposes, return mock data on error
        logDebug('Using mock data for debugging');
        return {
          count: 5,
          next: null,
          previous: null,
          results: [
            { device_id: "123", registration_id: "reg_456", device_type: "ANDROID" },
            { device_id: "67890", registration_id: "abcd1234ef567890", device_type: "ANDROID" },
            { device_id: "123abc", registration_id: "reg_4567888", device_type: "ANDROID" },
            { device_id: "3fa85f64-5717-4562-b3fc-2c968f66afa6", registration_id: "abcd1234ef567990", device_type: "IOS" },
            { device_id: "3fa85f64-5717-4562-b3fc-2c968f68afa6", registration_id: "abcd1234ef567690", device_type: "IOS" }
          ]
        };
      }
    },
    enabled: !!accessToken,
  });

  // Compute pagination values
  const pageSize = 10;
  const totalItems = devices?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Define the columns for the data table
  const columns = [
    {
      accessorKey: 'device_id',
      header: 'Device ID',
      cell: (row: Device) => (
        <div className="font-medium">{row.device_id}</div>
      ),
    },
    {
      accessorKey: 'device_type',
      header: 'Type',
      cell: (row: Device) => {
        const deviceType = row.device_type;
        return (
          <Badge variant={deviceType === 'ANDROID' ? 'default' : 'secondary'}>
            {deviceType === 'ANDROID' ? (
              <Smartphone className="mr-1 h-3 w-3" />
            ) : (
              <Tablet className="mr-1 h-3 w-3" />
            )}
            {deviceType}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'registration_id',
      header: 'Registration ID',
      cell: (row: Device) => {
        const regId = row.registration_id;
        // Truncate long registration IDs
        return (
          <div className="font-mono text-xs">
            {regId.length > 20 ? `${regId.substring(0, 18)}...` : regId}
          </div>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: Device) => {
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/users/devices/${row.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/users/devices/${row.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  return (
    <PageLayout
      title="Devices"
      description="Manage user mobile devices and registrations"
      actions={
        <Button asChild>
          <Link to="/users/devices/create">
            <Plus className="h-4 w-4 mr-2" />
            Register Device
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>Devices | Electric Flow Admin Portal</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load devices'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search devices..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={devices?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              pageSize: pageSize,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No devices found."
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default DevicesListPage;
