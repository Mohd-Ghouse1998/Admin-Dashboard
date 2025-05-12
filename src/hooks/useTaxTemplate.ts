
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { taxService, TaxTemplateCreateUpdatePayload } from '@/services/taxService';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useTaxTemplate = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Get all tax templates
  const getTaxTemplates = (page = currentPage) => {
    return useQuery({
      queryKey: ['taxTemplates', page],
      queryFn: () => accessToken ? taxService.getTaxTemplates(accessToken, page) : Promise.reject('No access token'),
      enabled: !!accessToken,
    });
  };

  // Get specific tax template
  const getTaxTemplate = (id: string) => {
    return useQuery({
      queryKey: ['taxTemplate', id],
      queryFn: () => accessToken ? taxService.getTaxTemplate(accessToken, id) : Promise.reject('No access token'),
      enabled: !!accessToken && !!id,
    });
  };

  // Create tax template
  const createTaxTemplate = useMutation({
    mutationFn: (data: TaxTemplateCreateUpdatePayload) => {
      if (!accessToken) return Promise.reject('No access token');
      return taxService.createTaxTemplate(accessToken, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tax template created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['taxTemplates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create tax template",
        variant: "destructive",
      });
    }
  });

  // Update tax template
  const updateTaxTemplate = useMutation({
    mutationFn: (params: { id: string; data: TaxTemplateCreateUpdatePayload }) => {
      if (!accessToken) return Promise.reject('No access token');
      return taxService.updateTaxTemplate(accessToken, params.id, params.data);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Tax template updated successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['taxTemplates'] });
      queryClient.invalidateQueries({ queryKey: ['taxTemplate', variables.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update tax template",
        variant: "destructive",
      });
    }
  });

  // Delete tax template
  const deleteTaxTemplate = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) return Promise.reject('No access token');
      return taxService.deleteTaxTemplate(accessToken, id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tax template deleted successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['taxTemplates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete tax template",
        variant: "destructive",
      });
    }
  });

  return {
    getTaxTemplates,
    getTaxTemplate,
    createTaxTemplate: createTaxTemplate.mutate,
    updateTaxTemplate: updateTaxTemplate.mutate,
    deleteTaxTemplate: deleteTaxTemplate.mutate,
    isCreatingTaxTemplate: createTaxTemplate.isPending,
    isUpdatingTaxTemplate: updateTaxTemplate.isPending,
    isDeletingTaxTemplate: deleteTaxTemplate.isPending,
    currentPage,
    setCurrentPage
  };
};
