
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UseQueryResult } from '@tanstack/react-query';

interface OCPIGenericListProps {
  title: string;
  description: string;
  columns: any[];
  useQuery: () => UseQueryResult<any[]>;
  createRoute?: string;
  createButtonLabel?: string;
}

export const OCPIGenericList: React.FC<OCPIGenericListProps> = ({
  title,
  description,
  columns,
  useQuery,
  createRoute,
  createButtonLabel = 'Create'
}) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const { data, isLoading, error } = useQuery();
  
  console.log(`OCPIGenericList for ${title}:`, { data, isLoading, error });
  
  return (
    <PageLayout title={title} description={description}>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      
      {createRoute && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => window.location.href = createRoute}
          >
            <Plus className="mr-2 h-4 w-4" />
            {createButtonLabel}
          </Button>
        </div>
      )}
      
      {isLoading ? (
        <Card className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </Card>
      ) : error ? (
        <Card className="p-6">
          <div className="text-center text-red-500">
            Error loading data: {(error as Error).message}
          </div>
        </Card>
      ) : data && data.length > 0 ? (
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          pagination={{
            currentPage,
            pageSize,
            totalPages: Math.ceil(data.length / pageSize),
            totalItems: data.length,
            onPageChange: setCurrentPage
          }}
          keyField="id"
          emptyMessage={`No ${title.toLowerCase()} found`}
        />
      ) : (
        <Card className="p-6">
          <div className="text-center">
            No {title.toLowerCase()} found. {createRoute && 'Create one to get started.'}
          </div>
        </Card>
      )}
    </PageLayout>
  );
};
