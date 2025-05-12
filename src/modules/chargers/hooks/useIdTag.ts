import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface IdTag {
  id: number;
  idtag: string;
  parent_idtag: string | null;
  is_blocked: boolean;
  expiry_date: string | null;
}

export const useIdTag = () => {
  // GET all ID tags
  const getIdTags = () => {
    return useQuery<IdTag[]>(['idTags'], async () => {
      const response = await axios.get('/api/ocpp/id-tags/');
      return response.data;
    });
  };

  // GET a single ID tag by ID
  const getIdTagById = (id: string | number) => {
    return useQuery<IdTag>(['idTag', id], async () => {
      const response = await axios.get(`/api/ocpp/id-tags/${id}/`);
      return response.data;
    }, {
      enabled: !!id,
    });
  };

  // POST create a new ID tag
  const createIdTag = useMutation(async (idTag: Partial<IdTag>) => {
    const response = await axios.post('/api/ocpp/id-tags/', idTag);
    return response.data;
  });

  // PUT update an existing ID tag
  const updateIdTag = useMutation(async ({ id, ...data }: Partial<IdTag> & { id: string | number }) => {
    const response = await axios.put(`/api/ocpp/id-tags/${id}/`, data);
    return response.data;
  });

  // DELETE an ID tag
  const deleteIdTag = useMutation(async (id: string | number) => {
    const response = await axios.delete(`/api/ocpp/id-tags/${id}/`);
    return response.data;
  });

  return {
    getIdTags,
    getIdTagById,
    createIdTag,
    updateIdTag,
    deleteIdTag,
  };
};

export default useIdTag;
