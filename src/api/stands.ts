import { apiClient } from './client';
import { Stand } from '../types';

export const standsApi = {
  getStands: async (): Promise<Stand[]> => {
    const response = await apiClient.get('/stands');
    return response.data;
  },

  getStandById: async (id: string): Promise<Stand> => {
    const response = await apiClient.get(`/stands/${id}`);
    return response.data;
  },
};

export default standsApi;
