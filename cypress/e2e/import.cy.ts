describe('Recipe Import', () => {
  beforeEach(() => {
    cy.fixture('users').as('users');
  });

  it('should require login to access import page', function() {
    // Try to access import page without login
    cy.visit('/import');
    
    // Verify redirect to login
    cy.url().should('include', '/login');
  });

  it('should allow importing recipes from Instagram', function() {
    const { testUser } = this.users;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to import page
    cy.visit('/import');
    
    // Verify import page is displayed
    cy.get('h1').contains('Import Recipe').should('be.visible');
    
    // Select Instagram as source
    cy.get('input[name="source"][value="instagram"]').check();
    
    // Enter Instagram URL
    cy.get('input[name="url"]').type('https://www.instagram.com/p/example123/');
    
    // Intercept API call
    cy.intercept('POST', '/api/import/instagram', {
      statusCode: 200,
      body: {
        recipe: {
          id: 999,
          title: 'Imported Instagram Recipe',
          description: 'This recipe was imported from Instagram'
        }
      }
    }).as('importRecipe');
    
    // Submit form
    cy.get('button').contains('Import Recipe').click();
    
    // Wait for API call
    cy.wait('@importRecipe');
    
    // Verify success message
    cy.get('[data-testid="toast"]').should('contain', 'Recipe imported successfully');
    
    // Verify redirect to recipe page
    cy.url().should('include', '/recipes/999');
  });

  it('should allow importing recipes from TikTok', function() {
    const { testUser } = this.users;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to import page
    cy.visit('/import');
    
    // Verify import page is displayed
    cy.get('h1').contains('Import Recipe').should('be.visible');
    
    // Select TikTok as source
    cy.get('input[name="source"][value="tiktok"]').check();
    
    // Enter TikTok URL
    cy.get('input[name="url"]').type('https://www.tiktok.com/@user/video/example123');
    
    // Intercept API call
    cy.intercept('POST', '/api/import/tiktok', {
      statusCode: 200,
      body: {
        recipe: {
          id: 998,
          title: 'Imported TikTok Recipe',
          description: 'This recipe was imported from TikTok'
        }
      }
    }).as('importRecipe');
    
    // Submit form
    cy.get('button').contains('Import Recipe').click();
    
    // Wait for API call
    cy.wait('@importRecipe');
    
    // Verify success message
    cy.get('[data-testid="toast"]').should('contain', 'Recipe imported successfully');
    
    // Verify redirect to recipe page
    cy.url().should('include', '/recipes/998');
  });

  it('should show error for invalid URL', function() {
    const { testUser } = this.users;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to import page
    cy.visit('/import');
    
    // Submit form without entering URL
    cy.get('button').contains('Import Recipe').click();
    
    // Verify error message
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('should handle import failures', function() {
    const { testUser } = this.users;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to import page
    cy.visit('/import');
    
    // Enter Instagram URL
    cy.get('input[name="url"]').type('https://www.instagram.com/p/invalid123/');
    
    // Intercept API call with error
    cy.intercept('POST', '/api/import/instagram', {
      statusCode: 400,
      body: {
        error: 'Failed to import recipe. URL not found or not accessible.'
      }
    }).as('importRecipe');
    
    // Submit form
    cy.get('button').contains('Import Recipe').click();
    
    // Wait for API call
    cy.wait('@importRecipe');
    
    // Verify error message
    cy.get('[data-testid="error-message"]').should('contain', 'Failed to import recipe');
    cy.get('[data-testid="toast"]').should('contain', 'Failed to import recipe');
  });
});
