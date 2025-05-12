
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEVSEs } from '@/hooks/useOCPI';
import { OCPIGenericList } from '../components/OCPIGenericList';
import { OCPIEVSE } from '@/types/ocpi.types';
import { formatDateTime } from '@/utils/formatters';
import { StatusBadge } from '@/components/ui/status-badge';

const OCPIEVSEList = () => {
  // Define the columns for the EVSEs table
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'EVSE ID',
      accessorKey: 'evse_id',
    },
    {
      header: 'UID',
      accessorKey: 'uid',
    },
    {
      header: 'Location ID',
      accessorKey: 'location',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: OCPIEVSE) => {
        const statusText = item.status || 'N/A';
        const variant = statusText === 'AVAILABLE' 
          ? 'success' 
          : statusText === 'OCCUPIED' 
            ? 'warning' 
            : 'neutral';
            
        return <StatusBadge status={statusText} variant={variant} />;
      }
    },
    {
      header: 'Last Updated',
      accessorKey: 'last_updated',
      cell: (item: OCPIEVSE) => (
        <span>
          {formatDateTime(item.last_updated)}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item: OCPIEVSE) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Edit EVSE', item.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Delete EVSE', item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <OCPIGenericList
      title="OCPI EVSEs"
      description="Manage Electric Vehicle Supply Equipment"
      columns={columns}
      useQuery={useEVSEs().getAll}
      createRoute="/ocpi-management/evses/create"
      createButtonLabel="Create EVSE"
    />
  );
};

export default OCPIEVSEList;
