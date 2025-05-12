import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Eye,
  Filter,
  Search,
  RefreshCw,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useOCPIRole } from '../../../contexts/OCPIRoleContext';
import { OCPIApiService } from '../../../services';
import { OCPIToken, TokenType } from '../../../types/token.types';
import {
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from '@/components/ui/tabs';

const CPOTokensPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, ensureRoleIsSet } = useOCPIRole();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // If not in CPO mode, show access denied
  if (role !== 'CPO') {
    return (
      <PageLayout 
        title="Token Management" 
        description="Token management is only available in CPO mode"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Token management is only available in CPO mode. Please switch to CPO mode to access this feature.</p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }
  
  // Fetch tokens with React Query, using the context's role synchronization
  const {
    data: tokensData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['cpo-tokens', searchQuery],
    queryFn: async () => {
      try {
        // First ensure the role is set to CPO using the context's method
        const roleIsSet = await ensureRoleIsSet();
        if (!roleIsSet) {
          throw new Error('Could not set role to CPO. Please check your permissions.');
        }
        
        // Then proceed with the API call
        const params = searchQuery ? { search: searchQuery } : undefined;
        const response = await OCPIApiService.cpo.tokens.getAll(params);
        console.log('Tokens data:', response.data);
        return response.data;
      } catch (err: any) {
        console.error('Error fetching tokens:', err);
        // More detailed error logging
        if (err.response) {
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
          console.error('Error response headers:', err.response.headers);
        }
        
        toast({
          title: 'Error',
          description: err.response?.status === 401 
            ? 'Authentication error. Please ensure you are logged in and have CPO permissions.' 
            : `Failed to fetch tokens: ${err.message}`,
          variant: 'destructive'
        });
        throw err;
      }
    },
    // Only run this query if we're in CPO mode
    enabled: role === 'CPO'
  });
  
  // Handle search
  const handleSearch = () => {
    refetch();
  };
  
  // Filter tokens based on active tab
  const filteredTokens = React.useMemo(() => {
    if (!tokensData?.results) return [];
    
    return tokensData.results.filter((token: OCPIToken) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'valid') return token.valid === true;
      if (activeTab === 'invalid') return token.valid === false;
      if (activeTab === 'rfid') return token.type === TokenType.RFID;
      if (activeTab === 'app') return token.type === TokenType.APP_USER;
      return true;
    });
  }, [tokensData, activeTab]);

  // Column definitions for the DataTable
  const columns = [
    {
      accessorKey: 'uid',
      header: 'UID',
      cell: (data: any) => (
        <span className="font-medium truncate max-w-[150px]">
          {data?.uid || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: (data: any) => <span>{data?.type || 'N/A'}</span>,
    },
    {
      accessorKey: 'issuer',
      header: 'Issuer',
      cell: (data: any) => (
        <span className="truncate max-w-[150px]">
          {data?.issuer || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'contract_id',
      header: 'Contract ID',
      cell: (data: any) => (
        <span className="font-mono text-xs truncate max-w-[120px]">
          {data?.contract_id || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'valid',
      header: 'Status',
      cell: (data: any) => (
        <div>
          {data?.valid ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Valid
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Invalid
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: (data: any) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/ocpi/cpo/tokens/${data?.uid}`);
            }}
            title="View Token Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/ocpi/tokens/validate?token=${data?.uid}`);
            }}
            title="Validate Token"
          >
            <Shield className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <PageLayout
      title="Token Management"
      description="Manage and validate tokens for charging authorization"
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            onClick={() => navigate('/ocpi/tokens/validate')}
          >
            <Shield className="h-4 w-4 mr-2" />
            Validate Token
          </Button>
        </div>
      }
    >
      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by token UID, contract ID, or issuer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {/* Add filter button if needed */}
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Token List */}
      <Card>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="p-6 pb-0">
            <TabsList>
              <TabsTrigger value="all">All Tokens</TabsTrigger>
              <TabsTrigger value="valid">Valid</TabsTrigger>
              <TabsTrigger value="invalid">Invalid</TabsTrigger>
              <TabsTrigger value="rfid">RFID</TabsTrigger>
              <TabsTrigger value="app">App User</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="mt-2">
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="bg-destructive/10 p-4 rounded-md text-destructive">
                  Error loading tokens: {(error as Error)?.message || 'Unknown error'}
                </div>
              ) : filteredTokens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tokens found
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredTokens}
                  keyField="uid"
                  onRowClick={(row) => navigate(`/ocpi/cpo/tokens/${row.uid}`)}
                />
              )}
              
              {tokensData && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredTokens.length} of {tokensData.count} tokens
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </PageLayout>
  );
};

export default CPOTokensPage;
