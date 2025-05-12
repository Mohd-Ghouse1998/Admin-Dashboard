
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge'; // Updated import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChargingSessions } from '@/modules/chargers/hooks/useChargingSessions';

const ChargingSessionsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { sessions, isLoading, error } = useChargingSessions(searchQuery);
  
  // Compute pagination values from the API response
  const pageSize = 10;
  const totalItems = sessions?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Format duration
  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "Ongoing";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMin = Math.floor(durationMs / (1000 * 60));
    
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;
    
    return `${hours}h ${minutes}m`;
  };

  // Format energy
  const formatEnergy = (energyWh: number) => {
    if (energyWh >= 1000) {
      return `${(energyWh / 1000).toFixed(2)} kWh`;
    }
    return `${energyWh} Wh`;
  };

  // Define table columns for charging sessions
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
      cell: (row: any) => (
        <div className="font-mono text-xs">
          {row.id}
        </div>
      ),
    },
    {
      header: 'Charger',
      accessorKey: 'charger_id',
      cell: (row: any) => (
        <div>
          <div className="font-medium">{row.charger_id}</div>
          <div className="text-xs text-gray-500">Connector {row.connector_id}</div>
        </div>
      ),
    },
    {
      header: 'User',
      accessorKey: 'user_id',
      cell: (row: any) => (
        <div>{row.user_id || 'Anonymous'}</div>
      ),
    },
    {
      header: 'Started',
      accessorKey: 'start_time',
      cell: (row: any) => (
        <div>
          <div>{new Date(row.start_time).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(row.start_time).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      header: 'Duration',
      accessorKey: 'duration', // Add accessorKey to fix type errors
      cell: (row: any) => (
        <div>{formatDuration(row.start_time, row.end_time)}</div>
      ),
    },
    {
      header: 'Energy',
      accessorKey: 'energy_wh',
      cell: (row: any) => (
        <div>{formatEnergy(row.energy_wh)}</div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => {
        let variant: "success" | "warning" | "danger" | "info" | "neutral" = "neutral";
        
        switch (row.status) {
          case 'Completed':
            variant = "success";
            break;
          case 'In Progress':
            variant = "info";
            break;
          case 'Error':
            variant = "danger";
            break;
        }
        
        return (
          <StatusBadge status={row.status} variant={variant} />
        );
      },
    },
    {
      header: 'Actions',
      accessorKey: 'actions', // Add accessorKey to fix type errors
      cell: (row: any) => (
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/chargers/sessions/${row.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
      ),
    }
  ];

  return (
    <PageLayout
      title="Charging Sessions"
      description="View and manage charging sessions"
    >
      <Helmet>
        <title>Charging Sessions | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load charging sessions'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sessions by ID, charger ID, or user..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={sessions?.results || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage
            }}
            keyField="id"
            emptyMessage="No charging sessions found."
            rowClassName="cursor-pointer"
            onRowClick={(row) => window.location.href = `/chargers/sessions/${row.id}`}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ChargingSessionsListPage;
