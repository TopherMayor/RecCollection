import { Context, Next } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';

// Validation middleware factory
export function validate<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      // Get request body
      const body = await c.req.json();
      
      // Validate against schema
      const result = schema.safeParse(body);
      
      if (!result.success) {
        // Format validation errors
        const errors = result.error.errors.reduce((acc, error) => {
          const path = error.path.join('.');
          acc[path] = error.message;
          return acc;
        }, {} as Record<string, string>);
        
        // Return validation error response
        throw new HTTPException(400, { 
          message: 'Validation Error',
          cause: { errors }
        });
      }
      
      // Add validated data to context
      c.set('validated', result.data);
      
      await next();
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      
      if (error instanceof SyntaxError) {
        throw new HTTPException(400, { message: 'Invalid JSON' });
      }
      
      throw new HTTPException(500, { message: 'Validation error' });
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
          const path = error.path.join('.');
          acc[path] = error.message;
          return acc;
        }, {} as Record<string, string>);
        
        // Return validation error response
        throw new HTTPException(400, { 
          message: 'Validation Error',
          cause: { errors }
        });
      }
      
      // Add validated query to context
      c.set('validatedQuery', result.data);
      
      await next();
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      
      throw new HTTPException(500, { message: 'Query validation error' });
    }
  };
}
