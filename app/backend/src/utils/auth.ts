import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { JWTPayload } from '../middleware/auth';

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await hash(password, saltRounds);
}

// Verify a password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

// Generate a JWT token
export function generateToken(payload: JWTPayload): string {
  return sign(payload, process.env.JWT_SECRET || '', {
    expiresIn: '1d' // Token expires in 1 day
  });
}

// Generate a refresh token (for future implementation)
export function generateRefreshToken(userId: number): string {
  return sign({ id: userId }, process.env.JWT_SECRET || '', {
    expiresIn: '7d' // Refresh token expires in 7 days
  });
}
