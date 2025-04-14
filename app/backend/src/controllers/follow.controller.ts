import type { Context } from "hono";
import { UserService } from "../services/user.service";
import { HTTPException } from "hono/http-exception";
import { JWTPayload } from "../types";

// Create an instance of the user service
const userService = new UserService();

export class FollowController {
  // Follow a user
  async followUser(c: Context) {
    try {
      const currentUser = c.get("user") as JWTPayload;
      const { username } = c.req.param();

      if (!username) {
        throw new HTTPException(400, { message: "Username is required" });
      }

      // Get the user to follow
      const userToFollow = await userService.getUserByUsername(username);

      if (!userToFollow) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Check if trying to follow self
      if (currentUser.id === userToFollow.id) {
        throw new HTTPException(400, { message: "You cannot follow yourself" });
      }

      // Follow the user
      await userService.followUser(currentUser.id, userToFollow.id);

      return c.json({
        success: true,
        message: `You are now following ${username}`,
      });
    } catch (error) {
      console.error("Error following user:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while following the user",
      });
    }
  }

  // Unfollow a user
  async unfollowUser(c: Context) {
    try {
      const currentUser = c.get("user") as JWTPayload;
      const { username } = c.req.param();

      if (!username) {
        throw new HTTPException(400, { message: "Username is required" });
      }

      // Get the user to unfollow
      const userToUnfollow = await userService.getUserByUsername(username);

      if (!userToUnfollow) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Unfollow the user
      await userService.unfollowUser(currentUser.id, userToUnfollow.id);

      return c.json({
        success: true,
        message: `You have unfollowed ${username}`,
      });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while unfollowing the user",
      });
    }
  }

  // Check if the current user is following another user
  async isFollowing(c: Context) {
    try {
      const currentUser = c.get("user") as JWTPayload;
      const { username } = c.req.param();

      if (!username) {
        throw new HTTPException(400, { message: "Username is required" });
      }

      // Get the user to check
      const userToCheck = await userService.getUserByUsername(username);

      if (!userToCheck) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Check if following
      const result = await userService.isFollowing(currentUser.id, userToCheck.id);

      return c.json({
        success: true,
        isFollowing: result.isFollowing,
      });
    } catch (error) {
      console.error("Error checking follow status:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while checking follow status",
      });
    }
  }

  // Get user's followers
  async getUserFollowers(c: Context) {
    try {
      const { username } = c.req.param();
      const { page, limit } = c.req.query();

      if (!username) {
        throw new HTTPException(400, { message: "Username is required" });
      }

      // Get the user
      const user = await userService.getUserByUsername(username);

      if (!user) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Get followers
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      const result = await userService.getUserFollowers(user.id, pageNum, limitNum);

      return c.json({
        success: true,
        followers: result.followers,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error getting user followers:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while getting user followers",
      });
    }
  }

  // Get users that a user is following
  async getUserFollowing(c: Context) {
    try {
      const { username } = c.req.param();
      const { page, limit } = c.req.query();

      if (!username) {
        throw new HTTPException(400, { message: "Username is required" });
      }

      // Get the user
      const user = await userService.getUserByUsername(username);

      if (!user) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Get following
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      const result = await userService.getUserFollowing(user.id, pageNum, limitNum);

      return c.json({
        success: true,
        following: result.following,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error getting user following:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while getting user following",
      });
    }
  }
}
