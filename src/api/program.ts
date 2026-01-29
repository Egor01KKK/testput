import { apiClient } from './client';
import { Activity } from '../types';

interface ProgramFilters {
  date?: string;
  zones?: string[];
}

export const programApi = {
  getProgram: async (filters?: ProgramFilters): Promise<Activity[]> => {
    const params = new URLSearchParams();
    if (filters?.date) {
      params.append('date', filters.date);
    }
    if (filters?.zones?.length) {
      params.append('zones', filters.zones.join(','));
    }
    const response = await apiClient.get(`/program?${params.toString()}`);
    return response.data;
  },

  getActivityById: async (id: string): Promise<Activity> => {
    const response = await apiClient.get(`/program/${id}`);
    return response.data;
  },
};

export default programApi;
