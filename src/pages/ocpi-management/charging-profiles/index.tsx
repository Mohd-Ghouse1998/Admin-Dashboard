
import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChargingProfiles } from '@/hooks/useOCPI';
import { OCPIGenericList } from '../components/OCPIGenericList';
import { OCPIChargingProfile } from '@/services/ocpiService';

const OCPIChargingProfileList = () => {
  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Profile ID',
      accessorKey: 'profile_id',
    },
    {
      header: 'Party',
      accessorKey: 'party',
    },
    {
      header: 'Active',
      accessorKey: 'active',
      cell: (item: OCPIChargingProfile) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          item.active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {item.active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Rate Unit',
      accessorKey: 'charging_rate_unit',
    },
    {
      header: 'Start Time',
      accessorKey: 'start_date_time',
      cell: (item: OCPIChargingProfile) => (
        <span>
          {item.start_date_time ? new Date(item.start_date_time).toLocaleString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'End Time',
      accessorKey: 'end_date_time',
      cell: (item: OCPIChargingProfile) => (
        <span>
          {item.end_date_time ? new Date(item.end_date_time).toLocaleString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Profile Kind',
      accessorKey: 'charging_profile_kind',
    },
    {
      header: 'Profile Purpose',
      accessorKey: 'charging_profile_purpose',
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (item: OCPIChargingProfile) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('View profile', item.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Edit profile', item.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log('Delete profile', item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <OCPIGenericList
      title="OCPI Charging Profiles"
      description="Manage charging profiles for smart charging"
      columns={columns}
      useQuery={useChargingProfiles().getAll}
      createRoute="/ocpi-management/charging-profiles/create"
      createButtonLabel="Create Charging Profile"
    />
  );
};

export default OCPIChargingProfileList;
