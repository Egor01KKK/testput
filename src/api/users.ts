import { apiClient } from './client';
import { UserProfile } from '../types';

export const usersApi = {
  register: async (profile: UserProfile): Promise<UserProfile> => {
    const response = await apiClient.post('/users/register', profile);
    return response.data;
  },

  updateProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiClient.put('/users/profile', profile);
    return response.data;
  },

  registerFCMToken: async (token: string): Promise<void> => {
    await apiClient.post('/users/fcm-token', { token });
  },
};

export default usersApi;
