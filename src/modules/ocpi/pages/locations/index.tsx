
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useLocations } from '@/hooks/useOCPI';
import { OCPILocation } from '@/types/ocpi.types';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { formatCoordinates } from '@/utils/formatters';
import { 
  createIdColumn, 
  createNameColumn, 
  createStatusColumn, 
  createViewEditDeleteActionsColumn 
} from '@/components/ui/column-helpers';
import LocationForm from './LocationForm';

const LocationList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;
  
  const { getAll, remove } = useLocations();
  const { data: locations, isLoading, refetch } = getAll();
  const deleteLocation = remove();
  
  const handleDelete = async (location: OCPILocation) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        // Convert id to number if it's a string
        const locationId = typeof location.id === 'string' ? parseInt(location.id, 10) : location.id;
        await deleteLocation.mutateAsync(locationId);
        toast({
          title: "Success",
          description: "Location deleted successfully",
        });
        refetch();
      } catch (error) {
        handleError(error, "Failed to delete location");
      }
    }
  };
  
  const handleViewDetails = (location: OCPILocation) => {
    navigate(`/ocpi-management/locations/${location.id}`);
  };
  
  const handleEditLocation = (location: OCPILocation) => {
    navigate(`/ocpi-management/locations/${location.id}/edit`);
  };
  
  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetch();
    toast({
      title: "Location created",
      description: "The location was created successfully.",
    });
  };

  const columns = [
    createIdColumn<OCPILocation>(),
    createNameColumn<OCPILocation>(),
    {
      header: 'Address',
      accessorKey: 'address',
      enableTooltip: true,
    },
    {
      header: 'City',
      accessorKey: 'city',
    },
    {
      header: 'Country',
      accessorKey: 'country',
    },
    {
      header: 'Coordinates',
      accessorKey: 'coordinates',
      cell: (location: OCPILocation) => (
        <div>{formatCoordinates(location.coordinates)}</div>
      )
    },
    createStatusColumn<OCPILocation>(),
    createViewEditDeleteActionsColumn<OCPILocation>(
      handleViewDetails,
      handleEditLocation,
      handleDelete
    )
  ];

  // Cast the locations data to ensure TypeScript compatibility
  // This addresses the type mismatch between service and type definitions
  const typedLocations = locations as unknown as OCPILocation[];

  return (
    <PageLayout
      title="OCPI Locations"
      description="Manage OCPI location data"
    >
      <Helmet>
        <title>OCPI Locations</title>
      </Helmet>
      
      <div className="flex justify-end mb-4">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Location</DialogTitle>
              <DialogDescription>
                Create a new OCPI location entry
              </DialogDescription>
            </DialogHeader>
            <LocationForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
      <DataTable
        columns={columns}
        data={typedLocations || []}
        isLoading={isLoading}
        pagination={{
          currentPage,
          pageSize,
          totalPages: typedLocations ? Math.ceil(typedLocations.length / pageSize) : 0,
          totalItems: typedLocations?.length || 0,
          onPageChange: setCurrentPage
        }}
        keyField="id"
        emptyMessage="No OCPI locations found"
      />
    </PageLayout>
  );
};

export default LocationList;
