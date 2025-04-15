import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

// Error handling middleware
export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace available"
    );

    // Log request details to help with debugging
    console.error("Request method:", c.req.method);
    console.error("Request path:", c.req.path);
    console.error("Request headers:", JSON.stringify(c.req.header()));

    // Try to get request body for debugging (this might not work if body was already consumed)
    try {
      const clonedReq = c.req.raw.clone();
      clonedReq
        .text()
        .then((body) => {
          if (body) console.error("Request body:", body);
        })
        .catch(() => {});
    } catch (e) {
      console.error("Could not log request body");
    }

    // Ensure we always return a JSON response
    try {
      if (error instanceof HTTPException) {
        // Handle Hono HTTP exceptions
        const status = error.status;
        const message = error.message;
        const cause = error.cause as Record<string, any> | undefined;

        return c.json(
          {
            success: false,
            message: message,
            status,
            ...(cause && { details: cause.errors }),
          },
          status
        );
      }

      // Handle other errors
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal Server Error",
          status: 500,
        },
        500
      );
    } catch (jsonError) {
      // If we can't even create a JSON response, return a simple text response
      console.error("Failed to create JSON error response:", jsonError);
      c.status(500);
      return c.text("Internal Server Error");
    }
  }
}
