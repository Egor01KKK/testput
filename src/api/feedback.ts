import { apiClient } from './client';
import { FeedbackData, VotingData } from '../types';

export const feedbackApi = {
  submitFeedback: async (data: FeedbackData): Promise<void> => {
    await apiClient.post('/feedback', data);
  },

  getVotingStatus: async (): Promise<{ hasVoted: boolean; votedFor?: string }> => {
    const response = await apiClient.get('/voting/status');
    return response.data;
  },

  submitVote: async (data: VotingData): Promise<void> => {
    await apiClient.post('/voting', data);
  },

  getVotingResults: async (): Promise<{ standId: string; votes: number }[]> => {
    const response = await apiClient.get('/voting/results');
    return response.data;
  },
};

export default feedbackApi;
