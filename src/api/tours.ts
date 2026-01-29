import { apiClient } from './client';
import { Tour, TourismType } from '../types';

interface ToursFilters {
  type?: TourismType;
  region?: string;
}

export const toursApi = {
  getTours: async (filters?: ToursFilters): Promise<Tour[]> => {
    const params = new URLSearchParams();
    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.region) {
      params.append('region', filters.region);
    }
    const response = await apiClient.get(`/tours?${params.toString()}`);
    return response.data;
  },

  getTourById: async (id: string): Promise<Tour> => {
    const response = await apiClient.get(`/tours/${id}`);
    return response.data;
  },
};

export default toursApi;
