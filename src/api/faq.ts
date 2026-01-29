import { apiClient } from './client';
import { FAQItem } from '../types';

export const faqApi = {
  getFAQ: async (): Promise<FAQItem[]> => {
    const response = await apiClient.get('/faq');
    return response.data;
  },
};

export default faqApi;
