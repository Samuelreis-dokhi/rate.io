# Relatorio Tecnico de Desenvolvimento e Arquitetura

## 1. Visao geral

O RATE.IO e uma aplicacao distribuida para gestao financeira colaborativa e rateio de despesas em grupos, com casos de uso como viagens, moradias compartilhadas e eventos. O projeto esta organizado como monorepo com dois produtos principais:

- `src/backend`: API REST em Node.js, Express e MongoDB/Mongoose.
- `src/frontend`: aplicacao Web em React, Vite e React Router.

A arquitetura adotada e cliente-servidor, com frontend leve consumindo uma API REST protegida por JWT. As regras centrais de negocio ficam no backend, especialmente validacao de membros, criacao de grupos, divisao de despesas, quitacao de parcelas e calculo de saldos.

## 2. Estrutura do repositorio

```text
.
├── docker-compose.yml
├── docs/
├── presentation/
├── videos/
├── src/
│   ├── backend/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── tests/
│   │   └── server.js
│   └── frontend/
│       ├── public/
│       └── src/
│           ├── components/
│           ├── context/
│           ├── pages/
│           ├── services/
│           └── tests/
├── .agents/
└── .codex/
```

## 3. Backend

### Stack

- Runtime: Node.js 18+.
- Framework HTTP: Express 5.
- Persistencia: MongoDB com Mongoose.
- Autenticacao: JWT via `jsonwebtoken`.
- Senhas: hash com `bcryptjs`.
- Configuracao: `dotenv`.
- Testes: Jest, Supertest e `mongodb-memory-server`.
- Qualidade: ESLint e Prettier.

### Ponto de entrada

O arquivo `src/backend/server.js` inicializa o Express, aplica CORS e JSON parser, conecta no MongoDB, registra rotas e expoe os endpoints publicos `/` e `/health`.

Rotas registradas:

- `/api/auth`: publico.
- `/api/users`: protegido por `authenticateToken`.
- `/api/groups`: protegido por `authenticateToken`.
- `/api/expenses`: protegido por `authenticateToken`.

### Persistencia e conexoes

`src/backend/config/database.js` cria conexoes separadas por dominio:

- `auth`: credenciais de autenticacao.
- `user`: perfis de usuario.
- `group`: grupos e atividades.
- `expense`: despesas.

As variaveis esperadas sao:

```env
MONGO_URI_AUTH=
MONGO_URI_USERS=
MONGO_URI_GROUPS=
MONGO_URI_EXPENSES=
JWT_SECRET=
PORT=3000
```

Tambem existe suporte a `MONGO_URI` unico como fallback.

### Modelos de dominio

- `Auth`: email, password, lastLogin, isActive. Aplica hash de senha em `pre('save')`.
- `User`: name, email, authId, avatarUrl, isActive. Representa o perfil funcional do usuario.
- `Group`: name, description, createdBy, members, isActive. Usa remocao logica por `isActive=false`.
- `Expense`: groupId, description, amount, currency, paidBy, createdBy, splitType, splits.
- `Activity`: historico de eventos por grupo.

### Controllers e responsabilidades

- `authController`: registro, criacao automatica de perfil e login.
- `userController`: perfil autenticado, criacao fallback de perfil, atualizacao e perfil publico.
- `groupController`: criacao, convite/adicao de membros, listagem de grupos, atividades e exclusao logica.
- `expenseController`: criacao, listagem, quitacao, saldo, atualizacao e exclusao de despesas.

### Services

- `splitService`: regra de divisao por `igual`, `porcentagem` e `exato`.
- `balanceService`: calculo de saldos por grupo e por usuario, alem de grafo simples de pagamentos.

## 4. Frontend

### Stack

- React 19.
- Vite.
- React Router DOM 6.
- Vitest e Testing Library.
- CSS modularizado por pagina em `src/frontend/src/pages/styles`.

### Rotas

Definidas em `src/frontend/src/App.jsx`:

