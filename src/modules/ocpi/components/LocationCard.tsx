
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { OcpiLocation } from '../hooks/useOcpiLocations';

interface LocationCardProps {
  location: OcpiLocation;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{location.name}</CardTitle>
          {location.evse_count && (
            <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium">
              {location.evse_count} EVSEs
            </div>
          )}
        </div>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {location.address}, {location.city}, {location.country}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Postal Code</p>
            <p>{location.postal_code}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Coordinates</p>
            <p>
              {location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}
            </p>
          </div>
          {location.description && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p>{location.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
