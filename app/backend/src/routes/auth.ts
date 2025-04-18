import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller.ts";
import { authenticate } from "../middleware/auth.ts";
import { validate } from "../middleware/validation.ts";
import { RegisterInput, LoginInput } from "../services/user.service.ts";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../utils/validation.ts";

// Create a new router
const router = new Hono();

// Create an instance of the auth controller
const authController = new AuthController();

// Register a new user
router.post("/register", validate(registerSchema), (c) => {
  const data = c.get("validated") as RegisterInput;
  return authController.register(c, data);
});

// Login a user
router.post("/login", validate(loginSchema), (c) => {
  const data = c.get("validated") as LoginInput;
  return authController.login(c, data);
});

// Get current user (requires authentication)
router.get("/me", authenticate, (c) => authController.me(c));

// Get user profile by username (public)
router.get("/profile/:username", (c) => authController.getUserByUsername(c));

// Update user profile (requires authentication)
router.put("/profile", authenticate, validate(updateProfileSchema), (c) => {
  const data = c.get("validated") as Partial<{
    displayName: string;
    bio: string;
    avatarUrl: string;
  }>;
  return authController.updateProfile(c, data);
});

export { router as authRoutes };
