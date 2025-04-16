describe('Basic Test', () => {
  it('Visits the app', () => {
    cy.visit('/');
    cy.get('body').should('exist');
  });
});
