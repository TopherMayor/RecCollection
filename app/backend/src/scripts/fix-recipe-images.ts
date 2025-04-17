import { db } from '../db';
import { recipes } from '../db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function fixRecipeImages() {
  try {
    console.log('Fixing recipe images...');
    
    // Get all recipes
    const allRecipes = await db.select().from(recipes);
    console.log('Total recipes:', allRecipes.length);
    
    // Check the uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const files = fs.readdirSync(uploadsDir);
    console.log('Files in uploads directory:', files.length);
    
    // Find the Pork Sinigang recipe
    const porkSinigang = allRecipes.find(recipe => recipe.title === 'Pork Sinigang Recipe');
    if (porkSinigang) {
      console.log('Found Pork Sinigang recipe:', porkSinigang.id);
      
      // Update the recipe with the correct image path
      await db.update(recipes)
        .set({
          imageUrl: '/uploads/fc4b8f8b-d0fc-4d8f-9703-ee89d761ff81.jpg',
          thumbnailPath: '/uploads/fc4b8f8b-d0fc-4d8f-9703-ee89d761ff81.jpg',
          thumbnailUrl: null
        })
        .where(eq(recipes.id, porkSinigang.id));
      
      console.log('Updated Pork Sinigang recipe with correct image path');
    } else {
      console.log('Pork Sinigang recipe not found');
    }
    
    // Find the Simple Roasted Zucchini recipe
    const zucchini = allRecipes.find(recipe => recipe.title === 'Simple Roasted Zucchini');
    if (zucchini) {
      console.log('Found Simple Roasted Zucchini recipe:', zucchini.id);
      
      // Update with a different image
      await db.update(recipes)
        .set({
          imageUrl: '/uploads/placeholder-food.svg',
          thumbnailPath: '/uploads/placeholder-food.svg',
          thumbnailUrl: null
        })
        .where(eq(recipes.id, zucchini.id));
      
      console.log('Updated Simple Roasted Zucchini recipe with correct image path');
    } else {
      console.log('Simple Roasted Zucchini recipe not found');
    }
    
    // Get updated recipes
    const updatedRecipes = await db.select().from(recipes);
    updatedRecipes.forEach(recipe => {
      console.log(`\nRecipe ID: ${recipe.id}`);
      console.log(`Title: ${recipe.title}`);
      console.log(`Image URL: ${recipe.imageUrl || 'None'}`);
      console.log(`Thumbnail URL: ${recipe.thumbnailUrl || 'None'}`);
      console.log(`Thumbnail Path: ${recipe.thumbnailPath || 'None'}`);
    });
    
    console.log('\nRecipe images fixed successfully!');
  } catch (error) {
    console.error('Error fixing recipe images:', error);
  } finally {
    process.exit(0);
  }
}

fixRecipeImages();
