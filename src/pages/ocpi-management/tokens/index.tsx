
import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTokens } from '@/hooks/useOCPI';
import { OCPIGenericList } from '../components/OCPIGenericList';
import { OCPIToken } from '@/services/ocpiService';

const OCPITokenList = () => {
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'UID',
      accessorKey: 'token_uid',
    },
    {
      header: 'Type',
      accessorKey: 'token_type',
    },
    {
      header: 'Auth ID',
      accessorKey: 'auth_id',
    },
    {
      header: 'Visual Number',
      accessorKey: 'visual_number',
    },
    {
      header: 'Issuer',
      accessorKey: 'issuer',
    },
    {
      header: 'Valid',
      accessorKey: 'valid',
      cell: (item: OCPIToken) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          item.valid 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.valid ? 'Valid' : 'Invalid'}
        </span>
      )
    },
    {
      header: 'Whitelist',
      accessorKey: 'whitelist',
    },
    {
      header: 'Last Updated',
      accessorKey: 'last_updated',
      cell: (item: OCPIToken) => (
        <span>
          {item.last_updated ? new Date(item.last_updated).toLocaleString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item: OCPIToken) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('View token', item.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Edit token', item.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Delete token', item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <OCPIGenericList
      title="OCPI Tokens"
      description="Manage authorization tokens"
      columns={columns}
      useQuery={useTokens().getAll}
      createRoute="/ocpi-management/tokens/create"
      createButtonLabel="Create Token"
    />
  );
};

export default OCPITokenList;
