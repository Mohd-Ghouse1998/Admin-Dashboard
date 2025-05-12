
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define types for OCPI locations
export interface OcpiLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  evse_count?: number;
  evse_ids?: string[];
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseOcpiLocationsReturn {
  locations: OcpiLocation[];
  isLoading: boolean;
  error: Error | null;
  fetchLocations: () => Promise<void>;
  getLocation: (id: string) => OcpiLocation | undefined;
  createLocation: (location: Omit<OcpiLocation, 'id' | 'created_at' | 'updated_at'>) => Promise<OcpiLocation>;
  updateLocation: (id: string, updates: Partial<OcpiLocation>) => Promise<OcpiLocation>;
  deleteLocation: (id: string) => Promise<void>;
}

export const useOcpiLocations = (): UseOcpiLocationsReturn => {
  const [locations, setLocations] = useState<OcpiLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Mock data - in a real app, this would come from an API
  const mockLocations: OcpiLocation[] = [
    { 
      id: '1', 
      name: 'Downtown Charging Hub', 
      address: '123 Main St', 
      city: 'San Francisco', 
      postal_code: '94105',
      country: 'US', 
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
      evse_count: 5,
      description: 'Central charging location in downtown area',
    },
    { 
      id: '2', 
      name: 'Airport Station', 
      address: '456 Airport Rd', 
      city: 'New York', 
      postal_code: '10001',
      country: 'US', 
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      evse_count: 10,
      description: 'Located at Terminal 2 arrivals',
    },
    { 
      id: '3', 
      name: 'Shopping Mall Plaza', 
      address: '789 Shopping Ave', 
      city: 'Los Angeles', 
      postal_code: '90001',
      country: 'US', 
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
      evse_count: 8,
      description: 'Located in underground parking level P2',
    },
  ];

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would fetch from an API
      // const response = await fetch('/api/ocpi/locations');
      // const data = await response.json();
      
      // Using mock data for this example
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setLocations(mockLocations);
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to load OCPI locations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const getLocation = (id: string) => {
    return locations.find(location => location.id === id);
  };

  const createLocation = async (location: Omit<OcpiLocation, 'id' | 'created_at' | 'updated_at'>): Promise<OcpiLocation> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would post to an API
      // const response = await fetch('/api/ocpi/locations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(location)
      // });
      // const data = await response.json();
      
      // Using mock data for this example
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const newLocation: OcpiLocation = {
        ...location,
        id: `${locations.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setLocations(prevLocations => [...prevLocations, newLocation]);
      
      toast({
        title: "Success",
        description: "OCPI location created successfully",
      });
      
      return newLocation;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to create OCPI location",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocation = async (id: string, updates: Partial<OcpiLocation>): Promise<OcpiLocation> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would put/patch to an API
      // const response = await fetch(`/api/ocpi/locations/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });
      // const data = await response.json();
      
      // Using mock data for this example
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      let updatedLocation: OcpiLocation | undefined;
      
      setLocations(prevLocations => prevLocations.map(location => {
        if (location.id === id) {
          updatedLocation = {
            ...location,
            ...updates,
            updated_at: new Date().toISOString(),
          };
          return updatedLocation;
        }
        return location;
      }));
      
      if (!updatedLocation) {
        throw new Error("Location not found");
      }
      
      toast({
        title: "Success",
        description: "OCPI location updated successfully",
      });
      
      return updatedLocation;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to update OCPI location",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLocation = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would delete from an API
      // await fetch(`/api/ocpi/locations/${id}`, { method: 'DELETE' });
      
      // Using mock data for this example
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      setLocations(prevLocations => prevLocations.filter(location => location.id !== id));
      
      toast({
        title: "Success",
        description: "OCPI location deleted successfully",
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to delete OCPI location",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    locations,
    isLoading,
    error,
    fetchLocations,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation,
  };
};
