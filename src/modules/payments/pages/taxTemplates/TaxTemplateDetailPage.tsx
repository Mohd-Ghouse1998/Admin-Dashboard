import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { getTaxTemplate, deleteTaxTemplate, TaxTemplate } from '@/services/api/taxTemplatesApi';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

const TaxTemplateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [template, setTemplate] = useState<TaxTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchTaxTemplate(parseInt(id));
    }
  }, [id]);

  const fetchTaxTemplate = async (templateId: number) => {
    setIsLoading(true);
    try {
      const response = await getTaxTemplate(templateId);
      setTemplate(response.data);
    } catch (error) {
      console.error('Failed to fetch tax template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tax template details. Please try again.',
        variant: 'destructive',
      });
      navigate('/payment/tax-templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    try {
      await deleteTaxTemplate(parseInt(id));
      toast({
        title: 'Success',
        description: 'Tax template deleted successfully',
        variant: 'success',
      });
      navigate('/payment/tax-templates');
    } catch (error) {
      console.error('Failed to delete tax template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tax template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPpp');
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Tax Template Details"
        description="Loading tax template information"
        breadcrumbs={[
          { label: 'Payment & Billing', url: '/payment' },
          { label: 'Tax Templates', url: '/payment/tax-templates' },
          { label: 'Details', url: `/payment/tax-templates/${id}` }
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/payment/tax-templates')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-64" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-36" />
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (!template) {
    return (
      <PageLayout
        title="Tax Template Not Found"
        description="The requested tax template could not be found"
        breadcrumbs={[
          { label: 'Payment & Billing', url: '/payment' },
          { label: 'Tax Templates', url: '/payment/tax-templates' },
          { label: 'Not Found', url: `/payment/tax-templates/${id}` }
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/payment/tax-templates')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        }
      >
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-medium">Tax Template Not Found</h3>
              <p className="text-muted-foreground">
                The tax template you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => navigate('/payment/tax-templates')}>
                Go to Tax Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Tax Template: ${template.name}`}
      description="Detailed information about this tax template"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payment' },
        { label: 'Tax Templates', url: '/payment/tax-templates' },
        { label: template.name, url: `/payment/tax-templates/${id}` }
      ]}
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/payment/tax-templates')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/payment/tax-templates/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base font-medium">{template.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-base">{template.description || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tax Type</p>
                <p className="text-base">{template.tax_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tax Rate</p>
                <p className="text-base font-medium">{template.tax_rate}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Country</p>
                <p className="text-base">{template.country || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">State</p>
                <p className="text-base">{template.state || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div>
                  {template.is_active ? 
                    <Badge variant="success">Active</Badge> : 
                    <Badge variant="destructive">Inactive</Badge>
                  }
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Default Template</p>
                <div>
                  {template.is_default ? 
                    <Badge variant="secondary">Default</Badge> : 
                    <Badge variant="outline">No</Badge>
                  }
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Compound Tax</p>
                <div>
                  {template.is_compound ? 
                    <Badge>Yes</Badge> : 
                    <Badge variant="outline">No</Badge>
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="text-base">{formatDate(template.created_at)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-base">{formatDate(template.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

export default TaxTemplateDetailPage;
