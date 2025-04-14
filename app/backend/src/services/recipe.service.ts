import { eq, and, desc, sql, like, inArray, or } from "drizzle-orm";
import { db, schema } from "../db";
import { HTTPException } from "hono/http-exception";

// Recipe input interface
export interface RecipeInput {
  title: string;
  description?: string;
  cookingTime?: number;
  prepTime?: number;
  servingSize?: number;
  difficultyLevel?: string;
  imageUrl?: string;
  thumbnailPath?: string; // Path to the thumbnail image from social media
  thumbnailUrl?: string; // URL of the thumbnail image from social media
  sourceUrl?: string; // URL of the source (e.g., social media post)
  sourceType?: string; // Type of source (e.g., tiktok, instagram, youtube)
  isPrivate?: boolean;
  isMockData?: boolean; // Flag to indicate if this is mock data
  ingredients: {
    name: string;
    quantity?: number;
    unit?: string;
    orderIndex: number;
    notes?: string;
  }[];
  instructions: {
    stepNumber: number;
    description: string;
    imageUrl?: string;
  }[];
  categories?: number[];
  tags?: string[];
}

// Recipe search params
export interface RecipeSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  categoryId?: number;
  difficulty?: string;
}

// Recipe service
export class RecipeService {
  // Search recipes
  async searchRecipes(params: RecipeSearchParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    // Build the where clause
    let whereClause = sql`1 = 1`;

    if (params.search) {
      const searchTerm = `%${params.search.toLowerCase()}%`;
      whereClause = sql`${whereClause} AND (
        lower(${schema.recipes.title}) LIKE ${searchTerm} OR
        lower(${schema.recipes.description}) LIKE ${searchTerm}
      )`;
    }

    if (params.userId) {
      whereClause = sql`${whereClause} AND ${schema.recipes.userId} = ${params.userId}`;
    }

    if (params.difficulty) {
      whereClause = sql`${whereClause} AND ${schema.recipes.difficultyLevel} = ${params.difficulty}`;
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.recipes)
      .where(whereClause);

    // Get recipes
    const recipes = await db
      .select()
      .from(schema.recipes)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(schema.recipes.createdAt));

