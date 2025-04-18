import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { v4 as uuidv4 } from "uuid";
import type { ContentfulStatusCode } from "hono/utils/http-status";

// Standard error codes
const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
} as const;

// Maps HTTP status codes to error codes
function getErrorCode(status: number | undefined): keyof typeof ERROR_CODES {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 422:
      return "VALIDATION_ERROR";
    default:
      return "INTERNAL_ERROR";
  }
}

// Error handling middleware
export async function errorHandler(c: Context, next: Next) {
  // Generate request ID for correlation
  const requestId = uuidv4();
  c.set("requestId", requestId);

  try {
    await next();
  } catch (error) {
    // Structured error logging
    const errorLog = {
      timestamp: new Date().toISOString(),
      requestId,
      error: {
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      request: {
        method: c.req.method,
        path: c.req.path,
        headers: c.req.header(),
      },
    };

    // Try to get request body for debugging
    try {
      const clonedReq = c.req.raw.clone();
      clonedReq
        .text()
        .then((body) => {
          if (body) {
            console.error(
              JSON.stringify({
                ...errorLog,
                request: { ...errorLog.request, body },
              })
            );
          } else {
            console.error(JSON.stringify(errorLog));
          }
        })
        .catch(() => console.error(JSON.stringify(errorLog)));
    } catch (e) {
      console.error(JSON.stringify(errorLog));
    }

    // Standardized error response
    try {
      if (error instanceof HTTPException) {
        // Handle Hono HTTP exceptions
        const status = error.status;
        const message = error.message;
        const cause = error.cause as Record<string, any> | undefined;

        return c.json(
          {
            success: false,
            requestId,
            code: getErrorCode(status),
            message,
            status,
            ...(cause && { details: cause.errors }),
            timestamp: new Date().toISOString(),
          },
          status
        );
      }

      // Handle other errors
      return c.json(
        {
          success: false,
          requestId,
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error ? error.message : "Internal Server Error",
          status: 500,
          timestamp: new Date().toISOString(),
        },
        500
      );
    } catch (jsonError) {
      // Fallback response if JSON creation fails
      console.error(
        JSON.stringify({
          ...errorLog,
          jsonError:
            jsonError instanceof Error
              ? jsonError.message
              : "Unknown JSON error",
        })
      );
      c.status(500);
      return c.text("Internal Server Error");
    }
  }
}

// Helper function to throw standardized errors
export function throwError(
  status: number,
  message: string,
  code?: keyof typeof ERROR_CODES,
  details?: Record<string, any>
) {
  // @ts-ignore - HTTPException expects ContentfulStatusCode but works with numbers
  const error = new HTTPException(status, {
    message,
    cause: details ? { errors: details } : undefined,
    // @ts-ignore - ContentfulStatusCode is from external type
  });
  (error as any).code = code || getErrorCode(status);
  throw error;
}
