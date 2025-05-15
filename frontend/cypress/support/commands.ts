// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

import '@testing-library/cypress/add-commands'

// Aumentar o tempo de espera para carregamento de páginas
Cypress.config('defaultCommandTimeout', 10000)

// Mock do localStorage para testes
const LOCAL_STORAGE_MEMORY: Record<string, string> = {}

// Comandos para manipular localStorage
Cypress.Commands.add('saveLocalStorage', () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage.getItem(key) || ''
  })
})

Cypress.Commands.add('restoreLocalStorage', () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key])
  })
})

// Comando para fazer login via UI
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('include', '/dashboard')
})

// Comando para fazer login programaticamente (via API)
Cypress.Commands.add('loginViaApi', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || ''}/auth/login`,
    form: true,
    body: {
      email,
      password,
    },
  }).then((response) => {
    // Armazenar token e dados do usuário no localStorage
    localStorage.setItem('authToken', response.body.token)
    localStorage.setItem('user', JSON.stringify(response.body.user))
    
    // Visitar a página após login para aplicar o token
    cy.visit('/dashboard')
  })
})

// Comando para logout
Cypress.Commands.add('logout', () => {
  cy.visit('/profile')
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/auth')
})

// Declare global Cypress namespace to add custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      saveLocalStorage(): void
      restoreLocalStorage(): void
      login(email: string, password: string): Chainable<void>
      loginViaApi(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
    }
  }
}
