
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
import { ChargerConfigTable } from '@/modules/chargers/components';
import { useCharger } from '@/modules/chargers/hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractArrayFromResponse } from '@/utils/apiHelpers';

export const ChargerConfigsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharger, setSelectedCharger] = useState<string>('all');
  
  // Get chargers for the filter dropdown
  const { getChargers, getChargerConfigs } = useCharger();
  const { data: chargersData, isLoading: isLoadingChargers } = getChargers();
  
  // Get configs
  const { 
    data: configsData, 
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs
  } = getChargerConfigs(
    selectedCharger !== 'all' ? selectedCharger : undefined
  );
  
  // Safely extract data from API responses
  const chargers = extractArrayFromResponse(chargersData, []);
  const configs = extractArrayFromResponse(configsData, []);
  
  // Filter configs based on search query
  const filteredConfigs = configs.filter(config => {
    // Search filter
    return searchQuery 
      ? ((config.key || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
         (config.value || '').toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
  });
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCharger('all');
  };

  return (
    <PageLayout title="Charger Configurations" description="Manage configuration parameters for chargers">
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search by key or value" 
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
                    if (!charger.id) return null;
                    
                    return (
                      <SelectItem key={charger.id} value={charger.id.toString()}>
                        {charger.name || charger.charger_id || `Charger ${charger.id}`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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
          <CardTitle>Charger Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCharger !== 'all' ? (
            <ChargerConfigTable 
              configs={filteredConfigs}
              chargerId={selectedCharger}
              isLoading={isLoadingConfigs || isLoadingChargers}
              onRefetch={refetchConfigs}
            />
          ) : (
            <ChargerConfigTable 
              configs={filteredConfigs}
              chargerId=""
              isLoading={isLoadingConfigs || isLoadingChargers}
              onRefetch={refetchConfigs}
            />
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ChargerConfigsPage;
