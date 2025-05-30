import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Search,
  ArrowUp,
  ArrowDown,
  Loader2,
  FileSpreadsheet,
  Database,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  ChartType, 
  TimePeriod, 
  DateRange, 
  ChargerUtilizationResponse,
  UserActivityResponse 
} from '../Chart';
import { EmptyState } from './EmptyState';

interface DataDetailsProps {
  chartType: ChartType;
  timePeriod: TimePeriod;
  dateRange: DateRange;
  chargerUtilization: ChargerUtilizationResponse | null;
  userData: UserActivityResponse | null;
  isLoading: boolean;
  error: Error | null;
}

// Define the data item type based on chart type
interface DataItem {
  id: string;
  name: string;
  location?: string;
  date?: string;
  energy?: number;
  revenue?: number;
  sessions?: number;
  utilization?: number;
  users?: number;
  [key: string]: any;
}

export const DataDetails: React.FC<DataDetailsProps> = ({
  chartType,
  timePeriod,
  dateRange,
  chargerUtilization,
  userData,
  isLoading,
  error,
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Sorting state
  const [sortField, setSortField] = useState<string>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Format table data based on chart type
  const formatTableData = (): DataItem[] => {
    // If charger utilization data is available
    if (chargerUtilization?.charger_utilization && ['energy', 'revenue', 'sessions', 'chargers'].includes(chartType)) {
      return chargerUtilization.charger_utilization.map((item, index) => ({
        id: item.charger_id || `id-${index}`,
        name: item.name || `Charger ${index+1}`,
        location: item.location || '-',
        date: format(new Date(), 'yyyy-MM-dd'),  // Current date as these are aggregated stats
        energy: item.energy_delivered,
        revenue: item.revenue,
        sessions: item.sessions,
        utilization: item.utilization_rate,
        users: 0  // Not available in this dataset
      }));
    }
    
    // If user data is available and chartType is users
    if (userData?.user_activity && chartType === 'users') {
      return userData.user_activity.map((item, index) => ({
        id: item.user_id || `id-${index}`,
        name: item.username || `User ${index+1}`,
        location: '-',  // Not available in this dataset
        date: format(new Date(), 'yyyy-MM-dd'),  // Current date as these are aggregated stats
        energy: item.energy_kwh,
        revenue: item.revenue,
        sessions: item.sessions,
        utilization: 0,  // Not available in this dataset
        users: 1  // Count as one user
      }));
    }
    
    // No data available, return empty array
    return [];
  };

  // Get column title based on chart type
  const getValueColumnTitle = () => {
    switch (chartType) {
      case 'energy':
        return 'Energy (kWh)';
      case 'revenue':
        return 'Revenue ($)';
      case 'sessions':
        return 'Sessions';
      case 'users':
        return 'Users';
      case 'chargers':
        return 'Utilization (%)';
      case 'custom':
        return 'Value';
      default:
        return 'Value';
    }
  };
  
  // Get value from item based on chart type
  const getItemValue = (item: DataItem) => {
    switch (chartType) {
      case 'energy':
        return item.energy;
      case 'revenue':
        return item.revenue;
      case 'sessions':
        return item.sessions;
      case 'users':
        return item.users;
      case 'chargers':
        return item.utilization;
      default:
        return 0;
    }
  };

  // Format value based on data type
  const formatValue = (value: number | undefined, type: string) => {
    if (value === undefined || value === null) return '-';
    
    switch (type) {
      case 'energy':
        return `${value.toFixed(2)} kWh`;
      case 'revenue':
        return `$${value.toFixed(2)}`;
      case 'utilization':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle CSV export
  const handleExportCSV = () => {
    const headers = ['Name', 'Location', 'Date', getValueColumnTitle(), 'Sessions', 'Utilization (%)', 'Users'];
    
    const csvData = [
      headers.join(','),
      ...filteredAndSortedData.map(item => [
        item.name,
        item.location,
        item.date,
        item.value,
        item.sessions,
        item.utilization,
        item.users
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${chartType}-data-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Get all data
  const allData = formatTableData();
  
  // Filter data based on search query
  const filteredData = allData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Sort filtered data
  const filteredAndSortedData = [...filteredData].sort((a, b) => {
    let aValue, bValue;
    
    if (sortField === 'value') {
      aValue = getItemValue(a) || 0;
      bValue = getItemValue(b) || 0;
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' ? (aValue || 0) - (bValue || 0) : (bValue || 0) - (aValue || 0);
  });
  
  // Paginate data
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  
  // Generate page numbers for pagination
  const pageNumbers = [];
  const displayPageCount = 3; // Number of page numbers to display
  
  let startPage = Math.max(1, currentPage - Math.floor(displayPageCount / 2));
  let endPage = Math.min(totalPages, startPage + displayPageCount - 1);
  
  if (endPage - startPage + 1 < displayPageCount) {
    startPage = Math.max(1, endPage - displayPageCount + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  // Render table content
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-28 text-center">
            <EmptyState
              type="loading"
              chartType="table"
              message="Loading data details..."
            />
          </TableCell>
        </TableRow>
      );
    }
    
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-28 text-center">
            <EmptyState
              type="error"
              chartType="table"
              message={error.message || 'Could not load data details'}
              onRetry={() => window.location.reload()}
            />
          </TableCell>
        </TableRow>
      );
    }
    
    if (paginatedData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-28 text-center">
            <EmptyState
              type="no-data"
              chartType="table"
              message={searchQuery ? `No results match "${searchQuery}"` : 'No data available for the selected filters'}
            />
          </TableCell>
        </TableRow>
      );
    }
    
    return paginatedData.map((item) => (
      <TableRow key={item.id} className="text-xs">
        <TableCell className="py-2 font-medium">{item.name}</TableCell>
        <TableCell className="py-2">{item.location}</TableCell>
        <TableCell className="py-2">{item.date}</TableCell>
        <TableCell className="py-2 text-right">{formatValue(getItemValue(item), chartType)}</TableCell>
        <TableCell className="py-2 text-right">{formatValue(item.sessions, 'sessions')}</TableCell>
        <TableCell className="py-2 text-right">{formatValue(item.utilization, 'utilization')}</TableCell>
        <TableCell className="py-2 text-right">{formatValue(item.users, 'users')}</TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center bg-white p-3 rounded-md border shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-indigo-500" />
          <h3 className="text-base font-medium">Data Details</h3>
        </div>
        <div className="relative w-56">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-500" />
          <Input 
            placeholder="Search..." 
            value={searchQuery}
            onChange={handleSearch}
            className="h-7 pl-7 text-xs"
          />
        </div>
      </div>
      
      <div className="bg-white border rounded-md overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b">
              <TableHead className="py-2 text-xs w-[150px] cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                <div className="flex items-center">
                  Name
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? 
                    <ArrowUp className="ml-1 h-3 w-3 text-blue-500" /> : 
                    <ArrowDown className="ml-1 h-3 w-3 text-blue-500" />
                  )}
                </div>
              </TableHead>
              <TableHead className="py-2 text-xs cursor-pointer hover:bg-gray-100" onClick={() => handleSort('location')}>
                <div className="flex items-center">
                  Location
                  {sortField === 'location' && (
                    sortDirection === 'asc' ? 
                    <ArrowUp className="ml-1 h-3 w-3 text-blue-500" /> : 
                    <ArrowDown className="ml-1 h-3 w-3 text-blue-500" />
                  )}
                </div>
              </TableHead>
              <TableHead className="py-2 text-xs cursor-pointer hover:bg-gray-100" onClick={() => handleSort('date')}>
                <div className="flex items-center">
                  Date
                  {sortField === 'date' && (
                    sortDirection === 'asc' ? 
                    <ArrowUp className="ml-1 h-3 w-3 text-blue-500" /> : 
                    <ArrowDown className="ml-1 h-3 w-3 text-blue-500" />
                  )}
                </div>
              </TableHead>
              <TableHead className="py-2 text-xs text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('value')}>
                <div className="flex items-center justify-end">
                  {getValueColumnTitle()}
                  {sortField === 'value' && (
                    sortDirection === 'asc' ? 
                    <ArrowUp className="ml-1 h-3 w-3 text-blue-500" /> : 
                    <ArrowDown className="ml-1 h-3 w-3 text-blue-500" />
                  )}
                </div>
              </TableHead>
              <TableHead className="py-2 text-xs text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('sessions')}>
                <div className="flex items-center justify-end">
                  Sessions
                  {sortField === 'sessions' && (
                    sortDirection === 'asc' ? 
                    <ArrowUp className="ml-1 h-3 w-3 text-blue-500" /> : 
                    <ArrowDown className="ml-1 h-3 w-3 text-blue-500" />
                  )}
                </div>
              </TableHead>
              <TableHead className="py-2 text-xs text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('utilization')}>
                <div className="flex items-center justify-end">
                  Utilization (%)
                  {sortField === 'utilization' && (
                    sortDirection === 'asc' ? 
                    <ArrowUp className="ml-1 h-3 w-3 text-blue-500" /> : 
                    <ArrowDown className="ml-1 h-3 w-3 text-blue-500" />
                  )}
                </div>
              </TableHead>
              <TableHead className="py-2 text-xs text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('users')}>
                <div className="flex items-center justify-end">
                  Users
                  {sortField === 'users' && (
                    sortDirection === 'asc' ? 
                    <ArrowUp className="ml-1 h-3 w-3 text-blue-500" /> : 
                    <ArrowDown className="ml-1 h-3 w-3 text-blue-500" />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-between items-center pt-2 px-3 pb-3 bg-white border rounded-md shadow-sm">
        <div className="text-xs text-gray-500">
          Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} items
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-0.5 bg-gray-50 rounded-md p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            
            {pageNumbers.map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                className="h-6 w-6 p-0 text-xs"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-6 ml-2 text-xs flex items-center gap-1 border-gray-200"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataDetails;
