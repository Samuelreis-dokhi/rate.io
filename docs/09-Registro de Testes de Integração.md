# Registro de Testes de Integracao

## 1. Objetivo do Documento
Este documento registra o planejamento, a execucao, os resultados e os incidentes dos testes de integracao do backend, seguindo a estrutura recomendada pela IEEE Std para documentacao de testes.

Escopo atual:
- Integracao de Auth: implementada e validada.
- Integracao de Groups: campo preparado para preenchimento.
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

Itens pendentes:
- Modulo Groups.
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
- 5 testes executados, 5 aprovados.

### 6.2 Modulo Groups (Template para preenchimento)

| ID | Endpoint | Cenario | Entrada | Resultado esperado | Status |
|---|---|---|---|---|---|
| INT-GRP-001 | POST /api/groups | Criacao de grupo valida | [preencher] | [preencher] | Planejado |
| INT-GRP-002 | POST /api/groups/:groupId/members | Adicao de membro valida | [preencher] | [preencher] | Planejado |
| INT-GRP-003 | GET /api/groups/user/:userId | Listagem de grupos do usuario | [preencher] | [preencher] | Planejado |
| INT-GRP-004 | GET /api/groups/:groupId/activities | Consulta de atividades | [preencher] | [preencher] | Planejado |
| INT-GRP-005 | DELETE /api/groups/:groupId | Exclusao logica sem pendencias | [preencher] | [preencher] | Planejado |

### 6.3 Modulo Expenses (Template para preenchimento)

| ID | Endpoint | Cenario | Entrada | Resultado esperado | Status |
|---|---|---|---|---|---|
| INT-EXP-001 | POST /api/expenses | Criacao de despesa valida | [preencher] | [preencher] | Planejado |
| INT-EXP-002 | GET /api/expenses/group/:groupId | Consulta de despesas por grupo | [preencher] | [preencher] | Planejado |
| INT-EXP-003 | POST /api/expenses/:expenseId/settle | Quitacao de parcela | [preencher] | [preencher] | Planejado |
| INT-EXP-004 | GET /api/expenses/group/:groupId/balances | Consulta de saldo por grupo | [preencher] | [preencher] | Planejado |

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

## 9. Diario de Execucao

| Data | Executor | Suite | Comando | Resultado | Observacao |
|---|---|---|---|---|---|
| 2026-04-07 | Heitor | Auth | npm run test:auth | PASS (5/5) | Fluxo de registro e login validado em integracao |

## 10. Relatorio de Resumo de Teste de Integracao
Resumo atual:
- Cobertura de integracao implementada para Auth com casos positivos e negativos principais.
- Estrutura de ambiente de integracao estabilizada (Jest + Supertest + Mongo em memoria).
- Templates de casos e procedimentos preparados para avancar com Groups e Expenses.

Riscos remanescentes:
- Suites de Groups e Expenses ainda sem casos implementados.
- Necessidade de definir massa de dados e cenarios de borda para modulos pendentes.

Proximos passos recomendados:
1. Implementar os primeiros casos de Groups (criacao, adicao de membro e listagem).
2. Implementar os primeiros casos de Expenses (criacao e consulta por grupo).
3. Atualizar este registro a cada execucao com status e incidentes.
