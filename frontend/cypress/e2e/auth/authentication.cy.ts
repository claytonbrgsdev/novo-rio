describe('Autenticação', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Teste@123',
  };

  beforeEach(() => {
    // Limpar cookies e localStorage antes de cada teste
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('Deve cadastrar um novo usuário com sucesso', () => {
    // Navegar para a página de registro
    cy.visit('/auth?view=register');

    // Verificar elementos na página
    cy.contains('Criar nova conta');
    
    // Preencher e enviar o formulário de registro
    cy.get('[data-testid="email-input"]').type(testUser.email);
    cy.get('[data-testid="password-input"]').type(testUser.password);
    cy.get('[data-testid="register-button"]').click();

    // Verificar que o usuário é redirecionado para o dashboard após o registro
    cy.url().should('include', '/dashboard');
    
    // Verificar que a autenticação foi realizada (token armazenado)
    cy.window().then((win) => {
      expect(win.localStorage.getItem('authToken')).to.exist;
    });
  });

  it('Deve fazer login com sucesso', () => {
    // Navegar para a página de login
    cy.visit('/auth');

    // Verificar elementos na página
    cy.contains('Entrar na sua conta');
    
    // Preencher e enviar o formulário de login
    cy.get('[data-testid="email-input"]').type(testUser.email);
    cy.get('[data-testid="password-input"]').type(testUser.password);
    cy.get('[data-testid="login-button"]').click();

    // Verificar que o usuário é redirecionado para o dashboard após o login
    cy.url().should('include', '/dashboard');
    
    // Verificar que a autenticação foi realizada (token armazenado)
    cy.window().then((win) => {
      expect(win.localStorage.getItem('authToken')).to.exist;
    });
  });

  it('Deve mostrar erro ao tentar fazer login com credenciais inválidas', () => {
    // Navegar para a página de login
    cy.visit('/auth');
    
    // Preencher e enviar o formulário com credenciais inválidas
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('senha_incorreta');
    cy.get('[data-testid="login-button"]').click();

    // Verificar que a mensagem de erro é exibida
    cy.contains('Falha ao fazer login');
    
    // Verificar que o usuário continua na página de login
    cy.url().should('include', '/auth');
  });

  it('Deve fazer logout com sucesso', () => {
    // Login primeiro
    cy.loginViaApi(testUser.email, testUser.password);
    
    // Verificar que estamos na página do painel
    cy.url().should('include', '/dashboard');
    
    // Fazer logout
    cy.get('[data-testid="user-menu-button"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Verificar que o usuário é redirecionado para a página de login
    cy.url().should('include', '/auth');
    
    // Verificar que o token foi removido
    cy.window().then((win) => {
      expect(win.localStorage.getItem('authToken')).to.be.null;
    });
  });
});
