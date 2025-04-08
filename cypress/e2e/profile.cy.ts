describe('User Profile', () => {
  beforeEach(() => {
    cy.fixture('users').as('users');
  });

  it('should display user profile information', function() {
    const { testUser } = this.users;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to profile
    cy.visit('/profile');
    
    // Verify profile information is displayed
    cy.get('h2').contains('Your Profile').should('be.visible');
    cy.get('h3').contains(testUser.displayName || testUser.username).should('be.visible');
    cy.get('p').contains(`@${testUser.username}`).should('be.visible');
    cy.get('p').contains(testUser.email).should('be.visible');
  });

  it('should allow editing profile information', function() {
    const { testUser } = this.users;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to profile
    cy.visit('/profile');
    
    // Click edit button
    cy.get('button').contains('Edit Profile').click();
    
    // Update profile information
    const newDisplayName = `Test User ${Math.floor(Math.random() * 1000)}`;
    const newBio = 'This is my updated bio for testing purposes.';
    
    cy.get('input[name="display-name"]').clear().type(newDisplayName);
    cy.get('textarea[name="bio"]').clear().type(newBio);
    
    // Save changes
    cy.get('button').contains('Save Changes').click();
    
    // Verify success message
    cy.get('[data-testid="toast"]').should('contain', 'Profile updated successfully');
    
    // Verify updated information is displayed
    cy.get('h3').contains(newDisplayName).should('be.visible');
    cy.get('p').contains(newBio).should('be.visible');
  });

  it('should validate profile form inputs', function() {
    const { testUser } = this.users;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to profile
    cy.visit('/profile');
    
    // Click edit button
    cy.get('button').contains('Edit Profile').click();
    
    // Enter invalid avatar URL
    cy.get('input[name="avatar-url"]').clear().type('invalid-url');
    
    // Try to save changes
    cy.get('button').contains('Save Changes').click();
    
    // Verify validation error
    cy.get('[data-testid="error-message"]').should('contain', 'Avatar URL must be a valid URL');
    
    // Form should not be submitted
    cy.get('input[name="avatar-url"]').should('exist');
  });

  it('should display user recipes', function() {
    const { testUser } = this.users;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to profile
    cy.visit('/profile');
    
    // Verify user recipes section exists
    cy.get('h2').contains('Your Recipes').should('be.visible');
    
    // If user has recipes, they should be displayed
    // If not, the empty state should be displayed
    cy.get('div[data-testid="user-recipe-list"]').then($el => {
      if ($el.find('[data-testid="recipe-item"]').length > 0) {
        cy.get('[data-testid="recipe-item"]').should('exist');
      } else {
        cy.get('p').contains("You haven't created any recipes yet").should('be.visible');
      }
    });
  });

  it('should display saved recipes', function() {
    const { testUser } = this.users;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to profile
    cy.visit('/profile');
    
    // Verify saved recipes section exists
    cy.get('h2').contains('Saved Recipes').should('be.visible');
    
    // If user has saved recipes, they should be displayed
    // If not, the empty state should be displayed
    cy.get('div[data-testid="saved-recipe-list"]').then($el => {
      if ($el.find('[data-testid="saved-recipe-item"]').length > 0) {
        cy.get('[data-testid="saved-recipe-item"]').should('exist');
      } else {
        cy.get('p').contains("You haven't saved any recipes yet").should('be.visible');
      }
    });
  });

  it('should display user statistics', function() {
    const { testUser } = this.users;
    
    // Login
    cy.login(testUser.email, testUser.password);
    
    // Navigate to profile
    cy.visit('/profile');
    
    // Verify user stats section exists
    cy.get('h2').contains('Your Stats').should('be.visible');
    
    // Stats should be displayed
    cy.get('div[data-testid="user-stats"]').within(() => {
      cy.get('div').contains('Recipes').should('exist');
      cy.get('div').contains('Likes Received').should('exist');
      cy.get('div').contains('Saved Recipes').should('exist');
      cy.get('div').contains('Comments').should('exist');
    });
  });
});
