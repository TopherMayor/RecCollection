import { db, schema } from "../db";

async function main() {
  try {
    console.log("Starting to add sample recipes...");

    // Get the first user from the database to use as the recipe creator
    const users = await db.select().from(schema.users).limit(1);
    if (users.length === 0) {
      throw new Error("No users found in the database. Please run the seed script first.");
    }
    const userId = users[0].id;
    console.log(`Using user ID ${userId} as the recipe creator`);

    // Create categories if they don't exist
    const categories = [
      { name: "Breakfast", description: "Morning meals" },
      { name: "Lunch", description: "Midday meals" },
      { name: "Dinner", description: "Evening meals" },
      { name: "Dessert", description: "Sweet treats" },
      { name: "Appetizer", description: "Starters" },
      { name: "Snack", description: "Light bites" }
    ];

    for (const category of categories) {
      // Check if category exists
      const existingCategory = await db
        .select()
        .from(schema.categories)
        .where(schema.categories.name === category.name)
        .limit(1);
      
      if (existingCategory.length === 0) {
        await db.insert(schema.categories).values(category);
        console.log(`Created category: ${category.name}`);
      }
    }

    // Create tags if they don't exist
    const tags = [
      { name: "healthy" },
      { name: "comfort-food" },
      { name: "spicy" },
      { name: "sweet" },
      { name: "savory" },
      { name: "baking" },
      { name: "grilling" },
      { name: "pasta" },
      { name: "soup" },
      { name: "salad" },
      { name: "quick" },
      { name: "vegetarian" },
      { name: "vegan" },
      { name: "gluten-free" },
      { name: "dairy-free" }
    ];

    for (const tag of tags) {
      // Check if tag exists
      const existingTag = await db
        .select()
        .from(schema.tags)
        .where(schema.tags.name === tag.name)
        .limit(1);
      
      if (existingTag.length === 0) {
        await db.insert(schema.tags).values(tag);
        console.log(`Created tag: ${tag.name}`);
      }
    }

    // Get all categories and tags for reference
    const allCategories = await db.select().from(schema.categories);
    const allTags = await db.select().from(schema.tags);

    // Helper function to get category ID by name
    const getCategoryId = (name: string) => {
      const category = allCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (!category) throw new Error(`Category ${name} not found`);
      return category.id;
    };

    // Helper function to get tag ID by name
    const getTagId = (name: string) => {
      const tag = allTags.find(t => t.name.toLowerCase() === name.toLowerCase());
      if (!tag) throw new Error(`Tag ${name} not found`);
      return tag.id;
    };

    // Recipe 1: Homemade Pizza
    const [recipe1] = await db.insert(schema.recipes).values({
      userId,
      title: "Homemade Pizza",
      description: "A delicious homemade pizza with a crispy crust and your favorite toppings.",
      cookingTime: 20,
      prepTime: 30,
      servingSize: 4,
      difficultyLevel: "medium",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      isPrivate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log(`Created recipe: ${recipe1.title} with ID ${recipe1.id}`);

    // Add ingredients for recipe 1
    await db.insert(schema.ingredients).values([
      { recipeId: recipe1.id, name: "Pizza dough", quantity: 1, unit: "ball", orderIndex: 1 },
      { recipeId: recipe1.id, name: "Tomato sauce", quantity: 0.5, unit: "cup", orderIndex: 2 },
      { recipeId: recipe1.id, name: "Mozzarella cheese", quantity: 2, unit: "cups", orderIndex: 3 },
      { recipeId: recipe1.id, name: "Pepperoni", quantity: 20, unit: "slices", orderIndex: 4, notes: "Optional" },
      { recipeId: recipe1.id, name: "Bell peppers", quantity: 1, unit: "", orderIndex: 5, notes: "Sliced" },
      { recipeId: recipe1.id, name: "Olive oil", quantity: 1, unit: "tbsp", orderIndex: 6 },
      { recipeId: recipe1.id, name: "Italian seasoning", quantity: 1, unit: "tsp", orderIndex: 7 }
    ]);

    // Add instructions for recipe 1
    await db.insert(schema.instructions).values([
      { recipeId: recipe1.id, stepNumber: 1, description: "Preheat oven to 475°F (245°C)." },
      { recipeId: recipe1.id, stepNumber: 2, description: "Roll out the pizza dough on a floured surface to your desired thickness." },
      { recipeId: recipe1.id, stepNumber: 3, description: "Transfer the dough to a pizza stone or baking sheet." },
      { recipeId: recipe1.id, stepNumber: 4, description: "Spread tomato sauce evenly over the dough, leaving a small border for the crust." },
      { recipeId: recipe1.id, stepNumber: 5, description: "Sprinkle mozzarella cheese over the sauce." },
      { recipeId: recipe1.id, stepNumber: 6, description: "Add pepperoni, bell peppers, and any other toppings you like." },
      { recipeId: recipe1.id, stepNumber: 7, description: "Drizzle with olive oil and sprinkle with Italian seasoning." },
      { recipeId: recipe1.id, stepNumber: 8, description: "Bake for 12-15 minutes or until the crust is golden and the cheese is bubbly." },
      { recipeId: recipe1.id, stepNumber: 9, description: "Let cool for a few minutes before slicing and serving." }
    ]);

    // Add categories for recipe 1
    await db.insert(schema.recipeCategories).values([
      { recipeId: recipe1.id, categoryId: getCategoryId("Dinner") }
    ]);

    // Add tags for recipe 1
    await db.insert(schema.recipeTags).values([
      { recipeId: recipe1.id, tagId: getTagId("comfort-food") },
      { recipeId: recipe1.id, tagId: getTagId("baking") }
    ]);

    // Recipe 2: Chicken Stir Fry
    const [recipe2] = await db.insert(schema.recipes).values({
      userId,
      title: "Chicken Stir Fry",
      description: "A quick and healthy chicken stir fry with colorful vegetables and a savory sauce.",
      cookingTime: 15,
      prepTime: 15,
      servingSize: 4,
      difficultyLevel: "easy",
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      isPrivate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log(`Created recipe: ${recipe2.title} with ID ${recipe2.id}`);

    // Add ingredients for recipe 2
    await db.insert(schema.ingredients).values([
      { recipeId: recipe2.id, name: "Chicken breast", quantity: 1, unit: "lb", orderIndex: 1, notes: "Sliced into thin strips" },
      { recipeId: recipe2.id, name: "Broccoli", quantity: 2, unit: "cups", orderIndex: 2, notes: "Cut into florets" },
      { recipeId: recipe2.id, name: "Carrots", quantity: 2, unit: "", orderIndex: 3, notes: "Julienned" },
      { recipeId: recipe2.id, name: "Bell peppers", quantity: 1, unit: "", orderIndex: 4, notes: "Sliced" },
      { recipeId: recipe2.id, name: "Soy sauce", quantity: 3, unit: "tbsp", orderIndex: 5 },
      { recipeId: recipe2.id, name: "Garlic", quantity: 3, unit: "cloves", orderIndex: 6, notes: "Minced" },
      { recipeId: recipe2.id, name: "Ginger", quantity: 1, unit: "tbsp", orderIndex: 7, notes: "Grated" },
      { recipeId: recipe2.id, name: "Vegetable oil", quantity: 2, unit: "tbsp", orderIndex: 8 },
      { recipeId: recipe2.id, name: "Cornstarch", quantity: 1, unit: "tbsp", orderIndex: 9 },
      { recipeId: recipe2.id, name: "Water", quantity: 0.25, unit: "cup", orderIndex: 10 }
    ]);

    // Add instructions for recipe 2
    await db.insert(schema.instructions).values([
      { recipeId: recipe2.id, stepNumber: 1, description: "In a small bowl, mix soy sauce, cornstarch, and water. Set aside." },
      { recipeId: recipe2.id, stepNumber: 2, description: "Heat oil in a large wok or skillet over high heat." },
      { recipeId: recipe2.id, stepNumber: 3, description: "Add chicken and stir-fry until no longer pink, about 5 minutes." },
      { recipeId: recipe2.id, stepNumber: 4, description: "Add garlic and ginger, stir-fry for 30 seconds until fragrant." },
      { recipeId: recipe2.id, stepNumber: 5, description: "Add broccoli, carrots, and bell peppers. Stir-fry for 3-4 minutes until vegetables are crisp-tender." },
      { recipeId: recipe2.id, stepNumber: 6, description: "Pour the sauce over the chicken and vegetables, stirring constantly until the sauce thickens, about 1-2 minutes." },
      { recipeId: recipe2.id, stepNumber: 7, description: "Serve hot over rice or noodles." }
    ]);

    // Add categories for recipe 2
    await db.insert(schema.recipeCategories).values([
      { recipeId: recipe2.id, categoryId: getCategoryId("Dinner") }
    ]);

    // Add tags for recipe 2
    await db.insert(schema.recipeTags).values([
      { recipeId: recipe2.id, tagId: getTagId("healthy") },
      { recipeId: recipe2.id, tagId: getTagId("quick") },
      { recipeId: recipe2.id, tagId: getTagId("spicy") }
    ]);

    // Recipe 3: Chocolate Chip Cookies
    const [recipe3] = await db.insert(schema.recipes).values({
      userId,
      title: "Chocolate Chip Cookies",
      description: "Classic homemade chocolate chip cookies that are crispy on the edges and chewy in the middle.",
      cookingTime: 12,
      prepTime: 15,
      servingSize: 24,
      difficultyLevel: "easy",
      imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      isPrivate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log(`Created recipe: ${recipe3.title} with ID ${recipe3.id}`);

    // Add ingredients for recipe 3
    await db.insert(schema.ingredients).values([
      { recipeId: recipe3.id, name: "All-purpose flour", quantity: 2.25, unit: "cups", orderIndex: 1 },
      { recipeId: recipe3.id, name: "Baking soda", quantity: 1, unit: "tsp", orderIndex: 2 },
      { recipeId: recipe3.id, name: "Salt", quantity: 1, unit: "tsp", orderIndex: 3 },
      { recipeId: recipe3.id, name: "Unsalted butter", quantity: 1, unit: "cup", orderIndex: 4, notes: "Softened" },
      { recipeId: recipe3.id, name: "Brown sugar", quantity: 0.75, unit: "cup", orderIndex: 5, notes: "Packed" },
      { recipeId: recipe3.id, name: "Granulated sugar", quantity: 0.75, unit: "cup", orderIndex: 6 },
      { recipeId: recipe3.id, name: "Vanilla extract", quantity: 1, unit: "tsp", orderIndex: 7 },
      { recipeId: recipe3.id, name: "Eggs", quantity: 2, unit: "", orderIndex: 8, notes: "Large" },
      { recipeId: recipe3.id, name: "Chocolate chips", quantity: 2, unit: "cups", orderIndex: 9 }
    ]);

    // Add instructions for recipe 3
    await db.insert(schema.instructions).values([
      { recipeId: recipe3.id, stepNumber: 1, description: "Preheat oven to 375°F (190°C). Line baking sheets with parchment paper." },
      { recipeId: recipe3.id, stepNumber: 2, description: "In a small bowl, whisk together flour, baking soda, and salt. Set aside." },
      { recipeId: recipe3.id, stepNumber: 3, description: "In a large bowl, cream together butter, brown sugar, and granulated sugar until light and fluffy." },
      { recipeId: recipe3.id, stepNumber: 4, description: "Beat in vanilla and eggs, one at a time, until well incorporated." },
      { recipeId: recipe3.id, stepNumber: 5, description: "Gradually add the flour mixture to the wet ingredients, mixing just until combined." },
      { recipeId: recipe3.id, stepNumber: 6, description: "Fold in chocolate chips." },
      { recipeId: recipe3.id, stepNumber: 7, description: "Drop rounded tablespoons of dough onto the prepared baking sheets, spacing them about 2 inches apart." },
      { recipeId: recipe3.id, stepNumber: 8, description: "Bake for 9-11 minutes or until golden brown around the edges but still soft in the center." },
      { recipeId: recipe3.id, stepNumber: 9, description: "Allow cookies to cool on the baking sheet for 5 minutes before transferring to a wire rack to cool completely." }
    ]);

    // Add categories for recipe 3
    await db.insert(schema.recipeCategories).values([
      { recipeId: recipe3.id, categoryId: getCategoryId("Dessert") }
    ]);

    // Add tags for recipe 3
    await db.insert(schema.recipeTags).values([
      { recipeId: recipe3.id, tagId: getTagId("sweet") },
      { recipeId: recipe3.id, tagId: getTagId("baking") },
      { recipeId: recipe3.id, tagId: getTagId("comfort-food") }
    ]);

    console.log("Successfully added sample recipes!");
  } catch (error) {
    console.error("Error adding sample recipes:", error);
  } finally {
    process.exit(0);
  }
}

main();
