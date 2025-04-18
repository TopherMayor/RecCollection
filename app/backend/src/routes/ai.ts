import { Hono } from "hono";
import { AIController } from "../controllers/ai.controller.ts";
import { authenticate } from "../middleware/auth.ts";
import { validate } from "../middleware/validation.ts";
import { z } from "zod";

// Create a new router
const router = new Hono();

// Create an instance of the AI controller
const aiController = new AIController();

// Validation schemas
const generateNameSchema = z.object({
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required"),
  instructions: z
    .array(z.string())
    .min(1, "At least one instruction is required"),
  category: z.string().optional(),
});

const generateDescriptionSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required"),
  instructions: z
    .array(z.string())
    .min(1, "At least one instruction is required"),
  category: z.string().optional(),
});

// Generate a recipe name
router.post(
  "/generate-name",
  authenticate,
  validate(generateNameSchema),
  (c) => {
    const data = c.get("validated");
    const validatedData = data as {
      ingredients: string[];
      instructions: string[];
      category?: string;
    };
    return aiController.generateName(c, validatedData);
  }
);

// Generate a recipe description
router.post(
  "/generate-description",
  authenticate,
  validate(generateDescriptionSchema),
  (c) => {
    const data = c.get("validated");
    const validatedData = data as {
      name: string;
      ingredients: string[];
      instructions: string[];
      category?: string;
    };
    return aiController.generateDescription(c, validatedData);
  }
);

export { router as aiRoutes };
