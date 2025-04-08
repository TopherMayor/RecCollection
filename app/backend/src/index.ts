import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { errorHandler } from "./middleware/error";
import { authRoutes } from "./routes/auth";
import { recipeRoutes } from "./routes/recipes";
import { aiRoutes } from "./routes/ai";
import { importRoutes } from "./routes/import";
import "dotenv/config";

// Create a new Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"], // Frontend URL
    credentials: true,
  })
);
app.use("*", secureHeaders());
app.use("*", errorHandler);

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/recipes", recipeRoutes);
app.route("/api/ai", aiRoutes);
app.route("/api/import", importRoutes);

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

export default app;
