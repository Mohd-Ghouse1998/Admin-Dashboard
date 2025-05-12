import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chargerApi } from '@/modules/chargers/services/chargerService';

export interface IdTag {
  id: number;
  idtag: string;
  user?: number | null;
  parent_idtag?: string | null;
  is_blocked: boolean;
  expiry_date?: string | null;
  last_modified?: string;
}

export interface IdTagFormValues {
  idtag: string;
  user?: number | null;
  parent_idtag?: string | null;
  is_blocked: boolean;
  expiry_date?: string | null;
}

export const useIdTags = () => {
  const queryClient = useQueryClient();

  const fetchIdTags = (params: Record<string, any> = {}) => {
    return chargerApi.getIdTags(params);
  };

  const fetchIdTag = (id: string) => {
    return chargerApi.getIdTag(id);
  };

  const createIdTagFn = (data: IdTagFormValues) => {
    return chargerApi.createIdTag(data);
  };

  const updateIdTagFn = ({ id, data }: { id: string; data: IdTagFormValues }) => {
    return chargerApi.updateIdTag(id, data);
  };

  const deleteIdTagFn = (id: string) => {
    return chargerApi.deleteIdTag(id);
  };

  const sendLocalListFn = () => {
    return chargerApi.sendLocalList({});
  };

  const useIdTagsQuery = (params: Record<string, any> = {}) => {
    return useQuery(['idTags', params], () => fetchIdTags(params));
  };

  const useIdTagQuery = (id: string | undefined) => {
    return useQuery(['idTag', id], () => fetchIdTag(id!), {
      enabled: !!id
    });
  };

  const useCreateIdTagMutation = () => {
    return useMutation(createIdTagFn, {
      onSuccess: () => {
        queryClient.invalidateQueries(['idTags']);
      }
    });
  };

  const useUpdateIdTagMutation = () => {
    return useMutation(updateIdTagFn, {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['idTag', variables.id]);
        queryClient.invalidateQueries(['idTags']);
      }
    });
  };

  const useDeleteIdTagMutation = () => {
    return useMutation(deleteIdTagFn, {
      onSuccess: (_, id) => {
        queryClient.invalidateQueries(['idTag', id]);
        queryClient.invalidateQueries(['idTags']);
      }
    });
  };

  const useSendLocalListMutation = () => {
    return useMutation(sendLocalListFn);
  };

  return {
    useIdTagsQuery,
    useIdTagQuery,
    useCreateIdTagMutation,
    useUpdateIdTagMutation,
    useDeleteIdTagMutation,
    useSendLocalListMutation
  };
};
