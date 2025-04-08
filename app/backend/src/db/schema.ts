import { pgTable, serial, varchar, text, timestamp, integer, boolean, decimal, primaryKey } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLogin: timestamp('last_login')
});

// Recipes table
export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  cookingTime: integer('cooking_time'), // in minutes
  prepTime: integer('prep_time'), // in minutes
  servingSize: integer('serving_size'),
  difficultyLevel: varchar('difficulty_level', { length: 20 }), // easy, medium, hard
  imageUrl: varchar('image_url', { length: 255 }),
  sourceUrl: varchar('source_url', { length: 255 }), // for imported recipes
  sourceType: varchar('source_type', { length: 50 }), // instagram, tiktok, manual
  isPrivate: boolean('is_private').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Ingredients table
export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  quantity: decimal('quantity'),
  unit: varchar('unit', { length: 30 }),
  orderIndex: integer('order_index').notNull(),
  notes: text('notes')
});

// Instructions table
export const instructions = pgTable('instructions', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  description: text('description').notNull(),
  imageUrl: varchar('image_url', { length: 255 })
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description')
});

// Recipe-Categories junction table
export const recipeCategories = pgTable('recipe_categories', {
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.recipeId, table.categoryId] })
  };
});

// Tags table
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 30 }).notNull().unique()
});

// Recipe-Tags junction table
export const recipeTags = pgTable('recipe_tags', {
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.recipeId, table.tagId] })
  };
});

// Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Likes table
export const likes = pgTable('likes', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.recipeId] })
  };
});

// Saved Recipes table
export const savedRecipes = pgTable('saved_recipes', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.recipeId] })
  };
});

// Follows table
export const follows = pgTable('follows', {
  followerId: integer('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: integer('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.followerId, table.followingId] })
  };
});

// AI Generations table
export const aiGenerations = pgTable('ai_generations', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').references(() => recipes.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  generationType: varchar('generation_type', { length: 50 }).notNull(), // name, description, etc.
  inputData: text('input_data'), // JSON data stored as text
  outputContent: text('output_content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});
