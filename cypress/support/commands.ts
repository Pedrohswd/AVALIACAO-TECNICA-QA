/// <reference types="cypress" />'

/* NESTE ARQUIVO SERÁ ARMAZENADOS TODAS AS FUNÇÕES */
declare namespace Cypress {
  interface Chainable<Subject> {
    criarUsuarioComSaldo(email, nome, senha): Chainable<any>;
    criarUsuarioSemSaldo(email, nome, senha): Chainable<any>;
    abrirBugBank(): Chainable<any>;
    fazerLogin(email, senha): Chainable<any>;
    transferirSaldo(conta, valor, descricao): Chainable<any>;
  }
}

Cypress.Commands.add("criarUsuarioComSaldo", (email, nome, senha): void => {
  cy.abrirBugBank();

  cy.contains("Registrar").click();
  cy.get("div.card__register").should("be.visible");
  cy.get("input[name=email]").eq(1).type(email, { force: true });
  cy.get("input[name=name]").type(nome, { force: true });
  cy.get("input[name=password]").eq(1).type(senha, { force: true });
  cy.get("input[name=passwordConfirmation]").type(senha, { force: true });
  cy.get("#toggleAddBalance").click({ force: true });
  cy.contains("Cadastrar").click({ force: true });
});

Cypress.Commands.add("criarUsuarioSemSaldo", (email, nome, senha): void => {
  cy.abrirBugBank();

  cy.contains("Registrar").click();
  cy.get("div.card__register").should("be.visible");
  cy.get("input[name=email]").eq(1).type(email, { force: true });
  cy.get("input[name=name]").type(nome, { force: true });
  cy.get("input[name=password]").eq(1).type(senha, { force: true });
  cy.get("input[name=passwordConfirmation]").type(senha, { force: true });
  cy.contains("Cadastrar").click({ force: true });
});

Cypress.Commands.add("abrirBugBank", () => {
  cy.visit("https://bugbank.netlify.app");
});

Cypress.Commands.add("fazerLogin", (email, senha): void => {
  cy.abrirBugBank();
  cy.get("input[name=email]").eq(0).type(email);
  cy.get("input[name=password]").eq(0).type(senha);
  cy.contains("Acessar").click();
});

Cypress.Commands.add("transferirSaldo", (conta, valor, descricao): void => {
  console.log(conta);
  conta = conta.split("-");
  const numero = conta[0];
  const digito = conta[1];

  cy.get("input[name=accountNumber]").type(numero);
  cy.get("input[name=digit]").type(digito);
  cy.get("input[name=transferValue]").type(valor);
  cy.get("input[name=description]").type(descricao);
  cy.contains("Transferir agora").click();
});
