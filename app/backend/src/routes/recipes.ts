import { Hono } from "hono";
import { RecipeController } from "../controllers/recipe.controller.ts";
import { authenticate, optionalAuthenticate } from "../middleware/auth.ts";
import { validate, validateQuery } from "../middleware/validation.ts";
import {
  recipeSchema,
  recipeUpdateSchema,
  commentSchema,
  searchParamsSchema,
} from "../utils/validation.ts";

// Create a new router
const router = new Hono();

// Create an instance of the recipe controller
const recipeController = new RecipeController();

// Get all recipes (with optional authentication)
router.get(
  "/",
  optionalAuthenticate,
  validateQuery(searchParamsSchema),
  (c) => {
    const params = c.get("validatedQuery");
    return recipeController.searchRecipes(c, params);
  }
);

// Get recipes from followed users (requires authentication)
router.get(
  "/following",
  authenticate,
  validateQuery(searchParamsSchema),
  (c) => {
    const params = c.get("validatedQuery");
    return recipeController.getFollowingRecipes(c, params);
  }
);

// Create a new recipe (requires authentication)
router.post("/", authenticate, validate(recipeSchema), (c) => {
  const validatedRecipeData = c.get("validated");
  return recipeController.createRecipe(c, validatedRecipeData);
});

// Get a recipe by ID (with optional authentication)
router.get("/:id", optionalAuthenticate, (c) => recipeController.getRecipe(c));

// Update a recipe (requires authentication)
router.put("/:id", authenticate, validate(recipeUpdateSchema), (c) => {
  const validatedUpdateData = c.get("validated");
  return recipeController.updateRecipe(c, validatedUpdateData);
});

// Delete a recipe (requires authentication)
router.delete("/:id", authenticate, (c) => recipeController.deleteRecipe(c));

// Delete multiple recipes (requires authentication)
router.post("/batch-delete", authenticate, (c) => {
  return c.req
    .json()
    .then((data) => recipeController.deleteMultipleRecipes(c, data));
});

// Like a recipe (requires authentication)
router.post("/:id/like", authenticate, (c) => recipeController.likeRecipe(c));

// Unlike a recipe (requires authentication)
router.delete("/:id/like", authenticate, (c) =>
  recipeController.unlikeRecipe(c)
);

// Add a comment to a recipe (requires authentication)
router.post("/:id/comments", authenticate, validate(commentSchema), (c) => {
  const validatedCommentData = c.get("validated");
  return recipeController.addComment(c, validatedCommentData);
});

// Get comments for a recipe
router.get("/:id/comments", (c) => recipeController.getComments(c));

export { router as recipeRoutes };
