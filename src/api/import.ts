import { apiClient } from './client';
import { Recipe } from './recipes';

// Import service
export const importService = {
  // Import recipe from Instagram
  async importFromInstagram(url: string) {
    return apiClient<{ recipe: Recipe }>('/import/instagram', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },
  
  // Import recipe from TikTok
  async importFromTikTok(url: string) {
    return apiClient<{ recipe: Recipe }>('/import/tiktok', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },
};
