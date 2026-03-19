import { apiClient } from './client';
import { Zone2026 } from '../types';

export const zonesApi = {
  getZones: async (): Promise<Zone2026[]> => {
    const response = await apiClient.get('/zones');
    return response.data;
  },
};

export default zonesApi;
