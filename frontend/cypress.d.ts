/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Salva o estado atual do localStorage
     */
    saveLocalStorage(): void;
    
    /**
     * Restaura o estado salvo do localStorage
     */
    restoreLocalStorage(): void;
    
    /**
     * Faz login via interface do usuário
     * @param email Email do usuário
     * @param password Senha do usuário
     */
    login(email: string, password: string): Chainable<void>;
    
    /**
     * Faz login via API sem usar a interface
     * @param email Email do usuário
     * @param password Senha do usuário
     */
    loginViaApi(email: string, password: string): Chainable<void>;
    
    /**
     * Faz logout do usuário
     */
    logout(): Chainable<void>;
  }
}
