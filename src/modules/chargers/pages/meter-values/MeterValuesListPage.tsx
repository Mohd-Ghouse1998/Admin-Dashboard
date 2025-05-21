import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { ListTemplate, Column } from '@/components/templates/list/ListTemplate';
import { useMeterValues } from '@/modules/chargers/hooks/useMeterValues';
import type { MeterValueFilters } from '@/modules/chargers/hooks/useMeterValues';

const MeterValuesListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [measurandFilter, setMeasurandFilter] = useState<string>('all');
  
  // Build filters object
  const filters: MeterValueFilters = {};
  
  // Use the hook to fetch data
  const {
    meterValues,
    isLoading,
    error
  } = useMeterValues(filters);
  
  // We'll filter by measurand in the UI since it's not in the API filter type
  const filteredMeterValues = measurandFilter === 'all' 
    ? meterValues?.results || [] 
    : (meterValues?.results || []).filter(mv => mv.measurand === measurandFilter);
  
  const meterValuesData = filteredMeterValues;
  const totalItems = meterValues?.count || 0;
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setMeasurandFilter('all');
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return timestamp;
    }
  };
  
  // Filter component
  const filterComponent = (
    <select
      id="measurand-filter"
      value={measurandFilter}
      onChange={(e) => setMeasurandFilter(e.target.value)}
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background"
    >
      <option value="all">All Measurands</option>
      <option value="Energy.Active.Import.Register">Energy Active Import</option>
      <option value="Power.Active.Import">Power Active Import</option>
      <option value="Current.Import">Current Import</option>
      <option value="Voltage">Voltage</option>
      <option value="Temperature">Temperature</option>
    </select>
  );

  // Define columns for the ListTemplate
  const columns: Column<any>[] = [
    {
      header: "ID",
      key: "id",
      render: (value) => value.id
    },
    {
      header: "Value",
      key: "value",
      render: (value) => `${value.value} ${value.unit || ''}`
    },
    {
      header: "Measurand",
      key: "measurand",
      render: (value) => value.measurand || 'Unknown'
    },
    {
      header: "Context",
      key: "context",
      render: (value) => value.context || '-'
    },
    {
      header: "Location",
      key: "location",
      render: (value) => value.location || '-'
    },
    {
      header: "Timestamp",
      key: "timestamp",
      render: (value) => formatTimestamp(value.timestamp)
    },
    {
      header: "Charger",
      key: "charger",
      render: (value) => value.charger || '-'
    },
    {
      header: "Connector",
      key: "connector",
      render: (value) => value.connector || '-'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Meter Values | EV Admin</title>
      </Helmet>
      
      <ListTemplate
        title="Meter Values"
        icon={<Activity className="h-5 w-5" />}
        description="View meter readings from EV charging stations"
        data={meterValuesData}
        isLoading={isLoading}
        error={error ? "Failed to load meter values" : null}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search meter values..."
        filterComponent={filterComponent}
        createPath="/chargers/meter-values/create"
        createButtonText="Add Meter Value"
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / pageSize)}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onRowClick={(value) => navigate(`/chargers/meter-values/${value.id}`)}
        rowActions={null}
        className="shadow-md border border-gray-100 rounded-lg overflow-hidden"
        tableClassName="[&_tr:hover]:bg-gray-50/80 [&_th]:bg-gray-50/70 [&_th]:text-gray-600 [&_th]:font-medium"
        actionBarClassName="border-b border-gray-100 bg-gray-50/40"
      />
    </>
  );
};

export default MeterValuesListPage;
