import { Context, Next } from "hono";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";

// Validation middleware factory
export function validate<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      // Get request body
      let body;
      try {
        body = await c.req.json();
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        return c.json(
          {
            success: false,
            message: "Invalid JSON in request body",
            status: 400,
          },
          400
        );
      }

      // Validate against schema
      const result = schema.safeParse(body);

      if (!result.success) {
        // Format validation errors
        const errors = result.error.errors.reduce((acc, error) => {
          const path = error.path.join(".");
          acc[path] = error.message;
          return acc;
        }, {} as Record<string, string>);

        // Return validation error response
        console.log("Validation errors:", errors);
        return c.json(
          {
            success: false,
            message: "Validation Error",
            errors,
            status: 400,
          },
          400
        );
      }

      // Add validated data to context
      c.set("validated", result.data);

      await next();
    } catch (error) {
      console.error("Validation middleware error:", error);

      if (error instanceof HTTPException) {
        return c.json(
          {
            success: false,
            message: error.message || "Validation Error",
            status: error.status,
          },
          error.status
        );
      }

      // For any other errors, return a generic error message
      return c.json(
        {
          success: false,
          message: "An error occurred during validation",
          status: 500,
        },
        500
      );
    }
  };
}

// Query validation middleware factory
export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      // Get query parameters
      const query = c.req.query();

      // Validate against schema
      const result = schema.safeParse(query);

      if (!result.success) {
        // Format validation errors
        const errors = result.error.errors.reduce((acc, error) => {
          const path = error.path.join(".");
          acc[path] = error.message;
          return acc;
        }, {} as Record<string, string>);

        // Return validation error response
        throw new HTTPException(400, {
          message: "Validation Error",
          cause: { errors },
        });
      }

      // Add validated query to context
      c.set("validatedQuery", result.data);

      await next();
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }

      throw new HTTPException(500, { message: "Query validation error" });
    }
  };
}
