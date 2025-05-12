
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { OCPIApiService } from '../../services';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const PartiesListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch parties from the API
  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await OCPIApiService.common.resources.parties.getAll();
      console.log('Parties API response:', response.data);
      // Handle the paginated response structure
      if (response.data && response.data.results) {
        setParties(response.data.results || []);
      } else {
        // Fallback to handling direct array if pagination structure changes
        setParties(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch parties:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load parties');
      toast({
        variant: "destructive",
        title: "Error loading parties",
        description: err?.response?.data?.message || err?.message || 'Failed to load parties',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle party deletion
  const handleDeleteParty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this party?')) {
      return;
    }
    
    setDeletingId(id);
    try {
      await OCPIApiService.common.resources.parties.delete(id);
      toast({
        title: "Party deleted",
        description: "The party has been successfully deleted.",
      });
      // Refresh the list
      fetchParties();
    } catch (err) {
      console.error('Failed to delete party:', err);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err?.response?.data?.message || err?.message || 'Failed to delete party',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter parties based on search term
  const filteredParties = Array.isArray(parties) ? parties.filter(party => 
    party.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.party_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.country_code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <PageLayout
      title="OCPI Parties"
      description="Manage OCPI party connections"
      createRoute="/ocpi/cpo/parties/create"
    >
      <div className="flex justify-between mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search parties..."
            className="pl-8 w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Party ID</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading parties...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredParties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No parties found. {searchTerm ? 'Try a different search term.' : ''}
                </TableCell>
              </TableRow>
            ) : (
              filteredParties.map((party) => (
                <TableRow key={party.id || `${party.country_code}-${party.party_id}`}>
                  <TableCell className="font-medium">{party.name}</TableCell>
                  <TableCell>{party.party_id}</TableCell>
                  <TableCell>{party.country_code}</TableCell>
                  <TableCell>
                    {Array.isArray(party.roles) ? party.roles.join(', ') : 
                     typeof party.roles === 'string' ? party.roles : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/ocpi/parties/${party.id || `${party.country_code}-${party.party_id}`}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/ocpi/parties/${party.id || `${party.country_code}-${party.party_id}`}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteParty(party.id || `${party.country_code}-${party.party_id}`)}
                        disabled={deletingId === (party.id || `${party.country_code}-${party.party_id}`)}
                      >
                        {deletingId === (party.id || `${party.country_code}-${party.party_id}`) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PageLayout>
  );
};

export default PartiesListPage;
