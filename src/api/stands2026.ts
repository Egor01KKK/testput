import { apiClient } from './client';
import { StandListResource, StandDetailResource } from '../types';

export const stands2026Api = {
  getStands: async (params?: {
    zone_id?: string;
    search?: string;
  }): Promise<StandListResource[]> => {
    const response = await apiClient.get('/stands', { params });
    return response.data;
  },

  getStandById: async (id: string): Promise<StandDetailResource> => {
    const response = await apiClient.get(`/stands/${id}`);
    return response.data;
  },
};

export default stands2026Api;
