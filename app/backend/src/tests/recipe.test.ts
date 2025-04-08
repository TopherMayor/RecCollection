import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import app from '../index';
import { db, schema } from '../db';
import { hashPassword } from '../utils/auth';
import { sign } from 'jsonwebtoken';

// Test user data
const testUser = {
  id: 0,
  username: 'recipeuser',
  email: 'recipe@example.com',
  password: 'password123',
  displayName: 'Recipe User'
};

// Test recipe data
const testRecipe = {
  title: 'Test Recipe',
  description: 'This is a test recipe',
  cookingTime: 30,
  prepTime: 15,
  servingSize: 4,
  difficultyLevel: 'medium',
  ingredients: [
    { name: 'Ingredient 1', quantity: 1, unit: 'cup', orderIndex: 1 },
    { name: 'Ingredient 2', quantity: 2, unit: 'tbsp', orderIndex: 2 }
  ],
  instructions: [
    { stepNumber: 1, description: 'Step 1 description' },
    { stepNumber: 2, description: 'Step 2 description' }
  ]
};

let authToken: string;
let createdRecipeId: number;

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
    if (createdRecipeId) {
      await db.delete(schema.recipes).where(schema.recipes.id.equals(createdRecipeId));
    }
    await db.delete(schema.users).where(schema.users.id.equals(testUser.id));
  } catch (error) {
    console.log('Teardown error:', error);
  }
});

describe('Recipe API', () => {
  it('should create a new recipe', async () => {
    const res = await app.request('/api/recipes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRecipe)
    });
    
    expect(res.status).toBe(201);
    
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.recipe).toBeDefined();
    expect(data.recipe.title).toBe(testRecipe.title);
    
    // Save recipe ID for later tests
    createdRecipeId = data.recipe.id;
  });
  
  it('should get a recipe by ID', async () => {
    const res = await app.request(`/api/recipes/${createdRecipeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.title).toBe(testRecipe.title);
    expect(data.description).toBe(testRecipe.description);
    expect(data.ingredients).toHaveLength(testRecipe.ingredients.length);
    expect(data.instructions).toHaveLength(testRecipe.instructions.length);
  });
  
  it('should update a recipe', async () => {
    const updatedTitle = 'Updated Test Recipe';
    
    const res = await app.request(`/api/recipes/${createdRecipeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: updatedTitle
      })
    });
    
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.recipe.title).toBe(updatedTitle);
  });
  
  it('should like a recipe', async () => {
    const res = await app.request(`/api/recipes/${createdRecipeId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.success).toBe(true);
  });
  
  it('should add a comment to a recipe', async () => {
    const comment = 'This is a test comment';
    
    const res = await app.request(`/api/recipes/${createdRecipeId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: comment
      })
    });
    
    expect(res.status).toBe(201);
    
    const data = await res.json();
    expect(data.content).toBe(comment);
    expect(data.user).toBeDefined();
    expect(data.user.id).toBe(testUser.id);
  });
  
  it('should get recipe comments', async () => {
    const res = await app.request(`/api/recipes/${createdRecipeId}/comments`, {
      method: 'GET'
    });
    
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.comments).toBeDefined();
    expect(data.comments.length).toBeGreaterThan(0);
    expect(data.pagination).toBeDefined();
  });
  
  it('should search recipes', async () => {
    const res = await app.request('/api/recipes?search=Test', {
      method: 'GET'
    });
    
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.recipes).toBeDefined();
    expect(data.pagination).toBeDefined();
    
    // At least one recipe should match our search
    const matchingRecipe = data.recipes.find((r: any) => r.id === createdRecipeId);
    expect(matchingRecipe).toBeDefined();
  });
  
  it('should delete a recipe', async () => {
    const res = await app.request(`/api/recipes/${createdRecipeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.success).toBe(true);
    
    // Verify the recipe is deleted
    const getRes = await app.request(`/api/recipes/${createdRecipeId}`, {
      method: 'GET'
    });
    
    expect(getRes.status).toBe(404);
    
    // Set createdRecipeId to 0 to avoid cleanup in afterAll
    createdRecipeId = 0;
  });
});
