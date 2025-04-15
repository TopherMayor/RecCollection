import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

interface RateLimitOptions {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Maximum number of requests in the time window
  message: string;   // Error message when rate limit is exceeded
  statusCode?: number; // Optional status code (defaults to 429)
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting
// In a production environment, this should be replaced with Redis or another distributed store
const store: RateLimitStore = {};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limiting middleware factory
 * @param options Rate limiting options
 * @returns Middleware function
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, message, statusCode = 429 } = options;

  return async function rateLimitMiddleware(c: Context, next?: Next) {
    // Get client IP
    const ip = c.req.header('x-forwarded-for') || 
               c.req.header('x-real-ip') || 
               c.env?.remoteAddr || 
               'unknown';
    
    // Create a key based on the IP and the route
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();
    
    // Initialize or get the entry for this key
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    // Increment the counter
    store[key].count++;
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', max.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, max - store[key].count).toString());
    c.header('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000).toString());
    
    // Check if the rate limit has been exceeded
    if (store[key].count > max) {
      throw new HTTPException(statusCode, { message });
    }
    
    // Continue to the next middleware if provided
    if (next) {
      await next();
    }
    
    return c;
  };
}
