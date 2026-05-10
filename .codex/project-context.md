# RATE.IO - Contexto do Projeto

## Produto

Aplicacao de rateio financeiro colaborativo para grupos. Usuarios criam grupos, convidam membros, registram despesas, dividem valores e acompanham saldos/pendencias.

## Arquitetura

- Monorepo com backend e frontend separados em `src/backend` e `src/frontend`.
- Backend: Express 5, CommonJS, Mongoose, JWT, bcryptjs.
- Frontend: React 19, Vite, React Router, CSS por pagina.
- Banco: MongoDB com conexoes separadas por dominio (`auth`, `user`, `group`, `expense`).
- Execucao integrada via Docker Compose.

## Dominios

- Auth: credenciais, login, hash de senha, JWT.
- User: perfil funcional do usuario.
- Group: grupos, membros, atividades e exclusao logica.
- Expense: despesas, splits, quitacoes, saldo.
- Activity: trilha de eventos por grupo.

## Arquivos-chave

- Backend entrypoint: `src/backend/server.js`
- Conexoes Mongo: `src/backend/config/database.js`
- Middleware JWT: `src/backend/middleware/authMiddleware.js`
- Cliente API frontend: `src/frontend/src/services/api.js`
- Auth React: `src/frontend/src/context/AuthContext.jsx`
- Rotas React: `src/frontend/src/App.jsx`
- Relatorio tecnico: `docs/14-Relatorio Tecnico de Desenvolvimento e Arquitetura.md`

## Contratos sensiveis

- Login retorna `{ message, token, userId }`, onde `userId` e o ID do registro `Auth`.
- Perfil autenticado vem de `GET /api/users/profile` e retorna o documento `User`.
- Listagem de despesas retorna envelope `{ expenses: [...] }`.
- Saldo de grupo retorna envelope `{ balance: {...} }`.
- Rotas protegidas exigem `Authorization: Bearer <token>`.

## Pontos de atencao

- O frontend usa `VITE_API_BASE`; o Compose define `VITE_API_URL`.
- `ProfilePage.jsx` possui chamadas diretas para `http://localhost:3000`.
- `groupRoutes.js` tem aliases duplicados para exclusao de grupo.
- `rateLimitMiddleware.js` nao esta aplicado e depende de pacote ausente no backend.
- Preservar compatibilidade de payloads enquanto houver testes ou telas usando contratos atuais.
