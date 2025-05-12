
import React from 'react';
import { Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCDRs } from '@/hooks/useOCPI';
import { OCPIGenericList } from '../components/OCPIGenericList';
import { OCPICDR } from '@/services/ocpiService';
import { formatDateTime, formatCurrency, formatNumberWithUnit } from '@/utils/formatters';

const OCPICDRList = () => {
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'CDR ID',
      accessorKey: 'cdr_id',
    },
    {
      header: 'Session ID',
      accessorKey: 'session_id',
    },
    {
      header: 'Start Time',
      accessorKey: 'start_datetime',
      cell: (item: OCPICDR) => (
        <span>{formatDateTime(item.start_datetime)}</span>
      )
    },
    {
      header: 'End Time',
      accessorKey: 'end_datetime',
      cell: (item: OCPICDR) => (
        <span>{formatDateTime(item.end_datetime)}</span>
      )
    },
    {
      header: 'Energy (kWh)',
      accessorKey: 'kwh',
      cell: (item: OCPICDR) => (
        <span>{formatNumberWithUnit(item.kwh, 'kWh', 2)}</span>
      )
    },
    {
      header: 'Total Cost',
      accessorKey: 'total_cost',
      cell: (item: OCPICDR) => (
        <span>
          {typeof item.total_cost === 'number' 
            ? formatCurrency(item.total_cost, item.currency || 'USD') 
            : 'N/A'}
        </span>
      )
    },
    {
      header: 'Location',
      accessorKey: 'location',
    },
    {
      header: 'Auth Method',
      accessorKey: 'auth_method',
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item: OCPICDR) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('View CDR', item.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Export CDR', item.id)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <OCPIGenericList
      title="OCPI Charge Detail Records"
      description="View and manage charge detail records"
      columns={columns}
      useQuery={useCDRs().getAll}
    />
  );
};

export default OCPICDRList;
