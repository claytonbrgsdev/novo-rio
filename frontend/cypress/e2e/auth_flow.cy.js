describe("Fluxo Completo: Auth → Character → Game", () => {
  const API = "http://localhost:8080";

  beforeEach(() => {
    // Garante um backend limpo com reset do banco de dados
    cy.request("POST", `${API}/test/reset`);
    cy.visit("/auth");
  });

  it("deve permitir login e customização sem loops", () => {
    // 1) Cadastro (caso não tenha rota de register, use usuário seeded)
    cy.get("input[name=email]").type("seeded@user.com");
    cy.get("input[name=password]").type("password{enter}");
    
    // 2) Verifica que o loading de validação some
    cy.contains("Carregando autenticação...").should("not.exist", { timeout: 5000 });

    // 3) Chegou na página de character-customizer
    cy.url().should("include", "/character-customizer");

    // 4) Escolhe atributos (ajuste selectors conforme seu UI)
    cy.get("[data-cy=strength]").click();
    cy.get("[data-cy=agility]").click();

    // 5) Salva personagem
    cy.get("button").contains("Salvar").click();

    // 6) Deve entrar em /game
    cy.url().should("include", "/game");
    cy.contains("Bem-vindo").should("exist");

    // 7) Refrescar e garantir persistência
    cy.reload();
    cy.url().should("include", "/game");
    cy.contains("Carregando autenticação...").should("not.exist");
    cy.contains("Bem-vindo").should("exist");
  });

  it("deve redirecionar para /auth se acessar /game sem estar logado", () => {
    cy.clearLocalStorage();
    cy.visit("/game");
    cy.url().should("include", "/auth");
    cy.url().should("include", "redirected=true");
  });
});
