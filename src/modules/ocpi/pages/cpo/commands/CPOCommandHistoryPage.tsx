import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  Clock,
  Search,
  Terminal,
  Eye,
  RotateCw,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useOCPIRole } from '../../../contexts/OCPIRoleContext';
import { OCPIApiService } from '../../../services';
import { CommandType, CommandStatus, OCPICommand } from '../../../types/command.types';

const CPOCommandHistoryPage: React.FC = () => {
  const { toast } = useToast();
  const { syncRoleWithBackend, role } = useOCPIRole();
  const navigate = useNavigate();
  
  // Filters state
  const [commandTypeFilter, setCommandTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('');
  
  // Prepare query parameters
  const getQueryParams = () => {
    const params: any = {};
    if (commandTypeFilter && commandTypeFilter !== 'all_types') params.command_type = commandTypeFilter;
    if (statusFilter && statusFilter !== 'all_statuses') params.status = statusFilter;
    if (searchTerm) params.search = searchTerm;
    
    // Handle date range filter
    if (dateRangeFilter === 'today') {
      const today = new Date();
      params.start_date = today.toISOString().split('T')[0];
    } else if (dateRangeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      params.start_date = weekAgo.toISOString().split('T')[0];
    } else if (dateRangeFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      params.start_date = monthAgo.toISOString().split('T')[0];
    }
    
    return params;
  };

  // Fetch commands with filters
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ocpi', 'cpo', 'commands', commandTypeFilter, statusFilter, searchTerm, dateRangeFilter],
    queryFn: async () => {
      try {
        const response = await OCPIApiService.cpo.commands.getAll(getQueryParams());
        return response.data;
      } catch (error: any) {
        // Handle 401 errors (unauthorized)
        if (error.response && error.response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Your session may have expired. Please try again.",
            variant: "destructive"
          });
        }
        throw error;
      }
    },
    enabled: role === 'CPO'
  });

  useEffect(() => {
    // Ensure the user has the CPO role before fetching data
    syncRoleWithBackend('CPO');
  }, [syncRoleWithBackend]);

  // Handle view command details
  const handleViewCommand = (commandId: string) => {
    navigate(`/ocpi/cpo/commands/${commandId}`);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setCommandTypeFilter('all_types');
    setStatusFilter('all_statuses');
    setSearchTerm('');
    setDateRangeFilter('all_dates');
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case CommandStatus.SUCCESSFUL:
      case CommandStatus.ACCEPTED:
        return 'default';
      case CommandStatus.PENDING:
      case CommandStatus.PROCESSING:
        return 'outline';
      case CommandStatus.FAILED:
      case CommandStatus.REJECTED:
        return 'destructive';
      case CommandStatus.CANCELLED:
      case CommandStatus.EXPIRED:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get command target display
  const getCommandTarget = (command: OCPICommand) => {
    if (command.session_id) {
      return `Session: ${command.session_id}`;
    } else if (command.location_id) {
      let target = `Location: ${command.location_id}`;
      if (command.evse_uid) {
        target += ` / EVSE: ${command.evse_uid}`;
        if (command.connector_id) {
          target += ` / Connector: ${command.connector_id}`;
        }
      }
      return target;
    } else if (command.reservation_id) {
      return `Reservation: ${command.reservation_id}`;
    }
    return 'Not specified';
  };

  return (
    <PageLayout title="Command History" description="View and manage commands received by your charging points">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>CPO Command History</CardTitle>
            <CardDescription>View and manage commands received by your charging points</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="command-type" className="text-sm font-medium leading-none">Command Type</label>
              <Select value={commandTypeFilter} onValueChange={setCommandTypeFilter}>
                <SelectTrigger id="command-type" className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all_types">All Types</SelectItem>
                  {Object.values(CommandType).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium leading-none">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status" className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all_statuses">All Statuses</SelectItem>
                  {Object.values(CommandStatus).map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="date-filter" className="text-sm font-medium leading-none">Date Range</label>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger id="date-filter" className="w-[180px]">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all_dates">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5 flex-grow">
              <label htmlFor="search" className="text-sm font-medium leading-none">Search</label>
              <div className="flex space-x-2">
                <Input
                  id="search"
                  placeholder="Search by ID, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow"
                />
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleResetFilters} title="Reset filters">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Command History Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading commands...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-2" />
              <h3 className="font-semibold text-lg">Error Loading Commands</h3>
              <p className="text-muted-foreground max-w-md">
                {error instanceof Error ? error.message : 'An unexpected error occurred.'}
              </p>
              <Button onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : data?.results?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Terminal className="mx-auto h-12 w-12 opacity-50 mb-2" />
              <p>No commands found with the current filters.</p>
              <Button variant="link" onClick={handleResetFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Command Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results.map((command: OCPICommand) => (
                    <TableRow key={command.id} className="group">
                      <TableCell className="font-medium">{command.command_type}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(command.status)}>
                          {command.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{getCommandTarget(command)}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>
                            {format(new Date(command.created_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewCommand(command.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex items-center justify-between space-x-4 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{data?.results.length}</span> of{' '}
                  <span className="font-medium">{data?.count || 0}</span> commands
                </div>
                {/* Pagination could be added here if needed */}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default CPOCommandHistoryPage;
