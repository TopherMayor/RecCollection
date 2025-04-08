import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import app from '../index';
import { db, schema } from '../db';
import { hashPassword } from '../utils/auth';
import { sign } from 'jsonwebtoken';

// Test user data
const testUser = {
  id: 0,
  username: 'aiuser',
  email: 'ai@example.com',
  password: 'password123',
  displayName: 'AI User'
};

let authToken: string;

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
  // Clean up test user
  try {
    await db.delete(schema.users).where(schema.users.id.equals(testUser.id));
  } catch (error) {
    console.log('Teardown error:', error);
  }
});

describe('AI API', () => {
  it('should generate a recipe name', async () => {
    const ingredients = ['chicken', 'garlic', 'lemon'];
    const instructions = ['Marinate chicken', 'Cook until done'];
    
    const res = await app.request('/api/ai/generate-name', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ingredients,
        instructions,
        category: 'Dinner'
      })
    });
    
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.name).toBeDefined();
    expect(typeof data.name).toBe('string');
    expect(data.name.length).toBeGreaterThan(0);
  });
  
  it('should generate a recipe description', async () => {
    const name = 'Lemon Garlic Chicken';
    const ingredients = ['chicken', 'garlic', 'lemon'];
    const instructions = ['Marinate chicken', 'Cook until done'];
    
    const res = await app.request('/api/ai/generate-description', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        ingredients,
        instructions,
        category: 'Dinner'
      })
    });
    
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.description).toBeDefined();
    expect(typeof data.description).toBe('string');
    expect(data.description.length).toBeGreaterThan(0);
  });
  
  it('should reject unauthorized access', async () => {
    const res = await app.request('/api/ai/generate-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ingredients: ['chicken'],
        instructions: ['Cook it']
      })
    });
    
    expect(res.status).toBe(401);
  });
  
  it('should validate input data', async () => {
    const res = await app.request('/api/ai/generate-name', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Missing required fields
        category: 'Dinner'
      })
    });
    
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});
