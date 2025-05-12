
import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTariffs } from '@/hooks/useOCPI';
import { OCPIGenericList } from '../components/OCPIGenericList';
import { OCPITariff } from '@/services/ocpiService';

const OCPITariffList = () => {
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Tariff ID',
      accessorKey: 'tariff_id',
    },
    {
      header: 'Party',
      accessorKey: 'party',
    },
    {
      header: 'Country',
      accessorKey: 'country_code',
    },
    {
      header: 'Party ID',
      accessorKey: 'party_id',
    },
    {
      header: 'Currency',
      accessorKey: 'currency',
    },
    {
      header: 'Type',
      accessorKey: 'type',
    },
    {
      header: 'Start Date',
      accessorKey: 'start_date_time',
      cell: (item: OCPITariff) => (
        <span>
          {item.start_date_time ? new Date(item.start_date_time).toLocaleString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'End Date',
      accessorKey: 'end_date_time',
      cell: (item: OCPITariff) => (
        <span>
          {item.end_date_time ? new Date(item.end_date_time).toLocaleString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Green Energy',
      accessorKey: 'energy_mix',
      cell: (item: OCPITariff) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          item.energy_mix?.is_green_energy 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {item.energy_mix?.is_green_energy ? 'Green' : 'Standard'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item: OCPITariff) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('View tariff', item.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Edit tariff', item.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Delete tariff', item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <OCPIGenericList
      title="OCPI Tariffs"
      description="Manage charging tariffs"
      columns={columns}
      useQuery={useTariffs().getAll}
      createRoute="/ocpi-management/tariffs/create"
      createButtonLabel="Create Tariff"
    />
  );
};

export default OCPITariffList;
