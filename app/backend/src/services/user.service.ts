import { eq, sql, like, or, desc } from "drizzle-orm";
import { db, schema } from "../db";
import { hashPassword, verifyPassword, generateToken } from "../utils/auth";
import { HTTPException } from "hono/http-exception";

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

// User search params
export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
}

// User service
export class UserService {
  // Register a new user
  async register(input: RegisterInput) {
    // Check if username already exists
    const existingUsername = await db.query.users.findFirst({
      where: eq(schema.users.username, input.username),
    });

    if (existingUsername) {
      throw new HTTPException(400, { message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await db.query.users.findFirst({
      where: eq(schema.users.email, input.email),
    });

    if (existingEmail) {
      throw new HTTPException(400, { message: "Email already exists" });
    }

    // Hash the password
    const passwordHash = await hashPassword(input.password);

    // Create the user
    const [user] = await db
      .insert(schema.users)
      .values({
        username: input.username,
        email: input.email,
        passwordHash,
        displayName: input.displayName || input.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        displayName: schema.users.displayName,
        createdAt: schema.users.createdAt,
      });

    // Generate a token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    return { user, token };
  }

  // Login a user
  async login(input: LoginInput) {
    // Find the user by email
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, input.email),
    });

    if (!user) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    // Verify the password
    const isPasswordValid = await verifyPassword(
      input.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    // Update last login
    await db
      .update(schema.users)
      .set({ lastLogin: new Date() })
      .where(eq(schema.users.id, user.id));

    // Generate a token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      token,
    };
  }

  // Get user by ID
  async getUserById(id: number) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }

  // Get user by username
  async getUserByUsername(username: string) {
    console.log(`UserService: Looking up user with username: ${username}`);
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.username, username),
      });

      console.log("UserService: User query result:", user);

      if (!user) {
        console.log(`UserService: User not found with username: ${username}`);
        throw new HTTPException(404, { message: "User not found" });
      }

      // Get user stats
      try {
        console.log(
          `UserService: Getting recipe count for user ID: ${user.id}`
        );
        const recipeCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.recipes)
          .where(eq(schema.recipes.userId, user.id));

        console.log("UserService: Recipe count result:", recipeCount);

        console.log(`UserService: Getting like count for user ID: ${user.id}`);
        const likeCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.likes)
          .innerJoin(
            schema.recipes,
            eq(schema.likes.recipeId, schema.recipes.id)
          )
          .where(eq(schema.recipes.userId, user.id));

        console.log("UserService: Like count result:", likeCount);

        const result = {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          stats: {
            recipeCount: parseInt(recipeCount[0]?.count as string) || 0,
            likeCount: parseInt(likeCount[0]?.count as string) || 0,
          },
        };

        console.log("UserService: Returning user profile:", result);
        return result;
      } catch (statsError) {
        console.error("UserService: Error getting user stats:", statsError);
        // Return user without stats if there's an error getting stats
        return {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          stats: {
            recipeCount: 0,
            likeCount: 0,
          },
        };
      }
    } catch (error) {
      console.error("UserService: Error in getUserByUsername:", error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(
    id: number,
    data: Partial<{
      displayName: string;
      bio: string;
      avatarUrl: string;
    }>
  ) {
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    // Update the user
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        displayName: schema.users.displayName,
        bio: schema.users.bio,
        avatarUrl: schema.users.avatarUrl,
        updatedAt: schema.users.updatedAt,
      });

    return updatedUser;
  }

  // Search users
  async searchUsers(params: UserSearchParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    // Build the where clause
    let whereClause = sql`1 = 1`;

    if (params.search) {
      const searchTerm = `%${params.search.toLowerCase()}%`;
      whereClause = sql`${whereClause} AND (
        lower(${schema.users.username}) LIKE ${searchTerm} OR
        lower(${schema.users.displayName}) LIKE ${searchTerm}
      )`;
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(whereClause);

    const count = countResult[0]?.count || 0;

    // Get users
    const users = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        displayName: schema.users.displayName,
        avatarUrl: schema.users.avatarUrl,
        bio: schema.users.bio,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(schema.users.createdAt));

    return {
      users,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}
