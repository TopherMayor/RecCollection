import { db } from "../db";
import { collections, recipeCollections } from "../db/schema";
import { and, eq, sql } from "drizzle-orm";
import type {
  Collection,
  NewCollection,
  RecipeCollection,
  NewRecipeCollection,
} from "../db/schema";

export async function createCollection(collectionData: NewCollection) {
  const [collection] = await db
    .insert(collections)
    .values(collectionData)
    .returning();
  return collection;
}

export async function getCollectionById(id: number) {
  const [collection] = await db
    .select()
    .from(collections)
    .where(eq(collections.id, id));
  return collection;
}

export async function getUserCollections(userId: number) {
  try {
    // Just return an empty array for now until we fix the collections table
    return [];
  } catch (error) {
    console.error("Error in getUserCollections:", error);
    return [];
  }
}

export async function updateCollection(
  id: number,
  collectionData: Partial<Collection>
) {
  const [collection] = await db
    .update(collections)
    .set(collectionData)
    .where(eq(collections.id, id))
    .returning();
  return collection;
}

export async function deleteCollection(id: number) {
  await db.delete(collections).where(eq(collections.id, id));
}

export async function addRecipeToCollection(
  recipeId: number,
  collectionId: number
) {
  const [recipeCollection] = await db
    .insert(recipeCollections)
    .values({ recipeId, collectionId })
    .returning();
  return recipeCollection;
}

export async function removeRecipeFromCollection(
  recipeId: number,
  collectionId: number
) {
  await db
    .delete(recipeCollections)
    .where(
      and(
        eq(recipeCollections.recipeId, recipeId),
        eq(recipeCollections.collectionId, collectionId)
      )
    );
}

export async function getCollectionRecipes(collectionId: number) {
  return await db
    .select()
    .from(recipeCollections)
    .where(eq(recipeCollections.collectionId, collectionId));
}
