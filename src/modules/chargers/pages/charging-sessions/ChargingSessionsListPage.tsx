import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, Trash2, Edit, Eye, Ban, Zap } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
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
} from "@/components/ui/alert-dialog";
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
  const { data, isLoading, refetch } = getChargingSessions(currentPage, filters);
  
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

  // Define columns for DataTable
  const columns = [
    { 
      accessorKey: "id",
      header: "ID",
    },
    { 
      accessorKey: "formatted_transaction_id",
      header: "Transaction ID",
      cell: (row) => (
        <Button
          variant="link"
          className="p-0 h-auto font-normal text-primary hover:text-primary-focus hover:underline"
          onClick={() => router.push(`/chargers/charging-sessions/${row.id}`)}
        >
          {row.formatted_transaction_id || row.transaction_id}
        </Button>
      )
    },
    { 
      accessorKey: "connector",
      header: "Connector",
    },
    { 
      accessorKey: "status", // Using accessorKey for DataTable to work correctly
      header: "Status",
      cell: (row) => {
        const isActive = !row.end_time;
        return (
          <StatusBadge 
            status={isActive ? 'Active' : 'Completed'} 
            variant={isActive ? 'info' : 'success'} 
          />
        );
      }
    },
    { 
      accessorKey: "energy", // Using accessorKey for DataTable to work correctly
      header: "Energy",
      cell: (row) => calculateEnergy(row)
    },
    { 
      accessorKey: "start_time",
      header: "Start Time",
      cell: (row) => row.start_time 
        ? format(new Date(row.start_time), 'PPp') 
        : 'N/A'
    },
    { 
      accessorKey: "end_time",
      header: "End Time",
      cell: (row) => row.end_time 
        ? format(new Date(row.end_time), 'PPp') 
        : 'Active'
    },
    { 
      accessorKey: "duration", // Using accessorKey for DataTable to work correctly
      header: "Duration",
      cell: (row) => calculateDuration(row)
    },
    { 
      accessorKey: "cost",
      header: "Cost",
      cell: (row) => row.cost 
        ? `$${row.cost.toFixed(2)}` 
        : 'N/A'
    },
    { 
      accessorKey: "actions", // Using accessorKey for DataTable to work correctly
      header: "Actions",
      cell: (row) => {
        const isActive = !row.end_time;
        return (
          <div className="flex space-x-2">
            <a 
              href={`/chargers/charging-sessions/${row.id.toString()}`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click from triggering
                console.log('Navigating to session detail with ID:', row.id);
              }}
            >
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </a>
            <a 
              href={`/chargers/charging-sessions/${row.id.toString()}/edit`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click from triggering
                console.log('Navigating to session edit with ID:', row.id);
              }}
            >
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </a>
            {isActive && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click from triggering
                  setSessionToStop({
                    id: row.id,
                    chargerId: row.charger,
                    transactionId: row.transaction_id
                  });
                }}
              >
                <Ban className="h-4 w-4 text-amber-500" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click from triggering
                setSessionToDelete(row.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    },
  ];
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <>
      <PageLayout title="Charging Sessions" description="Manage charging sessions">
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search by Transaction ID" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Status Filter */}
              <div className="w-52">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Reset Button */}
              <Button variant="outline" onClick={handleResetFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
              
              {/* Create Button */}
              <Button onClick={() => router.push('/chargers/charging-sessions/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Session
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Charging Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={sessions}
              keyField="id"
              isLoading={isLoading}
              onRowClick={(row) => router.push(`/chargers/charging-sessions/${row.id}`)}
              pagination={{
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalCount,
                onPageChange: (page) => setCurrentPage(page),
              }}
            />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {sessions.length} of {totalCount} sessions
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PageLayout>

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
