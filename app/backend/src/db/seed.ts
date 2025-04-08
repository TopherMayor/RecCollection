import { db, schema } from './index';
import { hashPassword } from '../utils/auth';
import 'dotenv/config';

// Seed the database with initial data
async function seed() {
  console.log('Seeding database...');
  
  try {
    // Create users
    const passwordHash = await hashPassword('password123');
    
    const [admin] = await db.insert(schema.users).values({
      username: 'admin',
      email: 'admin@example.com',
      passwordHash,
      displayName: 'Admin User',
      bio: 'Administrator of RecCollection',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    const [user1] = await db.insert(schema.users).values({
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash,
      displayName: 'John Doe',
      bio: 'I love cooking!',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    const [user2] = await db.insert(schema.users).values({
      username: 'janedoe',
      email: 'jane@example.com',
      passwordHash,
      displayName: 'Jane Doe',
      bio: 'Passionate about baking',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log('Created users');
    
    // Create categories
    const categories = await db.insert(schema.categories).values([
      { name: 'Breakfast', description: 'Morning meals' },
      { name: 'Lunch', description: 'Midday meals' },
      { name: 'Dinner', description: 'Evening meals' },
      { name: 'Dessert', description: 'Sweet treats' },
      { name: 'Vegetarian', description: 'Meat-free recipes' },
      { name: 'Vegan', description: 'Plant-based recipes' },
      { name: 'Gluten-Free', description: 'Recipes without gluten' },
      { name: 'Quick & Easy', description: 'Recipes that take less than 30 minutes' }
    ]).returning();
    
    console.log('Created categories');
    
    // Create tags
    const tags = await db.insert(schema.tags).values([
      { name: 'healthy' },
      { name: 'comfort-food' },
      { name: 'spicy' },
      { name: 'sweet' },
      { name: 'savory' },
      { name: 'baking' },
      { name: 'grilling' },
      { name: 'pasta' },
      { name: 'soup' },
      { name: 'salad' }
    ]).returning();
    
    console.log('Created tags');
    
    // Create recipes
    const [recipe1] = await db.insert(schema.recipes).values({
      userId: user1.id,
      title: 'Classic Chocolate Chip Cookies',
      description: 'Delicious homemade chocolate chip cookies that are crispy on the outside and chewy on the inside.',
      cookingTime: 15,
      prepTime: 15,
      servingSize: 24,
      difficultyLevel: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Add ingredients to recipe1
    await db.insert(schema.ingredients).values([
      { recipeId: recipe1.id, name: 'All-purpose flour', quantity: 2.25, unit: 'cups', orderIndex: 1 },
      { recipeId: recipe1.id, name: 'Baking soda', quantity: 1, unit: 'tsp', orderIndex: 2 },
      { recipeId: recipe1.id, name: 'Salt', quantity: 1, unit: 'tsp', orderIndex: 3 },
      { recipeId: recipe1.id, name: 'Unsalted butter', quantity: 1, unit: 'cup', orderIndex: 4 },
      { recipeId: recipe1.id, name: 'Brown sugar', quantity: 0.75, unit: 'cup', orderIndex: 5 },
      { recipeId: recipe1.id, name: 'Granulated sugar', quantity: 0.75, unit: 'cup', orderIndex: 6 },
      { recipeId: recipe1.id, name: 'Vanilla extract', quantity: 1, unit: 'tsp', orderIndex: 7 },
      { recipeId: recipe1.id, name: 'Eggs', quantity: 2, unit: '', orderIndex: 8 },
      { recipeId: recipe1.id, name: 'Chocolate chips', quantity: 2, unit: 'cups', orderIndex: 9 }
    ]);
    
    // Add instructions to recipe1
    await db.insert(schema.instructions).values([
      { recipeId: recipe1.id, stepNumber: 1, description: 'Preheat oven to 375°F (190°C).' },
      { recipeId: recipe1.id, stepNumber: 2, description: 'In a small bowl, whisk together the flour, baking soda, and salt.' },
      { recipeId: recipe1.id, stepNumber: 3, description: 'In a large bowl, beat the butter, brown sugar, and granulated sugar until creamy.' },
      { recipeId: recipe1.id, stepNumber: 4, description: 'Add vanilla and eggs to the butter mixture, one at a time, beating well after each addition.' },
      { recipeId: recipe1.id, stepNumber: 5, description: 'Gradually add the flour mixture to the butter mixture and mix until just combined.' },
      { recipeId: recipe1.id, stepNumber: 6, description: 'Stir in the chocolate chips.' },
      { recipeId: recipe1.id, stepNumber: 7, description: 'Drop rounded tablespoons of dough onto ungreased baking sheets.' },
      { recipeId: recipe1.id, stepNumber: 8, description: 'Bake for 9-11 minutes or until golden brown.' },
      { recipeId: recipe1.id, stepNumber: 9, description: 'Cool on baking sheets for 2 minutes, then transfer to wire racks to cool completely.' }
    ]);
    
    // Add categories to recipe1
    await db.insert(schema.recipeCategories).values([
      { recipeId: recipe1.id, categoryId: categories.find(c => c.name === 'Dessert')!.id }
    ]);
    
    // Add tags to recipe1
    await db.insert(schema.recipeTags).values([
      { recipeId: recipe1.id, tagId: tags.find(t => t.name === 'sweet')!.id },
      { recipeId: recipe1.id, tagId: tags.find(t => t.name === 'baking')!.id }
    ]);
    
    const [recipe2] = await db.insert(schema.recipes).values({
      userId: user2.id,
      title: 'Simple Vegetable Stir Fry',
      description: 'A quick and healthy vegetable stir fry that\'s perfect for busy weeknights.',
      cookingTime: 10,
      prepTime: 15,
      servingSize: 4,
      difficultyLevel: 'easy',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Add ingredients to recipe2
    await db.insert(schema.ingredients).values([
      { recipeId: recipe2.id, name: 'Vegetable oil', quantity: 2, unit: 'tbsp', orderIndex: 1 },
      { recipeId: recipe2.id, name: 'Garlic', quantity: 3, unit: 'cloves', orderIndex: 2 },
      { recipeId: recipe2.id, name: 'Fresh ginger', quantity: 1, unit: 'tbsp', orderIndex: 3 },
      { recipeId: recipe2.id, name: 'Broccoli', quantity: 2, unit: 'cups', orderIndex: 4 },
      { recipeId: recipe2.id, name: 'Carrots', quantity: 2, unit: '', orderIndex: 5 },
      { recipeId: recipe2.id, name: 'Bell peppers', quantity: 2, unit: '', orderIndex: 6 },
      { recipeId: recipe2.id, name: 'Snap peas', quantity: 1, unit: 'cup', orderIndex: 7 },
      { recipeId: recipe2.id, name: 'Soy sauce', quantity: 3, unit: 'tbsp', orderIndex: 8 },
      { recipeId: recipe2.id, name: 'Sesame oil', quantity: 1, unit: 'tsp', orderIndex: 9 },
      { recipeId: recipe2.id, name: 'Red pepper flakes', quantity: 0.5, unit: 'tsp', orderIndex: 10 }
    ]);
    
    // Add instructions to recipe2
    await db.insert(schema.instructions).values([
      { recipeId: recipe2.id, stepNumber: 1, description: 'Prepare all vegetables: cut broccoli into florets, slice carrots, dice bell peppers, and trim snap peas.' },
      { recipeId: recipe2.id, stepNumber: 2, description: 'Heat vegetable oil in a large wok or skillet over high heat.' },
      { recipeId: recipe2.id, stepNumber: 3, description: 'Add garlic and ginger, stir-fry for 30 seconds until fragrant.' },
      { recipeId: recipe2.id, stepNumber: 4, description: 'Add broccoli and carrots, stir-fry for 2 minutes.' },
      { recipeId: recipe2.id, stepNumber: 5, description: 'Add bell peppers and snap peas, stir-fry for another 2 minutes.' },
      { recipeId: recipe2.id, stepNumber: 6, description: 'Add soy sauce, sesame oil, and red pepper flakes, toss to combine.' },
      { recipeId: recipe2.id, stepNumber: 7, description: 'Continue cooking for 1-2 minutes until vegetables are crisp-tender.' },
      { recipeId: recipe2.id, stepNumber: 8, description: 'Serve immediately over rice or noodles if desired.' }
    ]);
    
    // Add categories to recipe2
    await db.insert(schema.recipeCategories).values([
      { recipeId: recipe2.id, categoryId: categories.find(c => c.name === 'Dinner')!.id },
      { recipeId: recipe2.id, categoryId: categories.find(c => c.name === 'Vegetarian')!.id },
      { recipeId: recipe2.id, categoryId: categories.find(c => c.name === 'Quick & Easy')!.id }
    ]);
    
    // Add tags to recipe2
    await db.insert(schema.recipeTags).values([
      { recipeId: recipe2.id, tagId: tags.find(t => t.name === 'healthy')!.id },
      { recipeId: recipe2.id, tagId: tags.find(t => t.name === 'spicy')!.id }
    ]);
    
    console.log('Created recipes with ingredients, instructions, categories, and tags');
    
    // Add some likes
    await db.insert(schema.likes).values([
      { userId: user1.id, recipeId: recipe2.id, createdAt: new Date() },
      { userId: user2.id, recipeId: recipe1.id, createdAt: new Date() },
      { userId: admin.id, recipeId: recipe1.id, createdAt: new Date() },
      { userId: admin.id, recipeId: recipe2.id, createdAt: new Date() }
    ]);
    
    // Add some comments
    await db.insert(schema.comments).values([
      { 
        userId: user2.id, 
        recipeId: recipe1.id, 
        content: 'These cookies are amazing! I added some walnuts and they turned out great.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        userId: admin.id, 
        recipeId: recipe1.id, 
        content: 'Classic recipe, always a crowd-pleaser!',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        userId: user1.id, 
        recipeId: recipe2.id, 
        content: 'I made this for dinner last night and it was delicious. I added some tofu for protein.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    console.log('Added likes and comments');
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
