/// <reference types="cypress" />

describe("casos de teste", () => {
  context("cadastro", () => {
    it("cadastro com email inválido", () => {
      cy.abrirBugBank();

      cy.contains("Registrar").click();
      cy.get("div.card__register").should("be.visible");

      cy.get("input[name=email]")
        .eq(1)
        .type("email_errado.com", { force: true });

      /*Forçado a verdade. O cypress não foi capaz de identificar a visibilidade do
        campo, então busquei informações em documentações oficiais https://docs.cypress.io.
        Sendo apenas necessário na tela de Cadastro e não na parte de login*/

      cy.get("p.input__warging").should("contain", "Formato inválido");
    });

    it("Cadastro com e-mail válido", () => {
      const email = "test@test.com";
      const nome = "Pedro Henrique";
      const senha = "12345";

      cy.criarUsuarioComSaldo(email, nome, senha);

      cy.get("#modalText").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain("foi criada com sucesso");
      });
    });
  });

  context("login", () => {
    it("Login com e-mail inválido", () => {
      cy.abrirBugBank();

      cy.get("input[name=email]").eq(0).type("email_errado.com");

      cy.get("p.input__warging").should("contain", "Formato inválido");
    });

    it("Login com e-mail inválido/senha não cadastrados", () => {
      const email = "test@test.com";
      const senha = "12345";

      cy.fazerLogin(email, senha);

      cy.get("#modalText").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain(
          "Usuário ou senha inválido.\nTente novamente ou verifique suas informações!"
        );
      });
    });

    it("Login com usuário/senha válidos", () => {
      const email = "test@test.com";
      const nome = "Pedro Henrique";
      const senha = "12345";
      let conta;

      cy.criarUsuarioComSaldo(email, nome, senha);

      //feito para pegar número da conta pela mensagem e validar futuramente
      cy.get("#modalText")
        .invoke("text")
        .then(($element) => {
          const mensagem = $element.split(" ");
          conta = mensagem[2];
        });

      cy.fazerLogin(email, senha);

      cy.get("#textName").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain(nome);
      });

      cy.get("#textAccountNumber").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain(conta);
      });
    });
  });

  context("Transferência", () => {
    it("Fazer transferencia com dados válidos", () => {
      let email = "test@test.com";
      let nome = "Luiz Henrique";
      let senha = "12345";
      let conta;
      const valorTransferir = 400;
      cy.criarUsuarioComSaldo(email, nome, senha);

      cy.get("#modalText")
        .invoke("text")
        .then(($element) => {
          const mensagem = $element.split(" ");
          conta = mensagem[2];

          email = "pedro@test.com";
          nome = "Pedro Henrique";
          senha = "12345";

          cy.criarUsuarioComSaldo(email, nome, senha);

          cy.fazerLogin(email, senha);

          cy.get("#textName").should(($element) => {
            const mensagem = $element.text();
            expect(mensagem).to.contain(nome);
          });

          cy.get("#btn-TRANSFERÊNCIA").click();

          cy.transferirSaldo(
            conta,
            valorTransferir,
            "Mensagem de transferencia"
          );
        });
      cy.get("#modalText").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain("Transferencia realizada com sucesso");
      });

      cy.contains("Fechar").click();
      cy.contains("Voltar").click();

      cy.get("#textBalance > span").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain(1000 - valorTransferir);
      });
    });

    it("Fazer transferencia para conta inválida/inexistente", () => {
      let email = "test@test.com";
      let nome = "Pedro Henrique";
      let senha = "12345";
      let conta;
      const valorTransferir = 400;

      cy.criarUsuarioComSaldo(email, nome, senha);

      cy.get("#modalText")
        .invoke("text")
        .then(($element) => {
          const mensagem = $element.split(" ");
          conta = mensagem[2];

          conta = conta + "1";
          cy.log(conta);
          cy.fazerLogin(email, senha);

          cy.get("#btn-TRANSFERÊNCIA").click();

          cy.transferirSaldo(
            conta,
            valorTransferir,
            "Tranferência para conta inexistente"
          );
        });

      cy.get("#modalText").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain("Conta inválida ou inexistente");
      });

      //verificar se saldo não foi alterado

      cy.contains("Fechar").click();
      cy.contains("Voltar").click();

      cy.get("#textBalance > span").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain("1.000,00");
      });
    });

    it("Fazer transferência sem saldo", () => {
      let email = "test@test.com";
      let nome = "Luiz Henrique";
      let senha = "12345";
      let conta;
      const valorTransferir = 599.99;
      cy.criarUsuarioSemSaldo(email, nome, senha);

      cy.get("#modalText")
        .invoke("text")
        .then(($element) => {
          const mensagem = $element.split(" ");
          conta = mensagem[2];

          email = "pedro@test.com";
          nome = "Pedro Henrique";
          senha = "12345";

          cy.criarUsuarioSemSaldo(email, nome, senha);

          cy.fazerLogin(email, senha);

          cy.get("#textName").should(($element) => {
            const mensagem = $element.text();
            expect(mensagem).to.contain(nome);
          });

          cy.get("#textBalance > span").should(($element) => {
            const mensagem = $element.text();
            expect(mensagem).to.contain("0,00");
          });

          cy.get("#btn-TRANSFERÊNCIA").click();

          cy.transferirSaldo(
            conta,
            valorTransferir,
            "Mensagem de transferencia"
          );
        });

      cy.get("#modalText").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.equal(
          "Você não tem saldo suficiente para essa transação"
        );
      });
    });
  });

  context("Extrato", () => {
    it("Gerar lançamento negativo no extrato da conta origem após transferência", () => {
      let email = "test@test.com";
      let nome = "Luiz Henrique";
      let senha = "12345";
      let conta;
      const valorTransferir = 400;
      cy.criarUsuarioComSaldo(email, nome, senha);

      cy.get("#modalText")
        .invoke("text")
        .then(($element) => {
          const mensagem = $element.split(" ");
          conta = mensagem[2];

          email = "pedro@test.com";
          nome = "Pedro Henrique";
          senha = "12345";

          cy.criarUsuarioComSaldo(email, nome, senha);

          cy.fazerLogin(email, senha);

          cy.get("#textName").should(($element) => {
            const mensagem = $element.text();
            expect(mensagem).to.contain(nome);
          });

          cy.get("#btn-TRANSFERÊNCIA").click();

          cy.transferirSaldo(
            conta,
            valorTransferir,
            "Mensagem de transferencia"
          );
        });
      cy.get("#modalText").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain("Transferencia realizada com sucesso");
      });

      cy.contains("Fechar").click();
      cy.contains("Voltar").click();

      cy.get("#btn-EXTRATO").click();

      cy.get("[type=withdrawal]").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain("-", "400");
      });

      cy.get("#textBalanceAvailable").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain("600");
      });
    });

    it("Verificar lançamento de saldo inicial no extrato", () => {
      const email = "test@test.com";
      const nome = "Pedro Henrique";
      const senha = "12345";

      cy.criarUsuarioComSaldo(email, nome, senha);

      cy.fazerLogin(email, senha);

      cy.get("#textName").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain(nome);
      });
      
      cy.get("#btn-EXTRATO").click();

      cy.get("#textBalanceAvailable").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain("1.000");
      });

      cy.get("#textTransferValue").should(($element) => {
        const mensagem = $element.text();
        expect(mensagem).to.contain("1.000");
      });
    });
  });
});
