import React from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DownloadIcon, FilterIcon, RefreshCwIcon } from 'lucide-react';

interface OCPIGenericListProps<T> {
  title: string;
  description: string;
  columns: any[];
  useQuery: () => UseQueryResult<T[]>;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
}

export const OCPIGenericList = <T extends { id?: string | number }>({
  title,
  description,
  columns,
  useQuery,
  actions,
  filters,
}: OCPIGenericListProps<T>) => {
  const { data, isLoading, isError, refetch } = useQuery();

  // Transform the data to match DataTable expectations
  const transformedData = React.useMemo(() => {
    if (!data) return [];
    return data.map(item => ({ row: { original: item } }));
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex space-x-2">
          {actions}
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            title="Refresh data"
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>{filters}</CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={transformedData}
            isLoading={isLoading}
            keyField={(row) => row.row.original.id?.toString() || ''}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              pageSize: transformedData.length,
              onPageChange: () => {}, // No-op since we're not handling pagination here
            }}
          />
          {isError && (
            <div className="py-4 text-center text-red-500">
              Error loading data. Please try again.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OCPIGenericList;
