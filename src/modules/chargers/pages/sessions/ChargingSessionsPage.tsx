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
import { Search, Filter } from 'lucide-react';
import { ChargingSessionTable } from '@/modules/chargers/components';
import { useChargingSession } from '@/modules/chargers/hooks';
import { useCharger } from '@/modules/chargers/hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from '@/components/ui/date-picker';
import { 
  extractArrayFromResponse, 
  createSafeSelectValue, 
  shouldRenderSelectItem 
} from '@/utils/apiHelpers';

export const ChargingSessionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharger, setSelectedCharger] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Get chargers for the filter dropdown
  const { getChargers } = useCharger();
  const { data: chargersData, isLoading: isLoadingChargers } = getChargers();
  
  // Get sessions
  const { getSessions, getSessionsByStatus } = useChargingSession();
  
  // Use the appropriate query based on filters
  const { 
    data: sessionsData, 
    isLoading: isLoadingSessions 
  } = selectedStatus !== 'all'
    ? getSessionsByStatus(selectedStatus) 
    : getSessions(selectedCharger !== 'all' ? selectedCharger : undefined);
  
  // Safely extract data from API responses
  const chargers = extractArrayFromResponse(chargersData, []);
  const sessions = extractArrayFromResponse(sessionsData, []);
  
  // Filter sessions based on search query and dates
  const filteredSessions = sessions.filter(session => {
    // Search filter
    const matchesSearch = searchQuery 
      ? ((session.id_tag || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
         (session.charger_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
         (session.transaction_id?.toString() || '').includes(searchQuery))
      : true;
      
    // Date filters
    const sessionStart = session.start_timestamp ? new Date(session.start_timestamp) : null;
    const matchesStartDate = startDate && sessionStart ? sessionStart >= startDate : true;
    const matchesEndDate = endDate && sessionStart ? sessionStart <= endDate : true;
    
    return matchesSearch && matchesStartDate && matchesEndDate;
  });
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCharger('all');
    setSelectedStatus('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <PageLayout title="Charging Sessions" description="View and manage charging session records">
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search by ID tag, charger, or transaction ID" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Charger Filter */}
            <div className="w-52">
              <Select value={selectedCharger} onValueChange={setSelectedCharger}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Charger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chargers</SelectItem>
                  {chargers.map(charger => {
                    // Only render items with valid IDs
                    if (!shouldRenderSelectItem(charger.id)) return null;
                    
                    const value = createSafeSelectValue(charger.id);
                    const displayName = charger.name || charger.charger_id || `Charger ${value}`;
                    
                    return (
                      <SelectItem key={value} value={value}>
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            {/* Status Filter */}
            <div className="w-52">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Filters */}
            <div className="w-44">
              <DatePicker 
                date={startDate} 
                onSelect={setStartDate} 
                placeholder="Start Date"
              />
            </div>
            <div className="w-44">
              <DatePicker 
                date={endDate} 
                onSelect={setEndDate} 
                placeholder="End Date"
              />
            </div>
            
            {/* Reset Button */}
            <Button variant="outline" onClick={handleResetFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Charging Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ChargingSessionTable 
            sessions={filteredSessions}
            isLoading={isLoadingSessions || isLoadingChargers}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ChargingSessionsPage;
