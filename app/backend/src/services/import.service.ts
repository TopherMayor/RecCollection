import { HTTPException } from 'hono/http-exception';
import { AIService } from './ai.service';

// Import service for importing recipes from social media
export class ImportService {
  private aiService: AIService;
  
  constructor() {
    this.aiService = new AIService();
  }
  
  // Validate a social media URL
  validateSocialMediaURL(url: string): { valid: boolean; platform?: 'instagram' | 'tiktok'; error?: string } {
    // Instagram URL pattern
    const instagramPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|tv|reel)\/([^\/\?]+)/;
    
    // TikTok URL pattern
    const tiktokPattern = /^https?:\/\/(www\.)?(tiktok\.com)\/@([^\/]+)\/video\/(\d+)/;
    
    if (instagramPattern.test(url)) {
      return { valid: true, platform: 'instagram' };
    } else if (tiktokPattern.test(url)) {
      return { valid: true, platform: 'tiktok' };
    } else {
      return { valid: false, error: 'URL is not from a supported platform or has an invalid format' };
    }
  }
  
  // Import a recipe from Instagram
  async importFromInstagram(userId: number, url: string): Promise<any> {
    try {
      // Validate the URL
      const validation = this.validateSocialMediaURL(url);
      
      if (!validation.valid || validation.platform !== 'instagram') {
        throw new HTTPException(400, { message: 'Invalid Instagram URL' });
      }
      
      // In a real implementation, this would fetch data from Instagram
      // For now, we'll return mock data
      
      // Mock ingredients and instructions
      const ingredients = ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'];
      const instructions = ['Step 1: Do something', 'Step 2: Do something else', 'Step 3: Finish'];
      
      // Generate a name and description using AI
      const name = await this.aiService.generateRecipeName(userId, ingredients, instructions);
      const description = await this.aiService.generateRecipeDescription(userId, name, ingredients, instructions);
      
      return {
        title: name,
        description,
        ingredients: ingredients.map((name, index) => ({
          name,
          quantity: 1,
          unit: 'cup',
          orderIndex: index + 1
        })),
        instructions: instructions.map((description, index) => ({
          stepNumber: index + 1,
          description
        })),
        cookingTime: 30,
        prepTime: 15,
        servingSize: 4,
        difficultyLevel: 'medium',
        sourceUrl: url,
        sourceType: 'instagram'
      };
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to import recipe from Instagram' });
    }
  }
  
  // Import a recipe from TikTok
  async importFromTikTok(userId: number, url: string): Promise<any> {
    try {
      // Validate the URL
      const validation = this.validateSocialMediaURL(url);
      
      if (!validation.valid || validation.platform !== 'tiktok') {
        throw new HTTPException(400, { message: 'Invalid TikTok URL' });
      }
      
      // In a real implementation, this would fetch data from TikTok
      // For now, we'll return mock data
      
      // Mock ingredients and instructions
      const ingredients = ['Ingredient A', 'Ingredient B', 'Ingredient C'];
      const instructions = ['Step 1: Mix ingredients', 'Step 2: Cook for 10 minutes', 'Step 3: Serve hot'];
      
      // Generate a name and description using AI
      const name = await this.aiService.generateRecipeName(userId, ingredients, instructions);
      const description = await this.aiService.generateRecipeDescription(userId, name, ingredients, instructions);
      
      return {
        title: name,
        description,
        ingredients: ingredients.map((name, index) => ({
          name,
          quantity: 2,
          unit: 'tbsp',
          orderIndex: index + 1
        })),
        instructions: instructions.map((description, index) => ({
          stepNumber: index + 1,
          description
        })),
        cookingTime: 15,
        prepTime: 5,
        servingSize: 2,
        difficultyLevel: 'easy',
        sourceUrl: url,
        sourceType: 'tiktok'
      };
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to import recipe from TikTok' });
    }
  }
}
