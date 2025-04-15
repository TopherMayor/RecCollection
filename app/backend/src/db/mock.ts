// Mock database for testing
import {
  recipes as recipesSchema,
  users as usersSchema,
  categories as categoriesSchema,
  tags as tagsSchema,
} from "./schema";

// Define types based on schema
export type User = {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
};

export type Recipe = {
  id: number;
  title: string;
  description?: string;
  user_id: number;
  prep_time?: number;
  cooking_time?: number;
  serving_size?: number;
  difficulty_level?: string;
  ingredients: string; // JSON string
  instructions: string; // JSON string
  image_url?: string;
  created_at: Date;
  updated_at: Date;
};

export type Category = {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
};

export type Tag = {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
};

// Mock users
export const users: User[] = [
  {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    password_hash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456789",
    display_name: "Test User",
    bio: "This is a test user",
    avatar_url: "https://example.com/avatar.jpg",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    username: "admin",
    email: "admin@example.com",
    password_hash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456789",
    display_name: "Admin User",
    bio: "This is an admin user",
    avatar_url: "https://example.com/admin-avatar.jpg",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Mock categories
export const categories: Category[] = [
  {
    id: 1,
    name: "Breakfast",
    description: "Morning meals",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    name: "Lunch",
    description: "Midday meals",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 3,
    name: "Dinner",
    description: "Evening meals",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 4,
    name: "Dessert",
    description: "Sweet treats",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Mock tags
export const tags: Tag[] = [
  {
    id: 1,
    name: "vegetarian",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    name: "vegan",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 3,
    name: "gluten-free",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 4,
    name: "quick",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 5,
    name: "easy",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Mock recipes
export const recipes: Recipe[] = [
  {
    id: 1,
    title: "Pancakes",
    description: "Fluffy breakfast pancakes",
    user_id: 1,
    prep_time: 10,
    cooking_time: 15,
    serving_size: 4,
    difficulty_level: "easy",
    ingredients: JSON.stringify([
      { name: "Flour", quantity: 2, unit: "cups" },
      { name: "Milk", quantity: 1, unit: "cup" },
      { name: "Eggs", quantity: 2, unit: "" },
      { name: "Baking powder", quantity: 1, unit: "tbsp" },
      { name: "Sugar", quantity: 2, unit: "tbsp" },
      { name: "Salt", quantity: 0.5, unit: "tsp" },
    ]),
    instructions: JSON.stringify([
      { step_number: 1, description: "Mix dry ingredients" },
      {
        step_number: 2,
        description: "Add wet ingredients and mix until smooth",
      },
      { step_number: 3, description: "Heat a pan and pour batter" },
      { step_number: 4, description: "Flip when bubbles form on top" },
      { step_number: 5, description: "Cook until golden brown" },
    ]),
    image_url: "https://example.com/pancakes.jpg",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    title: "Pasta Carbonara",
    description: "Classic Italian pasta dish",
    user_id: 2,
    prep_time: 15,
    cooking_time: 20,
    serving_size: 2,
    difficulty_level: "medium",
    ingredients: JSON.stringify([
      { name: "Spaghetti", quantity: 200, unit: "g" },
      { name: "Eggs", quantity: 2, unit: "" },
      { name: "Parmesan cheese", quantity: 50, unit: "g" },
      { name: "Pancetta", quantity: 100, unit: "g" },
      { name: "Black pepper", quantity: 1, unit: "tsp" },
      { name: "Salt", quantity: 1, unit: "tsp" },
    ]),
    instructions: JSON.stringify([
      { step_number: 1, description: "Cook pasta in salted water" },
      { step_number: 2, description: "Fry pancetta until crispy" },
      { step_number: 3, description: "Beat eggs with cheese and pepper" },
      { step_number: 4, description: "Drain pasta and mix with pancetta" },
      { step_number: 5, description: "Add egg mixture and stir quickly" },
    ]),
    image_url: "https://example.com/carbonara.jpg",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Recipe categories
export const recipe_categories = [
  { recipe_id: 1, category_id: 1 },
  { recipe_id: 2, category_id: 3 },
];

// Recipe tags
export const recipe_tags = [
  { recipe_id: 1, tag_id: 4 },
  { recipe_id: 1, tag_id: 5 },
  { recipe_id: 2, tag_id: 5 },
];

// User saved recipes
export const user_saved_recipes = [
  { user_id: 1, recipe_id: 2 },
  { user_id: 2, recipe_id: 1 },
];

// Recipe likes
export const recipe_likes = [
  { user_id: 1, recipe_id: 2 },
  { user_id: 2, recipe_id: 1 },
];

// Mock database queries
export const mockDb = {
  // User queries
  getUsers: () => users,
  getUserById: (id: number) => users.find((user) => user.id === id),
  getUserByEmail: (email: string) => users.find((user) => user.email === email),
  getUserByUsername: (username: string) =>
    users.find((user) => user.username === username),

  // Recipe queries
  getRecipes: () => recipes,
  getRecipeById: (id: number) => recipes.find((recipe) => recipe.id === id),
  getRecipesByUserId: (userId: number) =>
    recipes.filter((recipe) => recipe.user_id === userId),

  // Category queries
  getCategories: () => categories,
  getCategoryById: (id: number) =>
    categories.find((category) => category.id === id),
  getRecipeCategories: (recipeId: number) =>
    recipe_categories
      .filter((rc) => rc.recipe_id === recipeId)
      .map((rc) => categories.find((c) => c.id === rc.category_id)),

  // Tag queries
  getTags: () => tags,
  getTagById: (id: number) => tags.find((tag) => tag.id === id),
  getRecipeTags: (recipeId: number) =>
    recipe_tags
      .filter((rt) => rt.recipe_id === recipeId)
      .map((rt) => tags.find((t) => t.id === rt.tag_id)),

  // Saved recipes
  getUserSavedRecipes: (userId: number) =>
    user_saved_recipes
      .filter((usr) => usr.user_id === userId)
      .map((usr) => recipes.find((r) => r.id === usr.recipe_id)),

  // Recipe likes
  getRecipeLikes: (recipeId: number) =>
    recipe_likes.filter((rl) => rl.recipe_id === recipeId).length,

  // Search
  searchRecipes: (query: string) =>
    recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        recipe.description.toLowerCase().includes(query.toLowerCase())
    ),
};

export default mockDb;
