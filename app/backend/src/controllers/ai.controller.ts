import type { Context } from 'hono';
import { AIService } from '../services/ai.service';
import { HTTPException } from 'hono/http-exception';
import type { JWTPayload } from '../middleware/auth';

// Create an instance of the AI service
const aiService = new AIService();

export class AIController {
  // Generate a recipe name
  async generateName(c: Context, data: { ingredients: string[]; instructions: string[]; category?: string }) {
    try {
      const user = c.get('user') as JWTPayload;
      
      // Generate the recipe name
      const name = await aiService.generateRecipeName(
        user.id,
        data.ingredients,
        data.instructions,
        data.category
      );
      
      return c.json({
        success: true,
        name
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'An error occurred while generating the recipe name' });
    }
  }
  
  // Generate a recipe description
  async generateDescription(c: Context, data: { name: string; ingredients: string[]; instructions: string[]; category?: string }) {
    try {
      const user = c.get('user') as JWTPayload;
      
      // Generate the recipe description
      const description = await aiService.generateRecipeDescription(
        user.id,
        data.name,
        data.ingredients,
        data.instructions,
        data.category
      );
      
      return c.json({
        success: true,
        description
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'An error occurred while generating the recipe description' });
    }
  }
}
