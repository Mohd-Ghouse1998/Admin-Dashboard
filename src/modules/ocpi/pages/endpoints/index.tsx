
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEndpoints } from '@/hooks/useOCPI';
import { OCPIGenericList } from '../components/OCPIGenericList';
import { OCPIEndpoint } from '@/services/ocpiService';

const OCPIEndpointList = () => {
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Identifier',
      accessorKey: 'identifier',
    },
    {
      header: 'Party ID',
      accessorKey: 'party',
    },
    {
      header: 'Role',
      accessorKey: 'role',
    },
    {
      header: 'URL',
      accessorKey: 'url',
      enableTooltip: true,
      cell: (item: OCPIEndpoint) => (
        <div className="max-w-[200px] truncate">
          {item.url}
        </div>
      ),
    },
    {
      header: 'Version',
      accessorKey: 'version',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: OCPIEndpoint) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          item.status === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item: OCPIEndpoint) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Edit endpoint', item.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Delete endpoint', item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <OCPIGenericList
      title="OCPI Endpoints"
      description="Manage endpoint configurations for OCPI connections"
      columns={columns}
      useQuery={useEndpoints().getAll}
      createRoute="/ocpi-management/endpoints/create"
      createButtonLabel="Create Endpoint"
    />
  );
};

export default OCPIEndpointList;
