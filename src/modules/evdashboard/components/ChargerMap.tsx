import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, Search, MapPin, Map as MapIcon,
  Circle, ZoomIn, ZoomOut, RotateCw, CrosshairIcon
} from 'lucide-react';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { ChargerLocation } from '../types/api-types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChargerMapProps {
  locations: ChargerLocation[];
  isLoading: boolean;
  error: Error | null;
}

// Map container styles
const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '8px'
};

// Default center position (India)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

// Define status colors for consistency
const STATUS_COLORS = {
  available: '#16a34a', // green-600
  'in use': '#2563eb', // blue-600
  faulted: '#dc2626', // red-600
  offline: '#4b5563', // gray-600
  default: '#6b7280' // gray-500
};

export const ChargerMap: React.FC<ChargerMapProps> = ({ 
  locations,
  isLoading,
  error
}) => {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [filteredLocations, setFilteredLocations] = useState<ChargerLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ChargerLocation | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Apply filters when search query or status filter changes
  useEffect(() => {
    if (locations && Array.isArray(locations)) {
      let filtered = [...locations];
      
      // Apply search filter if there's a query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(location => 
          location.name?.toLowerCase().includes(query) || 
          location.charger_id?.toLowerCase().includes(query) ||
          location.address?.toLowerCase().includes(query)
        );
      }
      
      // Apply status filter if not "All"
      if (statusFilter !== 'All') {
        filtered = filtered.filter(location => 
          location.status?.toLowerCase() === statusFilter.toLowerCase()
        );
      }
      
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [locations, searchQuery, statusFilter]);

  // Handle map load
  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // If we have locations, fit the map to their bounds
    if (locations && Array.isArray(locations) && locations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      let validLocationsExist = false;
      
      locations.forEach(location => {
        if (location && 
            location.coordinates && 
            typeof location.coordinates.latitude === 'number' && 
            typeof location.coordinates.longitude === 'number') {
          bounds.extend({
            lat: location.coordinates.latitude,
            lng: location.coordinates.longitude
          });
          validLocationsExist = true;
        }
      });
      
      if (validLocationsExist) {
        map.fitBounds(bounds);
      } else {
        map.setCenter(defaultCenter);
        map.setZoom(5);
      }
    }
  }, [locations]);
  
  // Handle map unmount
  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  // Get marker color based on status
  const getMarkerColor = (status: string): string => {
    const statusKey = status.toLowerCase();
    return STATUS_COLORS[statusKey] || STATUS_COLORS.default;
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusLower = status.toLowerCase();
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-700';
    let label = status;
    
    switch (statusLower) {
      case 'available':
        bgColor = 'bg-green-100';
        textColor = 'text-green-700';
        label = 'Available';
        break;
      case 'in use':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-700';
        label = 'In Use';
        break;
      case 'faulted':
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
        label = 'Faulted';
        break;
      case 'offline':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-700';
        label = 'Offline';
        break;
    }
    
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', bgColor, textColor)}>
        {label}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="border shadow-sm h-full">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading map data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border shadow-sm h-full">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="font-medium mb-2">Error loading map data</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle map controls
  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 5;
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 5;
      map.setZoom(Math.max(currentZoom - 1, 1));
    }
  };

  const handleResetView = () => {
    if (map && locations && locations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      locations.forEach(location => {
        if (location?.coordinates?.latitude && location?.coordinates?.longitude) {
          bounds.extend({
            lat: location.coordinates.latitude,
            lng: location.coordinates.longitude
          });
        }
      });
      
      map.fitBounds(bounds);
    } else if (map) {
      map.setCenter(defaultCenter);
      map.setZoom(5);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
          map.setZoom(14);
        },
        () => {
          console.error("Error: The Geolocation service failed.");
        }
      );
    }
  };

  return (
    <Card className="border shadow-sm h-full">
      <CardContent className="p-4 h-full relative">
        {/* Map Filter Controls - Styled to match the design mockup */}
        <div className="mb-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold">MAP FILTER CONTROLS</h3>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search Chargers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <Button 
                variant={statusFilter === 'All' ? "default" : "outline"}
                size="sm"
                className="rounded-md px-3 h-7 text-xs"
                onClick={() => setStatusFilter('All')}
              >
                All
              </Button>
              
              <Button
                variant={statusFilter === 'Available' ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-md px-3 h-7 text-xs",
                  statusFilter === 'Available' && "bg-green-600 hover:bg-green-700 text-white"
                )}
                onClick={() => setStatusFilter('Available')}
              >
                <Circle className="h-2 w-2 mr-1 fill-current text-green-500" />
                Available
              </Button>
              
              <Button
                variant={statusFilter === 'In Use' ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-md px-3 h-7 text-xs",
                  statusFilter === 'In Use' && "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                onClick={() => setStatusFilter('In Use')}
              >
                <Circle className="h-2 w-2 mr-1 fill-current text-blue-500" />
                In Use
              </Button>
              
              <Button
                variant={statusFilter === 'Faulted' ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-md px-3 h-7 text-xs",
                  statusFilter === 'Faulted' && "bg-red-600 hover:bg-red-700 text-white"
                )}
                onClick={() => setStatusFilter('Faulted')}
              >
                <Circle className="h-2 w-2 mr-1 fill-current text-red-500" />
                Faulted
              </Button>
              
              <Button
                variant={statusFilter === 'Offline' ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-md px-3 h-7 text-xs",
                  statusFilter === 'Offline' && "bg-gray-600 hover:bg-gray-700 text-white"
                )}
                onClick={() => setStatusFilter('Offline')}
              >
                <Circle className="h-2 w-2 mr-1 fill-current text-gray-500" />
                Offline
              </Button>
            </div>
          </div>
        </div>
        
        {/* Map Container */}
        <div className="relative h-[calc(100%-6rem)] bg-gray-100 rounded-lg">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={defaultCenter}
              zoom={5}
              options={{
                fullscreenControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                zoomControl: false
              }}
              onLoad={onLoad}
              onUnmount={onUnmount}
            >
              {/* Map Markers */}
              {filteredLocations.map(location => {
                if (!location || 
                    !location.coordinates || 
                    typeof location.coordinates.latitude !== 'number' || 
                    typeof location.coordinates.longitude !== 'number') {
                  return null;
                }
                
                return (
                  <Marker
                    key={location.id}
                    position={{
                      lat: location.coordinates.latitude,
                      lng: location.coordinates.longitude
                    }}
                    onClick={() => setSelectedLocation(location)}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: getMarkerColor(location.status || ''),
                      fillOpacity: 1,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                      scale: 10
                    }}
                    label={{
                      text: String(location.connectors?.available || 0), 
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 'bold'
                    }}
                  />
                );
              })}
            </GoogleMap>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          
          {/* Map Legend */}
          <div className="absolute left-4 bottom-4 z-10 bg-white rounded-lg p-3 shadow-md border border-gray-200">
            <div className="mb-1">
              <h4 className="text-xs font-semibold">Legend:</h4>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
                <span className="text-xs">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                <span className="text-xs">In Use</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-red-600"></div>
                <span className="text-xs">Faulted</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-gray-600"></div>
                <span className="text-xs">Offline</span>
              </div>
            </div>
          </div>
          
          {/* Map Controls */}
          <div className="absolute right-4 bottom-4 z-10 flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow-sm border-gray-200 px-2"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              Zoom In
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow-sm border-gray-200 px-2"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4 mr-1" />
              Zoom Out
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow-sm border-gray-200 px-2"
              onClick={handleResetView}
              title="Reset View"
            >
              <RotateCw className="h-4 w-4 mr-1" />
              Reset View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow-sm border-gray-200 px-2"
              onClick={handleGetCurrentLocation}
              title="Current Location"
            >
              <CrosshairIcon className="h-4 w-4 mr-1" />
              Current Location
            </Button>
          </div>
        </div>
        
        {/* Selected Charger Details Panel */}
        {selectedLocation && (
          <div className="mt-4 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-base">{selectedLocation.name} ({selectedLocation.charger_id})</h3>
                <p className="text-sm text-gray-500">{selectedLocation.address}</p>
              </div>
              <div>
                <StatusBadge status={selectedLocation.status} />
              </div>
            </div>
            
            <div className="flex flex-wrap justify-between mt-3">
              <div className="text-sm">
                <span className="text-gray-600">Type: </span>
                <span className="font-medium">{selectedLocation.type} {selectedLocation.type.toLowerCase().includes('fast') ? '' : 'Fast'} Charger</span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-600">Connectors: </span>
                <span className="font-medium">
                  {selectedLocation.connectors.total} 
                  ({selectedLocation.connectors.available} Available
                  {selectedLocation.connectors.in_use > 0 ? `, ${selectedLocation.connectors.in_use} In Use` : ''}
                  {selectedLocation.connectors.faulted > 0 ? `, ${selectedLocation.connectors.faulted} Faulted` : ''})
                </span>
              </div>
            </div>
            
            <div className="mt-3 flex justify-end">
              <Button size="sm" className="px-3">
                View Details
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
