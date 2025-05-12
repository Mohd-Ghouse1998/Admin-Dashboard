
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OCPIApiService } from '../../services';

interface PartyData {
  id: number;
  party_id: string;
  country_code: string;
  name: string;
  website?: string;
  ocpi_token?: string;
  roles: string[] | string;
  status?: string;
  user?: number;
  logo?: string;
  created_at?: string;
  updated_at?: string;
}

const PartyDetailPage = () => {
  const { id } = useParams();
  
  // Use a reference to prevent infinite loops
  const fetchedRef = useRef(false);
  
  // State for storing party data, loading state, and errors
  const [party, setParty] = useState<PartyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the data once when component mounts
  useEffect(() => {
    if (!id) {
      setError('Party ID is required');
      setIsLoading(false);
      return;
    }
    
    // Prevent infinite loops by checking if we've already fetched
    if (fetchedRef.current) {
      return;
    }
    
    // Mark that we're fetching now
    fetchedRef.current = true;
    
    const fetchPartyData = async () => {
      try {
        console.log(`[DEBUG] Fetching party details for ID: ${id}`);
        
        // Use OCPIApiService for fetching party details
        const response = await OCPIApiService.common.resources.parties.getById(id);
        
        console.log('[DEBUG] Party data received:', response.data);
        setParty(response.data);
      } catch (err: any) {
        console.error('[DEBUG] Error fetching party:', err);
        setError(err?.response?.data?.detail || err?.message || 'Failed to load party details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartyData();
  }, [id]); // Only depend on the ID
  

  return (
    <PageLayout
      title={party ? party.name : 'Party Details'}
      description={party ? `Details for ${party.name}` : 'Loading party details...'}
      backButton
      backTo="/ocpi/parties"
    >
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading party details...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Content when loaded */}
      {!isLoading && !error && party && (
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div>
              <h2 className="text-2xl font-bold">{party.name} Details</h2>
              <p className="text-muted-foreground">
                Core details of the OCPI party
              </p>
              
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Party ID</h3>
                  <p className="mt-1">{party.party_id}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Country Code</h3>
                  <p className="mt-1">{party.country_code}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Name</h3>
                  <p className="mt-1">{party.name}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Roles</h3>
                  <div className="mt-1">
                    {Array.isArray(party.roles) ? 
                      party.roles.map((role, index) => (
                        <Badge key={index} className="mr-1" variant="outline">
                          {role}
                        </Badge>
                      )) : 
                      typeof party.roles === 'string' ? (
                        <Badge variant="outline">{party.roles}</Badge>
                      ) : 'N/A'
                    }
                  </div>
                </div>
                {party.website && (
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Website</h3>
                    <div className="mt-1">
                      <a href={party.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {party.website}
                      </a>
                    </div>
                  </div>
                )}
                {party.status && (
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Status</h3>
                    <div className="mt-1">
                      <Badge variant={party.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {party.status}
                      </Badge>
                    </div>
                  </div>
                )}
                {party.ocpi_token && (
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">OCPI Token</h3>
                    <div className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                      {party.ocpi_token}
                    </div>
                  </div>
                )}
                {party.user !== undefined && (
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">User ID</h3>
                    <p className="mt-1">{party.user}</p>
                  </div>
                )}
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Party Record ID</h3>
                  <p className="mt-1">{party.id}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="locations">
            <div>
              <h2 className="text-2xl font-bold">{party.name} Locations</h2>
              <p className="text-muted-foreground">
                Locations associated with this party
              </p>
              <div className="mt-6">
                <p className="text-center text-muted-foreground py-8">No locations found</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </PageLayout>
  );
};

export default PartyDetailPage;
