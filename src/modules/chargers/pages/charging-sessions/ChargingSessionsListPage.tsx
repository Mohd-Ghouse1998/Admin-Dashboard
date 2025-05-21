import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Filter, Plus, Trash2, Edit, Eye, Ban, Zap } from 'lucide-react';
import { useChargingSession } from '@/modules/chargers/hooks/useChargingSession';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from '@/navigation/navigation';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ListTemplate, Column } from '@/components/templates/list/ListTemplate';
import { format } from 'date-fns';

export const ChargingSessionsListPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [sessionToStop, setSessionToStop] = useState<{id: number, chargerId: string, transactionId: number} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  // Get Charging Sessions with pagination
  const { getChargingSessions, deleteChargingSession, remoteStopTransaction } = useChargingSession();
  const { data, isLoading, error, refetch } = getChargingSessions(currentPage, filters);
  
  // Update filters when searchQuery or statusFilter changes
  useEffect(() => {
    const newFilters: Record<string, any> = {};
    
    if (searchQuery) {
      // Either search by transaction_id or formatted_transaction_id
      newFilters.search = searchQuery;
    }
    
    if (statusFilter !== 'all') {
      newFilters.status = statusFilter;
    }
    
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [searchQuery, statusFilter]);
  
  // Get sessions array from paginated response
  const sessions = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / 10); // Assuming 10 items per page

  // Handle delete
  const handleDelete = async () => {
    if (sessionToDelete) {
      try {
        await deleteChargingSession.mutateAsync(sessionToDelete);
        toast({
          title: 'Charging Session Deleted',
          description: 'The charging session has been successfully deleted.',
        });
        refetch();
      } catch (error) {
        console.error('Error deleting charging session:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete charging session. Please try again.',
          variant: 'destructive',
        });
      }
      setSessionToDelete(null);
    }
  };

  // Handle remote stop
  const handleRemoteStop = async () => {
    if (sessionToStop) {
      try {
        await remoteStopTransaction.mutateAsync({
          chargerId: sessionToStop.chargerId,
          transactionId: sessionToStop.transactionId
        });
        toast({
          title: 'Charging Session Stopped',
          description: 'The charging session has been successfully stopped.',
        });
        refetch();
      } catch (error) {
        console.error('Error stopping charging session:', error);
        toast({
          title: 'Error',
          description: 'Failed to stop charging session. Please try again.',
          variant: 'destructive',
        });
      }
      setSessionToStop(null);
    }
  };

  // Calculate energy and duration
  const calculateEnergy = (session) => {
    if (session.meter_stop !== undefined && session.meter_start !== undefined) {
      return ((session.meter_stop - session.meter_start) / 1000).toFixed(2) + ' kWh';
    }
    return 'N/A';
  };

  const calculateDuration = (session) => {
    if (!session.start_time) return 'N/A';
    
    const start = new Date(session.start_time);
    const end = session.end_time ? new Date(session.end_time) : new Date();
    
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Define columns for ListTemplate component
  const columns: Column<any>[] = [
    { 
      key: "id",
      header: "ID",
    },
    { 
      key: "formatted_transaction_id",
      header: "Transaction ID",
      render: (row) => (
        <span className="font-medium">
          {row.formatted_transaction_id || row.transaction_id}
        </span>
      )
    },
    { 
      key: "connector",
      header: "Connector",
    },
    { 
      key: "status",
      header: "Status",
      render: (row) => {
        const isActive = !row.end_time;
        return (
          <Badge 
            className={isActive 
              ? "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100" 
              : "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"}
          >
            {isActive ? 'Active' : 'Completed'}
          </Badge>
        );
      }
    },
    { 
      key: "energy",
      header: "Energy",
      render: (row) => calculateEnergy(row)
    },
    { 
      key: "start_time",
      header: "Start Time",
      render: (row) => row.start_time 
        ? format(new Date(row.start_time), 'PPp') 
        : 'N/A'
    },
    { 
      key: "end_time",
      header: "End Time",
      render: (row) => row.end_time 
        ? format(new Date(row.end_time), 'PPp') 
        : 'Active'
    },
    { 
      key: "duration",
      header: "Duration",
      render: (row) => calculateDuration(row)
    },
    { 
      key: "cost",
      header: "Cost",
      render: (row) => row.cost 
        ? `$${row.cost.toFixed(2)}` 
        : 'N/A'
    },
  ];
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="border border-primary/10 rounded-md overflow-hidden shadow-sm">
          <ListTemplate
            title="Charging Sessions"
            description="Manage all EV charging sessions in one place"
            icon={<Zap className="h-5 w-5" />}
            
            // Data props
            data={sessions}
            isLoading={isLoading}
            error={error}
            totalItems={totalCount}
            emptyState={
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No charging sessions found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            }
            
            // Search props
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by Transaction ID"
            
            // Filtering props
            filterComponent={
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetFilters}
                  className="h-9"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            }
            
            // Columns and rendering
            columns={columns}
            onRowClick={(row) => router.push(`/chargers/charging-sessions/${row.id}`)}
            actionBarClassName="p-4 bg-gray-50 border-b border-primary/10"
            
            // Create options
            createPath="/chargers/charging-sessions/create"
            createButtonText="Add Session"
            
            // Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={10}
            onPageChange={setCurrentPage}
            className="border-none shadow-none"
          />
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this charging session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stop Confirmation Dialog */}
      <AlertDialog open={!!sessionToStop} onOpenChange={() => setSessionToStop(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Charging Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remotely stop the charging session. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoteStop}>Stop Session</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChargingSessionsListPage;
