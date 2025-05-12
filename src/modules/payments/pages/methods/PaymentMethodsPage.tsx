import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, CreditCard, AlertCircle } from 'lucide-react';
import { getPaymentMethods, PaymentMethod } from '@/services/api/paymentMethodsApi';
import { useToast } from '@/hooks/use-toast';

const PaymentMethodsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [filteredMethods, setFilteredMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const response = await getPaymentMethods();
      setPaymentMethods(response.data);
      setFilteredMethods(response.data);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment methods. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = paymentMethods.filter(
        (method) =>
          (method.card_holder_name && method.card_holder_name.toLowerCase().includes(term)) ||
          (method.last4 && method.last4.includes(term)) ||
          (method.brand && method.brand.toLowerCase().includes(term)) ||
          method.type.toLowerCase().includes(term)
      );
      setFilteredMethods(filtered);
    } else {
      setFilteredMethods(paymentMethods);
    }
  }, [searchTerm, paymentMethods]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const columns: Column<PaymentMethod>[] = [
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (info: any) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(info.row.original.type)}
          <span>{formatType(info.row.original.type)}</span>
        </div>
      )
    },
    {
      header: 'Card Holder',
      accessorKey: 'card_holder_name',
      cell: (info: any) => info.row.original.card_holder_name || 'N/A'
    },
    {
      header: 'Details',
      accessorKey: 'details',
      cell: (info: any) => {
        const method = info.row.original;
        if (method.type === 'credit_card' || method.type === 'debit_card') {
          return `${method.brand || ''} ****${method.last4 || ''}`;
        } else if (method.type === 'upi') {
          return method.upi_id || 'N/A';
        } else {
          return method.provider || 'N/A';
        }
      }
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (info: any) => (
        <Badge variant={info.row.original.is_active ? 'success' : 'secondary'}>
          {info.row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Default',
      accessorKey: 'is_default',
      cell: (info: any) => (
        info.row.original.is_default ? 
          <Badge variant="default">Default</Badge> : 
          <span className="text-muted-foreground">No</span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (info: any) => {
        const id = info.row.original.id;
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/payment/methods/${id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      }
    }
  ];

  return (
    <PageLayout
      title="Payment Methods"
      description="Manage your payment methods"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Payment Methods', url: '/payment/methods' }
      ]}
    >
      <div className="mb-6 flex items-center justify-between">
        <Input
          placeholder="Search payment methods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={filteredMethods}
          isLoading={isLoading}
          keyField="id"
          pagination={{
            currentPage: 1,
            totalPages: 1,
            totalItems: filteredMethods.length,
            pageSize: filteredMethods.length,
            onPageChange: () => {}, // No-op since we're showing all at once
          }}
          emptyMessage="No payment methods found"
        />
      </Card>
    </PageLayout>
  );
};

export default PaymentMethodsPage;
