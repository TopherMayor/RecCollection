import { Hono } from "hono";
import { SharingController } from "../controllers/sharing.controller";
import { authenticate } from "../middleware/auth";

// Create a new router
const router = new Hono();

// Create an instance of the sharing controller
const sharingController = new SharingController();

// Share recipe (requires authentication)
router.post("/recipes/:recipeId", authenticate, (c) => sharingController.shareRecipe(c));

// Get shared recipe by token (public)
router.get("/shared/:token", (c) => sharingController.getSharedRecipeByToken(c));

// Get user's shared recipes (requires authentication)
router.get("/my-shares", authenticate, (c) => sharingController.getUserSharedRecipes(c));

// Delete shared recipe (requires authentication)
router.delete("/:id", authenticate, (c) => sharingController.deleteSharedRecipe(c));

// Generate deep link for recipe import (public)
router.post("/deep-link/import", (c) => sharingController.generateImportDeepLink(c));

// Get pending import by token (public)
router.get("/import/:token", (c) => sharingController.getPendingImport(c));

// Delete pending import (public)
router.delete("/import/:token", (c) => sharingController.deletePendingImport(c));

export { router as sharingRoutes };
