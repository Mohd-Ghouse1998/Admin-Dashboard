
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCredentials } from '@/hooks/useOCPI';
import { OCPIGenericList } from '../components/OCPIGenericList';
import { OCPICredential } from '@/services/ocpiService';

const OCPICredentialList = () => {
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Token',
      accessorKey: 'token',
      enableTooltip: true,
      cell: (item: OCPICredential) => (
        <div className="max-w-[100px] truncate">
          {item.token}
        </div>
      ),
    },
    {
      header: 'URL',
      accessorKey: 'url',
      enableTooltip: true,
      cell: (item: OCPICredential) => (
        <div className="max-w-[200px] truncate">
          {item.url}
        </div>
      ),
    },
    {
      header: 'Roles',
      accessorKey: 'roles',
      cell: (item: OCPICredential) => (
        <div className="space-y-1">
          {item.roles && item.roles.map((role, index) => (
            <span key={index} className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mr-1">
              {role.role}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item: OCPICredential) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Edit credential', item.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Delete credential', item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <OCPIGenericList
      title="OCPI Credentials"
      description="Manage authentication credentials for OCPI connections"
      columns={columns}
      useQuery={useCredentials().getAll}
      createRoute="/ocpi-management/credentials/create"
      createButtonLabel="Create Credential"
    />
  );
};

export default OCPICredentialList;
