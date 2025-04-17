import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";
import "dotenv/config";

async function updateRecipeImage() {
  try {
    console.log("Updating recipe image...");
    
    // Update the recipe to use the placeholder image
    await db.execute(sql`
      UPDATE recipes 
      SET image_url = '/uploads/placeholder-food.svg', 
          thumbnail_path = '/uploads/placeholder-food.svg' 
      WHERE id = 1
    `);
    
    console.log("Updated recipe with placeholder image");
    
  } catch (error) {
    console.error("Error updating recipe image:", error);
  } finally {
    process.exit(0);
  }
}

updateRecipeImage();
