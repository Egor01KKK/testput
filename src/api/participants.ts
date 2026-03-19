import { apiClient } from './client';
import { Participant2026 } from '../types';

export const participantsApi = {
  getParticipants: async (params?: {
    role?: string;
    highlight_level?: string;
    tourism_type_id?: string;
    country_id?: string;
  }): Promise<Participant2026[]> => {
    const response = await apiClient.get('/participants', { params });
    return response.data;
  },

  getParticipantById: async (id: string): Promise<Participant2026> => {
    const response = await apiClient.get(`/participants/${id}`);
    return response.data;
  },
};

export default participantsApi;
