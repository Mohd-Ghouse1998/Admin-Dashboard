
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageLayout } from '@/components/layout/PageLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Save } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/modules/users/services/userService';
import { useToast } from '@/hooks/use-toast';

// Form schema validation
const formSchema = z.object({
  user: z.string({
    required_error: "User is required",
  }),
  balance: z.coerce.number(),
  currency: z.string({
    required_error: "Currency is required",
  }),
  is_active: z.boolean().default(true),
});

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'INR', label: 'Indian Rupee (INR)' },
];

const WalletEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch wallet details
  const { 
    data: wallet, 
    isLoading: isLoadingWallet, 
    error: walletError 
  } = useQuery({
    queryKey: ['wallet', id],
    queryFn: () => userService.getWallet(accessToken, id || ''),
    enabled: !!accessToken && !!id,
  });

  // Fetch users for the user dropdown
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(accessToken),
    enabled: !!accessToken,
  });
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: "",
      balance: 0,
      currency: "USD",
      is_active: true,
    },
  });

  // Update form with wallet data when loaded
  React.useEffect(() => {
    if (wallet) {
      form.reset({
        user: wallet.user?.id?.toString() || "",
        balance: Number(wallet.balance),
        currency: wallet.currency,
        is_active: wallet.is_active,
      });
    }
  }, [wallet, form]);

  // Update wallet mutation
  const updateWalletMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      return userService.updateWallet(accessToken, id || '', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Wallet updated successfully",
        variant: "success",
      });
      navigate(`/users/wallets/${id}`);
    },
    onError: (error) => {
      console.error('Error updating wallet:', error);
      toast({
        title: "Error",
        description: "Failed to update wallet",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateWalletMutation.mutate(values);
  };

  return (
    <PageLayout
      title="Edit Wallet"
      description={wallet ? `Editing wallet #${id}` : "Edit wallet details"}
      backButton
      backTo={`/users/wallets/${id}`}
    >
      <Helmet>
        <title>Edit Wallet | Admin Dashboard</title>
      </Helmet>
      
      {(walletError || usersError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {walletError instanceof Error ? walletError.message : 
             usersError instanceof Error ? usersError.message : 
             'Failed to load data'}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoadingWallet ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User</FormLabel>
                      <Select 
                        disabled={isLoadingUsers || updateWalletMutation.isPending} 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingUsers ? (
                            <SelectItem value="loading" disabled>Loading users...</SelectItem>
                          ) : users?.results ? (
                            users.results.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.username || user.email}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No users available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balance</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable this wallet
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={updateWalletMutation.isPending} 
                  className="w-full"
                >
                  {updateWalletMutation.isPending ? (
                    <>Updating wallet...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default WalletEditPage;
