import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chargerApi } from '@/modules/chargers/services/chargerService';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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
import { ListTemplate, Column } from '@/components/templates/list/ListTemplate';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import {
  Tag, 
  User,
  GitBranch,
  Calendar,
  Lock,
  CheckCircle2, 
  XCircle, 
  Clock,
  Edit,
  Download,
  Trash2,
  FilterIcon,
  TrendingUp
} from 'lucide-react';

// Define ID Tag interface based on the API response
interface IDTag {
  id: number;
  idtag: string;
  user?: number;
  parent_idtag?: string | null;
  is_blocked: boolean;
  expiry_date?: string | null;
  is_expired: boolean;
  created_at?: string;
}

const IdTagsListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterBlocked, setFilterBlocked] = useState<boolean | undefined>(undefined);
  const [filterExpired, setFilterExpired] = useState<boolean | undefined>(undefined);
  const [selectedIdTagIds, setSelectedIdTagIds] = useState<(string | number)[]>([]);
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState(false);
  
  // Fetch ID tags with filters
  const { accessToken } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['idTags', searchQuery, filterBlocked, filterExpired, currentPage, pageSize],
    queryFn: async () => {
      try {
        console.log('Fetching ID tags with accessToken:', accessToken ? 'Yes (token present)' : 'No token');
        
        // Build filters object
        const filters: Record<string, any> = {
          page: currentPage,
          page_size: pageSize
        };
        
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

  // Function to format date in a readable way
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Process data from API
  const idTags = (data?.results || []) as IDTag[];
  const totalItems = data?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Filter component
  const filterComponent = (
    <div className="flex gap-2">
      <select
        value={filterBlocked === undefined ? 'all' : filterBlocked ? 'true' : 'false'}
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'all') {
            setFilterBlocked(undefined);
          } else {
            setFilterBlocked(value === 'true');
          }
          setCurrentPage(1);
        }}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background"
      >
        <option value="all">All Statuses</option>
        <option value="true">Blocked</option>
        <option value="false">Active</option>
      </select>

      <select
        value={filterExpired === undefined ? 'all' : filterExpired ? 'true' : 'false'}
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'all') {
            setFilterExpired(undefined);
          } else {
            setFilterExpired(value === 'true');
          }
          setCurrentPage(1);
        }}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background"
      >
        <option value="all">All Expiries</option>
        <option value="true">Expired</option>
        <option value="false">Valid</option>
      </select>
    </div>
  );
  
  // Define columns for the ListTemplate
  const columns: Column<IDTag>[] = [
    {
      header: "ID Tag",
      key: "idtag",
      render: (idTag) => idTag.idtag,
      width: "20%"
    },
    {
      header: "User",
      key: "user",
      render: (idTag) => idTag.user ? `User ${idTag.user}` : '-',
      width: "15%"
    },
    {
      header: "Parent ID Tag",
      key: "parent_idtag",
      render: (idTag) => idTag.parent_idtag || '-',
      width: "15%"
    },
    {
      header: "Expiry Date",
      key: "expiry_date",
      render: (idTag) => idTag.expiry_date ? formatDate(idTag.expiry_date) : 'No expiry',
      width: "20%"
    },
    {
      header: "Status",
      key: "is_blocked",
      render: (idTag) => {
        const isBlocked = idTag.is_blocked;
        const isExpired = idTag.is_expired;
        
        let status = 'Active';
        let bgColor = 'bg-green-100 text-green-800';
        
        if (isBlocked) {
          status = 'Blocked';
          bgColor = 'bg-red-100 text-red-800';
        } else if (isExpired) {
          status = 'Expired';
          bgColor = 'bg-yellow-100 text-yellow-800';
        }
        
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${bgColor}`}>{status}</span>
        );
      },
      width: "15%"
    }
  ];

  const handleIdTagSelection = (selectedTags: IDTag[]) => {
    setSelectedIdTagIds(selectedTags.map(tag => tag.id));
  };

  return (
    <>
      <Helmet>
        <title>ID Tags Management | EV Admin</title>
      </Helmet>
      
      <ListTemplate
        title="ID Tags Management"
        description="Manage RFID cards and authentication tags for chargers"
        icon={<Tag className="h-5 w-5 text-primary" />}
        data={idTags}
        isLoading={isLoading}
        error={error ? "Failed to load ID tags data" : null}
        columns={columns}
        onRowClick={(idTag) => navigate(`/chargers/id-tags/${idTag.id}`)}
        createPath="/chargers/id-tags/create"
        createButtonText="Add ID Tag"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search ID tags..."
        filterComponent={filterComponent}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        selectable={true}
        selectedItems={idTags.filter(tag => selectedIdTagIds.includes(tag.id))}
        onSelectItems={handleIdTagSelection}
        className="shadow-md border border-gray-100 rounded-lg overflow-hidden"
        tableClassName="[&_tr:hover]:bg-gray-50/80 [&_th]:bg-gray-50/70 [&_th]:text-gray-600 [&_th]:font-medium"
        actionBarClassName="border-b border-gray-100 bg-gray-50/40"
      />
      
      {/* Bulk action toolbar */}
      {selectedIdTagIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 
                      bg-gradient-to-r from-primary to-indigo-600 text-white 
                      py-3 px-5 rounded-full shadow-xl flex items-center gap-4 
                      transition-all duration-300 ease-in-out">
          <span className="font-medium">{selectedIdTagIds.length} items selected</span>
          <div className="h-5 w-px bg-white/20"></div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" className="h-8 bg-white/10 hover:bg-white/20 text-white border-none">
              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="secondary" className="h-8 bg-white/10 hover:bg-white/20 text-white border-none">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button size="sm" variant="destructive" className="h-8" onClick={() => setIsMultiDeleteDialogOpen(true)}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}
          
      {/* Multi-delete confirmation dialog */}
      <AlertDialog open={isMultiDeleteDialogOpen} onOpenChange={setIsMultiDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete multiple ID tags?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedIdTagIds.length} ID tags. This action will permanently remove all selected tags.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                // Implementation for multi-delete
                Promise.all(selectedIdTagIds.map(id => deleteMutation.mutateAsync(Number(id))))
                  .then(() => {
                    toast({
                      title: "ID Tags deleted",
                      description: `${selectedIdTagIds.length} ID tags have been successfully deleted.`,
                    });
                    setSelectedIdTagIds([]);
                  })
                  .catch(() => {
                    toast({
                      title: "Error",
                      description: "Failed to delete ID tags. Please try again.",
                      variant: "destructive",
                    });
                  })
                  .finally(() => {
                    setIsMultiDeleteDialogOpen(false);
                  });
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedIdTagIds.length} ID Tags
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default IdTagsListPage;
