
import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useIdTag } from '@/hooks/useIdTag';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractArrayFromResponse } from '@/utils/apiHelpers';

export const IdTagsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Get ID Tags
  const { getIdTags } = useIdTag();
  const { data: idTagsData, isLoading: isLoadingIdTags } = getIdTags();
  
  // Extract ID tags safely
  const idTags = extractArrayFromResponse(idTagsData, []);
  
  // Filter ID Tags based on search and status
  const filteredIdTags = idTags.filter(tag => {
    // Search filter
    const matchesSearch = searchQuery 
      ? tag.id_tag?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    // Status filter
    const matchesStatus = statusFilter !== 'all' 
      ? tag.status === statusFilter
      : true;
    
    return matchesSearch && matchesStatus;
  });

  // Define columns for DataTable
  const columns = [
    { header: "Tag ID", accessorKey: "id_tag" },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (row: any) => {
        const status = row.status || 'Unknown';
        let variant: "success" | "warning" | "danger" | "info" | "neutral" = "neutral";
        
        switch (status) {
          case "Accepted":
            variant = "success";
            break;
          case "Blocked":
            variant = "danger";
            break;
          case "Expired":
            variant = "warning";
            break;
          case "Invalid":
            variant = "danger";
            break;
        }
        
        return <StatusBadge status={status} variant={variant} />;
      }
    },
    { 
      header: "Parent Tag", 
      accessorKey: "parent_id_tag",
      cell: (row: any) => row.parent_id_tag || 'N/A'
    },
    { 
      header: "Expiry Date", 
      accessorKey: "expiry_date",
      cell: (row: any) => row.expiry_date ? new Date(row.expiry_date).toLocaleDateString() : 'N/A'
    },
    { 
      header: "User", 
      accessorKey: "user",
      cell: (row: any) => row.user || 'None'
    },
    { 
      header: "Valid", 
      accessorKey: "valid",
      cell: (row: any) => (
        <StatusBadge 
          status={row.valid ? 'Valid' : 'Invalid'} 
          variant={row.valid ? 'success' : 'danger'} 
        />
      )
    },
  ];
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <PageLayout title="ID Tags" description="Manage RFID tags for charging authentication">
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search by tag ID" 
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
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Invalid">Invalid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Reset Button */}
            <Button variant="outline" onClick={handleResetFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
            
            {/* Create Button */}
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add ID Tag
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>ID Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredIdTags}
            keyField="id"
            emptyMessage="No ID tags found"
            isLoading={isLoadingIdTags}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default IdTagsPage;
