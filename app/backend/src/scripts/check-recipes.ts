import { db } from '../db';
import { recipes } from '../db/schema';
import { eq } from 'drizzle-orm';

async function checkRecipes() {
  try {
    console.log('Checking recipes table...');
    
    // Get all recipes
    const allRecipes = await db.select().from(recipes);
    console.log('Total recipes:', allRecipes.length);
    
    // Print each recipe with its image information
    allRecipes.forEach(recipe => {
      console.log(`\nRecipe ID: ${recipe.id}`);
      console.log(`Title: ${recipe.title}`);
      console.log(`Image URL: ${recipe.imageUrl || 'None'}`);
      console.log(`Thumbnail URL: ${recipe.thumbnailUrl || 'None'}`);
      console.log(`Thumbnail Path: ${recipe.thumbnailPath || 'None'}`);
    });
    
    // Get specific recipes by ID
    const recipe1 = await db.select().from(recipes).where(eq(recipes.id, 1));
    if (recipe1.length > 0) {
      console.log('\n--- Recipe ID 1 Details ---');
      console.log(JSON.stringify(recipe1[0], null, 2));
    }
    
    // Check for Pork Sinigang recipe
    const porkSinigang = await db.select().from(recipes).where(eq(recipes.title, 'Pork Sinigang Recipe'));
    if (porkSinigang.length > 0) {
      console.log('\n--- Pork Sinigang Recipe Details ---');
      console.log(JSON.stringify(porkSinigang[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error checking recipes:', error);
  } finally {
    process.exit(0);
  }
}

checkRecipes();
