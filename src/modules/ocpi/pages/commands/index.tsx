
import React from 'react';
import { Play, RotateCw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCommands } from '@/hooks/useOCPI';
import { OCPIGenericList } from '../components/OCPIGenericList';
import { OCPICommand } from '@/services/ocpiService';

const OCPICommandList = () => {
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Command ID',
      accessorKey: 'command_id',
    },
    {
      header: 'Command Type',
      accessorKey: 'command_type',
    },
    {
      header: 'Party',
      accessorKey: 'party',
    },
    {
      header: 'Response URL',
      accessorKey: 'response_url',
      enableTooltip: true,
      cell: (item: OCPICommand) => (
        <div className="max-w-[200px] truncate">
          {item.response_url || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Location ID',
      accessorKey: 'location_id',
      cell: (item: OCPICommand) => (
        <span>{item.location_id || 'N/A'}</span>
      )
    },
    {
      header: 'EVSE UID',
      accessorKey: 'evse_uid',
      cell: (item: OCPICommand) => (
        <span>{item.evse_uid || 'N/A'}</span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item: OCPICommand) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('View command', item.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Execute command', item.id)}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Refresh status', item.id)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <OCPIGenericList
      title="OCPI Commands"
      description="Manage and execute OCPI commands"
      columns={columns}
      useQuery={useCommands().getAll}
      createRoute="/ocpi-management/commands/create"
      createButtonLabel="Create Command"
    />
  );
};

export default OCPICommandList;
