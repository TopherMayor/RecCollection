import { apiClient } from './client';

// Types
export interface GenerateNameInput {
  ingredients: string[];
  instructions: string[];
  category?: string;
}

export interface GenerateDescriptionInput {
  name: string;
  ingredients: string[];
  instructions: string[];
  category?: string;
}

export interface GenerateNameResponse {
  success: boolean;
  name: string;
}

export interface GenerateDescriptionResponse {
  success: boolean;
  description: string;
}

// AI service
export const aiService = {
  // Generate a recipe name
  async generateName(data: GenerateNameInput) {
    return apiClient<GenerateNameResponse>('/ai/generate-name', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Generate a recipe description
  async generateDescription(data: GenerateDescriptionInput) {
    return apiClient<GenerateDescriptionResponse>('/ai/generate-description', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
