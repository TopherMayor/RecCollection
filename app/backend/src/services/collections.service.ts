import { db } from "../db/index.ts";
import { collections, recipeCollections } from "../db/schema.ts";
import { and, eq, sql } from "drizzle-orm";
import type {
  Collection,
  NewCollection,
  RecipeCollection,
  NewRecipeCollection,
} from "../db/schema.ts";

/**
 * Creates a new collection
 * @param {Omit<NewCollection, "userId"> & { userId: string }} collectionData - Collection data with user ID (must be numeric string)
 * @returns {Promise<Collection>} The created collection
 * @throws {Error} If userId is not a valid numeric string
 */
export async function createCollection(
  collectionData: Omit<NewCollection, "userId"> & { userId: string }
) {
  const userIdNum = Number(collectionData.userId);
  if (isNaN(userIdNum)) {
    throw new Error("Invalid user id - must be a numeric string");
  }

  const [collection] = await db
    .insert(collections)
    .values({ ...collectionData, userId: userIdNum })
    .returning();
  return collection;
}

/**
 * Gets a collection by its ID
 * @param {string} id - Collection ID
 * @returns {Promise<Collection | undefined>} The collection or undefined if not found
 */
export async function getCollectionById(id: string) {
  const idNum = Number(id);
  if (isNaN(idNum)) {
    throw new Error("Invalid collection id - must be a numeric string");
  }
  const [collection] = await db
    .select()
    .from(collections)
    .where(eq(collections.id, idNum));
  return collection;
}

/**
 * Gets all collections for a user
 * @param {string} userId - User ID
 * @returns {Promise<Collection[]>} Array of user's collections
 */
export async function getUserCollections(userId: string) {
  const userIdNum = Number(userId);
  if (isNaN(userIdNum)) {
    throw new Error("Invalid user id - must be a numeric string");
  }
  try {
    const userCollections = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userIdNum));
    console.log(
      `Found ${userCollections.length} collections for user ${userId}`
    );
    return userCollections;
  } catch (error) {
    console.error("Error in getUserCollections:", error);
    return [];
  }
}

/**
 * Updates a collection
 * @param {string} id - Collection ID to update
 * @param {Partial<Collection>} collectionData - Collection data to update
 * @returns {Promise<Collection>} The updated collection
 */
export async function updateCollection(
  id: string,
  collectionData: Partial<Collection>
) {
  const idNum = Number(id);
  if (isNaN(idNum)) {
    throw new Error("Invalid collection id - must be a numeric string");
  }
  const [collection] = await db
    .update(collections)
    .set(collectionData)
    .where(eq(collections.id, idNum))
    .returning();
  return collection;
}

/**
 * Deletes a collection
 * @param {string} id - Collection ID to delete
 * @returns {Promise<void>}
 */
export async function deleteCollection(id: string) {
  const idNum = Number(id);
  if (isNaN(idNum)) {
    throw new Error("Invalid collection id - must be a numeric string");
  }
  await db.delete(collections).where(eq(collections.id, idNum));
}

/**
 * Adds a recipe to a collection
 * @param {string} recipeId - Recipe ID to add
 * @param {string} collectionId - Collection ID to add to
 * @returns {Promise<RecipeCollection>} The created recipe-collection relationship
 */
export async function addRecipeToCollection(
  recipeId: string,
  collectionId: string
) {
  const recipeIdNum = Number(recipeId);
  const collectionIdNum = Number(collectionId);
  if (isNaN(recipeIdNum) || isNaN(collectionIdNum)) {
    throw new Error(
      "Invalid recipe or collection id - must be numeric strings"
    );
  }
  const [recipeCollection] = await db
    .insert(recipeCollections)
    .values({ recipeId: recipeIdNum, collectionId: collectionIdNum })
    .returning();
  return recipeCollection;
}

/**
 * Removes a recipe from a collection
 * @param {string} recipeId - Recipe ID to remove
 * @param {string} collectionId - Collection ID to remove from
 * @returns {Promise<void>}
 */
export async function removeRecipeFromCollection(
  recipeId: string,
  collectionId: string
) {
  const recipeIdNum = Number(recipeId);
  const collectionIdNum = Number(collectionId);
  if (isNaN(recipeIdNum) || isNaN(collectionIdNum)) {
    throw new Error(
      "Invalid recipe or collection id - must be numeric strings"
    );
  }
  await db
    .delete(recipeCollections)
    .where(
      and(
        eq(recipeCollections.recipeId, recipeIdNum),
        eq(recipeCollections.collectionId, collectionIdNum)
      )
    );
}

/**
 * Gets all recipes in a collection
 * @param {string} collectionId - Collection ID
 * @returns {Promise<RecipeCollection[]>} Array of recipe-collection relationships
 */
export async function getCollectionRecipes(collectionId: string) {
  const collectionIdNum = Number(collectionId);
  if (isNaN(collectionIdNum)) {
    throw new Error("Invalid collection id - must be a numeric string");
  }
  return await db
    .select()
    .from(recipeCollections)
    .where(eq(recipeCollections.collectionId, collectionIdNum));
}
