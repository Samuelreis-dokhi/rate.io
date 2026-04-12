# Registro de Testes de Integracao

## 1. Objetivo do Documento
Este documento registra o planejamento, a execucao, os resultados e os incidentes dos testes de integracao do backend, seguindo a estrutura recomendada pela IEEE Std para documentacao de testes.

Escopo atual:
- Integracao de Auth: implementada e validada.
- Integracao de Groups: implementada e validada.
- Integracao de Expenses: campo preparado para preenchimento.

## 2. Referencias
- IEEE Std (Software Test Documentation) para organizacao de artefatos de teste.
- Requisitos funcionais e nao funcionais do projeto RATE.IO.
- Implementacao de backend em Node.js + Express + Mongoose.

## 3. Contexto e Itens de Integracao
Itens sob teste de integracao:
- API REST de autenticacao e autorizacao.
- Integracao entre rotas, controllers, models e banco em memoria para testes.

Itens ja cobertos:
- Modulo Auth (registro e login).
- Modulo Groups (criacao, membros, consulta de grupos, atividades e exclusao logica).

Itens pendentes:
- Modulo Expenses.

## 4. Ambiente de Teste de Integracao
Configuracao utilizada:
- Runtime: Node.js.
- Runner: Jest (projeto integration).
- Requisicoes HTTP: Supertest.
- Banco para testes: MongoDB em memoria (mongodb-memory-server).
- Setup global de integracao:
  - Inicializacao de banco em memoria.
  - Configuracao das variaveis de ambiente de teste.
  - Conexao com os bancos de dominio necessarios.
  - Limpeza de colecoes entre testes.

Comando principal da suite de auth:
- npm run test:auth

Comando principal da suite de groups:
- npm run test:group

## 5. Especificacao de Projeto de Teste (Integration Design)
### 5.1 Estrategia
- Validar o comportamento integrado de endpoint HTTP + regra de negocio + persistencia.
- Cobrir casos de sucesso e falha de validacao/negocio.
- Garantir respostas HTTP coerentes com o contrato da API.

### 5.2 Criterios de Entrada
- Dependencias instaladas.
- Variaveis de ambiente de teste configuradas pelo helper global.
- Banco em memoria iniciado e conexoes ativas.

### 5.3 Criterios de Saida
- Todos os casos da suite em status PASS.
- Sem erros de lint nos arquivos alterados.
- Registro de incidentes atualizado quando houver falha.

## 6. Especificacao dos Casos de Teste

### 6.1 Modulo Auth (Implementado)

| ID | Endpoint | Cenario | Entrada | Resultado esperado |
|---|---|---|---|---|
| INT-AUTH-001 | POST /api/auth/register | Registro com payload valido | name, email, password validos | HTTP 201 e retorno com id, name e email |
| INT-AUTH-002 | POST /api/auth/register | Registro com email duplicado | email ja cadastrado | HTTP 409 |
| INT-AUTH-003 | POST /api/auth/register | Registro com payload invalido | payload vazio | HTTP 400 |
| INT-AUTH-004 | POST /api/auth/login | Login com credenciais validas | email e senha corretos | HTTP 200 e token JWT |
| INT-AUTH-005 | POST /api/auth/login | Login com senha invalida | email valido + senha incorreta | HTTP 401 |

Resultado consolidado atual:
- Suite executada com sucesso.
- 18 testes executados, 18 aprovados.

### 6.2 Modulo Groups (Implementado)

| ID | Endpoint | Cenario | Entrada | Resultado esperado | Status |
|---|---|---|---|---|---|
| INT-GRP-001 | POST /api/groups | Criacao de grupo valida | nome valido, createdBy valido, token | HTTP 201 e criador como admin | Aprovado |
| INT-GRP-002 | POST /api/groups | Validacao de nome invalido | nome vazio, 1 caractere, >100 caracteres | HTTP 400 | Aprovado |
| INT-GRP-003 | POST /api/groups | Acesso sem autenticacao | sem token | HTTP 401 | Aprovado |
| INT-GRP-004 | POST /api/groups/:groupId/members | Adicao de membro valida | groupId valido, userId valido, addedBy membro | HTTP 200 e membro com role member | Aprovado |
| INT-GRP-005 | POST /api/groups/:groupId/members | Duplicidade de membro | mesmo userId adicionado duas vezes | HTTP 400 | Aprovado |
| INT-GRP-006 | POST /api/groups/:groupId/members | Grupo inexistente | groupId inexistente | HTTP 404 | Aprovado |
| INT-GRP-007 | GET /api/groups/user/:userId | Listagem de grupos do usuario | userId valido e token | HTTP 200 com array | Aprovado |
| INT-GRP-008 | GET /api/groups/:groupId/activities | Consulta de atividades | groupId valido, userId valido e token | HTTP 200 com historico | Aprovado |
| INT-GRP-009 | GET /api/groups/:groupId/activities | Integracao com expenses | criacao de despesa no grupo antes da consulta | atividade `EXPENSE_CREATED` presente | Aprovado |
| INT-GRP-010 | DELETE /api/groups/:groupId | Exclusao logica sem pendencias | groupId valido, userId criador e token | HTTP 200 e grupo oculto em consultas futuras | Aprovado |

