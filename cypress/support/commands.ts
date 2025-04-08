// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
  cy.get('[data-testid="user-menu"]').should('exist');
});

// -- Create a recipe command --
Cypress.Commands.add('createRecipe', (recipe: {
  title: string;
  description?: string;
  prepTime?: number;
  cookingTime?: number;
  servingSize?: number;
  difficultyLevel?: string;
  ingredients: { name: string; quantity?: number; unit?: string }[];
  instructions: { description: string }[];
  categories?: string[];
  tags?: string[];
}) => {
  cy.visit('/recipes/create');
  
  // Fill basic info
  cy.get('input[name="title"]').type(recipe.title);
  if (recipe.description) {
    cy.get('textarea[name="description"]').type(recipe.description);
  }
  if (recipe.prepTime) {
    cy.get('input[name="prepTime"]').type(recipe.prepTime.toString());
  }
  if (recipe.cookingTime) {
    cy.get('input[name="cookingTime"]').type(recipe.cookingTime.toString());
  }
  if (recipe.servingSize) {
    cy.get('input[name="servingSize"]').type(recipe.servingSize.toString());
  }
  if (recipe.difficultyLevel) {
    cy.get('select[name="difficultyLevel"]').select(recipe.difficultyLevel);
  }
  
  // Add ingredients
  recipe.ingredients.forEach((ingredient, index) => {
    if (index > 0) {
      cy.get('[data-testid="add-ingredient"]').click();
    }
    cy.get(`input[name="ingredients[${index}].name"]`).type(ingredient.name);
    if (ingredient.quantity) {
      cy.get(`input[name="ingredients[${index}].quantity"]`).type(ingredient.quantity.toString());
    }
    if (ingredient.unit) {
      cy.get(`input[name="ingredients[${index}].unit"]`).type(ingredient.unit);
    }
  });
  
  // Add instructions
  recipe.instructions.forEach((instruction, index) => {
    if (index > 0) {
      cy.get('[data-testid="add-instruction"]').click();
    }
    cy.get(`textarea[name="instructions[${index}].description"]`).type(instruction.description);
  });
  
  // Add categories and tags
  if (recipe.categories && recipe.categories.length > 0) {
    cy.get('[data-testid="categories-select"]').click();
    recipe.categories.forEach(category => {
      cy.get('[data-testid="categories-select-option"]').contains(category).click();
    });
    cy.get('body').click(); // Close dropdown
  }
  
  if (recipe.tags && recipe.tags.length > 0) {
    cy.get('input[name="tags"]').type(recipe.tags.join(', '));
  }
  
  // Submit form
  cy.get('button[type="submit"]').click();
  
  // Verify success
  cy.url().should('include', '/recipes/');
  cy.get('h1').should('contain', recipe.title);
});

// -- Search recipes command --
Cypress.Commands.add('searchRecipes', (params: {
  search?: string;
  category?: string;
  tag?: string;
  difficulty?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  cy.visit('/recipes');
  
  if (params.search) {
    cy.get('input[name="search"]').type(params.search);
  }
  
  if (params.category) {
    cy.get('select[name="category"]').select(params.category);
  }
  
  if (params.tag) {
    cy.get('select[name="tag"]').select(params.tag);
  }
  
  if (params.difficulty) {
    cy.get('select[name="difficulty"]').select(params.difficulty);
  }
  
  if (params.sortBy) {
    cy.get('select[name="sort"]').select(params.sortBy);
  }
  
  if (params.sortOrder) {
    cy.get('select[name="order"]').select(params.sortOrder);
  }
  
  cy.get('button').contains('Search').click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createRecipe(recipe: {
        title: string;
        description?: string;
        prepTime?: number;
        cookingTime?: number;
        servingSize?: number;
        difficultyLevel?: string;
        ingredients: { name: string; quantity?: number; unit?: string }[];
        instructions: { description: string }[];
        categories?: string[];
        tags?: string[];
      }): Chainable<void>;
      searchRecipes(params: {
        search?: string;
        category?: string;
        tag?: string;
        difficulty?: string;
        sortBy?: string;
        sortOrder?: string;
      }): Chainable<void>;
    }
  }
}
