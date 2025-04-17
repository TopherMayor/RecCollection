import { describe, expect, it, beforeAll, afterAll } from "vitest";
import app from "../index";
import { db, schema } from "../db";
import { hashPassword } from "../utils/auth";

// Test user data
const testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "password123",
  displayName: "Test User",
};

// Setup and teardown
beforeAll(async () => {
  // Create a test user
  const passwordHash = await hashPassword(testUser.password);

  try {
    await db.insert(schema.users).values({
      username: testUser.username,
      email: testUser.email,
      passwordHash,
      displayName: testUser.displayName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    // User might already exist, ignore error
    console.log("Setup error (can be ignored if user exists):", error);
  }
});

afterAll(async () => {
  // Clean up test user
  try {
    await db
      .delete(schema.users)
      .where(schema.users.username.equals(testUser.username));
  } catch (error) {
    console.log("Teardown error:", error);
  }
});

describe("Authentication", () => {
  let authToken: string;

  it("should register a new user", async () => {
    const uniqueUsername = `testuser_${Date.now()}`;
    const uniqueEmail = `test_${Date.now()}@example.com`;

    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: uniqueUsername,
        email: uniqueEmail,
        password: "password123",
        displayName: "Test User",
      }),
    });

    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe(uniqueUsername);
    expect(data.token).toBeDefined();

    // Clean up the created user
    await db
      .delete(schema.users)
      .where(schema.users.username.equals(uniqueUsername));
  });

  it("should login a user", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testUser.email);
    expect(data.token).toBeDefined();

    // Save token for next tests
    authToken = data.token;
  });

  it("should get current user profile", async () => {
    const res = await app.request("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.username).toBe(testUser.username);
    expect(data.email).toBe(testUser.email);
  });

  it("should update user profile", async () => {
    const newBio = "This is my updated bio";

    const res = await app.request("/api/auth/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bio: newBio,
      }),
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.bio).toBe(newBio);
  });

  it("should reject invalid login", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testUser.email,
        password: "wrongpassword",
      }),
    });

    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("should reject unauthorized access", async () => {
    const res = await app.request("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: "Bearer invalidtoken",
      },
    });

    expect(res.status).toBe(401);
  });
});
