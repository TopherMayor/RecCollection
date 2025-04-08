import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import app from '../index';
import { db, schema } from '../db';
import { hashPassword } from '../utils/auth';
import { sign } from 'jsonwebtoken';

// Test user data
const testUser = {
  id: 0,
  username: 'importuser',
  email: 'import@example.com',
  password: 'password123',
  displayName: 'Import User'
};

let authToken: string;
let createdRecipeIds: number[] = [];

// Setup and teardown
beforeAll(async () => {
  // Create a test user
  const passwordHash = await hashPassword(testUser.password);
  
  try {
    const [user] = await db.insert(schema.users).values({
      username: testUser.username,
      email: testUser.email,
      passwordHash,
      displayName: testUser.displayName,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    testUser.id = user.id;
    
    // Generate auth token
    authToken = sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1d' }
    );
  } catch (error) {
    console.log('Setup error:', error);
  }
});

afterAll(async () => {
  // Clean up test data
  try {
    for (const recipeId of createdRecipeIds) {
      await db.delete(schema.recipes).where(schema.recipes.id.equals(recipeId));
    }
    await db.delete(schema.users).where(schema.users.id.equals(testUser.id));
  } catch (error) {
    console.log('Teardown error:', error);
  }
});

describe('Import API', () => {
  it('should import a recipe from Instagram', async () => {
    const res = await app.request('/api/import/instagram', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://www.instagram.com/p/example123/'
      })
    });
    
    expect(res.status).toBe(201);
    
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.recipe).toBeDefined();
    expect(data.recipe.sourceType).toBe('instagram');
    expect(data.recipe.sourceUrl).toBe('https://www.instagram.com/p/example123/');
    
    // Save recipe ID for cleanup
    createdRecipeIds.push(data.recipe.id);
  });
  
  it('should import a recipe from TikTok', async () => {
    const res = await app.request('/api/import/tiktok', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://www.tiktok.com/@user/video/123456'
      })
    });
    
    expect(res.status).toBe(201);
    
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.recipe).toBeDefined();
    expect(data.recipe.sourceType).toBe('tiktok');
    expect(data.recipe.sourceUrl).toBe('https://www.tiktok.com/@user/video/123456');
    
    // Save recipe ID for cleanup
    createdRecipeIds.push(data.recipe.id);
  });
  
  it('should reject invalid URLs', async () => {
    const res = await app.request('/api/import/instagram', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'invalid-url'
      })
    });
    
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data.success).toBe(false);
  });
  
  it('should reject unauthorized access', async () => {
    const res = await app.request('/api/import/instagram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://www.instagram.com/p/example123/'
      })
    });
    
    expect(res.status).toBe(401);
  });
});
