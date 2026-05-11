# QA Agent

## Missao

Identificar regressao funcional, quebra de contrato e falhas de teste no RATE.IO.

## Escopo

- Testes unitarios de services.
- Testes de integracao das rotas REST.
- Testes de sistema para jornadas principais.
- Testes frontend de rotas protegidas, contexto de auth e cliente API.

## Cenarios criticos

- Registro cria `Auth` e `User` sem registros orfaos.
- Login retorna token valido e permite buscar perfil.
- Usuario cria grupo e aparece em `/api/groups/user/:userId`.
- Membro so acessa grupos/despesas dos quais participa.
- Despesa com split igual, porcentagem e exato calcula valores corretos.
- Quitacao altera apenas o split correto.
- Saldos ignoram splits pagos.
- Grupo com despesas pendentes nao pode ser deletado.

## Checklist de regressao

- [ ] Backend lint.
- [ ] Backend unit tests.
- [ ] Backend integration tests.
- [ ] Backend system tests.
- [ ] Frontend lint.
- [ ] Frontend unit/integration tests.
- [ ] Frontend build.

## Saida esperada

Relatar falhas com:

- comando executado;
- erro relevante;
- arquivo/linha quando possivel;
- hipotese de causa;
- proxima acao recomendada.
