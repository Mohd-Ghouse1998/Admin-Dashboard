import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, Edit, Trash2 } from 'lucide-react';
import { getPromotions, deletePromotion, Promotion } from '@/services/api/promotionsApi';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const response = await getPromotions();
      setPromotions(response.data);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load promotions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setPromotionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (promotionToDelete === null) return;
    
    try {
      await deletePromotion(promotionToDelete);
      
      setPromotions(promotions.filter(promo => promo.id !== promotionToDelete));
      toast({
        title: 'Success',
        description: 'Promotion deleted successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete promotion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPromotionToDelete(null);
    }
  };

  // Define columns with proper types for DataTable
  const columns: Column<Promotion>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (info: any) => <span className="font-medium">{info.row.original.name}</span>
    },
    {
      header: 'Code',
      accessorKey: 'code',
      cell: (info: any) => (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
          {info.row.original.code}
        </code>
      )
    },
    {
      header: 'Discount',
      accessorKey: 'discount_value',
      cell: (info: any) => {
        const { discount_type, discount_value } = info.row.original;
        return discount_type === 'percentage' ? `${discount_value}%` : `$${discount_value.toFixed(2)}`;
      }
    },
    {
      header: 'Validity',
      accessorKey: 'end_date',
      cell: (info: any) => {
        const { start_date, end_date } = info.row.original;
        const formattedStartDate = format(new Date(start_date), 'MMM d, yyyy');
        
        if (!end_date) {
          return `From ${formattedStartDate}`;
        }
        
        const formattedEndDate = format(new Date(end_date), 'MMM d, yyyy');
        return `${formattedStartDate} - ${formattedEndDate}`;
      }
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (info: any) => {
        const isActive = info.row.original.is_active;
        const now = new Date();
        const endDate = info.row.original.end_date ? new Date(info.row.original.end_date) : null;
        
        let isExpired = false;
        if (endDate && now > endDate) {
          isExpired = true;
        }
        
        if (isExpired) {
          return <Badge variant="secondary">Expired</Badge>;
        }
        
        return isActive ? 
          <Badge variant="success">Active</Badge> : 
          <Badge variant="destructive">Inactive</Badge>;
      }
    },
    {
      header: 'Usage',
      accessorKey: 'current_uses',
      cell: (info: any) => {
        const { current_uses, max_uses } = info.row.original;
        return max_uses ? `${current_uses} / ${max_uses}` : `${current_uses}`;
      }
    },
    {
      header: 'Actions',
      accessorKey: 'id', // Using id as the accessorKey for the actions column
      cell: (info: any) => {
        const id = info.row.original.id;
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/payments/promotions/${id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/payments/promotions/${id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDeleteClick(id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <PageLayout
      title="Promotions"
      description="Manage promotional offers and discounts"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Promotions', url: '/payment/promotions' }
      ]}
      actions={
        <Button asChild>
          <Link to="/payment/promotions/create">
            <Plus className="h-4 w-4 mr-1" />
            Create Promotion
          </Link>
        </Button>
      }
    >
      <Card>
        <DataTable
          columns={columns}
          data={promotions}
          isLoading={isLoading}
          keyField="id"
          pagination={{
            currentPage: 1,
            totalPages: 1,
            totalItems: promotions.length,
            pageSize: promotions.length,
            onPageChange: () => {}, // No-op since we're showing all at once
          }}
          emptyMessage="No promotions found"
        />
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the promotion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default PromotionsPage;
