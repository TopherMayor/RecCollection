import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { serveStatic } from "@hono/node-server/serve-static";
import path from "path";
import fs from "fs";
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
import { uploadRoutes } from "./routes/upload";
import collectionsRoutes from "./routes/collections";
import { AIParserController } from "./controllers/ai-parser.controller";
import "dotenv/config";

// Create a new Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
// Configure CORS with more secure settings
app.use(
  "*",
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:5173", "http://localhost:5174"], // Frontend URLs
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
    exposeHeaders: [
      "Content-Length",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
    ],
    maxAge: 86400, // 24 hours in seconds
  })
);
// Add security headers
app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: [
        "'self'",
        "data:",
        "https://picsum.photos",
        "https://ui-avatars.com",
        "https://source.unsplash.com",
        "http://localhost:3001",
      ],
      connectSrc: [
        "'self'",
        "https://api.openrouter.ai",
        "https://generativelanguage.googleapis.com",
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
    xssProtection: "1; mode=block",
    noSniff: true,
    frameGuard: { action: "deny" },
  })
);
app.use("*", errorHandler);

// Serve static files from uploads directory
app.use("/uploads/*", serveStatic({ root: path.resolve(process.cwd()) }));

// Direct route for serving static files
app.get("/uploads/:filename", async (c) => {
  const filename = c.req.param("filename");
  const filePath = path.join(process.cwd(), "uploads", filename);

  try {
    if (!fs.existsSync(filePath)) {
      return c.json({ error: "File not found" }, 404);
    }

    const fileContent = await fs.promises.readFile(filePath);
    const contentType = filename.endsWith(".svg")
      ? "image/svg+xml"
      : filename.endsWith(".jpg") || filename.endsWith(".jpeg")
      ? "image/jpeg"
      : filename.endsWith(".png")
      ? "image/png"
      : "application/octet-stream";

    c.header("Content-Type", contentType);
    return c.body(fileContent);
  } catch (error) {
    console.error(`Error serving file ${filename}:`, error);
    return c.json({ error: "Failed to serve file" }, 500);
  }
});

// API route for serving static files (for proxy access)
app.get("/api/uploads/:filename", async (c) => {
  const filename = c.req.param("filename");
  const filePath = path.join(process.cwd(), "uploads", filename);

  try {
    if (!fs.existsSync(filePath)) {
      return c.json({ error: "File not found" }, 404);
    }

    const fileContent = await fs.promises.readFile(filePath);
    const contentType = filename.endsWith(".svg")
      ? "image/svg+xml"
      : filename.endsWith(".jpg") || filename.endsWith(".jpeg")
      ? "image/jpeg"
      : filename.endsWith(".png")
      ? "image/png"
      : "application/octet-stream";

    c.header("Content-Type", contentType);
    return c.body(fileContent);
  } catch (error) {
    console.error(`Error serving file ${filename}:`, error);
    return c.json({ error: "Failed to serve file" }, 500);
  }
});

// Add a route to debug file access
app.get("/debug/file/:filename", (c) => {
  const filename = c.req.param("filename");
  const filePath = path.join(process.cwd(), "uploads", filename);

  try {
    const exists = fs.existsSync(filePath);
    const stats = exists ? fs.statSync(filePath) : null;

    return c.json({
      filename,
      filePath,
      exists,
      stats: stats
        ? {
            size: stats.size,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
            permissions: stats.mode.toString(8),
          }
        : null,
    });
  } catch (error) {
    return c.json(
      {
        filename,
        filePath,
        error: error.message,
      },
      500
    );
  }
});

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
app.route("/api/collections", collectionsRoutes);
app.route("/api/upload", uploadRoutes);

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
