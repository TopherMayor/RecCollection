import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

// Error handling middleware
export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof HTTPException) {
      // Handle Hono HTTP exceptions
      const status = error.status;
      const message = error.message;
      const cause = error.cause as Record<string, any> | undefined;
      
      return c.json({
        success: false,
        error: message,
        status,
        ...(cause && { details: cause.errors })
      }, status);
    }
    
    // Handle other errors
    return c.json({
      success: false,
      error: 'Internal Server Error',
      status: 500
    }, 500);
  }
}
