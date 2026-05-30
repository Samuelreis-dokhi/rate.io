# RATE.IO

Aplicação distribuída para gestão financeira colaborativa e rateio de despesas em grupos (viagens, moradias compartilhadas e eventos).

## Visão Geral

O projeto adota arquitetura cliente-servidor com API REST no back-end e persistência em MongoDB. A API é consumida por clientes Web e Mobile.

## Integrantes

- Samuel Filipe dos Reis
- Louise Dias Santos
- Heitor Oliveiro Soares Domingos
- Vinícius Nogueira
- Rondinelli Silva de Oliveira
- Icaro de Jesus Souza e Cota

## Orientador

- Leonardo Vilela Cardoso

## Pré-requisitos

Obrigatórios:

1. Git
2. Docker e Docker Compose
3. Acesso ao MongoDB Atlas (usuário, senha e permissões)

Opcionais (execução sem Docker):

1. Node.js 18+
2. npm 9+

Validação rápida:

```bash
git --version
docker --version
docker compose version
node -v
npm -v
```

## Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd pmv-ads-2026-1-e4-infra-t1-segunda-20h
```

### 2. Criar arquivo de ambiente

```bash
cp src/backend/.env.example src/backend/.env
```

### 3. Configurar variáveis obrigatórias

Edite `src/backend/.env` e configure ao menos:

```env
PORT=3000
JWT_SECRET=<sua-chave-jwt>
MONGO_URI_AUTH=<uri-do-mongo-auth>
MONGO_URI_USERS=<uri-do-mongo-users>
MONGO_URI_EXPENSES=<uri-do-mongo-expenses>
MONGO_URI_GROUPS=<uri-do-mongo-groups>
```

Observações:

1. Se a senha do MongoDB tiver caracteres especiais, aplique URL encode.
2. Garanta que seu IP esteja liberado no Atlas.

## Como Rodar o Projeto

### Opção A: Com Docker (recomendado)

Na raiz do projeto:

```bash
docker compose up --build
```

Validação:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

### Opção B: Sem Docker (Node local)

```bash
cd src/backend
npm install
npm run dev
```

## Contrato de API Real (fonte da verdade)

Antes de qualquer linha de código, o time precisa ter este mapa internalizado. Tudo no frontend deriva daqui.

### Autenticação — /api/auth

| Método | Rota | Body | Proteção | Resposta de sucesso |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ name, email, password }` | Pública | `201 { message, authId, id, name, email }` |
| POST | `/api/auth/login` | `{ email, password }` | Pública | `200 { message, token, userId }` |
| PUT | `/api/auth/change-password` | `{ currentPassword, newPassword, confirmPassword }` | Bearer token | `200 { message }` |

Atenção no login: a resposta usa `userId`. Os clientes tratam compatibilidade com `authData.authId || authData.userId`. O token JWT expira em 1 hora.

