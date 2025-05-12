
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { promotionService, PromotionCreateUpdatePayload } from '@/services/promotionService';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const usePromotion = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Get all promotions
  const getPromotions = (page = currentPage) => {
    return useQuery({
      queryKey: ['promotions', page],
      queryFn: () => accessToken ? promotionService.getPromotions(accessToken, page) : Promise.reject('No access token'),
      enabled: !!accessToken,
    });
  };

  // Get specific promotion
  const getPromotion = (id: string) => {
    return useQuery({
      queryKey: ['promotion', id],
      queryFn: () => accessToken ? promotionService.getPromotion(accessToken, id) : Promise.reject('No access token'),
      enabled: !!accessToken && !!id,
    });
  };

  // Create promotion
  const createPromotion = useMutation({
    mutationFn: (data: PromotionCreateUpdatePayload) => {
      if (!accessToken) return Promise.reject('No access token');
      return promotionService.createPromotion(accessToken, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Promotion created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create promotion",
        variant: "destructive",
      });
    }
  });

  // Update promotion
  const updatePromotion = useMutation({
    mutationFn: (params: { id: string; data: PromotionCreateUpdatePayload }) => {
      if (!accessToken) return Promise.reject('No access token');
      return promotionService.updatePromotion(accessToken, params.id, params.data);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Promotion updated successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotion', variables.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update promotion",
        variant: "destructive",
      });
    }
  });

  // Delete promotion
  const deletePromotion = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) return Promise.reject('No access token');
      return promotionService.deletePromotion(accessToken, id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Promotion deleted successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete promotion",
        variant: "destructive",
      });
    }
  });

  return {
    getPromotions,
    getPromotion,
    createPromotion: createPromotion.mutate,
    updatePromotion: updatePromotion.mutate,
    deletePromotion: deletePromotion.mutate,
    isCreatingPromotion: createPromotion.isPending,
    isUpdatingPromotion: updatePromotion.isPending,
    isDeletingPromotion: deletePromotion.isPending,
    currentPage,
    setCurrentPage
  };
};
