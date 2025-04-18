import { Context, Next } from "hono";
import { verify } from "jsonwebtoken";
import { HTTPException } from "hono/http-exception";
import { rateLimit } from "../utils/rate-limit.ts";

// Define the user type for the JWT payload
export interface JWTPayload {
  id: string; // Changed to string for UUID support
  username: string;
  email: string;
}

// Apply rate limiting to authentication attempts
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many authentication attempts, please try again later",
});

// Authentication middleware
export async function authenticate(c: Context, next: Next) {
  try {
    // Apply rate limiting
    await authRateLimit(c);

    // Get the authorization header
    const authHeader = c.req.header("Authorization");

    // Check if the header exists and has the correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    if (!token || token.trim() === "") {
      throw new HTTPException(401, { message: "Invalid token format" });
    }

    // Verify the token with proper error handling
    let decoded;
    try {
      // Check if JWT_SECRET is set
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
        console.error("JWT_SECRET is not set or is empty");
        throw new HTTPException(500, { message: "Server configuration error" });
      }

      decoded = verify(token, process.env.JWT_SECRET) as JWTPayload;
    } catch (jwtError: any) {
      console.error("JWT verification error:", jwtError.message);
      throw new HTTPException(401, { message: "Invalid or expired token" });
    }

    // Validate the decoded payload
    if (!decoded || !decoded.id || !decoded.username) {
      throw new HTTPException(401, { message: "Invalid token payload" });
    }

    // Add the user to the context
    c.set("user", decoded);

    // Continue to the next middleware or handler
    await next();
  } catch (error) {
    // Handle token verification errors
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error("Authentication error:", error);
    throw new HTTPException(401, { message: "Authentication failed" });
  }
}

// Optional authentication middleware (doesn't throw if no token)
export async function optionalAuthenticate(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token && token.trim() !== "") {
        try {
          const decoded = verify(
            token,
            process.env.JWT_SECRET || ""
          ) as JWTPayload;

          // Validate the decoded payload
          if (decoded && decoded.id && decoded.username) {
            c.set("user", decoded);
          }
        } catch (jwtError) {
          // Just log the error but don't throw
          console.warn("Optional auth: Invalid token", jwtError);
        }
      }
    }

    await next();
  } catch (error) {
    // Log the error but continue without setting user
    console.warn("Optional authentication error:", error);
    await next();
  }
}
