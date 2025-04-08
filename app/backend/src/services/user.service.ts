import { eq } from 'drizzle-orm';
import { db, schema } from '../db';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { HTTPException } from 'hono/http-exception';

// User registration input
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

// User login input
export interface LoginInput {
  email: string;
  password: string;
}

// User service
export class UserService {
  // Register a new user
  async register(input: RegisterInput) {
    // Check if username already exists
    const existingUsername = await db.query.users.findFirst({
      where: eq(schema.users.username, input.username)
    });

    if (existingUsername) {
      throw new HTTPException(400, { message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await db.query.users.findFirst({
      where: eq(schema.users.email, input.email)
    });

    if (existingEmail) {
      throw new HTTPException(400, { message: 'Email already exists' });
    }

    // Hash the password
    const passwordHash = await hashPassword(input.password);

    // Create the user
    const [user] = await db.insert(schema.users).values({
      username: input.username,
      email: input.email,
      passwordHash,
      displayName: input.displayName || input.username,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      displayName: schema.users.displayName,
      createdAt: schema.users.createdAt
    });

    // Generate a token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    return { user, token };
  }

  // Login a user
  async login(input: LoginInput) {
    // Find the user by email
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, input.email)
    });

    if (!user) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    // Verify the password
    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    // Update last login
    await db.update(schema.users)
      .set({ lastLogin: new Date() })
      .where(eq(schema.users.id, user.id));

    // Generate a token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
      },
      token
    };
  }

  // Get user by ID
  async getUserById(id: number) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };
  }

  // Update user profile
  async updateProfile(id: number, data: Partial<{
    displayName: string;
    bio: string;
    avatarUrl: string;
  }>) {
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    // Update the user
    const [updatedUser] = await db.update(schema.users)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, id))
      .returning({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        displayName: schema.users.displayName,
        bio: schema.users.bio,
        avatarUrl: schema.users.avatarUrl,
        updatedAt: schema.users.updatedAt
      });

    return updatedUser;
  }
}
