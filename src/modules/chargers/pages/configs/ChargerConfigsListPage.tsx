
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ListTemplate, Column } from '@/components/templates/list/ListTemplate';
import { Wrench } from 'lucide-react';
import { useChargerConfigs } from '@/modules/chargers/hooks/useChargerConfigs';
import { useToast } from '@/hooks/use-toast';
import { chargerApi } from '@/modules/chargers/services/chargerService';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const ChargerConfigsListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [readonlyFilter, setReadonlyFilter] = useState<string>('all');
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  
  const { chargerConfigs, isLoading, error } = useChargerConfigs(
    searchQuery,
    undefined,
    undefined,
    readonlyFilter === 'all' ? undefined : readonlyFilter === 'true'
  );
  
  // Process data for the list template
  const configData = chargerConfigs?.results || [];
  const totalItems = chargerConfigs?.count || 0;
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => chargerApi.deleteChargerConfig(accessToken, id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Configuration successfully deleted.",
      });
      // Refresh the data
      queryClient.invalidateQueries({
        queryKey: ["chargerConfigs"],
      });
    },
    onError: (error: any) => {
      console.error('Error deleting charger config:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to delete configuration. Please try again.",
      });
    },
  });

  // Define columns for the ListTemplate
  const columns: Column<any>[] = [
    {
      header: "ID",
      key: "id",
      render: (config) => config.id
    },
    {
      header: "Charger ID",
      key: "charger",
      render: (config) => config.charger
    },
    {
      header: "Configuration Key",
      key: "key",
      render: (config) => config.key
    },
    {
      header: "Value",
      key: "value",
      render: (config) => config.value
    },
    {
      header: "Read Only",
      key: "readonly",
      render: (config) => {
        const isReadOnly = config.readonly;
        const bgColor = isReadOnly ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800';
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${bgColor}`}>
            {isReadOnly ? 'Yes' : 'No'}
          </span>
        );
      }
    }
  ];

  // Filter component
  const filterComponent = (
    <select
      id="readonly-filter"
      value={readonlyFilter}
      onChange={(e) => setReadonlyFilter(e.target.value)}
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background"
    >
      <option value="all">All Configs</option>
      <option value="true">Read-only</option>
      <option value="false">Editable</option>
    </select>
  );

  // Define row actions
  const rowActions = (config: any) => null;

  return (
    <>
      <Helmet>
        <title>Charger Configurations | EV Admin</title>
      </Helmet>
      
      <ListTemplate
        title="Charger Configurations"
        icon={<Wrench className="h-5 w-5" />}
        description="Manage configuration parameters for chargers"
        data={configData}
        isLoading={isLoading}
        error={error ? "Failed to load charger configurations" : null}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search configurations..."
        filterComponent={filterComponent}
        createPath="/chargers/configs/create"
        createButtonText="Add Configuration"
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / pageSize)}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onRowClick={(config) => navigate(`/chargers/configs/${config.id}`)}
        rowActions={rowActions}
        className="shadow-md border border-gray-100 rounded-lg overflow-hidden"
        tableClassName="[&_tr:hover]:bg-gray-50/80 [&_th]:bg-gray-50/70 [&_th]:text-gray-600 [&_th]:font-medium"
        actionBarClassName="border-b border-gray-100 bg-gray-50/40"
      />
    </>
  );
};

export default ChargerConfigsListPage;
