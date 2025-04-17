import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authenticate as authMiddleware } from "../middleware/auth";
import * as collectionsService from "../services/collections.service";

const collections = new Hono();

// Apply auth middleware to all routes
collections.use("*", authMiddleware);

// Get all collections for the authenticated user
collections.get("/", async (c) => {
  const userId = c.get("userId");

  try {
    const userCollections = await collectionsService.getUserCollections(userId);
    return c.json({ success: true, collections: userCollections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return c.json(
      { success: false, message: "Failed to fetch collections" },
      500
    );
  }
});

// Get a specific collection by ID
collections.get("/:id", async (c) => {
  const userId = c.get("userId");
  const collectionId = parseInt(c.req.param("id"));

  if (isNaN(collectionId)) {
    return c.json({ success: false, message: "Invalid collection ID" }, 400);
  }

  try {
    const collection = await collectionsService.getCollectionById(collectionId);

    if (!collection) {
      return c.json({ success: false, message: "Collection not found" }, 404);
    }

    // Check if the collection belongs to the authenticated user
    if (collection.userId !== userId) {
      return c.json(
        { success: false, message: "Unauthorized access to collection" },
        403
      );
    }

    // Get recipes in the collection
    const collectionRecipes = await collectionsService.getCollectionRecipes(
      collectionId
    );

    return c.json({
      success: true,
      collection,
      recipes: collectionRecipes,
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return c.json(
      { success: false, message: "Failed to fetch collection" },
      500
    );
  }
});

// Create a new collection
const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

collections.post("/", zValidator("json", createCollectionSchema), async (c) => {
  const userId = c.get("userId");
  const { name, description } = c.req.valid("json");

  try {
    const newCollection = await collectionsService.createCollection({
      userId,
      name,
      description: description || null,
    });

    return c.json({ success: true, collection: newCollection }, 201);
  } catch (error) {
    console.error("Error creating collection:", error);
    return c.json(
      { success: false, message: "Failed to create collection" },
      500
    );
  }
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
    const userId = c.get("userId");
    const collectionId = parseInt(c.req.param("id"));
    const updates = c.req.valid("json");

    if (isNaN(collectionId)) {
      return c.json({ success: false, message: "Invalid collection ID" }, 400);
    }

    try {
      // Check if collection exists and belongs to user
      const collection = await collectionsService.getCollectionById(
        collectionId
      );

      if (!collection) {
        return c.json({ success: false, message: "Collection not found" }, 404);
      }

      if (collection.userId !== userId) {
        return c.json(
          { success: false, message: "Unauthorized access to collection" },
          403
        );
      }

      // Update the collection
      const updatedCollection = await collectionsService.updateCollection(
        collectionId,
        updates
      );

      return c.json({ success: true, collection: updatedCollection });
    } catch (error) {
      console.error("Error updating collection:", error);
      return c.json(
        { success: false, message: "Failed to update collection" },
        500
      );
    }
  }
);

// Delete a collection
collections.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const collectionId = parseInt(c.req.param("id"));

  if (isNaN(collectionId)) {
    return c.json({ success: false, message: "Invalid collection ID" }, 400);
  }

  try {
    // Check if collection exists and belongs to user
    const collection = await collectionsService.getCollectionById(collectionId);

    if (!collection) {
      return c.json({ success: false, message: "Collection not found" }, 404);
    }

    if (collection.userId !== userId) {
      return c.json(
        { success: false, message: "Unauthorized access to collection" },
        403
      );
    }

    // Delete the collection
    await collectionsService.deleteCollection(collectionId);

    return c.json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return c.json(
      { success: false, message: "Failed to delete collection" },
      500
    );
  }
});

// Add a recipe to a collection
const addRecipeSchema = z.object({
  recipeId: z.number().int().positive(),
});

collections.post(
  "/:id/recipes",
  zValidator("json", addRecipeSchema),
  async (c) => {
    const userId = c.get("userId");
    const collectionId = parseInt(c.req.param("id"));
    const { recipeId } = c.req.valid("json");

    if (isNaN(collectionId)) {
      return c.json({ success: false, message: "Invalid collection ID" }, 400);
    }

    try {
      // Check if collection exists and belongs to user
      const collection = await collectionsService.getCollectionById(
        collectionId
      );

      if (!collection) {
        return c.json({ success: false, message: "Collection not found" }, 404);
      }

      if (collection.userId !== userId) {
        return c.json(
          { success: false, message: "Unauthorized access to collection" },
          403
        );
      }

      // Add recipe to collection
      const recipeCollection = await collectionsService.addRecipeToCollection(
        recipeId,
        collectionId
      );

      return c.json({ success: true, recipeCollection }, 201);
    } catch (error) {
      console.error("Error adding recipe to collection:", error);
      return c.json(
        { success: false, message: "Failed to add recipe to collection" },
        500
      );
    }
  }
);

// Remove a recipe from a collection
collections.delete("/:id/recipes/:recipeId", async (c) => {
  const userId = c.get("userId");
  const collectionId = parseInt(c.req.param("id"));
  const recipeId = parseInt(c.req.param("recipeId"));

  if (isNaN(collectionId) || isNaN(recipeId)) {
    return c.json(
      { success: false, message: "Invalid collection or recipe ID" },
      400
    );
  }

  try {
    // Check if collection exists and belongs to user
    const collection = await collectionsService.getCollectionById(collectionId);

    if (!collection) {
      return c.json({ success: false, message: "Collection not found" }, 404);
    }

    if (collection.userId !== userId) {
      return c.json(
        { success: false, message: "Unauthorized access to collection" },
        403
      );
    }

    // Remove recipe from collection
    await collectionsService.removeRecipeFromCollection(recipeId, collectionId);

    return c.json({ success: true, message: "Recipe removed from collection" });
  } catch (error) {
    console.error("Error removing recipe from collection:", error);
    return c.json(
      { success: false, message: "Failed to remove recipe from collection" },
      500
    );
  }
});

export default collections;
