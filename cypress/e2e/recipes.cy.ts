describe('Recipe Management', () => {
  beforeEach(() => {
    cy.fixture('users').as('users');
    cy.fixture('recipes').as('recipes');
  });

  it('should allow creating a new recipe', function() {
    const { testUser } = this.users;
    const { basicRecipe } = this.recipes;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Create recipe
    cy.createRecipe(basicRecipe);
    
    // Verify recipe was created successfully
    cy.url().should('include', '/recipes/');
    cy.get('h1').should('contain', basicRecipe.title);
    cy.get('[data-testid="recipe-description"]').should('contain', basicRecipe.description);
    
    // Verify ingredients are displayed
    basicRecipe.ingredients.forEach(ingredient => {
      cy.get('[data-testid="ingredients-list"]').should('contain', ingredient.name);
    });
    
    // Verify instructions are displayed
    basicRecipe.instructions.forEach((instruction, index) => {
      cy.get('[data-testid="instructions-list"]').should('contain', `${index + 1}.`);
      cy.get('[data-testid="instructions-list"]').should('contain', instruction.description);
    });
  });

  it('should allow viewing recipe details', function() {
    // Navigate to recipes page
    cy.visit('/recipes');
    
    // Click on the first recipe
    cy.get('[data-testid="recipe-card"]').first().click();
    
    // Verify recipe details page is displayed
    cy.url().should('include', '/recipes/');
    cy.get('h1').should('exist');
    cy.get('[data-testid="recipe-details"]').should('exist');
    cy.get('[data-testid="ingredients-list"]').should('exist');
    cy.get('[data-testid="instructions-list"]').should('exist');
  });

  it('should allow searching for recipes', function() {
    // Navigate to recipes page
    cy.visit('/recipes');
    
    // Search for a recipe
    cy.searchRecipes({
      search: 'pasta'
    });
    
    // Verify search results
    cy.url().should('include', 'search=pasta');
    
    // Check if results contain the search term
    cy.get('[data-testid="recipe-list"]').then($list => {
      if ($list.find('[data-testid="recipe-card"]').length > 0) {
        cy.get('[data-testid="recipe-card"]').should('exist');
      } else {
        cy.get('[data-testid="empty-state"]').should('exist');
      }
    });
  });

  it('should allow filtering recipes by category', function() {
    // Navigate to recipes page
    cy.visit('/recipes');
    
    // Get the first category
    cy.get('[data-testid="category-item"]').first().then($category => {
      const categoryName = $category.text().trim();
      const categoryId = $category.attr('data-category-id');
      
      // Click on the category
      cy.wrap($category).click();
      
      // Verify URL contains category filter
      cy.url().should('include', `categoryId=${categoryId}`);
      
      // Check if results are filtered
      cy.get('[data-testid="recipe-list"]').then($list => {
        if ($list.find('[data-testid="recipe-card"]').length > 0) {
          cy.get('[data-testid="recipe-card"]').should('exist');
        } else {
          cy.get('[data-testid="empty-state"]').should('exist');
        }
      });
    });
  });

  it('should allow filtering recipes by tag', function() {
    // Navigate to recipes page
    cy.visit('/recipes');
    
    // Get the first tag
    cy.get('[data-testid="tag-item"]').first().then($tag => {
      const tagName = $tag.text().trim().replace('#', '');
      
      // Click on the tag
      cy.wrap($tag).click();
      
      // Verify URL contains tag filter
      cy.url().should('include', `tag=${tagName}`);
      
      // Check if results are filtered
      cy.get('[data-testid="recipe-list"]').then($list => {
        if ($list.find('[data-testid="recipe-card"]').length > 0) {
          cy.get('[data-testid="recipe-card"]').should('exist');
        } else {
          cy.get('[data-testid="empty-state"]').should('exist');
        }
      });
    });
  });

  it('should allow liking and saving recipes', function() {
    const { testUser } = this.users;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to recipes page
    cy.visit('/recipes');
    
    // Get the first recipe
    cy.get('[data-testid="recipe-card"]').first().within(() => {
      // Like the recipe
      cy.get('[data-testid="like-button"]').click();
      
      // Verify like button is active
      cy.get('[data-testid="like-button"]').should('have.class', 'active');
      
      // Save the recipe
      cy.get('[data-testid="save-button"]').click();
      
      // Verify save button is active
      cy.get('[data-testid="save-button"]').should('have.class', 'active');
    });
    
    // Navigate to profile to check saved recipes
    cy.visit('/profile');
    
    // Verify recipe is in saved recipes
    cy.get('[data-testid="saved-recipe-list"]').should('exist');
    cy.get('[data-testid="saved-recipe-item"]').should('exist');
  });

  it('should allow editing own recipes', function() {
    const { testUser } = this.users;
    const { basicRecipe } = this.recipes;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Create a recipe first
    cy.createRecipe(basicRecipe);
    
    // Get the recipe ID from URL
    cy.url().then(url => {
      const recipeId = url.split('/').pop();
      
      // Navigate to edit page
      cy.visit(`/recipes/${recipeId}/edit`);
      
      // Update recipe title
      const updatedTitle = `${basicRecipe.title} (Updated)`;
      cy.get('input[name="title"]').clear().type(updatedTitle);
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Verify recipe was updated successfully
      cy.url().should('include', `/recipes/${recipeId}`);
      cy.get('h1').should('contain', updatedTitle);
    });
  });

  it('should allow deleting own recipes', function() {
    const { testUser } = this.users;
    const { basicRecipe } = this.recipes;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to profile
    cy.visit('/profile');
    
    // Get the first recipe
    cy.get('[data-testid="user-recipe-list"]').then($list => {
      if ($list.find('[data-testid="recipe-item"]').length > 0) {
        // Click delete button
        cy.get('[data-testid="delete-button"]').first().click();
        
        // Confirm deletion
        cy.get('[data-testid="confirm-dialog"]').within(() => {
          cy.get('button').contains('Delete').click();
        });
        
        // Verify success message
        cy.get('[data-testid="toast"]').should('contain', 'Recipe deleted successfully');
      } else {
        // Create a recipe first
        cy.createRecipe(basicRecipe);
        
        // Navigate back to profile
        cy.visit('/profile');
        
        // Click delete button
        cy.get('[data-testid="delete-button"]').first().click();
        
        // Confirm deletion
        cy.get('[data-testid="confirm-dialog"]').within(() => {
          cy.get('button').contains('Delete').click();
        });
        
        // Verify success message
        cy.get('[data-testid="toast"]').should('contain', 'Recipe deleted successfully');
      }
    });
  });
});
