import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/hooks/use-toast';
import ChargerTableFilters from '@/modules/chargers/components/tables/ChargerTableFilters';
import ChargerTableActions from '@/modules/chargers/components/tables/ChargerTableActions';
import { Charger } from '@/modules/chargers/hooks/useChargers';

interface ChargerTableProps {
  chargers: Charger[];
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const ChargerTable: React.FC<ChargerTableProps> = ({ 
  chargers, 
  onDelete,
  isLoading
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  
  // Apply filters
  const filteredChargers = chargers.filter(charger => {
    const matchesSearch = 
      (charger.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (charger.charger_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      ((charger.address || '').toLowerCase()).includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter ? charger.status === statusFilter : true;
    const matchesType = typeFilter ? charger.type === typeFilter : true;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Extract unique statuses and types for filters - ensure no empty values
  const uniqueStatuses = Array.from(new Set(chargers
    .map(c => c.status || 'Unknown')))
    .filter(status => status !== ''); // Filter out empty strings
    
  const uniqueTypes = Array.from(new Set(chargers
    .map(c => c.type || 'Unknown')))
    .filter(type => type !== ''); // Filter out empty strings
  
  // Helper function to get status variant
  const getStatusVariant = (status?: string): "success" | "warning" | "danger" | "info" | "neutral" => {
    switch (status) {
      case "Available":
        return "success";
      case "Preparing":
      case "SuspendedEVSE":
      case "SuspendedEV":
        return "warning";
      case "Charging":
        return "info";
      case "Faulted":
      case "Unavailable":
        return "danger";
      default:
        return "neutral";
    }
  };

  // Check and log the charger IDs to help debug
  useEffect(() => {
    console.log("Chargers with IDs:", chargers.map(c => ({ id: c.id, charger_id: c.charger_id })));
  }, [chargers]);

  const columns = [
    { header: "ID", accessorKey: "charger_id" },
    { header: "Name", accessorKey: "name" },
    { header: "Vendor", accessorKey: "vendor" },
    { header: "Model", accessorKey: "model" },
    { header: "Type", accessorKey: "type" },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (row: any) => {
        const status = row.status || "Unknown";
        return <StatusBadge status={status} variant={getStatusVariant(status)} />;
      }
    },
    { 
      header: "Enabled", 
      accessorKey: "enabled",
      cell: (row: any) => (
        <StatusBadge 
          status={row.enabled ? "Enabled" : "Disabled"} 
          variant={row.enabled ? "success" : "danger"} 
        />
      )
    },
    { 
      header: "Address", 
      accessorKey: "address",
      cell: (row: any) => {
        // Display address if available, otherwise show coordinates if available
        if (row.address) {
          return row.address;
        } else if (row.location && row.location.latitude && row.location.longitude) {
          return `${row.location.latitude.toFixed(6)}, ${row.location.longitude.toFixed(6)}`;
        }
        return "No location data";
      }
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: any) => {
        const rowId = row.id?.toString();
        return (
          <ChargerTableActions 
            chargerId={rowId} 
            onDelete={onDelete} 
            isLoading={isLoading}
          />
        );
      }
    }
  ];

  const handleRowClick = (row: any) => {
    const rowId = row.id?.toString();
    if (rowId) {
      console.log(`Row click - Navigating to charger details with ID: ${rowId}`);
      navigate(`/chargers/${rowId}`);
    } else {
      toast({
        title: "Error",
        description: "Could not find charger ID",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Section */}
      <ChargerTableFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        uniqueStatuses={uniqueStatuses}
        uniqueTypes={uniqueTypes}
      />
      
      {/* Main Chargers Table */}
      <DataTable
        columns={columns}
        data={filteredChargers}
        keyField="id"
        emptyMessage="No chargers found"
        isLoading={isLoading}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: filteredChargers.length,
          onPageChange: () => {}
        }}
        onRowClick={handleRowClick}
      />
    </div>
  );
};