Resultado consolidado atual:
- Suite executada com sucesso.
- 21 testes executados, 21 aprovados.

### 6.3 Modulo Expenses (Implementado)

| ID | Endpoint | Cenario | Entrada | Resultado esperado | Status |
|---|---|---|---|---|---|
| INT-EXP-001 | POST /api/expenses | Criacao de despesa valida | groupId, description, amount, paidBy, createdBy, splitType, splitsData | HTTP 201 e retorno com expense contendo splits calculados corretamente | Aprovado |
| INT-EXP-002 | GET /api/expenses/group/:groupId | Consulta de despesas por grupo | groupId válido + userId query | HTTP 200 e retorno com array expenses do grupo, ordenado por createdAt decrescente | Aprovado |
| INT-EXP-003 | POST /api/expenses/:expenseId/settle | Quitacao de parcela | expenseId, body com userId e paidBy | HTTP 200 e parcela marcada como quitada | Aprovado |
| INT-EXP-004 | GET /api/expenses/group/:groupId/balances | Consulta de saldo por grupo | groupId válido + userId query | HTTP 200 com balance contendo totalPaid, totalOwed, netBalance e summary | Aprovado |

Resultado consolidado atual:
- Suite executada com sucesso.
- 25 testes executados, 25 aprovados.

## 7. Especificacao de Procedimentos de Teste
Procedimento padrao:
1. Garantir que a branch local esteja atualizada.
2. Entrar no diretorio do backend.
3. Executar a suite alvo.
4. Registrar saida (PASS/FAIL) e tempo de execucao.
5. Em caso de falha, abrir incidente no registro da Secao 8.

Comandos sugeridos:
- Auth: npm run test:auth
- Groups: npm run test:group
- Expenses: npm run test:expense
- Integracao completa: npm run test:integration

## 8. Registro de Incidentes de Teste

| ID Incidente | Data | Suite | Descricao | Impacto | Acao tomada | Status |
|---|---|---|---|---|---|---|
| INC-INT-001 | 2026-04-07 | Auth | Falta da dependencia supertest para testes HTTP | Impediu execucao da suite auth | Dependencia instalada e suite reexecutada | Resolvido |
| INC-INT-002 | 2026-04-07 | Auth | Setup de banco sem connectDB no helper global | Erro de conexao dos models ao subir app de teste | connectDB adicionado no setup global | Resolvido |
| INC-INT-003 | 2026-04-07 | Auth | Duplicidade de setup local no teste auth | Risco de conflitos e manutencao mais dificil | Centralizacao no setup global e simplificacao do teste | Resolvido |
| INC-INT-004 | 2026-04-09 | Groups | Validacao de tamanho de nome retornando 500 em vez de 400 | Falha em 2 cenarios de contrato da rota de criacao | Validacao explicita de tamanho no controller `createGroup` | Resolvido |
| INC-INT-004 | 2026-04-10 | Expense | Setup inicial de teste de quitação sem criação do segundo usuário userId2, usando apenas paidBy (userId1) | Impediu validação correta do cenário de quitação de parcela de outro membro | Ajuste no setup para criar userId2 e incluir membro adicional no grupo antes de executar os testes | Resolvido |

## 9. Diario de Execucao

| Data | Executor | Suite | Comando | Resultado | Observacao |
|---|---|---|---|---|---|
| 2026-04-07 | Heitor | Auth | npm run test:auth | PASS (18/18) | Fluxo de autenticação e middleware validado em integracao |
| 2026-04-09 | Heitor | Groups | npm run test:group | PASS (21/21) | Fluxo completo de grupos validado com cenarios de sucesso, erro e seguranca |
| 2026-04-10 | Icaro | Expense | npm run test:expense | PASS (25/25) | Fluxo de criação, listagem, quitação e balanço de despesas validado |

## 10. Relatorio de Resumo de Teste de Integracao
Resumo atual:
- Cobertura de integracao implementada para Auth e Groups com casos positivos, negativos e de seguranca.
- Estrutura de ambiente de integracao estabilizada (Jest + Supertest + Mongo em memoria).
- Templates de casos e procedimentos preparados para avancar com Expenses.

Riscos remanescentes:
- Suite de Expenses ainda sem casos implementados.
- Necessidade de definir massa de dados e cenarios de borda para modulo pendente.

Proximos passos recomendados:
1. Implementar os primeiros casos de Expenses (criacao e consulta por grupo).
2. Evoluir a suite de integracao para cobrir settle e balances em Expenses.
3. Atualizar este registro a cada execucao com status e incidentes.

## 11. Execucao Atualizada - 2026-04-10

Comando executado:
- `npm run test`

Recorte de integracao:
- Suite `tests/integration/expense.routes.test.js`: **PASS**
- Suite `tests/integration/group.routes.test.js`: **PASS**
- Suite `tests/integration/auth.routes.test.js`: **PASS**

Incidentes corrigidos nesta execucao:
- Correcao de matcher no helper local de criacao de grupo (`tobe` -> `toBe`).
- Correcao do payload de membros no setup de despesas (`{ membersIds: [userId2] }`).

Resultado consolidado apos correcao:
- Integracao: 3 suites aprovadas.
- Nenhuma falha remanescente nas suites de integracao.
