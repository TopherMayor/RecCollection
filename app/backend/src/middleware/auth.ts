import { Context, Next } from 'hono';
import { verify } from 'jsonwebtoken';
import { HTTPException } from 'hono/http-exception';

// Define the user type for the JWT payload
export interface JWTPayload {
  id: number;
  username: string;
  email: string;
}

// Authentication middleware
export async function authenticate(c: Context, next: Next) {
  try {
    // Get the authorization header
    const authHeader = c.req.header('Authorization');
    
    // Check if the header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET || '') as JWTPayload;
    
    // Add the user to the context
    c.set('user', decoded);
    
    // Continue to the next middleware or handler
    await next();
  } catch (error) {
    // Handle token verification errors
    throw new HTTPException(401, { message: 'Invalid or expired token' });
  }
}

// Optional authentication middleware (doesn't throw if no token)
export async function optionalAuthenticate(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verify(token, process.env.JWT_SECRET || '') as JWTPayload;
      c.set('user', decoded);
    }
    
    await next();
  } catch (error) {
    // Continue without setting user
    await next();
  }
}
