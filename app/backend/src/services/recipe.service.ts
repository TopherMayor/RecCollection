import { eq, and, desc, sql, like, inArray } from 'drizzle-orm';
import { db, schema } from '../db';
import { HTTPException } from 'hono/http-exception';

// Recipe input interface
export interface RecipeInput {
  title: string;
  description?: string;
  cookingTime?: number;
  prepTime?: number;
  servingSize?: number;
  difficultyLevel?: string;
  imageUrl?: string;
  isPrivate?: boolean;
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
  // Create a new recipe
  async createRecipe(userId: number, input: RecipeInput) {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Insert the recipe
      const [recipe] = await tx.insert(schema.recipes).values({
        userId,
        title: input.title,
        description: input.description,
        cookingTime: input.cookingTime,
        prepTime: input.prepTime,
        servingSize: input.servingSize,
        difficultyLevel: input.difficultyLevel,
        imageUrl: input.imageUrl,
        isPrivate: input.isPrivate || false,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Insert ingredients
      if (input.ingredients && input.ingredients.length > 0) {
        await tx.insert(schema.ingredients).values(
          input.ingredients.map(ingredient => ({
            recipeId: recipe.id,
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            orderIndex: ingredient.orderIndex,
            notes: ingredient.notes
          }))
        );
      }

      // Insert instructions
      if (input.instructions && input.instructions.length > 0) {
        await tx.insert(schema.instructions).values(
          input.instructions.map(instruction => ({
            recipeId: recipe.id,
            stepNumber: instruction.stepNumber,
            description: instruction.description,
            imageUrl: instruction.imageUrl
          }))
        );
      }

      // Handle categories
      if (input.categories && input.categories.length > 0) {
        await tx.insert(schema.recipeCategories).values(
          input.categories.map(categoryId => ({
            recipeId: recipe.id,
            categoryId
          }))
        );
      }

      // Handle tags
      if (input.tags && input.tags.length > 0) {
        // For each tag, check if it exists, if not create it
        for (const tagName of input.tags) {
          // Check if tag exists
          let tag = await tx.query.tags.findFirst({
            where: eq(schema.tags.name, tagName)
          });

          // If tag doesn't exist, create it
          if (!tag) {
            const [newTag] = await tx.insert(schema.tags).values({
              name: tagName
            }).returning();
            tag = newTag;
          }

          // Add tag to recipe
          await tx.insert(schema.recipeTags).values({
            recipeId: recipe.id,
            tagId: tag.id
          });
        }
      }

      return recipe;
    });
  }

