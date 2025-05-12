
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVersions } from '@/hooks/useOCPI';
import { OCPIGenericList } from '../components/OCPIGenericList';
import { OCPIVersion } from '@/services/ocpiService';

const OCPIVersionList = () => {
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Party ID',
      accessorKey: 'party',
    },
    {
      header: 'Version',
      accessorKey: 'version',
    },
    {
      header: 'URL',
      accessorKey: 'url',
      enableTooltip: true,
      cell: (item: OCPIVersion) => (
        <div className="max-w-[200px] truncate">
          {item.url}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: OCPIVersion) => (
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
      cell: (item: OCPIVersion) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Edit version', item.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Delete version', item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <OCPIGenericList
      title="OCPI Versions"
      description="Manage OCPI version implementations"
      columns={columns}
      useQuery={useVersions().getAll}
      createRoute="/ocpi-management/versions/create"
      createButtonLabel="Create Version"
    />
  );
};

export default OCPIVersionList;
