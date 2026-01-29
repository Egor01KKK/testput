import { apiClient } from './client';
import { Excursion, ExcursionBooking } from '../types';

export const excursionsApi = {
  getExcursions: async (date?: string): Promise<Excursion[]> => {
    const params = date ? `?date=${date}` : '';
    const response = await apiClient.get(`/excursions${params}`);
    return response.data;
  },

  getExcursionById: async (id: string): Promise<Excursion> => {
    const response = await apiClient.get(`/excursions/${id}`);
    return response.data;
  },

  bookExcursion: async (id: string, booking: ExcursionBooking): Promise<void> => {
    await apiClient.post(`/excursions/${id}/book`, booking);
  },
};

export default excursionsApi;
