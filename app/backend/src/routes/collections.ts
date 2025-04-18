import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authenticate as authMiddleware } from "../middleware/auth.ts";
import * as collectionsService from "../services/collections.service.ts";
import { throwError } from "../middleware/error.ts";

const collections = new Hono();

// Apply auth middleware to all routes
collections.use("*", authMiddleware);

// UUID validation schema
const uuidSchema = z.string().uuid();

// Get all collections for the authenticated user
collections.get("/", async (c) => {
  const userId = c.user.id;
  const userCollections = await collectionsService.getUserCollections(
    Number(userId)
  );
  return c.json({
    success: true,
    collections: userCollections,
  });
});

// Get a specific collection by ID
collections.get("/:id", async (c) => {
  const userId = c.user.id;
  const collectionId = c.req.param("id");

  try {
    uuidSchema.parse(collectionId);
  } catch {
    throwError(400, "Invalid collection ID format", "BAD_REQUEST");
  }

  const collection = await collectionsService.getCollectionById(
    Number(collectionId)
  );

  if (!collection) {
    throwError(404, "Collection not found", "NOT_FOUND");
  }

  // Check if the collection belongs to the authenticated user
  if (collection.userId !== Number(userId)) {
    throwError(403, "Unauthorized access to collection", "FORBIDDEN");
  }

  // Get recipes in the collection
  const collectionRecipes = await collectionsService.getCollectionRecipes(
    Number(collectionId)
  );

  return c.json({
    success: true,
    collection,
    recipes: collectionRecipes,
  });
});

// Create a new collection
const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

collections.post("/", zValidator("json", createCollectionSchema), async (c) => {
  const userId = c.user.id;
  const { name, description } = c.req.valid("json");

  const newCollection = await collectionsService.createCollection({
    userId: Number(userId),
    name,
    description: description || null,
  });

  return c.json(
    {
      success: true,
      collection: newCollection,
    },
    201
  );
});

// Update a collection
const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

collections.put(
  "/:id",
  zValidator("json", updateCollectionSchema),
  async (c) => {
    const userId = c.user.id;
    const collectionId = c.req.param("id");
    const updates = c.req.valid("json");

    try {
      uuidSchema.parse(collectionId);
    } catch {
      throwError(400, "Invalid collection ID format", "BAD_REQUEST");
    }

    // Check if collection exists and belongs to user
    const collection = await collectionsService.getCollectionById(
      Number(collectionId)
    );

    if (!collection) {
      throwError(404, "Collection not found", "NOT_FOUND");
    }

    if (collection.userId !== Number(userId)) {
      throwError(403, "Unauthorized access to collection", "FORBIDDEN");
    }

    // Update the collection
    const updatedCollection = await collectionsService.updateCollection(
      Number(collectionId),
      updates
    );

    return c.json({
      success: true,
      collection: updatedCollection,
    });
  }
);

// Delete a collection
collections.delete("/:id", async (c) => {
  const userId = c.user.id;
  const collectionId = c.req.param("id");

  try {
    uuidSchema.parse(collectionId);
  } catch {
    throwError(400, "Invalid collection ID format", "BAD_REQUEST");
  }

  // Check if collection exists and belongs to user
  const collection = await collectionsService.getCollectionById(
    Number(collectionId)
  );

  if (!collection) {
    throwError(404, "Collection not found", "NOT_FOUND");
  }

  if (collection.userId !== Number(userId)) {
    throwError(403, "Unauthorized access to collection", "FORBIDDEN");
  }

  // Delete the collection
  await collectionsService.deleteCollection(Number(collectionId));

  return c.json({
    success: true,
    message: "Collection deleted successfully",
  });
});

// Add a recipe to a collection
const addRecipeSchema = z.object({
  recipeId: z.number().int().positive(),
});

collections.post(
  "/:id/recipes",
  zValidator("json", addRecipeSchema),
  async (c) => {
    const userId = c.user.id;
    const collectionId = c.req.param("id");
    const { recipeId } = c.req.valid("json");

    try {
      uuidSchema.parse(collectionId);
    } catch {
      throwError(400, "Invalid collection ID format", "BAD_REQUEST");
    }

    // Check if collection exists and belongs to user
    const collection = await collectionsService.getCollectionById(
      Number(collectionId)
    );

    if (!collection) {
      throwError(404, "Collection not found", "NOT_FOUND");
    }

    if (collection.userId !== Number(userId)) {
      throwError(403, "Unauthorized access to collection", "FORBIDDEN");
    }

    // Add recipe to collection
    const recipeCollection = await collectionsService.addRecipeToCollection(
      recipeId,
      Number(collectionId)
    );

    return c.json(
      {
        success: true,
        recipeCollection,
      },
      201
    );
  }
);

// Remove a recipe from a collection
collections.delete("/:id/recipes/:recipeId", async (c) => {
  const userId = c.user.id;
  const collectionId = c.req.param("id");
  const recipeId = parseInt(c.req.param("recipeId"));

  try {
    uuidSchema.parse(collectionId);
  } catch {
    throwError(400, "Invalid collection ID format", "BAD_REQUEST");
  }

  if (isNaN(recipeId)) {
    throwError(400, "Invalid recipe ID", "BAD_REQUEST");
  }

  // Check if collection exists and belongs to user
  const collection = await collectionsService.getCollectionById(
    Number(collectionId)
  );

  if (!collection) {
    throwError(404, "Collection not found", "NOT_FOUND");
  }

  if (collection.userId !== Number(userId)) {
    throwError(403, "Unauthorized access to collection", "FORBIDDEN");
  }

  // Remove recipe from collection
  await collectionsService.removeRecipeFromCollection(
    recipeId,
    Number(collectionId)
  );

  return c.json({
    success: true,
    message: "Recipe removed from collection",
  });
});

export default collections;
