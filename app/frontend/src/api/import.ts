import { apiClient } from './client';
import { Recipe } from './recipes';

// Types
export interface ImportResponse {
  success: boolean;
  recipe: Recipe;
}

// Import service
export const importService = {
  // Import from Instagram
  async importFromInstagram(url: string) {
    return apiClient<ImportResponse>('/import/instagram', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },
  
  // Import from TikTok
  async importFromTikTok(url: string) {
    return apiClient<ImportResponse>('/import/tiktok', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },
};
