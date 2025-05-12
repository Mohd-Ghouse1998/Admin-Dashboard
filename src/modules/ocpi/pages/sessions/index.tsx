
import React from 'react';
import { Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessions } from '@/hooks/useOCPI';
import { OCPIGenericList } from '../components/OCPIGenericList';
import { OCPISession } from '@/services/ocpiService';

const OCPISessionList = () => {
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Session ID',
      accessorKey: 'session_id',
    },
    {
      header: 'Start Time',
      accessorKey: 'start_datetime',
      cell: (item: OCPISession) => (
        <span>
          {item.start_datetime ? new Date(item.start_datetime).toLocaleString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'End Time',
      accessorKey: 'end_datetime',
      cell: (item: OCPISession) => (
        <span>
          {item.end_datetime ? new Date(item.end_datetime).toLocaleString() : 'Ongoing'}
        </span>
      )
    },
    {
      header: 'Energy (kWh)',
      accessorKey: 'kwh',
    },
    {
      header: 'Location',
      accessorKey: 'location_id',
    },
    {
      header: 'Auth Method',
      accessorKey: 'auth_method',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item: OCPISession) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          item.status === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : item.status === 'COMPLETED'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item: OCPISession) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('View session', item.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Export session', item.id)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <OCPIGenericList
      title="OCPI Sessions"
      description="Manage charging sessions across networks"
      columns={columns}
      useQuery={useSessions().getAll}
    />
  );
};

export default OCPISessionList;