- `/`: landing page.
- `/auth`: login/cadastro.
- `/dashboard`: area autenticada.
- `/groups`: lista de grupos.
- `/groups/:groupId`: detalhe do grupo, despesas, membros, atividades e saldo.
- `/activities`: feed agregado de atividades.
- `/profile`: perfil.
- `/reset-password`: tela protegida ainda simples.

### Estado de autenticacao

`src/frontend/src/context/AuthContext.jsx` guarda token em `localStorage`, valida sessao chamando `api.getCurrentUser()` e expoe:

- `token`
- `user`
- `isAuthenticated`
- `bootstrapping`
- `login`
- `register`
- `logout`

### Cliente de API

`src/frontend/src/services/api.js` centraliza chamadas REST, adicionando `Authorization: Bearer <token>` quando houver token salvo. A base URL vem de `import.meta.env.VITE_API_BASE`.

## 5. Contrato de API implementado

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Users

- `GET /api/users/profile`
- `PUT /api/users/profile`
- `POST /api/users`
- `GET /api/users/:userId`

### Groups

- `POST /api/groups`
- `POST /api/groups/:groupId/members`
- `POST /api/groups/:groupId/invite`
- `GET /api/groups/user/:userId`
- `GET /api/groups/:groupId/activities?userId=&limit=`
- `DELETE /api/groups/:groupId`

O arquivo de rotas tambem contem aliases POST/DELETE duplicados para exclusao, mantidos por compatibilidade.

### Expenses

- `POST /api/expenses`
- `GET /api/expenses/group/:groupId?userId=`
- `GET /api/expenses/group/:groupId/balances?userId=`
- `POST /api/expenses/:expenseId/settle`
- `PUT /api/expenses/:expenseId`
- `DELETE /api/expenses/:expenseId`

## 6. Execucao local

### Docker

```bash
docker compose up --build
```

Servicos:

- API: `http://localhost:3000`
- Web: `http://localhost:5174`

### Backend local

```bash
cd src/backend
npm install
npm run dev
```

### Frontend local

```bash
cd src/frontend
npm install
npm run dev
```

## 7. Testes e qualidade

### Backend

```bash
cd src/backend
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run test:system
npm run test:coverage
```

### Frontend

```bash
cd src/frontend
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run test:coverage
```

## 8. Pontos de atencao para evolucao

- `docker-compose.yml` define `VITE_API_URL`, mas o frontend le `VITE_API_BASE`.
- `ProfilePage.jsx` faz `fetch` direto para `http://localhost:3000`, divergindo do cliente central `api.js`.
- `rateLimitMiddleware.js` importa `express-rate-limit`, mas a dependencia nao aparece no `package.json` do backend e o middleware nao esta aplicado nas rotas de auth.
- O error handler global em `server.js` esta com assinatura de 3 argumentos; no Express, middlewares de erro devem receber `(err, req, res, next)`.
- `userRoutes.js` aplica `authenticateToken` em rotas que ja sao protegidas no `server.js`, gerando redundancia.
- `groupRoutes.js` contem multiplos aliases para exclusao de grupo; qualquer refatoracao deve preservar compatibilidade ou atualizar o frontend/testes.
- A resposta de login retorna `userId` com o ID do registro `Auth`, enquanto o frontend busca o perfil real depois via `/api/users/profile`.

## 9. Diretrizes para desenvolvimento

- Preservar a separacao entre credencial (`Auth`) e perfil (`User`).
- Nunca acessar MongoDB diretamente pelo frontend.
- Validar `ObjectId`, existencia de grupo e pertencimento de membro antes de mutar grupos ou despesas.
- Usar `splitService` para qualquer regra de divisao de despesa.
- Usar `balanceService` para qualquer regra de saldo.
- Manter responses e envelopes existentes porque o frontend depende deles.
- Para mudancas de contrato, atualizar backend, frontend, testes e documentacao no mesmo PR.
- Preferir testes focados: unitarios para services, integracao para rotas e sistema para jornadas completas.
