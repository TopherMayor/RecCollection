import { relations } from "drizzle-orm";
import {
  users,
  recipes,
  ingredients,
  instructions,
  categories,
  recipeCategories,
  tags,
  recipeTags,
  comments,
  likes,
  savedRecipes,
  follows,
  aiGenerations,
  notifications,
  notificationPreferences,
  userContacts,
  sharedRecipes,
} from "./schema";

// Define relations for users
export const usersRelations = relations(users, ({ many, one }) => ({
  recipes: many(recipes),
  comments: many(comments),
  likes: many(likes),
  savedRecipes: many(savedRecipes),
  followers: many(follows, { relationName: "followers" }),
  following: many(follows, { relationName: "following" }),
  aiGenerations: many(aiGenerations),
  receivedNotifications: many(notifications, { relationName: "receivedNotifications" }),
  sentNotifications: many(notifications, { relationName: "sentNotifications" }),
  notificationPreferences: one(notificationPreferences),
  userContacts: one(userContacts),
  sharedRecipes: many(sharedRecipes),
}));

// Define relations for recipes
export const recipesRelations = relations(recipes, ({ many, one }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
  ingredients: many(ingredients),
  instructions: many(instructions),
  recipeCategories: many(recipeCategories),
  recipeTags: many(recipeTags),
  comments: many(comments),
  likes: many(likes),
  savedBy: many(savedRecipes),
  aiGenerations: many(aiGenerations),
  notifications: many(notifications),
  sharedRecipes: many(sharedRecipes),
}));

// Define relations for ingredients
export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [ingredients.recipeId],
    references: [recipes.id],
  }),
}));

// Define relations for instructions
export const instructionsRelations = relations(instructions, ({ one }) => ({
  recipe: one(recipes, {
    fields: [instructions.recipeId],
    references: [recipes.id],
  }),
}));

// Define relations for categories
export const categoriesRelations = relations(categories, ({ many }) => ({
  recipeCategories: many(recipeCategories),
}));

// Define relations for recipeCategories
export const recipeCategoriesRelations = relations(recipeCategories, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeCategories.recipeId],
    references: [recipes.id],
  }),
  category: one(categories, {
    fields: [recipeCategories.categoryId],
    references: [categories.id],
  }),
}));

// Define relations for tags
export const tagsRelations = relations(tags, ({ many }) => ({
  recipeTags: many(recipeTags),
}));

// Define relations for recipeTags
export const recipeTagsRelations = relations(recipeTags, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeTags.recipeId],
    references: [recipes.id],
  }),
  tag: one(tags, {
    fields: [recipeTags.tagId],
    references: [tags.id],
  }),
}));

// Define relations for comments
export const commentsRelations = relations(comments, ({ one }) => ({
  recipe: one(recipes, {
    fields: [comments.recipeId],
    references: [recipes.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// Define relations for likes
export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [likes.recipeId],
    references: [recipes.id],
  }),
}));

// Define relations for savedRecipes
export const savedRecipesRelations = relations(savedRecipes, ({ one }) => ({
  user: one(users, {
    fields: [savedRecipes.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [savedRecipes.recipeId],
    references: [recipes.id],
  }),
}));

// Define relations for follows
export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "followers",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

// Define relations for aiGenerations
export const aiGenerationsRelations = relations(aiGenerations, ({ one }) => ({
  user: one(users, {
    fields: [aiGenerations.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [aiGenerations.recipeId],
    references: [recipes.id],
  }),
}));

// Define relations for notifications
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "receivedNotifications",
  }),
  sender: one(users, {
    fields: [notifications.senderId],
    references: [users.id],
    relationName: "sentNotifications",
  }),
  recipe: one(recipes, {
    fields: [notifications.recipeId],
    references: [recipes.id],
  }),
}));

// Define relations for notificationPreferences
export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

// Define relations for userContacts
export const userContactsRelations = relations(userContacts, ({ one }) => ({
  user: one(users, {
    fields: [userContacts.userId],
    references: [users.id],
  }),
}));

// Define relations for sharedRecipes
export const sharedRecipesRelations = relations(sharedRecipes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [sharedRecipes.recipeId],
    references: [recipes.id],
  }),
  sharedByUser: one(users, {
    fields: [sharedRecipes.sharedBy],
    references: [users.id],
  }),
}));
