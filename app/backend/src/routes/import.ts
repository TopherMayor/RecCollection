import { Hono } from 'hono';
import { ImportController } from '../controllers/import.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

// Create a new router
const router = new Hono();

// Create an instance of the import controller
const importController = new ImportController();

// Validation schemas
const urlSchema = z.object({
  url: z.string().url('Invalid URL')
});

// Import from Instagram
router.post('/instagram', authenticate, validate(urlSchema), (c) => {
  const data = c.get('validated');
  return importController.importFromInstagram(c, data);
});

// Import from TikTok
router.post('/tiktok', authenticate, validate(urlSchema), (c) => {
  const data = c.get('validated');
  return importController.importFromTikTok(c, data);
});

export { router as importRoutes };
