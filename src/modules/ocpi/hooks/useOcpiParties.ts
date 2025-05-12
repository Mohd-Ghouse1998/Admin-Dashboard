
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define types for OCPI parties
export interface OcpiParty {
  id: string;
  name: string;
  country_code: string;
  party_id: string;
  role: 'CPO' | 'EMSP' | 'HUB' | 'NSP' | 'OTHER';
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  created_at?: string;
  updated_at?: string;
}

interface UseOcpiPartiesReturn {
  parties: OcpiParty[];
  isLoading: boolean;
  error: Error | null;
  fetchParties: () => Promise<void>;
  getParty: (id: string) => OcpiParty | undefined;
  createParty: (party: Omit<OcpiParty, 'id' | 'created_at' | 'updated_at'>) => Promise<OcpiParty>;
  updateParty: (id: string, updates: Partial<OcpiParty>) => Promise<OcpiParty>;
  deleteParty: (id: string) => Promise<void>;
}

export const useOcpiParties = (): UseOcpiPartiesReturn => {
  const [parties, setParties] = useState<OcpiParty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Mock data - in a real app, this would come from an API
  const mockParties: OcpiParty[] = [
    { id: '1', name: 'Example Party 1', country_code: 'US', party_id: 'PTY001', role: 'CPO', status: 'ACTIVE' },
    { id: '2', name: 'Example Party 2', country_code: 'UK', party_id: 'PTY002', role: 'EMSP', status: 'ACTIVE' },
    { id: '3', name: 'Example Party 3', country_code: 'DE', party_id: 'PTY003', role: 'HUB', status: 'PENDING' },
  ];

  const fetchParties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would fetch from an API
      // const response = await fetch('/api/ocpi/parties');
      // const data = await response.json();
      
      // Using mock data for this example
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setParties(mockParties);
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to load OCPI parties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  const getParty = (id: string) => {
    return parties.find(party => party.id === id);
  };

  const createParty = async (party: Omit<OcpiParty, 'id' | 'created_at' | 'updated_at'>): Promise<OcpiParty> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would post to an API
      // const response = await fetch('/api/ocpi/parties', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(party)
      // });
      // const data = await response.json();
      
      // Using mock data for this example
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const newParty: OcpiParty = {
        ...party,
        id: `${parties.length + 1}`,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setParties(prevParties => [...prevParties, newParty]);
      
      toast({
        title: "Success",
        description: "OCPI party created successfully",
      });
      
      return newParty;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to create OCPI party",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateParty = async (id: string, updates: Partial<OcpiParty>): Promise<OcpiParty> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would put/patch to an API
      // const response = await fetch(`/api/ocpi/parties/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });
      // const data = await response.json();
      
      // Using mock data for this example
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      let updatedParty: OcpiParty | undefined;
      
      setParties(prevParties => prevParties.map(party => {
        if (party.id === id) {
          updatedParty = {
            ...party,
            ...updates,
            updated_at: new Date().toISOString(),
          };
          return updatedParty;
        }
        return party;
      }));
      
      if (!updatedParty) {
        throw new Error("Party not found");
      }
      
      toast({
        title: "Success",
        description: "OCPI party updated successfully",
      });
      
      return updatedParty;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to update OCPI party",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteParty = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would delete from an API
      // await fetch(`/api/ocpi/parties/${id}`, { method: 'DELETE' });
      
      // Using mock data for this example
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      setParties(prevParties => prevParties.filter(party => party.id !== id));
      
      toast({
        title: "Success",
        description: "OCPI party deleted successfully",
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to delete OCPI party",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    parties,
    isLoading,
    error,
    fetchParties,
    getParty,
    createParty,
    updateParty,
    deleteParty,
  };
};
