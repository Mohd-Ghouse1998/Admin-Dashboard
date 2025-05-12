import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { 
  AlertCircle, 
  Tag, 
  Plus, 
  Search, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Calendar,
  User,
  GitBranch, // Using GitBranch instead of ParentChild which doesn't exist
  MoreHorizontal
} from 'lucide-react';
// Using type any for ColumnDef since we may have issues with @tanstack/react-table types
type ColumnDef<T> = any;
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chargerApi } from '@/modules/chargers/services/chargerService';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Define IDTag interface based on the API response
interface IDTag {
  id: number;
  idtag: string;
  user?: number;
  parent_idtag?: string | null;
  is_blocked: boolean;
  expiry_date?: string | null;
  is_expired: boolean;
}

const IdTagsListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlocked, setFilterBlocked] = useState<boolean | undefined>(undefined);
  const [filterExpired, setFilterExpired] = useState<boolean | undefined>(undefined);
  
  // Fetch id tags with filters
  const { accessToken } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['idTags', searchQuery, filterBlocked, filterExpired],
    queryFn: async () => {
      try {
        console.log('Fetching ID tags with accessToken:', accessToken ? 'Yes (token present)' : 'No token');
        
        // Build filters object
        const filters: Record<string, any> = {};
        
        if (searchQuery) {
          filters.search = searchQuery;
        }
        
        if (filterBlocked !== undefined) {
          filters.is_blocked = filterBlocked;
        }
        
        if (filterExpired !== undefined) {
          filters.is_expired = filterExpired;
        }
        
        console.log('Fetching with filters:', filters);
        const result = await chargerApi.getIdTags(accessToken, filters);
        console.log('ID tags API response:', result);
        return result;
      } catch (error) {
        console.error('Error fetching ID tags:', error);
        throw error;
      }
    },
    enabled: !!accessToken // Only run query when accessToken is available
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        console.log(`Deleting ID tag with ID: ${id}`);
        const result = await chargerApi.deleteIdTag(accessToken, id.toString());
        console.log('Delete response:', result);
        return result;
      } catch (error) {
        console.error('Error in delete mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idTags'] });
      toast({
        title: 'ID Tag Deleted',
        description: 'The ID tag was successfully deleted.',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Error deleting ID tag:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting the ID tag.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle delete action
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this ID tag?')) {
      deleteMutation.mutate(id);
    }
  };
  
  // Define columns for the data table
  const columns: ColumnDef<IDTag>[] = [
    {
      accessorKey: 'idtag',
      header: 'ID Tag',
      cell: ({ row }) => {
        if (!row?.original) return null;
        return (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <Link 
              to={`/chargers/id-tags/${row.original.id}`}
              className="font-medium text-primary hover:underline"
            >
              {row.original.idtag}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        if (!row?.original) return null;
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {row.original.user ? (
              <Link 
                to={`/users/${row.original.user}`}
                className="text-sm hover:underline"
              >
                User {row.original.user}
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">Not assigned</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'parent_idtag',
      header: 'Parent ID Tag',
      cell: ({ row }) => {
        if (!row?.original) return null;
        return (
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {row.original.parent_idtag ? (
              <span className="text-sm">{row.original.parent_idtag}</span>
            ) : (
              <span className="text-sm text-muted-foreground">None</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'is_blocked',
      header: 'Status',
      cell: ({ row }) => {
        if (!row?.original) return null;
        return (
          <div className="flex items-center gap-2">
            {row.original.is_blocked ? (
              <>
                <Lock className="h-4 w-4 text-destructive" />
                <Badge variant="destructive">Blocked</Badge>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                  Active
                </Badge>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'expiry_date',
      header: 'Expiry Date',
      cell: ({ row }) => {
        if (!row?.original) return null;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {row.original.expiry_date ? (
              <span className="text-sm">
                {format(new Date(row.original.expiry_date), 'dd MMM yyyy, HH:mm')}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">No expiry</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'is_expired',
      header: 'Expiry Status',
      cell: ({ row }) => {
        if (!row?.original) return null;
        return (
          <div className="flex items-center gap-2">
            {row.original.is_expired ? (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <Badge variant="destructive">Expired</Badge>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 text-green-500" />
                <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                  Valid
                </Badge>
              </>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        if (!row?.original) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/chargers/id-tags/${row.original.id}`}>
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/chargers/id-tags/${row.original.id}/edit`}>
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(row.original.id)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  
  // Add debugging for data coming from the API
  console.log('Raw data from API:', data);
  
  // Ensure we're handling the pagination data correctly
  const processedData = data?.results || [];
  console.log('Processed data for table:', processedData);
  
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Create pagination object for the DataTable
  const pagination = data 
    ? {
        currentPage: currentPage,
        totalPages: Math.ceil(data.count / pageSize),
        totalItems: data.count,
        pageSize: pageSize,
        onPageChange: (page: number) => setCurrentPage(page),
        onPageSizeChange: (newPageSize: number) => setPageSize(newPageSize),
        pageSizeOptions: [10, 20, 30, 50]
      }
    : {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: 10,
        onPageChange: (page: number) => setCurrentPage(page),
        onPageSizeChange: (newPageSize: number) => setPageSize(newPageSize),
        pageSizeOptions: [10, 20, 30, 50]
      };
  
  // Log pagination configuration
  console.log('Pagination config:', pagination);
  
  return (
    <PageLayout
      title="ID Tags Management"
      description="Manage RFID cards and authentication tags for chargers"
      actions={
        <Button asChild>
          <Link to="/chargers/id-tags/create">
            <Plus className="mr-2 h-4 w-4" /> Create ID Tag
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>ID Tags Management | Electric Flow Admin Portal</title>
      </Helmet>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by ID Tag"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="blocked-status">Blocked Status</Label>
              <Select
                value={filterBlocked?.toString() || 'all'}
                onValueChange={(value) => 
                  setFilterBlocked(value === 'all' ? undefined : value === 'true')
                }
              >
                <SelectTrigger id="blocked-status" className="mt-1">
                  <SelectValue placeholder="Filter by blocked status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Blocked</SelectItem>
                  <SelectItem value="false">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="expired-status">Expiry Status</Label>
              <Select
                value={filterExpired?.toString() || 'all'}
                onValueChange={(value) => 
                  setFilterExpired(value === 'all' ? undefined : value === 'true')
                }
              >
                <SelectTrigger id="expired-status" className="mt-1">
                  <SelectValue placeholder="Filter by expiry status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Expired</SelectItem>
                  <SelectItem value="false">Valid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <div>
                <h3 className="font-semibold">Error loading ID tags</h3>
                <p className="text-sm text-muted-foreground">
                  There was a problem loading the ID tags. Please try again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="ml-2">Loading ID Tags...</span>
            </div>
          </CardContent>
        </Card>
      ) : processedData.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center text-center">
              <Tag className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-semibold">No ID Tags Found</h3>
              <p className="text-sm text-muted-foreground">
                No ID tags match your search criteria
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={`header-${index}`}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.map((row, rowIndex) => (
                <TableRow key={`row-${row.id || rowIndex}`}>
                  {columns.map((column, colIndex) => {
                    return (
                      <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                        {column.cell ? column.cell({ row: { original: row } }) : row[column.accessorKey]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Simple pagination UI */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {processedData.length} of {data?.count || 0} ID Tags
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default IdTagsListPage;
