import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Shield, 
  Calendar, 
  User, 
  Globe, 
  CreditCard, 
  Hash,
  Loader2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useOCPIRole } from '../../../contexts/OCPIRoleContext';
import { OCPIApiService } from '../../../services';
import { OCPIToken } from '../../../types/token.types';

const CPOTokenDetailPage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, ensureRoleIsSet } = useOCPIRole();
  
  // Fetch token details
  const {
    data: token,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['cpo-token-detail', uid],
    queryFn: async () => {
      if (!uid) throw new Error('Token UID is required');
      
      try {
        // First ensure the role is set to CPO using the context's method
        const roleIsSet = await ensureRoleIsSet();
        if (!roleIsSet) {
          throw new Error('Could not set role to CPO. Please check your permissions.');
        }
        
        const response = await OCPIApiService.cpo.tokens.getById(uid);
        console.log('Token detail:', response.data);
        return response.data;
      } catch (err: any) {
        console.error('Error fetching token details:', err);
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
            : `Failed to fetch token details: ${err.message}`,
          variant: 'destructive'
        });
        throw err;
      }
    },
    enabled: !!uid && role === 'CPO'
  });
  
  // Function to authorize token with role synchronization
  const handleAuthorizeToken = async () => {
    if (!uid) return;
    
    try {
      // Ensure the role is properly set before making the API call
      const roleIsSet = await ensureRoleIsSet();
      if (!roleIsSet) {
        throw new Error('Could not set role to CPO. Please check your permissions.');
      }
      
      const response = await OCPIApiService.cpo.tokens.authorizeToken(uid);
      console.log('Token authorization result:', response.data);
      
      toast({
        title: response.data.valid ? 'Token Authorized' : 'Token Not Authorized',
        description: response.data.valid 
          ? 'This token is authorized to start a charging session.' 
          : 'This token is not authorized to start a charging session.',
        variant: response.data.valid ? 'default' : 'destructive'
      });
    } catch (err: any) {
      console.error('Error authorizing token:', err);
      
      // More detailed error logging
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      }
      
      toast({
        title: 'Authorization Failed',
        description: err.response?.status === 401 
          ? 'Authentication error. Please ensure you are logged in and have CPO permissions.' 
          : `Error: ${err.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };
  
  // Check if we're still loading or had an error
  if (role !== 'CPO') {
    return (
      <PageLayout
        title="Token Details"
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
  
  if (isLoading) {
    return (
      <PageLayout 
        title="Token Details" 
        description="Loading token information..."
        backButton={true}
        backTo="/ocpi/cpo/tokens"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }
  
  if (isError || !token) {
    return (
      <PageLayout
        title="Token Details"
        description="Error loading token information"
        backButton={true}
        backTo="/ocpi/cpo/tokens"
      >
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Token</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{(error as Error)?.message || "Token not found"}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => navigate('/ocpi/cpo/tokens')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tokens
            </Button>
          </CardFooter>
        </Card>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout
      title={`Token: ${token.uid}`}
      description="Token Details"
      backButton={true}
      backTo="/ocpi/cpo/tokens"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
          >
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/ocpi/tokens/validate?token=${token.uid}`)}
          >
            <Shield className="h-4 w-4 mr-2" />
            Validate Token
          </Button>
          <Button
            onClick={handleAuthorizeToken}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Authorize Token
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        {/* Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div>
                  {token.valid ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Valid
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Invalid
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  {token.last_updated ? format(new Date(token.last_updated), 'MMM dd, yyyy HH:mm:ss') : 'Unknown'}
                </div>
              </div>
              
              {token.whitelist && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Whitelist Status</div>
                  <div>
                    <Badge variant="outline">
                      {token.whitelist}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Token Information */}
        <Card>
          <CardHeader>
            <CardTitle>Token Information</CardTitle>
            <CardDescription>
              Detailed information about this token
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Token UID</div>
              <div className="font-medium font-mono text-sm flex items-center">
                <Hash className="h-4 w-4 mr-1 text-muted-foreground" />
                {token.uid}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Type</div>
              <div className="font-medium">
                <CreditCard className="h-4 w-4 mr-1 inline-block text-muted-foreground" />
                {token.type}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Contract ID</div>
              <div className="font-medium font-mono text-sm">
                {token.contract_id}
              </div>
            </div>
            
            {token.visual_number && (
              <div>
                <div className="text-sm text-muted-foreground">Visual Number</div>
                <div className="font-medium">{token.visual_number}</div>
              </div>
            )}
            
            {token.auth_id && (
              <div>
                <div className="text-sm text-muted-foreground">Auth ID</div>
                <div className="font-medium font-mono text-sm">{token.auth_id}</div>
              </div>
            )}
            
            <Separator />
            
            <div>
              <div className="text-sm text-muted-foreground">Issuer</div>
              <div className="font-medium">
                <User className="h-4 w-4 mr-1 inline-block text-muted-foreground" />
                {token.issuer}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Country Code</div>
              <div className="font-medium">
                <Globe className="h-4 w-4 mr-1 inline-block text-muted-foreground" />
                {token.country_code}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Party ID</div>
              <div className="font-medium font-mono text-sm">{token.party_id}</div>
            </div>
            
            {token.valid_from && (
              <div>
                <div className="text-sm text-muted-foreground">Valid From</div>
                <div className="font-medium">
                  <Calendar className="h-4 w-4 mr-1 inline-block text-muted-foreground" />
                  {format(new Date(token.valid_from), 'MMM dd, yyyy HH:mm:ss')}
                </div>
              </div>
            )}
            
            {token.valid_to && (
              <div>
                <div className="text-sm text-muted-foreground">Valid To</div>
                <div className="font-medium">
                  <Calendar className="h-4 w-4 mr-1 inline-block text-muted-foreground" />
                  {format(new Date(token.valid_to), 'MMM dd, yyyy HH:mm:ss')}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-end">
              <Button
                variant="outline"
                onClick={() => navigate('/ocpi/cpo/tokens')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tokens
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CPOTokenDetailPage;