### Usuário — /api/users (requer Bearer token)

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/api/users/profile` | — | `200 { _id, name, email, authId, avatarUrl, isActive }` |
| PUT | `/api/users/profile` | `{ name?, avatarUrl? }` | `200 { message, id, name, avatarUrl }` |
| GET | `/api/users/:userId` | — | `200 { _id, name, email, avatarUrl }` |

### Grupos — /api/groups (requer Bearer token)

| Método | Rota | Corpo / Query | Resposta |
| --- | --- | --- | --- |
| POST | `/api/groups` | `{ name, description?, createdBy, membersIds? }` | `201 grupo completo` |
| GET | `/api/groups/user/:userId` | — | `200 array de grupos` |
| POST | `/api/groups/:groupId/members` | `{ userId, addedBy }` | `200 grupo atualizado` |
| POST | `/api/groups/:groupId/invite` | `{ email, addedBy }` | `200 grupo atualizado` |
| DELETE | `/api/groups/:groupId` | `{ userId }` no body | `200 { message }` |
| GET | `/api/groups/:groupId/activities?userId=&limit=200` | — | `array de atividades` |

Regras de negócio: Só o criador pode deletar o grupo. Não é possível deletar com splits pendentes em aberto. Atividades suportam `limit` entre 1 e 200, default 50.

### Despesas — /api/expenses (requer Bearer token)

| Método | Rota | Corpo / Query | Resposta |
| --- | --- | --- | --- |
| POST | `/api/expenses` | ver abaixo | `201 { message, expense }` |
| GET | `/api/expenses/group/:groupId?userId=` | — | `200 { expenses: [...] }` — envelope |
| POST | `/api/expenses/:expenseId/settle` | `{ userId, paidBy }` | `200 { message }` |
| GET | `/api/expenses/group/:groupId/balances?userId=` | — | `200 { balance: { totalPaid, totalOwed, netBalance, summary } }` — envelope |
| PUT | `/api/expenses/:expenseId` | `{ updatedBy, ...campos }` | `200 { message, expense }` |
| DELETE | `/api/expenses/:expenseId` | `{ userId }` | `200 { message }` |

## Scripts úteis

Os scripts são executados dentro de cada aplicação, pois backend, frontend web e mobile possuem dependências próprias.

### Backend (`src/backend`)

| Script | Descrição |
| --- | --- |
| `npm run dev` | Executa a API com Nodemon |
| `npm start` | Executa a API com Node |
| `npm test` | Executa unitários, integração e sistema |
| `npm run test:unit` | Testes unitários de serviços |
| `npm run test:integration` | Testes HTTP integrados com MongoDB em memória |
| `npm run test:system` | Jornada E2E de API |
| `npm run test:coverage` | Relatório de cobertura Jest |

### Frontend (`src/frontend`)

| Script | Descrição |
| --- | --- |
| `npm run dev` | Executa o Vite |
| `npm test` | Executa unitários, integração e E2E web com Vitest |
| `npm run test:unit` | Testes de serviços e contexto React |
| `npm run test:integration` | Testes de componentes integrados |
| `npm run test:e2e` | Fluxo web autenticado com mocks de API |
| `npm run build` | Build de produção |

### Mobile (`src/mobile`)

| Script | Descrição |
| --- | --- |
| `npm start` | Executa Expo |
| `npm run web` | Executa Expo Web |
| `npm test` | Executa testes Jest/Jest Expo |
| `npm run test:unit` | Executa testes unitários mobile |
| `npm run test:integration` | Executa testes de integração mobile |
| `npm run test:e2e` | Executa fluxo E2E mobile |
| `npm run test:coverage` | Relatório de cobertura Jest |

## Estratégia de Testes

A suíte segue os critérios F.I.R.S.T.: testes rápidos, independentes, repetíveis, auto-verificáveis e escritos em tempo de desenvolvimento. O backend usa MongoDB em memória para integração e sistema, evitando dependência de Atlas. Web e mobile isolam chamadas HTTP por mocks para validar contratos de serviço, autenticação, rotas protegidas e fluxos críticos sem flutuação de rede.

Execução validada em 2026-05-30:

| Aplicação | Comando | Resultado |
| --- | --- | --- |
| Backend | `cd src/backend && npm test` | 7 suítes, 108 testes aprovados |
| Frontend | `cd src/frontend && npm test` | 4 suítes, 13 testes aprovados |
| Mobile | `cd src/mobile && npm test` | 5 suítes, 15 testes aprovados |

## Automação com GitHub Actions

O workflow `.github/workflows/ci.yml` executa a cada `push` em `develop`, `task/**`, `test/**` e `feature/**`, além de `pull_request` para `develop`. A automação usa Node.js 20.19.0 e `npm ci` com cache separado por aplicação.

Jobs configurados:

| Job | Diretório | Comandos |
| --- | --- | --- |
| `backend-tests` | `src/backend` | `npm test` |
| `frontend-tests` | `src/frontend` | `npm run test:unit`, `npm run test:integration`, `npm run test:e2e` |
| `mobile-tests` | `src/mobile` | `npm run test:unit`, `npm run test:integration`, `npm run test:e2e` |

A separação por job deixa falhas localizadas por camada e mantém a automação alinhada à pirâmide de testes do projeto.

## Passo a Passo Rápido de Uso

1. Suba a API (Docker ou Node local).
2. Verifique o healthcheck em `GET /health`.
3. Faça registro e login para obter token JWT.
4. Use o token para acessar rotas protegidas (`/api/users`, `/api/groups`, `/api/expenses`).


## Documentação

1. [Documentação de Contexto](docs/01-Documentação%20de%20Contexto.md)
2. [Especificação do Projeto](docs/02-Especificação%20do%20Projeto.md)
3. [Metodologia](docs/03-Metodologia.md)
4. [Projeto de Interface](docs/04-Projeto%20de%20Interface.md)
5. [Arquitetura da Solução](docs/05-Arquitetura%20da%20Solução.md)
6. [Template Padrão da Aplicação](docs/06-Template%20Padrão%20da%20Aplicação.md)
7. [Programação de Funcionalidades](docs/07-Programação%20de%20Funcionalidades.md)
8. [Registro de Testes Unitários](docs/08-Registro%20de%20Testes%20Unitários.md)
9. [Registro de Testes de Integração](docs/09-Registro%20de%20Testes%20de%20Integração.md)
10. [Registro de Testes de Sistema](docs/10-Registro%20de%20Testes%20de%20Sistema.md)
11. [Registro de Contribuição](docs/11-Registro%20de%20Contribuição.md)
12. [Apresentação do Projeto](docs/12-Apresentação%20do%20Projeto.md)
13. [Referências](docs/13-Referencias.md)

## Código e Apresentação

- [Código Fonte](src/README.md)
- [Guia do Backend](src/backend/README.md)
- [Apresentação da Solução](presentation/README.md)
