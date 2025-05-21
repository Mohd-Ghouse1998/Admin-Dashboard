import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Zap, Battery } from 'lucide-react';
import { useChargers } from '@/modules/chargers/hooks/useChargers';

// UI Components
import { ListTemplate } from '@/components/templates/list/ListTemplate';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const ChargersListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for pagination, search, and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Fetch all chargers data
  const { 
    data: chargersData,
    isLoading, 
    error,
    refetch,
    deleteCharger
  } = useChargers('');
  
  // Extract and normalize the charger data from the API response
  const normalizedChargers = useMemo(() => {
    if (!chargersData) return [];
    
    // Helper function to extract properties from different API response formats
    const extractChargerData = (data: any) => {
      if (Array.isArray(data)) {
        return data.map(charger => ({
          id: charger.id || Math.random().toString(),
          ...charger
        }));
      } else if (data.results?.features) {
        return data.results.features.map((feature: any) => ({
          id: feature.id || feature.properties?.id || Math.random().toString(),
          ...feature.properties
        }));
      } else if (data.features) {
        return data.features.map((feature: any) => ({
          id: feature.id || feature.properties?.id || Math.random().toString(),
          ...feature.properties
        }));
      } else if (data.results) {
        return data.results.map((item: any) => ({
          id: item.id || Math.random().toString(),
          ...item
        }));
      }
      return [];
    };
    
    return extractChargerData(chargersData);
  }, [chargersData]);
  
  // Apply search and filters to the data
  const filteredChargers = useMemo(() => {
    return normalizedChargers.filter((charger: any) => {
      // 1. Apply search filter first
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          charger.name,
          charger.charger_id,
          charger.address,
          charger.vendor,
          charger.model,
          charger.type
        ];
        
        // If no field matches the search query, exclude this charger
        const matchesSearch = searchFields.some(field => 
          field && String(field).toLowerCase().includes(query)
        );
        
        if (!matchesSearch) return false;
      }
      
      // 2. Apply status filter
      if (statusFilter !== 'all') {
        // Handle online/offline status
        if (statusFilter === 'online' && charger.online === false) return false;
        if (statusFilter === 'offline' && charger.online === true) return false;
        
        // Handle connector status filters
        if (['available', 'charging', 'faulted', 'unavailable'].includes(statusFilter)) {
          // If no connectors or empty connectors array, exclude this charger for connector status filters
          if (!charger.connectors || !Array.isArray(charger.connectors) || charger.connectors.length === 0) {
            return false;
          }
          
          // Check if any connector matches the status (case insensitive)
          const hasMatchingConnector = charger.connectors.some((connector: any) => 
            connector.status && connector.status.toLowerCase() === statusFilter.toLowerCase()
          );
          
          if (!hasMatchingConnector) return false;
        }
      }
      
      // 3. Apply type filter
      if (typeFilter !== 'all' && charger.type) {
        // Case insensitive comparison
        const chargerTypeUpper = charger.type.toUpperCase();
        const filterTypeUpper = typeFilter.toUpperCase();
        
        if (chargerTypeUpper !== filterTypeUpper) return false;
      }
      
      // If passed all filters, include this charger
      return true;
    });
  }, [normalizedChargers, searchQuery, statusFilter, typeFilter]);
  
  // Calculate pagination details
  const totalItems = filteredChargers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Paginated data slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredChargers.slice(start, end);
  }, [filteredChargers, currentPage, pageSize]);
  
  // Reset to page 1 when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter]);
  
  // Define filter UI components and options
  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Online', value: 'online' },
    { label: 'Offline', value: 'offline' },
    { label: 'Available', value: 'available' },
    { label: 'Charging', value: 'charging' },
    { label: 'Faulted', value: 'faulted' },
  ];
  
  const typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'AC', value: 'AC' },
    { label: 'DC', value: 'DC' },
    { label: 'Both', value: 'BOTH' },
  ];
  
  // Define filter component
  const filterComponent = (
    <div className="flex gap-2">
      <select
        id="status-filter"
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1); // Reset to first page when filter changes
        }}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background"
      >
        <option value="all">All Status</option>
        <option value="online">Online</option>
        <option value="offline">Offline</option>
        <option value="available">Available</option>
        <option value="charging">Charging</option>
      </select>
      
      <select
        id="type-filter"
        value={typeFilter}
        onChange={(e) => {
          setTypeFilter(e.target.value);
          setCurrentPage(1); // Reset to first page when filter changes
        }}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background"
      >
        <option value="all">All Types</option>
        <option value="AC">AC</option>
        <option value="DC">DC</option>
      </select>
    </div>
  );
  
  // Handle charger deletion
  const handleDeleteCharger = async (chargerId: string) => {
    if (confirm('Are you sure you want to delete this charger?')) {
      try {
        await deleteCharger(chargerId);
        toast({
          title: "Success",
          description: "Charger deleted successfully",
        });
        refetch();
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete charger",
        });
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Chargers | Electric Flow Admin Portal</title>
      </Helmet>
      
      <ListTemplate
        title="Charger Management"
        icon={<Zap className="h-5 w-5" />}
        description="Manage EV charging stations across all locations"
        
        // Data props
        data={paginatedData}
        isLoading={isLoading}
        error={error ? (error instanceof Error ? error : new Error("Failed to load chargers")) : null}
        
        // Search props
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by name, ID, or address..."
        
        // Additional filters
        filterComponent={filterComponent}
        
        // Create button
        createPath="/chargers/create"
        createButtonText="Add Charger"
        
        // Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={totalItems}
        
        // Row selection
        selectable={true}
        selectedItems={selectedItems}
        onSelectItems={setSelectedItems}
        
        // Empty state
        emptyState={
          <div className="flex flex-col items-center justify-center py-8">
            <h3 className="text-lg font-semibold mb-1">No Chargers Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                ? "No chargers match your search criteria. Try different filters." 
                : "No chargers have been added yet. Add your first charger to get started."}
            </p>
          </div>
        }
        
        // Columns - only the most important fields
        columns={[
          {
            header: "Charger ID",
            key: "charger_id",
            render: (row) => row.charger_id || 'N/A',
          },
          {
            header: "Name/Location",
            key: "name",
            render: (row) => (
              <div>
                <div>{row.name || 'Unnamed Charger'}</div>
                {row.address && <div className="text-xs text-muted-foreground">{row.address}</div>}
              </div>
            )
          },
          {
            header: "Type",
            key: "type",
            render: (row) => row.type || 'Unknown'
          },
          {
            header: "Status",
            key: "status",
            render: (row) => {
              // Define status based on online status and connectors
              let status = row.online ? 'Online' : 'Offline';
              let bgColor = row.online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
              
              // If the charger has connectors, show their status
              if (row.connectors && row.connectors.length > 0) {
                status = row.connectors[0].status;
                
                // Map status to colors
                switch (status.toLowerCase()) {
                  case 'available':
                    bgColor = 'bg-green-100 text-green-800';
                    break;
                  case 'charging':
                    bgColor = 'bg-blue-100 text-blue-800';
                    break;
                  case 'faulted':
                  case 'unavailable':
                    bgColor = 'bg-red-100 text-red-800';
                    break;
                  case 'reserved':
                  case 'preparing':
                    bgColor = 'bg-yellow-100 text-yellow-800';
                    break;
                  default:
                    bgColor = row.online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                }
              }
              
              return (
                <div>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${bgColor}`}>
                    {status}
                  </span>
                </div>
              );
            },
          },
          {
            header: "Connectors",
            key: "connectors",
            render: (row) => {
              if (!row.connectors || row.connectors.length === 0) {
                return "None";
              }
              
              return row.connectors.length === 1 ? 
                row.connectors[0].type : 
                `${row.connectors.length} connectors`;
            },
          }
        ]}
        
        // Row interactions
        onRowClick={(row) => navigate(`/chargers/${row.id}`)}
        
        // Styling classes to ensure consistent appearance
        className="shadow-md border border-gray-100 rounded-lg overflow-hidden"
        tableClassName="[&_tr:hover]:bg-gray-50/80 [&_th]:bg-gray-50/70 [&_th]:text-gray-600 [&_th]:font-medium"
        actionBarClassName="border-b border-gray-100 bg-gray-50/40"
      />
    </>
  );
};

export default ChargersListPage;
