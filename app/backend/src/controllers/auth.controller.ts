import type { Context } from "hono";
import { UserService } from "../services/user.service.ts";
import { HTTPException } from "hono/http-exception";
import type { JWTPayload } from "../middleware/auth.ts";
import type { RegisterInput, LoginInput } from "../services/user.service.ts";

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
      console.log("Login attempt for email:", data.email);

      // Check if JWT_SECRET is set
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
        console.error("JWT_SECRET is not set or is empty");
        return c.json(
          {
            success: false,
            message: "Server configuration error",
          },
          500
        );
      }

      // Login the user
      const result = await userService.login(data);
      console.log("Login successful for user:", result.user.username);

      return c.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof HTTPException) {
        // Ensure we return a proper JSON response
        return c.json(
          {
            success: false,
            message: error.message || "Authentication failed",
            status: error.status,
          },
          error.status
        );
      }

      // For any other errors, return a generic error message
      return c.json(
        {
          success: false,
          message: "An error occurred during login",
          status: 500,
        },
        500
      );
    }
  }

  // Get current user
  async me(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;

      // Get user details
      const userDetails = await userService.getUserById(Number(user.id));
      console.log("User details fetched successfully:", user.id);

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

  // Get user by username
  async getUserByUsername(c: Context) {
    try {
      const username = c.req.param("username");
      console.log(`Fetching profile for username: ${username}`);

      // Get user details
      try {
        const userDetails = await userService.getUserByUsername(username);
        console.log("User details fetched successfully:", userDetails);
        return c.json(userDetails);
      } catch (serviceError) {
        console.error("Error in userService.getUserByUsername:", serviceError);
        throw serviceError;
      }
    } catch (error) {
      console.error("Error in getUserByUsername controller:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while fetching user profile",
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
      const updatedUser = await userService.updateProfile(
        Number(user.id),
        data
      );

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
