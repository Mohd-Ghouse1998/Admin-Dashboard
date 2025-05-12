import React from 'react';
import { useRouter } from '@/navigation/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowLeft, Trash2, Ban } from 'lucide-react';
import { useChargingSession } from '@/modules/chargers/hooks/useChargingSession';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ChargingSessionDetailPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  
  // Extract ID from URL path directly
  const pathParts = window.location.pathname.split('/');
  const idFromPath = pathParts[pathParts.length - 1];
  
  // Make sure we have a valid ID (from path or router)
  const id = idFromPath || '';
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isStopDialogOpen, setIsStopDialogOpen] = React.useState(false);
  
  console.log('Charging Session Detail Page - ID extraction:', {
    windowLocation: window.location.pathname,
    pathParts,
    idFromPath,
    finalId: id
  });
  
  const { 
    getChargingSessionById, 
    deleteChargingSession,
    remoteStopTransaction 
  } = useChargingSession();
  
  // Only fetch if we have a valid ID
  const { data: session, isLoading, error } = getChargingSessionById(id);
  
  React.useEffect(() => {
    if (error) {
      console.error('Error fetching charging session:', error);
      toast({
        title: 'Error',
        description: 'Failed to load charging session details.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  console.log('Session data:', session, 'Loading:', isLoading, 'Error:', error);

  // Calculate energy consumption
  const calculateEnergy = (session) => {
    if (session?.meter_stop !== undefined && session?.meter_start !== undefined) {
      return ((session.meter_stop - session.meter_start) / 1000).toFixed(2) + ' kWh';
    }
    return 'N/A';
  };

  // Calculate session duration
  const calculateDuration = (session) => {
    if (!session?.start_time) return 'N/A';
    
    const start = new Date(session.start_time);
    const end = session.end_time ? new Date(session.end_time) : new Date();
    
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Handle delete session
  const handleDelete = async () => {
    try {
      await deleteChargingSession.mutateAsync(id);
      toast({
        title: 'Charging Session Deleted',
        description: 'The charging session has been successfully deleted.',
      });
      router.push('/chargers/charging-sessions');
    } catch (error) {
      console.error('Error deleting charging session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete charging session. Please try again.',
        variant: 'destructive',
      });
    }
    setIsDeleteDialogOpen(false);
  };

  // Handle stop session
  const handleStopSession = async () => {
    if (!session) return;
    
    try {
      await remoteStopTransaction.mutateAsync({
        chargerId: session?.charger || '',
        transactionId: session?.transaction_id || 0
      });
      toast({
        title: 'Charging Session Stopped',
        description: 'The charging session has been successfully stopped.',
      });
      // Refresh session data
      if (id) {
        getChargingSessionById(id);
      }
    } catch (error) {
      console.error('Error stopping charging session:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop charging session. Please try again.',
        variant: 'destructive',
      });
    }
    setIsStopDialogOpen(false);
  };

  const isActiveSession = session && !session.end_time;

  // Format a session field value for display
  const formatFieldValue = (key, value) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Handle specific field types
    if (key.includes('time') && typeof value === 'string') {
      return format(new Date(value), 'PPp');
    }
    
    if (key === 'cost') {
      return `$${parseFloat(value).toFixed(2)}`;
    }
    
    return String(value);
  };

  // Format a field name for display
  const formatFieldName = (key) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      <PageLayout
        title={isLoading ? 'Loading...' : `Charging Session: ${session?.formatted_transaction_id || session?.transaction_id}`}
        description="Charging session details"
      >
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => window.location.href = '/chargers/charging-sessions'}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sessions
          </Button>
          
          <div className="flex space-x-2">
            {isActiveSession && (
              <Button 
                variant="outline" 
                onClick={() => setIsStopDialogOpen(true)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Stop Session
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.location.href = `/chargers/charging-sessions/${id}/edit`}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : session ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant={isActiveSession ? 'default' : 'outline'}>
                    {isActiveSession ? 'Active' : 'Completed'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Transaction ID:</span>
                  <span>{session.formatted_transaction_id || session.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Start Time:</span>
                  <span>{formatFieldValue('start_time', session.start_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">End Time:</span>
                  <span>{formatFieldValue('end_time', session.end_time) || 'Active'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Duration:</span>
                  <span>{calculateDuration(session)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Energy:</span>
                  <span>{calculateEnergy(session)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Connector ID:</span>
                  <span>{session.connector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Meter Start:</span>
                  <span>{session.meter_start !== null ? `${session.meter_start} Wh` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Meter Stop:</span>
                  <span>{session.meter_stop !== null ? `${session.meter_stop} Wh` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Cost:</span>
                  <span>{formatFieldValue('cost', session.cost)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Information */}
            <Card>
              <CardHeader>
                <CardTitle>Authentication Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">ID Tag:</span>
                  <span>{session.id_tag !== null ? session.id_tag : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Stop ID Tag:</span>
                  <span>{session.stop_id_tag || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Auth Method:</span>
                  <span>{session.auth_method || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Reservation ID:</span>
                  <span>{session.reservation_id || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Limit Information */}
            <Card>
              <CardHeader>
                <CardTitle>Limit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Limit:</span>
                  <span>{session.limit ? `${session.limit} ${session.limit_type === 'AMOUNT' ? '$' : 'kWh'}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Limit Type:</span>
                  <span>{session.limit_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Reason:</span>
                  <span>{session.reason || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* OCPI Information */}
            <Card>
              <CardHeader>
                <CardTitle>OCPI Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">OCPI Session ID:</span>
                  <span>{session.ocpi_session_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">OCPI EMSP ID:</span>
                  <span>{session.ocpi_emsp_id || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Session Not Found</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <p>The charging session with ID "{id}" could not be found or may have been deleted.</p>
                <Button onClick={() => window.location.href = '/chargers/charging-sessions'}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sessions List
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </PageLayout>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the charging session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stop Session Confirmation Dialog */}
      <AlertDialog open={isStopDialogOpen} onOpenChange={setIsStopDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Charging Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remotely stop the charging session. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStopSession}>Stop Session</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChargingSessionDetailPage;
