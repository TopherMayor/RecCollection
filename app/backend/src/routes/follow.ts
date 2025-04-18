import { Hono } from "hono";
import { FollowController } from "../controllers/follow.controller.ts";
import { authenticate } from "../middleware/auth.ts";

// Create a new router
const router = new Hono();

// Create an instance of the follow controller
const followController = new FollowController();

// Follow a user (requires authentication)
router.post("/:username", authenticate, (c) => followController.followUser(c));

// Unfollow a user (requires authentication)
router.delete("/:username", authenticate, (c) =>
  followController.unfollowUser(c)
);

// Check if the current user is following another user (requires authentication)
router.get("/:username/is-following", authenticate, (c) =>
  followController.isFollowing(c)
);

// Get user's followers
router.get("/:username/followers", (c) => followController.getUserFollowers(c));

// Get users that a user is following
router.get("/:username/following", (c) => followController.getUserFollowing(c));

export { router as followRoutes };
