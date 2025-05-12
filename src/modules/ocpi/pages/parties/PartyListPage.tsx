
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/data-table';
import { useParties } from '@/hooks/useOCPI';
import { OCPIParty } from '@/services/ocpiService';
import { useToast } from '@/hooks/use-toast';

const PartyListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const { getAll, remove } = useParties();
  const { data: parties, isLoading, refetch } = getAll();
  const deleteParty = remove();
  
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this party?')) {
      try {
        await deleteParty.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete party:', error);
      }
    }
  };
  
  const handleViewDetails = (party: OCPIParty) => {
    navigate(`/ocpi/parties/${party.id}`);
  };
  
  const handleCreateParty = () => {
    navigate('/ocpi/parties/create');
  };

  const columns: Column<OCPIParty>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Party ID',
      accessorKey: 'party_id',
    },
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Country Code',
      accessorKey: 'country_code',
    },
    {
      header: 'Website',
      accessorKey: 'website',
      enableTooltip: true,
    },
    {
      header: 'Roles',
      accessorKey: 'roles',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (party) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          party.status === 'ACTIVE' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {party.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (party) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetails(party)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(party.id!)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <PageLayout
      title="OCPI Parties"
      description="Manage OCPI party relationships and configurations"
    >
      <Helmet>
        <title>OCPI Parties</title>
      </Helmet>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreateParty}>
          <Plus className="mr-2 h-4 w-4" />
          Create Party
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={parties || []}
        isLoading={isLoading}
        pagination={{
          currentPage,
          pageSize,
          totalPages: parties ? Math.ceil(parties.length / pageSize) : 0,
          totalItems: parties?.length || 0,
          onPageChange: setCurrentPage
        }}
        keyField="id"
        emptyMessage="No OCPI parties found"
      />
    </PageLayout>
  );
};

export default PartyListPage;
