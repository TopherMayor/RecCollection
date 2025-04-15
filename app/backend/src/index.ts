import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { serveStatic } from "hono/bun";
import path from "path";
import { errorHandler } from "./middleware/error";
import { authRoutes } from "./routes/auth";
import { recipeRoutes } from "./routes/recipes";
import { aiRoutes } from "./routes/ai";
import { importRoutes } from "./routes/import";
import { socialImportRoutes } from "./routes/social-import";
import { searchRoutes } from "./routes/search";
import { followRoutes } from "./routes/follow";
import { notificationRoutes } from "./routes/notifications";
import { sharingRoutes } from "./routes/sharing";
import { AIParserController } from "./controllers/ai-parser.controller";
import "dotenv/config";

// Create a new Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Frontend URLs
    credentials: true,
  })
);
app.use("*", secureHeaders());
app.use("*", errorHandler);

// Serve static files from uploads directory
app.use("/uploads/*", serveStatic({ root: path.resolve(process.cwd()) }));

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/recipes", recipeRoutes);
app.route("/api/ai", aiRoutes);
app.route("/api/import", importRoutes);
app.route("/api/social-import", socialImportRoutes);
app.route("/api/search", searchRoutes);
app.route("/api/follow", followRoutes);
app.route("/api/notifications", notificationRoutes);
app.route("/api/sharing", sharingRoutes);

// Health check
app.get("/", (c) =>
  c.json({ status: "ok", message: "RecCollection API is running" })
);

// Not found handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: "Not Found",
      status: 404,
    },
    404
  );
});

// Create an instance of the AI Parser Controller for cleanup
const aiParserController = new AIParserController();

// Handle cleanup on process termination
process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT. Cleaning up resources...");
  await aiParserController.cleanup();
  console.log("Cleanup completed. Exiting process.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM. Cleaning up resources...");
  await aiParserController.cleanup();
  console.log("Cleanup completed. Exiting process.");
  process.exit(0);
});

export default app;
