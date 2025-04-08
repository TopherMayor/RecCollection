describe('Authentication', () => {
  beforeEach(() => {
    cy.fixture('users').as('users');
  });

  it('should allow a user to register', function() {
    const randomNum = Math.floor(Math.random() * 10000);
    const email = `test${randomNum}@example.com`;
    const username = `testuser${randomNum}`;
    const password = 'Password123!';

    cy.visit('/register');
    
    // Fill out registration form
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Verify successful registration
    cy.url().should('not.include', '/register');
    cy.get('[data-testid="user-menu"]').should('exist');
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

  it('should show error for invalid credentials', function() {
    cy.visit('/login');
    
    // Fill out login form with invalid credentials
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('WrongPassword123!');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Verify error message
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should allow a user to logout', function() {
    const { testUser } = this.users;
    
    // Login first
    cy.login(testUser.email, testUser.password);
    
    // Click on user menu
    cy.get('[data-testid="user-menu"]').click();
    
    // Click logout button
    cy.get('[data-testid="logout-button"]').click();
    
    // Verify successful logout
    cy.get('[data-testid="user-menu"]').should('not.exist');
    cy.get('[data-testid="login-button"]').should('exist');
  });

  it('should redirect to login when accessing protected routes', function() {
    cy.visit('/profile');
    
    // Verify redirect to login
    cy.url().should('include', '/login');
    
    // Verify that the original URL is saved for redirect after login
    cy.get('[data-testid="login-form"]').should('exist');
    
    // Login
    const { testUser } = this.users;
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Verify redirect back to original URL
    cy.url().should('include', '/profile');
  });
});
