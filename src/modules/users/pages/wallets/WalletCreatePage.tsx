
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
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

const WalletCreatePage = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch users for the user dropdown
  const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(accessToken),
    enabled: !!accessToken,
  });
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balance: 0,
      currency: "USD",
      is_active: true,
    },
  });

  // Create wallet mutation
  const createWalletMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      return userService.createWallet(accessToken, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Wallet created successfully",
        variant: "success",
      });
      navigate("/users/wallets");
    },
    onError: (error) => {
      console.error('Error creating wallet:', error);
      toast({
        title: "Error",
        description: "Failed to create wallet",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createWalletMutation.mutate(values);
  };

  return (
    <PageLayout
      title="Create Wallet"
      description="Create a new user wallet"
      backButton
      backTo="/users/wallets"
    >
      <Helmet>
        <title>Create Wallet | Admin Dashboard</title>
      </Helmet>
      
      {usersError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {usersError instanceof Error ? usersError.message : 'Failed to load users data'}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select 
                      disabled={isLoadingUsers} 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
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
                    <FormLabel>Initial Balance</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              
              <Button type="submit" disabled={createWalletMutation.isPending} className="w-full">
                {createWalletMutation.isPending ? (
                  <>Creating wallet...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Wallet
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default WalletCreatePage;
