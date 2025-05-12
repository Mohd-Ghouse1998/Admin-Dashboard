
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, Search, Loader2, MapPin } from 'lucide-react';
import { OCPIApiService } from '../../services';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Define the types based on the API response structure
interface Connector {
  id: number;
  evse: number;
  connector_id: string;
  standard: string;
  format: string;
  power_type: string;
  max_voltage: number;
  max_amperage: number;
  max_electric_power: number;
  tariff_ids?: string[];
  terms_and_conditions?: string;
  last_updated: string;
}

interface Direction {
  text: string;
  language: string;
}

interface Evse {
  id: number;
  location: number;
  evse_id: string;
  ocpp_connector_id: number;
  status: string;
  capabilities?: string[];
  floor_level?: string;
  coordinates: string;
  physical_reference?: string;
  directions?: Direction[];
  parking_restrictions?: string[];
  images?: any;
  last_updated: string;
  status_schedule?: any;
  connectors: Connector[];
}

interface Location {
  id: number;
  party: number;
  location_id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  coordinates: string;
  time_zone: string;
  opening_times: any;
  charging_when_closed: boolean;
  images: any;
  operator: any;
  suboperator: any;
  owner: any;
  facilities: any;
  energy_mix: any;
  last_updated: string;
  publish: boolean;
  status: string;
  evses: Evse[];
  ocpp_charger: number | null;
}

interface LocationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Location[];
}

const LocationsListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch locations data from API
  const { data, isLoading, error } = useQuery<LocationsResponse>({
    queryKey: ['ocpi-locations'],
    queryFn: async () => {
      const response = await OCPIApiService.common.resources.locations.getAll();
      return response.data;
    },
  });
  
  // Filter locations based on search term
  const filteredLocations = data?.results.filter(location => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <PageLayout
      title="OCPI Locations"
      description="Manage OCPI location data"
    >
      <div className="flex justify-between mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search locations..."
            className="pl-8 w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/ocpi/locations/map-chargers">
              <MapPin className="mr-2 h-4 w-4" />
              Map Chargers
            </Link>
          </Button>
          <Button asChild>
            <Link to="/ocpi/locations/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading locations...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-destructive">
              <p>Error loading locations. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location ID</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>EVSEs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No locations found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.location_id}</TableCell>
                    <TableCell>{location.address}</TableCell>
                    <TableCell>{location.city}</TableCell>
                    <TableCell>{location.country}</TableCell>
                    <TableCell>
                      <Badge variant={location.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {location.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{location.evses.length}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/ocpi/locations/${location.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </PageLayout>
  );
};

export default LocationsListPage;
