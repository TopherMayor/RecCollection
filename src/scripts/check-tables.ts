import { db } from "../db";
import { sql } from "drizzle-orm";
import "dotenv/config";

async function checkTables() {
  try {
    console.log("Checking database tables...");
    
    // Get list of all tables
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("Tables in database:");
    console.log(tables.rows);
    
    // Check if collections table exists
    const collectionsExists = tables.rows.some(
      (row: any) => row.table_name === "collections"
    );
    
    console.log(`Collections table exists: ${collectionsExists}`);
    
    // If collections table doesn't exist, we need to run migrations
    if (!collectionsExists) {
      console.log("Collections table doesn't exist. You need to run migrations.");
      console.log("Run: bun run db:migrate");
    }
    
    // Check recipe table structure
    const recipeColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'recipes'
    `);
    
    console.log("\nRecipe table columns:");
    console.log(recipeColumns.rows);
    
    // Check for specific recipe with ID 1
    const recipe = await db.execute(sql`
      SELECT id, title, image_url, thumbnail_path, thumbnail_url 
      FROM recipes 
      WHERE id = 1
    `);
    
    console.log("\nRecipe with ID 1:");
    console.log(recipe.rows);
    
    // Update the recipe to use the placeholder image
    if (recipe.rows.length > 0) {
      await db.execute(sql`
        UPDATE recipes 
        SET image_url = '/uploads/placeholder-food.svg', 
            thumbnail_path = '/uploads/placeholder-food.svg' 
        WHERE id = 1
      `);
      
      console.log("\nUpdated recipe with placeholder image");
    }
    
  } catch (error) {
    console.error("Error checking tables:", error);
  } finally {
    process.exit(0);
  }
}

checkTables();