  // Get recipe by ID with all related data
  async getRecipeById(id: number, userId?: number) {
    const recipe = await db.query.recipes.findFirst({
      where: eq(schema.recipes.id, id),
      with: {
        ingredients: {
          orderBy: schema.ingredients.orderIndex
        },
        instructions: {
          orderBy: schema.instructions.stepNumber
        }
      }
    });

    if (!recipe) {
      throw new HTTPException(404, { message: 'Recipe not found' });
    }

    // If recipe is private and user is not the owner, throw error
    if (recipe.isPrivate && (!userId || recipe.userId !== userId)) {
      throw new HTTPException(403, { message: 'You do not have permission to view this recipe' });
    }

    // Get user info
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, recipe.userId),
      columns: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true
      }
    });

    // Get categories
    const recipeCategories = await db.query.recipeCategories.findMany({
      where: eq(schema.recipeCategories.recipeId, id),
      with: {
        category: true
      }
    });

    const categories = recipeCategories.map(rc => rc.category);

    // Get tags
    const recipeTags = await db.query.recipeTags.findMany({
      where: eq(schema.recipeTags.recipeId, id),
      with: {
        tag: true
      }
    });

    const tags = recipeTags.map(rt => rt.tag);

    // Get like count
    const likeCount = await db.select({ count: sql<number>`count(*)` })
      .from(schema.likes)
      .where(eq(schema.likes.recipeId, id));

    // Check if user has liked the recipe
    let isLiked = false;
    if (userId) {
      const like = await db.query.likes.findFirst({
        where: and(
          eq(schema.likes.recipeId, id),
          eq(schema.likes.userId, userId)
        )
      });
      isLiked = !!like;
    }

    // Get comment count
    const commentCount = await db.select({ count: sql<number>`count(*)` })
      .from(schema.comments)
      .where(eq(schema.comments.recipeId, id));

    return {
      ...recipe,
      user,
      categories,
      tags,
      likeCount: likeCount[0].count,
      commentCount: commentCount[0].count,
      isLiked
    };
  }

  // Update a recipe
  async updateRecipe(id: number, userId: number, input: Partial<RecipeInput>) {
    // Check if recipe exists and user is the owner
    const recipe = await db.query.recipes.findFirst({
      where: eq(schema.recipes.id, id)
    });

    if (!recipe) {
      throw new HTTPException(404, { message: 'Recipe not found' });
    }

    if (recipe.userId !== userId) {
      throw new HTTPException(403, { message: 'You do not have permission to update this recipe' });
    }

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Update the recipe
      const [updatedRecipe] = await tx.update(schema.recipes)
        .set({
          ...(input.title && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.cookingTime !== undefined && { cookingTime: input.cookingTime }),
          ...(input.prepTime !== undefined && { prepTime: input.prepTime }),
          ...(input.servingSize !== undefined && { servingSize: input.servingSize }),
          ...(input.difficultyLevel !== undefined && { difficultyLevel: input.difficultyLevel }),
          ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
          ...(input.isPrivate !== undefined && { isPrivate: input.isPrivate }),
          updatedAt: new Date()
        })
        .where(eq(schema.recipes.id, id))
        .returning();

      // Update ingredients if provided
      if (input.ingredients) {
        // Delete existing ingredients
        await tx.delete(schema.ingredients)
          .where(eq(schema.ingredients.recipeId, id));

        // Insert new ingredients
        if (input.ingredients.length > 0) {
          await tx.insert(schema.ingredients).values(
            input.ingredients.map(ingredient => ({
              recipeId: id,
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              orderIndex: ingredient.orderIndex,
              notes: ingredient.notes
            }))
          );
        }
      }

      // Update instructions if provided
      if (input.instructions) {
        // Delete existing instructions
        await tx.delete(schema.instructions)
          .where(eq(schema.instructions.recipeId, id));

        // Insert new instructions
        if (input.instructions.length > 0) {
          await tx.insert(schema.instructions).values(
            input.instructions.map(instruction => ({
              recipeId: id,
              stepNumber: instruction.stepNumber,
              description: instruction.description,
              imageUrl: instruction.imageUrl
            }))
          );
        }
      }

      // Update categories if provided
      if (input.categories) {
        // Delete existing categories
        await tx.delete(schema.recipeCategories)
          .where(eq(schema.recipeCategories.recipeId, id));

        // Insert new categories
        if (input.categories.length > 0) {
          await tx.insert(schema.recipeCategories).values(
            input.categories.map(categoryId => ({
              recipeId: id,
              categoryId
            }))
          );
        }
      }

      // Update tags if provided
      if (input.tags) {
        // Delete existing tags
        await tx.delete(schema.recipeTags)
          .where(eq(schema.recipeTags.recipeId, id));

        // Insert new tags
        if (input.tags.length > 0) {
          for (const tagName of input.tags) {
            // Check if tag exists
            let tag = await tx.query.tags.findFirst({
              where: eq(schema.tags.name, tagName)
            });

            // If tag doesn't exist, create it
            if (!tag) {
              const [newTag] = await tx.insert(schema.tags).values({
                name: tagName
              }).returning();
              tag = newTag;
            }

            // Add tag to recipe
            await tx.insert(schema.recipeTags).values({
              recipeId: id,
              tagId: tag.id
            });
          }
        }
      }

      return updatedRecipe;
    });
  }

  // Delete a recipe
  async deleteRecipe(id: number, userId: number) {
    // Check if recipe exists and user is the owner
    const recipe = await db.query.recipes.findFirst({
      where: eq(schema.recipes.id, id)
    });

    if (!recipe) {
      throw new HTTPException(404, { message: 'Recipe not found' });
    }

    if (recipe.userId !== userId) {
      throw new HTTPException(403, { message: 'You do not have permission to delete this recipe' });
    }

    // Delete the recipe (cascade will handle related records)
    await db.delete(schema.recipes)
      .where(eq(schema.recipes.id, id));

    return { success: true };
  }

  // Search recipes
  async searchRecipes(params: RecipeSearchParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    // Build the where clause
    let whereClause = sql`1 = 1`;

    if (params.search) {
      whereClause = sql`${whereClause} AND ${schema.recipes.title} ILIKE ${`%${params.search}%`}`;
    }

    if (params.userId) {
      whereClause = sql`${whereClause} AND ${schema.recipes.userId} = ${params.userId}`;
    }

    if (params.difficulty) {
      whereClause = sql`${whereClause} AND ${schema.recipes.difficultyLevel} = ${params.difficulty}`;
    }

    // Get total count
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.recipes)
      .where(whereClause);

    // Get recipes
    const recipes = await db.select()
      .from(schema.recipes)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(schema.recipes.createdAt));

    // Get user info for each recipe
    const recipeIds = recipes.map(recipe => recipe.id);
    const users = await db.select({
      id: schema.users.id,
      username: schema.users.username,
      displayName: schema.users.displayName,
      avatarUrl: schema.users.avatarUrl
    })
      .from(schema.users)
      .where(inArray(schema.users.id, recipes.map(r => r.userId)));

    // Create a map of user IDs to user objects
    const userMap = new Map(users.map(user => [user.id, user]));

    // Add user info to each recipe
    const recipesWithUsers = recipes.map(recipe => ({
      ...recipe,
      user: userMap.get(recipe.userId)
    }));

    return {
      recipes: recipesWithUsers,
      pagination: {
        total: Number(count),
        page,
        limit,
        pages: Math.ceil(Number(count) / limit)
      }
    };
  }

  // Like a recipe
  async likeRecipe(recipeId: number, userId: number) {
    // Check if recipe exists
    const recipe = await db.query.recipes.findFirst({
      where: eq(schema.recipes.id, recipeId)
    });

    if (!recipe) {
      throw new HTTPException(404, { message: 'Recipe not found' });
    }

    // Check if already liked
    const existingLike = await db.query.likes.findFirst({
      where: and(
        eq(schema.likes.recipeId, recipeId),
        eq(schema.likes.userId, userId)
      )
    });

    if (existingLike) {
      return { success: true, message: 'Recipe already liked' };
    }

    // Add like
    await db.insert(schema.likes).values({
      recipeId,
      userId,
      createdAt: new Date()
    });

    return { success: true, message: 'Recipe liked successfully' };
  }

  // Unlike a recipe
  async unlikeRecipe(recipeId: number, userId: number) {
    // Check if recipe exists
    const recipe = await db.query.recipes.findFirst({
      where: eq(schema.recipes.id, recipeId)
    });

    if (!recipe) {
      throw new HTTPException(404, { message: 'Recipe not found' });
    }

    // Delete like
    await db.delete(schema.likes)
      .where(and(
        eq(schema.likes.recipeId, recipeId),
        eq(schema.likes.userId, userId)
      ));

    return { success: true, message: 'Recipe unliked successfully' };
  }

  // Add a comment to a recipe
  async addComment(recipeId: number, userId: number, content: string) {
    // Check if recipe exists
    const recipe = await db.query.recipes.findFirst({
      where: eq(schema.recipes.id, recipeId)
    });

    if (!recipe) {
      throw new HTTPException(404, { message: 'Recipe not found' });
    }

    // Add comment
    const [comment] = await db.insert(schema.comments).values({
      recipeId,
      userId,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Get user info
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true
      }
    });

    return {
      ...comment,
      user
    };
  }

  // Get comments for a recipe
  async getComments(recipeId: number, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // Check if recipe exists
    const recipe = await db.query.recipes.findFirst({
      where: eq(schema.recipes.id, recipeId)
    });

    if (!recipe) {
      throw new HTTPException(404, { message: 'Recipe not found' });
    }

    // Get total count
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.comments)
      .where(eq(schema.comments.recipeId, recipeId));

    // Get comments
    const comments = await db.select()
      .from(schema.comments)
      .where(eq(schema.comments.recipeId, recipeId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(schema.comments.createdAt));

    // Get user info for each comment
    const userIds = comments.map(comment => comment.userId);
    const users = await db.select({
      id: schema.users.id,
      username: schema.users.username,
      displayName: schema.users.displayName,
      avatarUrl: schema.users.avatarUrl
    })
      .from(schema.users)
      .where(inArray(schema.users.id, userIds));

    // Create a map of user IDs to user objects
    const userMap = new Map(users.map(user => [user.id, user]));

    // Add user info to each comment
    const commentsWithUsers = comments.map(comment => ({
      ...comment,
      user: userMap.get(comment.userId)
    }));

    return {
      comments: commentsWithUsers,
      pagination: {
        total: Number(count),
        page,
        limit,
        pages: Math.ceil(Number(count) / limit)
      }
    };
  }
}
