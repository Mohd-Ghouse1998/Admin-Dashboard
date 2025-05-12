import React, { useState } from 'react';
import { OCPIApiService } from '../../services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OCPILocation } from '../../types/ocpi.types';
import { PageLayout } from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Zap, Star, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const LocationFinder: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    distance: 10,
    status: 'AVAILABLE',
    connectorType: '',
    maxResults: 50
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Get locations from external networks
  const { data: locationsData, isLoading } = useQuery({
    queryKey: [
      'emsp-locations',
      { distance: filters.distance, status: filters.status, connectorType: filters.connectorType, maxResults: filters.maxResults }
    ],
    queryFn: async () => {
      const response = await OCPIApiService.emsp.locations.getAll(filters);
      return response.data;
    }
  });

  // Add location to favorites
  const favoriteLocationMutation = useMutation({
    mutationFn: (locationId: string) => OCPIApiService.emsp.addFavorite({ location_id: locationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocpi', 'emsp', 'favorites'] });
    }
  });

  // Handle favorite toggle with optimistic update
  const handleFavoriteToggle = (locationId: string) => {
    favoriteLocationMutation.mutate(locationId);
  };

  // Define a proper type for the API response
  interface LocationsResponse {
    results: OCPILocation[];
    count: number;
    next?: string;
    previous?: string;
  }
  
  // Cast the data to the correct type to prevent TypeScript errors
  const typedLocationsData = locationsData as LocationsResponse | undefined;
  const locations = typedLocationsData?.results || [];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update filters with the search text
    setFilters(prev => ({
      ...prev,
      searchQuery: searchText
    }));
  };
  
  const handleFilterChange = (key: string, value: any) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };
  
  return (
    <PageLayout 
      title="Browse External Charging Locations" 
      description="Find charging stations on external networks"
    >
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            placeholder="Search by name, address, city..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </form>
      </div>
      
      {/* Filter panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Options</CardTitle>
            <CardDescription>Refine your search with these filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium">Distance (km)</label>
                <div className="flex items-center space-x-2 mt-2">
                  <Slider 
                    value={[filters.distance]} 
                    min={1} 
                    max={50} 
                    step={1}
                    onValueChange={(value) => handleFilterChange('distance', value[0])}
                  />
                  <span className="w-12 text-center">{filters.distance}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="CHARGING">Charging</SelectItem>
                    <SelectItem value="INOPERATIVE">Inoperative</SelectItem>
                    <SelectItem value="OUTOFORDER">Out of Order</SelectItem>
                    <SelectItem value="RESERVED">Reserved</SelectItem>
                    <SelectItem value="">All Statuses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Connector Type</label>
                <Select 
                  value={filters.connectorType} 
                  onValueChange={(value) => handleFilterChange('connectorType', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select connector type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IEC_62196_T2">Type 2</SelectItem>
                    <SelectItem value="CHADEMO">CHAdeMO</SelectItem>
                    <SelectItem value="IEC_62196_T2_COMBO">CCS (Combo 2)</SelectItem>
                    <SelectItem value="DOMESTIC">Domestic</SelectItem>
                    <SelectItem value="">All Types</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Map display would go here */}
      <Card className="mb-6">
        <CardContent className="p-0 h-[400px] bg-gray-100 flex items-center justify-center">
          {/* This would be an actual map component */}
          <div className="text-center">
            <MapPin className="h-10 w-10 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Map View</p>
            <p className="text-xs text-muted-foreground">Showing {locations.length} locations</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Location list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p>Loading locations...</p>
        ) : locations.length === 0 ? (
          <p>No locations found. Try adjusting your search or filters.</p>
        ) : (
          locations.map((location: any) => (
            <Card key={location.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">{location.name}</h3>
                    <button
                      className="absolute right-0 p-2 mr-1 text-primary-foreground bg-primary rounded-md"
                      onClick={() => handleFavoriteToggle(location.id)}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{location.address}, {location.city}</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{location.evses?.length || 0} charging points</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {location.status && (
                        <Badge 
                          variant={location.status === 'AVAILABLE' ? 'success' : 'secondary'}
                        >
                          {location.status}
                        </Badge>
                      )}
                      {/* Additional badges for connector types would go here */}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => window.location.href = `/ocpi/emsp/locations/${location.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  );
};
