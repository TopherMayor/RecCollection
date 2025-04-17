import { db } from "../db";
import { sql } from "drizzle-orm";
import "dotenv/config";

async function updateRecipeImage() {
  try {
    console.log("Updating recipe image...");

    // Check for specific recipe with ID 1
    const recipe = await db.execute(sql`
      SELECT id, title, image_url, thumbnail_path, thumbnail_url
      FROM recipes
      WHERE id = 1
    `);

    console.log("Recipe with ID 1:");
    console.log(recipe);

    // Update the recipe to use the placeholder image
    if (recipe && recipe[0]) {
      await db.execute(sql`
        UPDATE recipes
        SET image_url = '/uploads/placeholder-food.svg',
            thumbnail_path = '/uploads/placeholder-food.svg'
        WHERE id = 1
      `);

      console.log("Updated recipe with placeholder image");

      // Verify the update
      const updatedRecipe = await db.execute(sql`
        SELECT id, title, image_url, thumbnail_path, thumbnail_url
        FROM recipes
        WHERE id = 1
      `);

      console.log("Updated recipe data:");
      console.log(updatedRecipe.rows);
    } else {
      console.log("Recipe with ID 1 not found");
    }
  } catch (error) {
    console.error("Error updating recipe image:", error);
  } finally {
    process.exit(0);
  }
}

updateRecipeImage();
