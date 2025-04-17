import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { JWTPayload } from "../types";

// Simple in-memory rate limiter
// Maps user IDs to their request timestamps
const requestTimestamps: Map<number, number[]> = new Map();

// Rate limit configuration
const MAX_REQUESTS = 10; // Maximum number of requests
const TIME_WINDOW = 60 * 1000; // Time window in milliseconds (1 minute)

/**
 * Rate limiting middleware for API endpoints
 * Limits the number of requests a user can make within a time window
 */
export const rateLimit = async (c: Context, next: Next) => {
  try {
    // Get user from context (set by authenticate middleware)
    const user = c.get("user") as JWTPayload;
    const userId = user.id;
    const now = Date.now();

    // Get user's request timestamps
    let timestamps = requestTimestamps.get(userId) || [];
    
    // Filter out timestamps outside the time window
    timestamps = timestamps.filter(time => now - time < TIME_WINDOW);
    
    // Check if user has exceeded rate limit
    if (timestamps.length >= MAX_REQUESTS) {
      // Calculate time until reset
      const oldestTimestamp = timestamps[0];
      const resetTime = oldestTimestamp + TIME_WINDOW - now;
      const resetSeconds = Math.ceil(resetTime / 1000);
      
      throw new HTTPException(429, {
        message: `Rate limit exceeded. Try again in ${resetSeconds} seconds.`,
        res: {
          headers: {
            'X-RateLimit-Limit': MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((now + resetTime) / 1000).toString(),
            'Retry-After': resetSeconds.toString()
          }
        }
      });
    }
    
    // Add current timestamp to user's request timestamps
    timestamps.push(now);
    requestTimestamps.set(userId, timestamps);
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', MAX_REQUESTS.toString());
    c.header('X-RateLimit-Remaining', (MAX_REQUESTS - timestamps.length).toString());
    c.header('X-RateLimit-Reset', Math.ceil((now + TIME_WINDOW) / 1000).toString());
    
    // Continue to the next middleware or route handler
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Rate limiting error" });
  }
};

/**
 * Less strict rate limiting for read-only endpoints
 */
export const readRateLimit = async (c: Context, next: Next) => {
  try {
    // Get user from context (set by authenticate middleware)
    const user = c.get("user") as JWTPayload;
    const userId = user.id;
    const now = Date.now();

    // Get user's request timestamps
    let timestamps = requestTimestamps.get(userId) || [];
    
    // Filter out timestamps outside the time window
    timestamps = timestamps.filter(time => now - time < TIME_WINDOW);
    
    // For read-only endpoints, allow more requests
    const readMaxRequests = MAX_REQUESTS * 3;
    
    // Check if user has exceeded rate limit
    if (timestamps.length >= readMaxRequests) {
      // Calculate time until reset
      const oldestTimestamp = timestamps[0];
      const resetTime = oldestTimestamp + TIME_WINDOW - now;
      const resetSeconds = Math.ceil(resetTime / 1000);
      
      throw new HTTPException(429, {
        message: `Rate limit exceeded. Try again in ${resetSeconds} seconds.`,
        res: {
          headers: {
            'X-RateLimit-Limit': readMaxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((now + resetTime) / 1000).toString(),
            'Retry-After': resetSeconds.toString()
          }
        }
      });
    }
    
    // Add current timestamp to user's request timestamps
    timestamps.push(now);
    requestTimestamps.set(userId, timestamps);
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', readMaxRequests.toString());
    c.header('X-RateLimit-Remaining', (readMaxRequests - timestamps.length).toString());
    c.header('X-RateLimit-Reset', Math.ceil((now + TIME_WINDOW) / 1000).toString());
    
    // Continue to the next middleware or route handler
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Rate limiting error" });
  }
};
