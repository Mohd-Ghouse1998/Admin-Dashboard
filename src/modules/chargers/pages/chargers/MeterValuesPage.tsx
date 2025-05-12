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
import { MeterValueTable } from '@/modules/chargers/components';
import { useMeterValue } from '@/modules/chargers/hooks';
import { useCharger } from '@/modules/chargers/hooks';
import { useChargingSession } from '@/modules/chargers/hooks';
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

export const MeterValuesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharger, setSelectedCharger] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Get chargers for the filter dropdown
  const { getChargers } = useCharger();
  const { data: chargersData, isLoading: isLoadingChargers } = getChargers();
  
  // Get sessions for the transaction filter dropdown
  const { getSessions } = useChargingSession();
  const { data: sessionsData, isLoading: isLoadingSessions } = getSessions();
  
  // Safely extract data from API responses
  const chargers = extractArrayFromResponse(chargersData, []);
  const sessions = extractArrayFromResponse(sessionsData, []);
  
  // Get meter values
  const { getMeterValues } = useMeterValue();
  const { 
    data: meterValuesData, 
    isLoading: isLoadingMeterValues 
  } = getMeterValues(
    selectedCharger !== 'all' ? selectedCharger : undefined, 
    selectedTransaction !== 'all' ? parseInt(selectedTransaction, 10) : undefined
  );
  
  // Extract meter values safely
  const meterValues = extractArrayFromResponse(meterValuesData, []);
  
  // Filter meter values based on search query and dates
  const filteredMeterValues = meterValues.filter(value => {
    // Search filter
    const matchesSearch = searchQuery 
      ? ((value.measurand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
         (value.charger_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
         (value.value || '').toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
      
    // Date filters
    const valueDate = value.timestamp ? new Date(value.timestamp) : null;
    const matchesStartDate = startDate && valueDate ? valueDate >= startDate : true;
    const matchesEndDate = endDate && valueDate ? valueDate <= endDate : true;
    
    return matchesSearch && matchesStartDate && matchesEndDate;
  });
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCharger('all');
    setSelectedTransaction('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <PageLayout title="Meter Values" description="View detailed meter measurement data from chargers">
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search by measurand, charger, or value" 
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
            
            {/* Transaction Filter */}
            <div className="w-52">
              <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Transaction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  {sessions.map(session => {
                    // Only render items with valid transaction IDs
                    if (!shouldRenderSelectItem(session.transaction_id)) return null;
                    
                    const value = createSafeSelectValue(session.transaction_id);
                    
                    return (
                      <SelectItem key={value} value={value}>
                        Transaction #{value}
                      </SelectItem>
                    );
                  })}
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
          <CardTitle>Meter Values</CardTitle>
        </CardHeader>
        <CardContent>
          <MeterValueTable 
            meterValues={filteredMeterValues}
            isLoading={isLoadingMeterValues || isLoadingChargers || isLoadingSessions}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default MeterValuesPage;
