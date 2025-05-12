import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  CreditCard,
  User, 
  Calendar,
  Shield
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOCPIRole } from '../../../contexts/OCPIRoleContext';
import { OCPIApiService } from '../../../services';
import { TokenType, TokenValidationResponse } from '../../../types/token.types';
import { format } from 'date-fns';

// Define the schema for token validation
const tokenValidationSchema = z.object({
  tokenUid: z.string().min(1, 'Token UID is required'),
  countryCode: z.string().length(2, 'Country code must be exactly 2 characters'),
  partyId: z.string().min(1, 'Party ID is required'),
  tokenType: z.enum(['RFID', 'APP_USER', 'OTHER']),
});

type TokenValidationFormValues = z.infer<typeof tokenValidationSchema>;

const TokenValidatorEnhanced: React.FC = () => {
  const { toast } = useToast();
  const { role } = useOCPIRole();
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') || '';
  
  const [validationResult, setValidationResult] = useState<TokenValidationResponse | null>(null);

  // Form with default values
  const form = useForm<TokenValidationFormValues>({
    resolver: zodResolver(tokenValidationSchema),
    defaultValues: {
      tokenUid: initialToken,
      countryCode: 'NL', // Default country code 
      partyId: 'ABC', // Default party ID
      tokenType: TokenType.RFID,
    },
  });

  // Validate token mutation
  const validateTokenMutation = useMutation({
    mutationFn: async (data: TokenValidationFormValues) => {
      const validationData = {
        token_uid: data.tokenUid,
        country_code: data.countryCode,
        party_id: data.partyId,
        token_type: data.tokenType,
      };
      
      const response = role === 'CPO'
        ? await OCPIApiService.cpo.tokens.validate(validationData)
        : await OCPIApiService.emsp.tokens.validate(validationData);
        
      return response.data;
    },
    onSuccess: (data: TokenValidationResponse) => {
      setValidationResult(data);
      toast({
        title: 'Token Validation Complete',
        description: data.valid 
          ? 'The token is valid.' 
          : 'The token is invalid.',
      });
    },
    onError: (error: any) => {
      setValidationResult(null);
      toast({
        title: 'Validation Failed',
        description: `Error: ${error?.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: TokenValidationFormValues) => {
    validateTokenMutation.mutate(data);
  };
  
  // Clear form
  const handleClear = () => {
    form.reset({
      tokenUid: '',
      countryCode: 'NL',
      partyId: 'ABC',
      tokenType: TokenType.RFID,
    });
    setValidationResult(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Validation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Token Validation
          </CardTitle>
          <CardDescription>
            Test if a token is authorized to start a charging session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="tokenUid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token UID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter token UID" />
                    </FormControl>
                    <FormDescription>
                      The unique identifier for the token.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Country code (e.g., NL)" maxLength={2} />
                    </FormControl>
                    <FormDescription>
                      ISO-3166 alpha-2 country code.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="partyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Party ID" />
                    </FormControl>
                    <FormDescription>
                      ID of the CPO or eMSP.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tokenType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select token type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TokenType.RFID}>RFID</SelectItem>
                        <SelectItem value={TokenType.APP_USER}>App User</SelectItem>
                        <SelectItem value={TokenType.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of token.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClear}
                >
                  Clear
                </Button>
                <Button 
                  type="submit" 
                  disabled={validateTokenMutation.isPending}
                >
                  {validateTokenMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Validate Token'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Validation Result */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Validation Result
          </CardTitle>
          <CardDescription>
            Token validation response
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validateTokenMutation.isPending ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : validationResult ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center p-6">
                {validationResult.valid ? (
                  <div className="bg-green-50 text-green-700 rounded-full p-4">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                ) : (
                  <div className="bg-red-50 text-red-700 rounded-full p-4">
                    <XCircle className="h-12 w-12" />
                  </div>
                )}
              </div>
              
              <Alert variant={validationResult.valid ? "default" : "destructive"}>
                <div className="flex items-center">
                  {validationResult.valid ? (
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2 text-red-500" />
                  )}
                  <AlertTitle>
                    {validationResult.valid ? "Valid Token" : "Invalid Token"}
                  </AlertTitle>
                </div>
                <AlertDescription>
                  {validationResult.valid
                    ? "This token is valid and can be used for authentication."
                    : "This token is not valid and cannot be used for authentication."}
                </AlertDescription>
              </Alert>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Token Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">UID:</div>
                  <div className="font-mono">{validationResult.token.uid}</div>
                  
                  <div className="font-medium">Type:</div>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                    {validationResult.token.type}
                  </div>
                  
                  {validationResult.token.auth_id && (
                    <>
                      <div className="font-medium">Auth ID:</div>
                      <div className="font-mono">{validationResult.token.auth_id}</div>
                    </>
                  )}
                  
                  {validationResult.token.visual_number && (
                    <>
                      <div className="font-medium">Visual Number:</div>
                      <div>{validationResult.token.visual_number}</div>
                    </>
                  )}
                  
                  <div className="font-medium">Issuer:</div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-muted-foreground" />
                    {validationResult.token.issuer}
                  </div>
                  
                  {validationResult.token.valid_from && (
                    <>
                      <div className="font-medium">Valid From:</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {format(new Date(validationResult.token.valid_from), 'MMM dd, yyyy')}
                      </div>
                    </>
                  )}
                  
                  {validationResult.token.valid_to && (
                    <>
                      <div className="font-medium">Valid To:</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {format(new Date(validationResult.token.valid_to), 'MMM dd, yyyy')}
                      </div>
                    </>
                  )}
                  
                  {validationResult.token.whitelist && (
                    <>
                      <div className="font-medium">Whitelist Status:</div>
                      <div>{validationResult.token.whitelist}</div>
                    </>
                  )}
                </div>
              </div>

              {validationResult.location && (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Location Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">ID:</div>
                    <div className="font-mono">{validationResult.location.id}</div>
                    
                    <div className="font-medium">Name:</div>
                    <div>{validationResult.location.name}</div>
                    
                    {validationResult.location.evse && (
                      <>
                        <div className="font-medium">EVSE ID:</div>
                        <div className="font-mono">{validationResult.location.evse.uid}</div>
                        
                        <div className="font-medium">EVSE Status:</div>
                        <div>{validationResult.location.evse.status}</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Shield className="h-12 w-12 mb-4" />
              <p>Enter token details and click validate to see results</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenValidatorEnhanced;
