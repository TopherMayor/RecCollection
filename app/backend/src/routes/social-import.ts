import { Hono } from 'hono';
import { AIParserController } from '../controllers/ai-parser.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

// Create a new router
const router = new Hono();

// Create an instance of the AI parser controller
const aiParserController = new AIParserController();

// Validation schemas
const urlSchema = z.object({
  url: z.string().url('Invalid URL'),
  platform: z.enum(['tiktok', 'instagram', 'youtube']).optional()
});

const importSchema = z.object({
  url: z.string().url('Invalid URL'),
  platform: z.enum(['tiktok', 'instagram', 'youtube']).optional(),
  recipeData: z.any().optional() // This will be validated more thoroughly in the controller
});

// Parse recipe from social media URL
router.post('/parse', authenticate, validate(urlSchema), (c) => {
  return aiParserController.parseRecipeFromSocialMedia(c);
});

// Import recipe from social media URL
router.post('/import', authenticate, validate(importSchema), (c) => {
  return aiParserController.importRecipeFromSocialMedia(c);
});

export { router as socialImportRoutes };
