import { Hono } from "hono";
import { ImportController } from "../controllers/import.controller.ts";
import { authenticate } from "../middleware/auth.ts";
import { validate } from "../middleware/validation.ts";
import { z } from "zod";
import type { CustomContext } from "../types/hono.d.ts";

// Create a new router
const router = new Hono<{ Variables: CustomContext }>();

// Create an instance of the import controller
const importController = new ImportController();

// Validation schemas
const urlSchema = z.object({
  url: z.string().url("Invalid URL"),
});

// Import from Instagram
router.post(
  "/instagram",
  authenticate,
  validate(urlSchema),
  (c: CustomContext) => {
    const { body } = c.get("validated");
    return importController.importFromInstagram(c, body);
  }
);

// Import from TikTok
router.post(
  "/tiktok",
  authenticate,
  validate(urlSchema),
  (c: CustomContext) => {
    const { body } = c.get("validated");
    return importController.importFromTikTok(c, body);
  }
);

export { router as importRoutes };
