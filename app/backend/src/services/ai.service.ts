import { db, schema } from "../db/index.ts";
import { HTTPException } from "hono/http-exception";

// Mock AI service for development
// In production, this would be replaced with a real AI service like OpenAI
export class AIService {
  // Generate a recipe name based on ingredients and instructions
  async generateRecipeName(
    userId: number,
    ingredients: string[],
    instructions: string[],
    category?: string
  ): Promise<string> {
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll use a simple algorithm to generate a name

      // Get the main ingredients (first 3)
      const mainIngredients = ingredients.slice(0, 3).map((i) => i.trim());

      // Generate a basic name
      let name = "";

      if (category) {
        name += `${this.capitalizeFirstLetter(category)} `;
      }

      // Add main ingredients to the name
      if (mainIngredients.length === 1) {
        name += mainIngredients[0];
      } else if (mainIngredients.length === 2) {
        name += `${mainIngredients[0]} and ${mainIngredients[1]}`;
      } else {
        name += `${mainIngredients[0]}, ${mainIngredients[1]}, and ${mainIngredients[2]}`;
      }

      // Add a cooking method if we can detect one from instructions
      const cookingMethods = [
        "Grilled",
        "Baked",
        "Roasted",
        "Fried",
        "Sautéed",
        "Steamed",
        "Boiled",
      ];

      for (const method of cookingMethods) {
        const lowerMethod = method.toLowerCase();
        if (instructions.some((i) => i.toLowerCase().includes(lowerMethod))) {
          name = `${method} ${name}`;
          break;
        }
      }

      // Store the generation in the database
      await db.insert(schema.aiGenerations).values({
        userId,
        generationType: "name",
        inputData: JSON.stringify({ ingredients, instructions, category }),
        outputContent: name,
        createdAt: new Date(),
      });

      return name;
    } catch (error) {
      console.error("Error generating recipe name:", error);
      throw new HTTPException(500, {
        message: "Failed to generate recipe name",
      });
    }
  }

  // Generate a recipe description based on name, ingredients, and instructions
  async generateRecipeDescription(
    userId: number,
    name: string,
    ingredients: string[],
    instructions: string[],
    category?: string
  ): Promise<string> {
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll use a simple template to generate a description

      // Get the main ingredients (first 3)
      const mainIngredients = ingredients.slice(0, 3).map((i) => i.trim());

      // Generate a basic description
      let description = `This ${
        category ? category.toLowerCase() + " " : ""
      }recipe features `;

      // Add main ingredients to the description
      if (mainIngredients.length === 1) {
        description += `${mainIngredients[0]}`;
      } else if (mainIngredients.length === 2) {
        description += `${mainIngredients[0]} and ${mainIngredients[1]}`;
      } else {
        description += `${mainIngredients[0]}, ${mainIngredients[1]}, and ${mainIngredients[2]}`;
      }

      // Add a cooking method if we can detect one from instructions
      const cookingMethods = [
        "grill",
        "bake",
        "roast",
        "fry",
        "sauté",
        "steam",
        "boil",
      ];
      let method = "";

      for (const m of cookingMethods) {
        if (instructions.some((i) => i.toLowerCase().includes(m))) {
          method = m;
          break;
        }
      }

      if (method) {
        description += ` that are ${method}ed to perfection`;
      }

      // Add a generic ending
      description += ". Perfect for a delicious meal that everyone will enjoy!";

      // Store the generation in the database
      await db.insert(schema.aiGenerations).values({
        userId,
        generationType: "description",
        inputData: JSON.stringify({
          name,
          ingredients,
          instructions,
          category,
        }),
        outputContent: description,
        createdAt: new Date(),
      });

      return description;
    } catch (error) {
      console.error("Error generating recipe description:", error);
      throw new HTTPException(500, {
        message: "Failed to generate recipe description",
      });
    }
  }

  // Helper method to capitalize the first letter of a string
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
}
