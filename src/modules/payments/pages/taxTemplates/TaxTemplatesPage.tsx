import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, Edit, Trash2 } from 'lucide-react';
import { getTaxTemplates, deleteTaxTemplate, TaxTemplate } from '@/services/api/taxTemplatesApi';
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

const TaxTemplatesPage = () => {
  const [taxTemplates, setTaxTemplates] = useState<TaxTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTaxTemplates();
  }, []);

  const fetchTaxTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await getTaxTemplates();
      setTaxTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch tax templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tax templates. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (templateToDelete === null) return;
    
    try {
      await deleteTaxTemplate(templateToDelete);
      
      setTaxTemplates(taxTemplates.filter(template => template.id !== templateToDelete));
      toast({
        title: 'Success',
        description: 'Tax template deleted successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to delete tax template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tax template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  // Define columns with proper types for DataTable
  const columns: Column<TaxTemplate>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (info: any) => info.getValue()
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (info: any) => info.getValue() || '—'
    },
    {
      header: 'Tax Type',
      accessorKey: 'tax_type',
      cell: (info: any) => info.getValue()
    },
    {
      header: 'Tax Rate',
      accessorKey: 'tax_rate',
      cell: (info: any) => `${info.getValue()}%`
    },
    {
      header: 'Country',
      accessorKey: 'country',
      cell: (info: any) => info.getValue() || '—'
    },
    {
      header: 'State',
      accessorKey: 'state',
      cell: (info: any) => info.getValue() || '—'
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (info: any) => {
        const isActive = info.getValue();
        
        return isActive ? 
          <Badge variant="success">Active</Badge> : 
          <Badge variant="destructive">Inactive</Badge>;
      }
    },
    {
      header: 'Default',
      accessorKey: 'is_default',
      cell: (info: any) => {
        const isDefault = info.getValue();
        
        return isDefault ? 
          <Badge variant="secondary">Default</Badge> : 
          <Badge variant="outline">No</Badge>;
      }
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (info: any) => {
        const id = info.row.original.id;
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/payment/tax-templates/${id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/payment/tax-templates/${id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleDeleteClick(id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <PageLayout
      title="Tax Templates"
      description="Manage tax templates for different regions and rates"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Tax Templates', url: '/payment/tax-templates' }
      ]}
      actions={
        <Button asChild>
          <Link to="/payment/tax-templates/create">
            <Plus className="h-4 w-4 mr-1" />
            Create Tax Template
          </Link>
        </Button>
      }
    >
      <Card>
        <DataTable
          columns={columns}
          data={taxTemplates}
          isLoading={isLoading}
          keyField="id"
          pagination={{
            currentPage: 1,
            totalPages: 1,
            totalItems: taxTemplates.length,
            pageSize: taxTemplates.length,
            onPageChange: () => {}, // No-op since we're showing all at once
          }}
          emptyMessage="No tax templates found"
        />
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tax template.
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

export default TaxTemplatesPage;
