import React from 'react';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChargingSession } from '@/types/charger';
import { formatDistanceToNow } from 'date-fns';

interface ChargingSessionTableProps {
  sessions: ChargingSession[];
  isLoading?: boolean;
}

export const ChargingSessionTable: React.FC<ChargingSessionTableProps> = ({ 
  sessions, 
  isLoading
}) => {
  // Helper to get status variant
  const getStatusVariant = (status?: string): "success" | "warning" | "danger" | "info" | "neutral" => {
    switch (status) {
      case "Completed":
        return "success";
      case "Preparing":
        return "warning";
      case "InProgress":
      case "Active":
        return "info";
      case "Error":
        return "danger";
      default:
        return "neutral";
    }
  };
  
  // Format duration time
  const formatDuration = (start: string, end?: string) => {
    if (!start) return 'N/A';
    
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;
    
    if (!endDate) {
      return formatDistanceToNow(startDate, { addSuffix: false }) + ' (ongoing)';
    }
    
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMins = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(durationMins / 60);
    const mins = durationMins % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    
    return `${mins} min`;
  };
  
  const columns: Column<ChargingSession>[] = [
    { header: "Transaction ID", accessorKey: "transaction_id" },
    { header: "Charger ID", accessorKey: "charger_id" },
    { header: "Connector", accessorKey: "connector_id" },
    { header: "ID Tag", accessorKey: "id_tag" },
    { 
      header: "Start Time", 
      accessorKey: "start_timestamp",
      cell: (session) => new Date(session.start_timestamp).toLocaleString()
    },
    { 
      header: "End Time", 
      accessorKey: "end_timestamp",
      cell: (session) => session.end_timestamp ? new Date(session.end_timestamp).toLocaleString() : 'In progress'
    },
    {
      header: "Duration",
      accessorKey: "duration",
      cell: (session) => formatDuration(session.start_timestamp, session.end_timestamp)
    },
    { 
      header: "Energy", 
      accessorKey: "energy_delivered",
      cell: (session) => {
        if (typeof session.energy_delivered === 'number') {
          return `${session.energy_delivered.toFixed(2)} kWh`;
        }
        
        if (typeof session.meter_start === 'number' && typeof session.meter_stop === 'number') {
          const energy = (session.meter_stop - session.meter_start) / 1000; // Assuming meter values in Wh
          return `${energy.toFixed(2)} kWh`;
        }
        
        return 'N/A';
      }
    },
    { 
      header: "Cost", 
      accessorKey: "cost",
      cell: (session) => typeof session.cost === 'number' ? `₹${session.cost.toFixed(2)}` : 'N/A'
    },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (session) => (
        <StatusBadge 
          status={session.status || 'Unknown'} 
          variant={getStatusVariant(session.status)} 
        />
      )
    }
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={sessions}
        keyField="id"
        emptyMessage="No charging sessions found"
        isLoading={isLoading}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: sessions.length,
          onPageChange: () => {}
        }}
      />
    </div>
  );
};
