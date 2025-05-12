
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getSessionBilling, SessionBilling } from '@/services/api/sessionBillingsApi';

const SessionBillingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionBilling, setSessionBilling] = useState<SessionBilling | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchSessionBilling = async () => {
      setIsLoading(true);
      try {
        const response = await getSessionBilling(id);
        setSessionBilling(response.data);
      } catch (err) {
        console.error('Error fetching session billing:', err);
        setError(err instanceof Error ? err : new Error('Failed to load session billing'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessionBilling();
  }, [id]);
  
  // Handle error state
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: `Failed to load session billing: ${error.message}`,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (!isLoading && !sessionBilling) {
    return (
      <PageLayout
        title="Session Billing Not Found"
        description="The session billing you're looking for doesn't exist or you don't have permission to view it"
        backButton
        backTo="/payment/session-billings"
      >
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-semibold text-gray-800">Session Billing Not Found</h2>
          <p className="text-gray-600 mt-2">
            The session billing you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button 
            onClick={() => navigate('/payment/session-billings')}
            className="mt-6"
          >
            Return to Session Billings
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={isLoading ? 'Loading Session Billing...' : `Session Billing: ${sessionBilling?.session || id}`}
      description={isLoading ? 'Loading session billing details...' : `Billing details for charging session ${sessionBilling?.session || id}`}
      backButton
      backTo="/payment/session-billings"
    >
      {sessionBilling && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Billing Details</CardTitle>
              <CardDescription>ID: {sessionBilling.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Session ID</h3>
                  <p className="text-sm text-gray-500">{sessionBilling.session}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">CDR Sent</h3>
                  <Badge variant={sessionBilling.cdr_sent ? "success" : "secondary"}>
                    {sessionBilling.cdr_sent ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Amount Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs text-gray-500">Amount Added</h4>
                    <p className="text-sm">{sessionBilling.amount_added !== null ? `$${sessionBilling.amount_added.toFixed(2)}` : 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500">Amount Consumed</h4>
                    <p className="text-sm">{sessionBilling.amount_consumed !== null ? `$${sessionBilling.amount_consumed.toFixed(2)}` : 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500">Amount Refunded</h4>
                    <p className="text-sm">{sessionBilling.amount_refunded !== null ? `$${sessionBilling.amount_refunded.toFixed(2)}` : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Energy Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs text-gray-500">Energy Added</h4>
                    <p className="text-sm">{sessionBilling.kwh_added !== null ? `${sessionBilling.kwh_added} kWh` : 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500">Energy Consumed</h4>
                    <p className="text-sm">{sessionBilling.kwh_consumed !== null ? `${sessionBilling.kwh_consumed} kWh` : 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500">Energy Refunded</h4>
                    <p className="text-sm">{sessionBilling.kwh_refunded !== null ? `${sessionBilling.kwh_refunded} kWh` : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Time Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs text-gray-500">Time Added</h4>
                    <p className="text-sm">{sessionBilling.time_added !== null ? `${sessionBilling.time_added} hours` : 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500">Time Consumed</h4>
                    <p className="text-sm">{sessionBilling.time_consumed !== null ? `${sessionBilling.time_consumed} hours` : 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500">Time Refunded</h4>
                    <p className="text-sm">{sessionBilling.time_refunded !== null ? `${sessionBilling.time_refunded} hours` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
};

export default SessionBillingDetailPage;
