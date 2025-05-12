import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getTariffs, Tariff } from '@/services/api/tariffsApi';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Plus } from 'lucide-react';

const TariffsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [filteredTariffs, setFilteredTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTariffs();
  }, []);

  const fetchTariffs = async () => {
    setIsLoading(true);
    try {
      const response = await getTariffs();
      setTariffs(response.data);
      setFilteredTariffs(response.data);
    } catch (error) {
      console.error('Failed to fetch tariffs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tariffs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = tariffs.filter(
        (tariff) =>
          tariff.name.toLowerCase().includes(term) ||
          tariff.description.toLowerCase().includes(term) ||
          tariff.status.toLowerCase().includes(term)
      );
      setFilteredTariffs(filtered);
    } else {
      setFilteredTariffs(tariffs);
    }
  }, [searchTerm, tariffs]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' = 'default';
    
    switch (status) {
      case 'active':
        variant = 'success';
        break;
      case 'inactive':
        variant = 'secondary';
        break;
      case 'draft':
        variant = 'outline';
        break;
      default:
        variant = 'default';
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  const columns: Column<Tariff>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (info: any) => info.row.original.name
    },
    {
      header: 'Base Price',
      accessorKey: 'base_price',
      cell: (info: any) => formatCurrency(info.row.original.base_price)
    },
    {
      header: 'Price/kWh',
      accessorKey: 'price_per_kwh',
      cell: (info: any) => formatCurrency(info.row.original.price_per_kwh)
    },
    {
      header: 'Price/Min',
      accessorKey: 'price_per_minute',
      cell: (info: any) => formatCurrency(info.row.original.price_per_minute)
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => getStatusBadge(info.row.original.status)
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (info: any) => {
        const id = info.row.original.id;
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/payment/tariffs/${id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/payment/tariffs/${id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <PageLayout
      title="Tariffs"
      description="Manage your tariff plans for charging services"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Tariffs', url: '/payment/tariffs' }
      ]}
      actions={
        <Button onClick={() => navigate('/payment/tariffs/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tariff
        </Button>
      }
    >
      <div className="mb-6 flex items-center justify-between">
        <Input
          placeholder="Search tariffs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={filteredTariffs}
          isLoading={isLoading}
          keyField="id"
          pagination={{
            currentPage: 1,
            totalPages: 1,
            totalItems: filteredTariffs.length,
            pageSize: filteredTariffs.length,
            onPageChange: () => {}, // No-op since we're showing all at once
          }}
          emptyMessage="No tariffs found"
        />
      </Card>
    </PageLayout>
  );
};

export default TariffsPage;
