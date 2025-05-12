
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConnectors } from '@/hooks/useOCPI';
import { OCPIGenericList } from '../components/OCPIGenericList';
import { OCPIConnector } from '@/services/ocpiService';
import { formatNumberWithUnit } from '@/utils/formatters';
import { StatusBadge } from '@/components/ui/status-badge';

const OCPIConnectorList = () => {
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Connector ID',
      accessorKey: 'connector_id',
    },
    {
      header: 'EVSE ID',
      accessorKey: 'evse',
    },
    {
      header: 'Standard',
      accessorKey: 'standard',
    },
    {
      header: 'Format',
      accessorKey: 'format',
    },
    {
      header: 'Power Type',
      accessorKey: 'power_type',
    },
    {
      header: 'Max Power',
      accessorKey: 'max_electric_power',
      cell: (item: OCPIConnector) => (
        <span>
          {formatNumberWithUnit(item.max_electric_power, 'kW', 1)}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: OCPIConnector) => {
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
      header: 'Actions',
      accessorKey: 'id',
      cell: (item: OCPIConnector) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Edit connector', item.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Delete connector', item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <OCPIGenericList
      title="OCPI Connectors"
      description="Manage charging connectors for EVSEs"
      columns={columns}
      useQuery={useConnectors().getAll}
      createRoute="/ocpi-management/connectors/create"
      createButtonLabel="Create Connector"
    />
  );
};

export default OCPIConnectorList;
