
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { AlertCircle, CheckCircle } from 'lucide-react';

const formSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
});

const TenantValidateDomainPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{ 
    valid: boolean; 
    tenant?: any; 
    error?: string; 
  } | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: '',
    },
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setValidationResult(null);
    
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      const response = await axios.get(`/api/tenant/validate-domain/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { domain: data.domain }
      });
      
      setValidationResult(response.data);
    } catch (error: any) {
      setValidationResult({
        valid: false,
        error: error.response?.data?.error || 'Failed to validate domain'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <PageHeader 
        title="Validate Domain" 
        description="Check if a domain is registered and linked to a tenant"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Domain Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter domain (e.g., example.com)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Validating...' : 'Validate Domain'}
              </Button>
            </form>
          </Form>
          
          {validationResult && (
            <div className="mt-6 p-4 border rounded-lg">
              {validationResult.valid ? (
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Domain is valid</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      This domain is linked to tenant: <span className="font-medium">{validationResult.tenant?.name}</span>
                    </p>
                    {validationResult.tenant?.schema_name && (
                      <p className="text-sm text-gray-500">
                        Schema: <span className="font-medium">{validationResult.tenant.schema_name}</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Domain is not valid</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {validationResult.error || 'This domain is not linked to any tenant.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantValidateDomainPage;
