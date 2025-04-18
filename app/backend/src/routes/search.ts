import { Hono } from "hono";
import { SearchController } from "../controllers/search.controller.ts";
import { optionalAuthenticate } from "../middleware/auth.ts";
import { validateQuery } from "../middleware/validation.ts";
import { z } from "zod";

// Create a new router
const router = new Hono();

// Create an instance of the search controller
const searchController = new SearchController();

// Search query validation schema
const searchQuerySchema = z.object({
  q: z.string().optional(),
  type: z.enum(["users", "recipes"]).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

// Combined search endpoint (with optional authentication)
router.get("/", optionalAuthenticate, validateQuery(searchQuerySchema), (c) => {
  return searchController.search(c);
});

// Search users endpoint (with optional authentication)
router.get(
  "/users",
  optionalAuthenticate,
  validateQuery(searchQuerySchema),
  (c) => {
    const params = c.get("validatedQuery");
    return searchController.searchUsers(c, {
      search: params.q,
      page: params.page ? parseInt(params.page) : undefined,
      limit: params.limit ? parseInt(params.limit) : undefined,
    });
  }
);

// Search recipes endpoint (with optional authentication)
router.get(
  "/recipes",
  optionalAuthenticate,
  validateQuery(searchQuerySchema),
  (c) => {
    const params = c.get("validatedQuery");
    return searchController.searchRecipes(c, {
      search: params.q,
      page: params.page ? parseInt(params.page) : undefined,
      limit: params.limit ? parseInt(params.limit) : undefined,
    });
  }
);

export { router as searchRoutes };
