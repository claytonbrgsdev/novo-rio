describe('Proteção de Rotas', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Teste@123',
  };
  
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/game',
    '/settings',
    '/inventory'
  ];
  
  beforeEach(() => {
    // Limpar cookies e localStorage antes de cada teste
    cy.clearCookies();
    cy.clearLocalStorage();
  });
  
  protectedRoutes.forEach((route) => {
    it(`Deve redirecionar para tela de login ao tentar acessar rota protegida: ${route}`, () => {
      // Tentar acessar uma rota protegida sem estar autenticado
      cy.visit(route);
      
      // Verificar que fomos redirecionados para a página de login
      cy.url().should('include', '/auth');
      
      // Verificar que o callbackUrl foi adicionado à URL para redirecionamento após login
      cy.url().should('include', `callbackUrl=${encodeURIComponent(route)}`);
    });
  });
  
  it('Deve permitir acesso às rotas protegidas após login', () => {
    // Registrar um usuário para teste
    cy.visit('/auth?view=register');
    cy.get('[data-testid="email-input"]').type(testUser.email);
    cy.get('[data-testid="password-input"]').type(testUser.password);
    cy.get('[data-testid="register-button"]').click();
    
    // Verificar que podemos acessar o dashboard após login
    cy.url().should('include', '/dashboard');
    
    // Salvar o localStorage para manter a sessão
    cy.saveLocalStorage();
    
    // Verificar acesso a cada rota protegida
    protectedRoutes.forEach((route) => {
      // Visitar rota protegida
      cy.restoreLocalStorage();
      cy.visit(route);
      
      // Verificar que a rota está acessível (não redireciona)
      cy.url().should('include', route);
    });
  });
  
  it('Deve redirecionar para dashboard ao tentar acessar tela de login estando autenticado', () => {
    // Login via API
    cy.loginViaApi(testUser.email, testUser.password);
    
    // Tentar acessar a página de login estando autenticado
    cy.visit('/auth');
    
    // Verificar que fomos redirecionados para o dashboard
    cy.url().should('include', '/dashboard');
  });
  
  it('Deve redirecionar para página original após login via callbackUrl', () => {
    // Limpar autenticação
    cy.clearLocalStorage();
    
    // Tentar acessar uma rota protegida que será redirecionada para login
    cy.visit('/profile');
    
    // URL de login deve conter o callbackUrl
    cy.url().should('include', '/auth');
    cy.url().should('include', 'callbackUrl=/profile');
    
    // Fazer login
    cy.get('[data-testid="email-input"]').type(testUser.email);
    cy.get('[data-testid="password-input"]').type(testUser.password);
    cy.get('[data-testid="login-button"]').click();
    
    // Verificar que fomos redirecionados para a página original
    cy.url().should('include', '/profile');
  });
});
