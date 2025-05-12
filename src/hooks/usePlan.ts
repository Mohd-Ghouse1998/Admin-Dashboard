
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { planService, PlanCreateUpdatePayload, PlanUserCreatePayload } from '@/services/planService';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const usePlan = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Get all plans
  const getPlans = (page = currentPage) => {
    return useQuery({
      queryKey: ['plans', page],
      queryFn: () => accessToken ? planService.getPlans(accessToken, page) : Promise.reject('No access token'),
      enabled: !!accessToken,
    });
  };

  // Get specific plan
  const getPlan = (id: string) => {
    return useQuery({
      queryKey: ['plan', id],
      queryFn: () => accessToken ? planService.getPlan(accessToken, id) : Promise.reject('No access token'),
      enabled: !!accessToken && !!id,
    });
  };

  // Create plan
  const createPlan = useMutation({
    mutationFn: (data: PlanCreateUpdatePayload) => {
      if (!accessToken) return Promise.reject('No access token');
      return planService.createPlan(accessToken, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plan created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create plan",
        variant: "destructive",
      });
    }
  });

  // Update plan
  const updatePlan = useMutation({
    mutationFn: (params: { id: string; data: PlanCreateUpdatePayload }) => {
      if (!accessToken) return Promise.reject('No access token');
      return planService.updatePlan(accessToken, params.id, params.data);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Plan updated successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plan', variables.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update plan",
        variant: "destructive",
      });
    }
  });

  // Delete plan
  const deletePlan = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) return Promise.reject('No access token');
      return planService.deletePlan(accessToken, id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plan deleted successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete plan",
        variant: "destructive",
      });
    }
  });

  // Get plan users
  const getPlanUsers = (page = currentPage) => {
    return useQuery({
      queryKey: ['planUsers', page],
      queryFn: () => accessToken ? planService.getPlanUsers(accessToken, page) : Promise.reject('No access token'),
      enabled: !!accessToken,
    });
  };

  // Get specific plan user
  const getPlanUser = (id: string) => {
    return useQuery({
      queryKey: ['planUser', id],
      queryFn: () => accessToken ? planService.getPlanUser(accessToken, id) : Promise.reject('No access token'),
      enabled: !!accessToken && !!id,
    });
  };

  // Subscribe to plan
  const subscribeToPlan = useMutation({
    mutationFn: (data: PlanUserCreatePayload) => {
      if (!accessToken) return Promise.reject('No access token');
      return planService.subscribeToPlan(accessToken, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully subscribed to plan",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['planUsers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to subscribe to plan",
        variant: "destructive",
      });
    }
  });

  // Cancel subscription
  const cancelSubscription = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) return Promise.reject('No access token');
      return planService.cancelSubscription(accessToken, id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription canceled successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['planUsers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  });

  return {
    getPlans,
    getPlan,
    createPlan: createPlan.mutate,
    updatePlan: updatePlan.mutate,
    deletePlan: deletePlan.mutate,
    getPlanUsers,
    getPlanUser,
    subscribeToPlan: subscribeToPlan.mutate,
    cancelSubscription: cancelSubscription.mutate,
    isCreatingPlan: createPlan.isPending,
    isUpdatingPlan: updatePlan.isPending,
    isDeletingPlan: deletePlan.isPending,
    isSubscribingToPlan: subscribeToPlan.isPending,
    isCancellingSubscription: cancelSubscription.isPending,
    currentPage,
    setCurrentPage
  };
};
