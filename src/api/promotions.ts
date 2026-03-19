import { apiClient } from './client';
import { PromotionListResource, PromotionDetailResource } from '../types';

export const promotionsApi = {
  getPromotions: async (params?: {
    partner_only?: boolean;
    is_foreign?: boolean;
    tourism_type_id?: string;
    search?: string;
    limit?: number;
  }): Promise<PromotionListResource[]> => {
    const response = await apiClient.get('/promotions', { params });
    return response.data;
  },

  getPromotionById: async (id: string): Promise<PromotionDetailResource> => {
    const response = await apiClient.get(`/promotions/${id}`);
    return response.data;
  },

  swipePromotion: async (id: string, action: 'accept' | 'skip'): Promise<void> => {
    await apiClient.post(`/promotions/${id}/swipe`, { action });
  },

  claimPromotion: async (id: string, data: { name: string; email: string }): Promise<void> => {
    await apiClient.post(`/promotions/${id}/claim`, data);
  },

  toggleFavorite: async (id: string, isFavorite: boolean): Promise<void> => {
    if (isFavorite) {
      await apiClient.post(`/favorites/promotions/${id}`);
    } else {
      await apiClient.delete(`/favorites/promotions/${id}`);
    }
  },
};

export default promotionsApi;
