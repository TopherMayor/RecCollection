import type { Context } from "hono";
import { UserService } from "../services/user.service";
import { HTTPException } from "hono/http-exception";
import type { JWTPayload } from "../middleware/auth";
import type { RegisterInput, LoginInput } from "../services/user.service";

// Create an instance of the user service
const userService = new UserService();

export class AuthController {
  // Register a new user
  async register(c: Context, data: RegisterInput) {
    try {
      // Register the user
      const result = await userService.register(data);

      return c.json(
        {
          success: true,
          user: result.user,
          token: result.token,
        },
        201
      );
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred during registration",
      });
    }
  }

  // Login a user
  async login(c: Context, data: LoginInput) {
    try {
      // Login the user
      const result = await userService.login(data);

      return c.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred during login",
      });
    }
  }

  // Get current user
  async me(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;

      // Get user details
      const userDetails = await userService.getUserById(user.id);

      return c.json(userDetails);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while fetching user details",
      });
    }
  }

  // Update user profile
  async updateProfile(
    c: Context,
    data: Partial<{ displayName: string; bio: string; avatarUrl: string }>
  ) {
    try {
      const user = c.get("user") as JWTPayload;

      // Update the profile
      const updatedUser = await userService.updateProfile(user.id, data);

      return c.json(updatedUser);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while updating profile",
      });
    }
  }
}
