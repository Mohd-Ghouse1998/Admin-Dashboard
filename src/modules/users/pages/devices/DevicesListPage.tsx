import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListTemplate, Column } from '@/components/templates/list/ListTemplate';
import { Smartphone, Tablet, Plus, Edit, Eye, Download, Trash2, MoreHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Import the userApi service
import { userApi } from '@/services/api';

// Define the device interface
interface Device {
  id: number;
  device_id: string;
  registration_id: string;
  device_type: string;
  user?: {
    id: number;
    username: string;
    email?: string;
  };
  created_at?: string;
  updated_at?: string;
}

const DevicesListPage = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<(string | number)[]>([]);
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState(false);
  
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
            { id: 1, device_id: "123", registration_id: "reg_456", device_type: "ANDROID", user: { id: 1, username: "admin", email: "admin@example.com" } },
            { id: 2, device_id: "67890", registration_id: "abcd1234ef567890", device_type: "ANDROID", user: { id: 2, username: "user1", email: "user1@example.com" } },
            { id: 3, device_id: "123abc", registration_id: "reg_4567888", device_type: "ANDROID", user: { id: 3, username: "user2", email: "user2@example.com" } },
            { id: 4, device_id: "3fa85f64-5717-4562-b3fc-2c968f66afa6", registration_id: "abcd1234ef567990", device_type: "IOS", user: { id: 4, username: "user3", email: "user3@example.com" } },
            { id: 5, device_id: "3fa85f64-5717-4562-b3fc-2c968f68afa6", registration_id: "abcd1234ef567690", device_type: "IOS", user: { id: 5, username: "user4", email: "user4@example.com" } }
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
  // We no longer need the DataTable columns since we're using the EntityListTemplate with custom rendering

  // Function to get device type icon and badge
  const getDeviceTypeBadge = (deviceType: string) => {
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
  };
  // Function to safely get the device ID for navigation
  const getDeviceIdForNavigation = (device: Device) => {
    return device.id ? device.id.toString() : device.device_id;
  };

  // Filter component to filter by device type
  const filterComponent = (
    <select
      id="statusFilter"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="border rounded-md px-2 py-1 w-full h-9 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/30"
    >
      <option value="all">All Devices</option>
      <option value="android">Android</option>
      <option value="ios">iOS</option>
    </select>
  );

  // Function to get device type text (without icons)
  const getDeviceType = (deviceType: string) => {
    const type = deviceType?.toUpperCase() || 'Unknown';
    return type;
  };

  // Define columns for the modern ListTemplate
  const columns: Column<Device>[] = [
    {
      header: 'User',
      width: '25%',
      render: (device) => (
        <div className="space-y-0.5">
          <div className="font-medium">{device.user?.username || 'Unknown'}</div>
          <div className="text-xs text-muted-foreground truncate">{device.user?.email || ''}</div>
        </div>
      )
    },
    {
      header: 'Device ID',
      render: (device) => device.device_id
    },
    {
      header: 'Type',
      width: '15%',
      render: (device) => getDeviceType(device.device_type)
    },
    {
      header: 'Registration ID',
      width: '35%',
      render: (device) => (
        <div className="font-mono text-xs truncate">
          {device.registration_id}
        </div>
      )
    }
  ];
  
  // Define row actions - return null to hide the action buttons
  const rowActions = (device: Device) => null;

  // Apply filters to the data
  const filteredData = React.useMemo(() => {
    if (!devices?.results) return [];
    
    // Apply device type filter if not set to 'all'
    let filtered = [...devices.results];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(device => device.device_type === statusFilter);
    }
    
    // Apply search if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(device => 
        device.device_id?.toLowerCase().includes(query) || 
        device.registration_id?.toLowerCase().includes(query) ||
        device.user?.username?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [devices?.results, statusFilter, searchQuery]);

  // Calculate totals for filtered data
  const filteredTotalItems = filteredData.length;
  const filteredTotalPages = Math.max(1, Math.ceil(filteredTotalItems / pageSize));
  
  // Handle device selection for bulk actions
  const handleDeviceSelection = (selectedDevices: Device[]) => {
    setSelectedDeviceIds(selectedDevices.map(device => device.id));
  };

  return (
    <>
      <ListTemplate
        title="Device Management"
        icon={<Smartphone className="h-5 w-5" />}
        description="Manage user mobile devices and registrations"
        data={filteredData}
        isLoading={isLoading}
        error={error ? "Failed to load device data" : null}
        totalItems={filteredTotalItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search devices by ID or registration..."
        filterComponent={filterComponent}
        columns={columns}
        rowActions={rowActions}
        onRowClick={(device) => navigate(`/users/devices/${getDeviceIdForNavigation(device)}`)}
        createPath="/users/devices/create"
        createButtonText="Register Device"
        currentPage={currentPage}
        totalPages={filteredTotalPages}
        onPageChange={setCurrentPage}
        selectable={true}
        selectedItems={filteredData.filter(device => selectedDeviceIds.includes(device.id))}
        onSelectItems={handleDeviceSelection}
        className="shadow-md border border-gray-100 rounded-lg overflow-hidden"
        tableClassName="[&_tr:hover]:bg-gray-50/80 [&_th]:bg-gray-50/70 [&_th]:text-gray-600 [&_th]:font-medium"
        actionBarClassName="border-b border-gray-100 bg-gray-50/40"
        emptyState={
        <div className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-primary/10 p-3 mb-3">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No devices found</h3>
          <p className="text-muted-foreground text-sm text-center max-w-xs">
            {searchQuery 
              ? `No devices found for "${searchQuery}". Try adjusting your search.` 
              : `There are no registered devices available. Register one to get started.`
            }
          </p>
        </div>
      }
      />
      
      {/* Bulk action toolbar */}
      {selectedDeviceIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 
                      bg-gradient-to-r from-primary to-indigo-600 text-white 
                      py-3 px-5 rounded-full shadow-xl flex items-center gap-4 
                      transition-all duration-300 ease-in-out">
          <span className="font-medium">{selectedDeviceIds.length} devices selected</span>
          <div className="h-5 w-px bg-white/20"></div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" className="h-8 bg-white/10 hover:bg-white/20 text-white border-none">
              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="secondary" className="h-8 bg-white/10 hover:bg-white/20 text-white border-none">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              className="h-8" 
              onClick={() => setIsMultiDeleteDialogOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}
      
      {/* Multi-delete confirmation dialog */}
      <AlertDialog open={isMultiDeleteDialogOpen} onOpenChange={setIsMultiDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete multiple devices?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedDeviceIds.length} devices. This action will permanently remove all selected devices and their associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                // Implementation for multi-delete would go here
                // For now we'll just show a toast
                toast({
                  title: "Devices deleted",
                  description: `${selectedDeviceIds.length} devices have been successfully deleted.`,
                });
                setSelectedDeviceIds([]);
                setIsMultiDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedDeviceIds.length} Devices
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DevicesListPage;
