import { z } from 'zod';

// User registration schema
export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username cannot exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().optional()
});

// User login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// User profile update schema
export const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url('Invalid URL').optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

// Recipe creation schema
export const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().optional(),
  cookingTime: z.number().int().positive().optional(),
  prepTime: z.number().int().positive().optional(),
  servingSize: z.number().int().positive().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  imageUrl: z.string().url('Invalid URL').optional(),
  isPrivate: z.boolean().optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1, 'Ingredient name is required'),
    quantity: z.number().positive().optional(),
    unit: z.string().optional(),
    orderIndex: z.number().int().nonnegative(),
    notes: z.string().optional()
  })).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.object({
    stepNumber: z.number().int().positive(),
    description: z.string().min(1, 'Instruction description is required'),
    imageUrl: z.string().url('Invalid URL').optional()
  })).min(1, 'At least one instruction is required'),
  categories: z.array(z.number().int().positive()).optional(),
  tags: z.array(z.string()).optional()
});

// Recipe update schema (similar to creation but all fields optional)
export const recipeUpdateSchema = recipeSchema.partial().refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

// Comment schema
export const commentSchema = z.object({
  content: z.string().min(1, 'Comment content is required')
});

// Search params schema
export const searchParamsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  search: z.string().optional(),
  userId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  categoryId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional()
});
