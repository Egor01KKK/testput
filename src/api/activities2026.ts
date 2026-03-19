import { apiClient } from './client';
import { ActivityListResource, ActivityDetailResource } from '../types';

export const activities2026Api = {
  getActivities: async (params?: {
    type?: string;
    date?: string;
    time?: string;
  }): Promise<ActivityListResource[]> => {
    const response = await apiClient.get('/activities', { params });
    return response.data;
  },

  getActivityById: async (id: string): Promise<ActivityDetailResource> => {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data;
  },

  toggleFavorite: async (id: string, isFavorite: boolean): Promise<void> => {
    if (isFavorite) {
      await apiClient.post(`/favorites/activities/${id}`);
    } else {
      await apiClient.delete(`/favorites/activities/${id}`);
    }
  },
};

export default activities2026Api;
