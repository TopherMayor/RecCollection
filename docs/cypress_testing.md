# Cypress End-to-End Testing Strategy

## Overview

This document outlines the end-to-end testing strategy for the RecCollection application using Cypress. It covers the approach to testing, the organization of tests, and examples of how to write effective Cypress tests.

## Testing Approach

### End-to-End Testing with Cypress

End-to-end tests verify complete user flows from start to finish. We use Cypress for end-to-end testing because it provides:

- A powerful, easy-to-use API for browser automation
- Real-time reloading during test development
- Time-travel debugging with snapshots
- Network traffic control and stubbing
- Consistent, reliable test execution

### Test Organization

Our Cypress tests are organized by feature area:

```
cypress/
  e2e/
    auth.cy.ts       # Authentication tests
    profile.cy.ts    # Profile management tests
    recipes.cy.ts    # Recipe management tests
    import.cy.ts     # Recipe import tests
  fixtures/
    users.json       # User test data
    recipes.json     # Recipe test data
  support/
    commands.ts      # Custom Cypress commands
    e2e.ts           # Global configuration
```

### Custom Commands

We've created custom Cypress commands to simplify common operations:

- `cy.login(email, password)`: Log in a user
- `cy.createRecipe(recipeData)`: Create a new recipe
- `cy.searchRecipes(searchParams)`: Search for recipes with filters

## Key User Flows Tested

### Authentication

- User registration with valid/invalid data
- Login with correct/incorrect credentials
- Logout functionality
- Protected route access and redirection

### Profile Management

- Viewing profile information
- Editing profile details
- Viewing user statistics
- Managing user recipes
- Accessing saved recipes

### Recipe Management

- Creating new recipes
- Viewing recipe details
- Searching and filtering recipes
- Liking and saving recipes
- Editing and deleting recipes

### Recipe Import

- Importing recipes from Instagram
- Importing recipes from TikTok
- Handling import errors
- Validating imported data

## Test Examples

### Authentication Test Example

```typescript
describe('Authentication', () => {
  beforeEach(() => {
    cy.fixture('users').as('users');
  });

  it('should allow a user to login', function() {
    const { testUser } = this.users;
    
    cy.visit('/login');
    
    // Fill out login form
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Verify successful login
    cy.url().should('not.include', '/login');
    cy.get('[data-testid="user-menu"]').should('exist');
  });
});
```

### Recipe Creation Test Example

```typescript
describe('Recipe Creation', () => {
  beforeEach(() => {
    cy.fixture('users').as('users');
    cy.fixture('recipes').as('recipes');
  });

  it('should allow creating a new recipe', function() {
    const { testUser } = this.users;
    const { basicRecipe } = this.recipes;
    
    // Login using custom command
    cy.login(testUser.email, testUser.password);
    
    // Navigate to recipe creation
    cy.visit('/recipes/create');
    
    // Fill recipe form
    cy.get('input[name="title"]').type(basicRecipe.title);
    cy.get('textarea[name="description"]').type(basicRecipe.description);
    cy.get('input[name="prepTime"]').type(basicRecipe.prepTime.toString());
    cy.get('input[name="cookingTime"]').type(basicRecipe.cookingTime.toString());
    cy.get('select[name="difficultyLevel"]').select(basicRecipe.difficultyLevel);
    
    // Add ingredients
    basicRecipe.ingredients.forEach((ingredient, index) => {
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
    basicRecipe.instructions.forEach((instruction, index) => {
      if (index > 0) {
        cy.get('[data-testid="add-instruction"]').click();
      }
      cy.get(`textarea[name="instructions[${index}].description"]`).type(instruction.description);
    });
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Verify success
    cy.url().should('include', '/recipes/');
    cy.get('h1').should('contain', basicRecipe.title);
  });
});
```

### Recipe Search Test Example

```typescript
describe('Recipe Search', () => {
  it('should allow searching for recipes', () => {
    // Navigate to recipes page
    cy.visit('/recipes');
    
    // Search for a recipe
    cy.get('input[name="search"]').type('pasta');
    cy.get('button').contains('Search').click();
    
    // Verify URL contains search parameter
    cy.url().should('include', 'search=pasta');
    
    // Verify search results
    cy.get('[data-testid="recipe-list"]').should('exist');
  });
  
  it('should allow filtering by category', () => {
    // Navigate to recipes page
    cy.visit('/recipes');
    
    // Select a category
    cy.get('select[name="category"]').select('Dinner');
    cy.get('button').contains('Search').click();
    
    // Verify URL contains category parameter
    cy.url().should('include', 'categoryId=');
    
    // Verify filtered results
    cy.get('[data-testid="recipe-list"]').should('exist');
  });
});
```

## Best Practices

### Writing Effective Tests

1. **Test Real User Flows**: Focus on testing complete user journeys rather than implementation details.
2. **Use Custom Commands**: Create custom commands for common operations to keep tests DRY.
3. **Use Fixtures**: Store test data in fixtures to make tests more maintainable.
4. **Avoid Flaky Tests**: Use proper waiting strategies and avoid timing-dependent tests.
5. **Test Error States**: Test both happy paths and error cases.

### Test Data Management

1. **Use Fixtures**: Store test data in JSON fixtures.
2. **Generate Dynamic Data**: Use functions to generate unique data for tests.
3. **Clean Up After Tests**: Reset application state between tests.

### Test Performance

1. **Group Related Tests**: Use `describe` blocks to group related tests.
2. **Optimize Test Speed**: Use `beforeEach` hooks to set up common state.
3. **Avoid Unnecessary Waits**: Use Cypress's automatic waiting instead of explicit waits.

## Running Tests

```bash
# Open Cypress Test Runner
bun run cypress:open

# Run Cypress tests headlessly
bun run cypress:run

# Start dev server and run tests
bun run e2e

# Start dev server and open Cypress
bun run e2e:open
```

## Conclusion

This Cypress testing strategy provides a comprehensive approach to end-to-end testing for the RecCollection application. By implementing tests for all key user flows, we can ensure the application works correctly from a user's perspective and catch regressions before they reach production.