    // Get user info for each recipe
    const userIds = recipes.map((recipe) => recipe.userId);
    const users = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        displayName: schema.users.displayName,
        avatarUrl: schema.users.avatarUrl,
      })
      .from(schema.users)
      .where(inArray(schema.users.id, userIds));

    // Create a map of user IDs to user objects
    const userMap = new Map(users.map((user) => [user.id, user]));

    // Add user info to each recipe
    const recipesWithUsers = recipes.map((recipe) => ({
      ...recipe,
      user: userMap.get(recipe.userId),
    }));

    return {
      recipes: recipesWithUsers,
      pagination: {
        total: Number(count),
        page,
        limit,
        pages: Math.ceil(Number(count) / limit),
      },
    };
  }

  // Get recipes from followed users
  async getFollowingRecipes(userId: number, params: RecipeSearchParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    // Get the IDs of users that the current user follows
    const followedUsers = await db
      .select({ followingId: schema.follows.followingId })
      .from(schema.follows)
      .where(eq(schema.follows.followerId, userId));

    // If the user doesn't follow anyone, return empty results
    if (followedUsers.length === 0) {
      return {
        recipes: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      };
    }

    // Extract the user IDs
    const followedUserIds = followedUsers.map((user) => user.followingId);

    // Build the where clause
    let whereClause = sql`${schema.recipes.userId} IN (${sql.join(
      followedUserIds
    )}) AND ${schema.recipes.isPrivate} = false`;

    if (params.search) {
      whereClause = sql`${whereClause} AND ${
        schema.recipes.title
      } ILIKE ${`%${params.search}%`}`;
    }

    if (params.difficulty) {
      whereClause = sql`${whereClause} AND ${schema.recipes.difficultyLevel} = ${params.difficulty}`;
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.recipes)
      .where(whereClause);

    // Get recipes
    const recipes = await db
      .select()
      .from(schema.recipes)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(schema.recipes.createdAt));

    // Get user info for each recipe
    const userIds = recipes.map((recipe) => recipe.userId);
    const users = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        displayName: schema.users.displayName,
        avatarUrl: schema.users.avatarUrl,
      })
      .from(schema.users)
      .where(inArray(schema.users.id, userIds));

    // Create a map of user IDs to user objects
    const userMap = new Map(users.map((user) => [user.id, user]));

    // Add user info to each recipe
    const recipesWithUsers = recipes.map((recipe) => ({
      ...recipe,
      user: userMap.get(recipe.userId),
    }));

    return {
      recipes: recipesWithUsers,
      pagination: {
        total: Number(count),
        page,
        limit,
        pages: Math.ceil(Number(count) / limit),
      },
    };
  }

  // Create a new recipe
  async createRecipe(userId: number, input: RecipeInput) {
    try {
      // Start a transaction
      return await db.transaction(async (tx) => {
        // Create the recipe
        const [recipe] = await tx
          .insert(schema.recipes)
          .values({
            userId,
            title: input.title,
            description: input.description,
            cookingTime: input.cookingTime,
            prepTime: input.prepTime,
            servingSize: input.servingSize,
            difficultyLevel: input.difficultyLevel,
            imageUrl: input.imageUrl,
            thumbnailPath: input.thumbnailPath,
            thumbnailUrl: input.thumbnailUrl,
            sourceUrl: input.sourceUrl,
            sourceType: input.sourceType,
            isPrivate: input.isPrivate ?? false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        // Create ingredients
        if (input.ingredients && input.ingredients.length > 0) {
          await tx.insert(schema.ingredients).values(
            input.ingredients.map((ingredient) => ({
              recipeId: recipe.id,
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              orderIndex: ingredient.orderIndex,
              notes: ingredient.notes,
            }))
          );
        }

        // Create instructions
        if (input.instructions && input.instructions.length > 0) {
          await tx.insert(schema.instructions).values(
            input.instructions.map((instruction) => ({
              recipeId: recipe.id,
              stepNumber: instruction.stepNumber,
              description: instruction.description,
              imageUrl: instruction.imageUrl,
            }))
          );
        }

        // Create categories
        if (input.categories && input.categories.length > 0) {
          await tx.insert(schema.recipeCategories).values(
            input.categories.map((categoryId) => ({
              recipeId: recipe.id,
              categoryId,
            }))
          );
        }

        // Create tags
        if (input.tags && input.tags.length > 0) {
          // First, ensure all tags exist in the database
          for (const tagName of input.tags) {
            // Check if tag exists
            const existingTag = await tx
              .select()
              .from(schema.tags)
              .where(eq(schema.tags.name, tagName))
              .limit(1);

            // If tag doesn't exist, create it
            if (existingTag.length === 0) {
              await tx.insert(schema.tags).values({
                name: tagName,
              });
            }
          }

          // Get all tags
          const tags = await tx
            .select()
            .from(schema.tags)
            .where(inArray(schema.tags.name, input.tags));

          // Link tags to recipe
          if (tags.length > 0) {
            await tx.insert(schema.recipeTags).values(
              tags.map((tag) => ({
                recipeId: recipe.id,
                tagId: tag.id,
              }))
            );
          }
        }

        // Get the user
        const [user] = await tx
          .select({
            id: schema.users.id,
            username: schema.users.username,
            displayName: schema.users.displayName,
            avatarUrl: schema.users.avatarUrl,
          })
          .from(schema.users)
          .where(eq(schema.users.id, userId))
          .limit(1);

        // Return the created recipe with user info
        return {
          ...recipe,
          user,
          ingredients: input.ingredients || [],
          instructions: input.instructions || [],
          categories: input.categories
            ? input.categories.map((id) => ({ id, name: "" }))
            : [],
          tags: input.tags ? input.tags.map((name) => ({ id: 0, name })) : [],
        };
      });
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw new HTTPException(500, { message: "Failed to create recipe" });
    }
  }

  // Get a recipe by ID
  async getRecipeById(id: number, userId?: number) {
    // Get the recipe
    const recipe = await db
      .select()
      .from(schema.recipes)
      .where(eq(schema.recipes.id, id))
      .limit(1);

    // If recipe not found, return null
    if (recipe.length === 0) {
      return null;
    }

    const recipeData = recipe[0];

    // Log recipe and user information for debugging
    console.log(
      `Recipe ${id} found. Owner ID: ${
        recipeData.userId
      } (${typeof recipeData.userId})`
    );
    console.log(
      `Current user ID: ${userId || "not logged in"} (${typeof userId})`
    );

    // Check if the recipe is private and the user is not the owner
    const isOwner =
      userId &&
      (recipeData.userId === userId ||
        String(recipeData.userId) === String(userId));
    console.log(
      `Is owner check: ${isOwner}, Recipe is private: ${recipeData.isPrivate}`
    );

    if (recipeData.isPrivate && !isOwner) {
      console.log(
        `Permission denied: Private recipe ${id} cannot be viewed by user ${
          userId || "not logged in"
        }`
      );
      throw new HTTPException(403, {
        message: "You don't have permission to view this recipe",
      });
    }

    // Get user info
    const user = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        displayName: schema.users.displayName,
        avatarUrl: schema.users.avatarUrl,
      })
      .from(schema.users)
      .where(eq(schema.users.id, recipeData.userId))
      .limit(1);

    // Get ingredients
    const ingredients = await db
      .select()
      .from(schema.ingredients)
      .where(eq(schema.ingredients.recipeId, id))
      .orderBy(schema.ingredients.orderIndex);

    // Get instructions
    const instructions = await db
      .select()
      .from(schema.instructions)
      .where(eq(schema.instructions.recipeId, id))
      .orderBy(schema.instructions.stepNumber);

    // Get categories
    const recipeCategories = await db
      .select({
        id: schema.categories.id,
        name: schema.categories.name,
      })
      .from(schema.recipeCategories)
      .innerJoin(
        schema.categories,
        eq(schema.recipeCategories.categoryId, schema.categories.id)
      )
      .where(eq(schema.recipeCategories.recipeId, id));

    // Get tags
    const recipeTags = await db
      .select({
        id: schema.tags.id,
        name: schema.tags.name,
      })
      .from(schema.recipeTags)
      .innerJoin(schema.tags, eq(schema.recipeTags.tagId, schema.tags.id))
      .where(eq(schema.recipeTags.recipeId, id));

    // Return the recipe with all related data
    return {
      ...recipeData,
      user: user[0],
      ingredients,
      instructions,
      categories: recipeCategories,
      tags: recipeTags,
    };
  }

  // Update a recipe
  async updateRecipe(id: number, userId: number, input: Partial<RecipeInput>) {
    // Check if recipe exists and user is the owner
    console.log(`Checking recipe ${id} for user ${userId}`);
    const recipe = await db.query.recipes.findFirst({
      where: eq(schema.recipes.id, id),
    });

    if (!recipe) {
      console.log(`Recipe ${id} not found`);
      throw new HTTPException(404, { message: "Recipe not found" });
    }

    console.log(
      `Recipe ${id} found. Owner ID: ${
        recipe.userId
      } (${typeof recipe.userId}), Current user ID: ${userId} (${typeof userId})`
    );
    console.log(
      `Equality check: ${recipe.userId === userId}, String comparison: ${
        String(recipe.userId) === String(userId)
      }`
    );

    // Compare both as numbers and as strings to handle potential type mismatches
    if (recipe.userId !== userId && String(recipe.userId) !== String(userId)) {
      console.log(
        `Permission denied: Recipe owner ${recipe.userId} does not match current user ${userId}`
      );
      throw new HTTPException(403, {
        message: "You do not have permission to update this recipe",
      });
    }

    console.log(`User ${userId} has permission to update recipe ${id}`);

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Update the recipe
      const [updatedRecipe] = await tx
        .update(schema.recipes)
        .set({
          ...(input.title && { title: input.title }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.cookingTime !== undefined && {
            cookingTime: input.cookingTime,
          }),
          ...(input.prepTime !== undefined && { prepTime: input.prepTime }),
          ...(input.servingSize !== undefined && {
            servingSize: input.servingSize,
          }),
          ...(input.difficultyLevel !== undefined && {
            difficultyLevel: input.difficultyLevel,
          }),
          ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
          ...(input.thumbnailPath !== undefined && {
            thumbnailPath: input.thumbnailPath,
          }),
          ...(input.thumbnailUrl !== undefined && {
            thumbnailUrl: input.thumbnailUrl,
          }),
          ...(input.sourceUrl !== undefined && { sourceUrl: input.sourceUrl }),
          ...(input.sourceType !== undefined && {
            sourceType: input.sourceType,
          }),
          ...(input.isPrivate !== undefined && { isPrivate: input.isPrivate }),
          updatedAt: new Date(),
        })
        .where(eq(schema.recipes.id, id))
        .returning();

      // Update ingredients if provided
      if (input.ingredients && input.ingredients.length > 0) {
        // Delete existing ingredients
        await tx
          .delete(schema.ingredients)
          .where(eq(schema.ingredients.recipeId, id));

        // Insert new ingredients
        const ingredientsToInsert = input.ingredients.map((ing, index) => ({
          recipeId: id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes || null,
          orderIndex: index,
        }));

        await tx.insert(schema.ingredients).values(ingredientsToInsert);
      }

      // Update instructions if provided
      if (input.instructions && input.instructions.length > 0) {
        // Delete existing instructions
        await tx
          .delete(schema.instructions)
          .where(eq(schema.instructions.recipeId, id));

        // Insert new instructions
        const instructionsToInsert = input.instructions.map((inst) => ({
          recipeId: id,
          stepNumber: inst.stepNumber,
          description: inst.description,
          imageUrl: inst.imageUrl || null,
        }));

        await tx.insert(schema.instructions).values(instructionsToInsert);
      }

      // Update categories if provided
      if (input.categories && input.categories.length > 0) {
        // Delete existing recipe categories
        await tx
          .delete(schema.recipeCategories)
          .where(eq(schema.recipeCategories.recipeId, id));

        // Insert new recipe categories
        const recipeCategoriesValues = input.categories.map((categoryId) => ({
          recipeId: id,
          categoryId,
        }));

        await tx.insert(schema.recipeCategories).values(recipeCategoriesValues);
      }

      // Update tags if provided
      if (input.tags && input.tags.length > 0) {
        // Delete existing recipe tags
        await tx
          .delete(schema.recipeTags)
          .where(eq(schema.recipeTags.recipeId, id));

        // Get or create tags
        const tagPromises = input.tags.map(async (tagName) => {
          const existingTag = await tx
            .select()
            .from(schema.tags)
            .where(eq(schema.tags.name, tagName.trim()));

          if (existingTag.length > 0) {
            return existingTag[0].id;
          } else {
            const [newTag] = await tx
              .insert(schema.tags)
              .values({ name: tagName.trim() })
              .returning();
            return newTag.id;
          }
        });

        const tagIds = await Promise.all(tagPromises);

        // Insert new recipe tags
        const recipeTagsValues = tagIds.map((tagId) => ({
          recipeId: id,
          tagId,
        }));

        if (recipeTagsValues.length > 0) {
          await tx.insert(schema.recipeTags).values(recipeTagsValues);
        }
      }

      return updatedRecipe;
    });
  }

  // Delete a recipe
  async deleteRecipe(id: number, userId: number) {
    // Check if recipe exists and user is the owner
    const recipe = await db.query.recipes.findFirst({
      where: eq(schema.recipes.id, id),
    });

    if (!recipe) {
      throw new HTTPException(404, { message: "Recipe not found" });
    }

    if (recipe.userId !== userId) {
      throw new HTTPException(403, {
        message: "You do not have permission to delete this recipe",
      });
    }

    // Delete the recipe
    await db.delete(schema.recipes).where(eq(schema.recipes.id, id));

    return { success: true };
  }

  // Like a recipe
  async likeRecipe(recipeId: number, userId: number) {
    // Implementation omitted for brevity
    return { success: true };
  }

  // Unlike a recipe
  async unlikeRecipe(recipeId: number, userId: number) {
    // Implementation omitted for brevity
    return { success: true };
  }

  // Add a comment to a recipe
  async addComment(recipeId: number, userId: number, content: string) {
    // Implementation omitted for brevity
    return null;
  }

  // Get comments for a recipe
  async getComments(recipeId: number, page = 1, limit = 10) {
    // Implementation omitted for brevity
    return null;
  }
}

export const recipeService = new RecipeService();
