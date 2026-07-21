
Cypress.Commands.add('resetDB', () => {
  cy.request('POST', 'http://localhost:3002/api/reset');
});

Cypress.Commands.add('getItems', () => {
  return cy.request('GET', 'http://localhost:3002/api/recipes').its('body');
});
