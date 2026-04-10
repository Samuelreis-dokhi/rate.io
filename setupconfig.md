# Setup Inicial do Projeto (Back-end)

Este documento centraliza o setup do ambiente e o guia reutilizável de testes no Postman.

## 1. Objetivo

Padronizar o onboarding da equipe, reduzir erros de ambiente e manter um fluxo único para instalação, configuração, execução e validação da API.

## 2. Pré-requisitos

1. Git
2. Node.js 18+ e npm 9+
3. Docker e Docker Compose (recomendado)
4. VS Code (recomendado)
5. Postman
6. Acesso ao MongoDB Atlas (ou Mongo local)

Validação rápida:

```bash
git --version
node -v
npm -v
docker --version
docker compose version
```

## 3. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd pmv-ads-2026-1-e4-infra-t1-segunda-20h
```

## 4. Configurar ambiente do backend

```bash
cp src/backend/.env.example src/backend/.env
```

Preencha `src/backend/.env`:

```env
PORT=3000
JWT_SECRET=<sua-chave-jwt>
MONGO_URI_AUTH=<uri-do-mongo-auth>
MONGO_URI_USERS=<uri-do-mongo-users>
MONGO_URI_EXPENSES=<uri-do-mongo-expenses>
MONGO_URI_GROUPS=<uri-do-mongo-groups>
```

Observações:

1. Faça URL encode da senha do Atlas, se necessário.
2. Libere seu IP em Network Access no Atlas.
3. Garanta permissão de leitura/escrita para o usuário do banco.

## 5. Instalar dependências

```bash
cd src/backend
npm install
```

## 6. Rodar a API

### Opção A: Docker (na raiz do projeto)

```bash
docker compose up --build
```

### Opção B: Node local (em `src/backend`)

```bash
npm run dev
```

## 7. Verificar se a API subiu

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

## 8. Scripts disponíveis

```bash
npm run start
npm run dev
npm run lint
npm run lint:fix
npm run format
npm run test
npm run test:unit
npm run test:integration
npm run test:system
```

## 9. Guia Reutilizável de Testes no Postman

### 9.1 Criar Environment

Crie um Environment no Postman com:

1. `baseUrl` = `http://localhost:3000`
2. `tokenUser1`
3. `tokenUser2`
4. `profileIdUser1`
5. `profileIdUser2`
6. `groupId`
7. `expenseId`

### 9.2 Regras importantes

1. Rotas protegidas exigem `Authorization: Bearer <token>`.
2. Para grupos e despesas, use IDs de perfil (não `authId`).
3. Body em `raw -> JSON`.
4. `update profile` usa `PUT`.
5. `settle` exige `userId` e `paidBy` no body.

### 9.3 Fluxo recomendado de requests

1. Registrar usuário 1
2. Login usuário 1 (salvar token em `tokenUser1`)
3. Registrar usuário 2
4. Login usuário 2 (salvar token em `tokenUser2`)
5. Buscar perfil do usuário 1 (salvar `_id` em `profileIdUser1`)
6. Buscar perfil do usuário 2 (salvar `_id` em `profileIdUser2`)
7. Criar grupo com usuário 1 (salvar `_id` em `groupId`)
8. Adicionar usuário 2 no grupo
9. Listar grupos do usuário 1
10. Criar despesa no grupo (salvar `expense._id` em `expenseId`)
11. Listar despesas do grupo
12. Marcar parcela como paga (`settle`)
13. Consultar balanço do grupo
14. Listar atividades do grupo
15. Deletar grupo

### 9.4 Endpoints principais (referência rápida)

Autenticação:

- `POST {{baseUrl}}/api/auth/register`
- `POST {{baseUrl}}/api/auth/login`

Usuário:

- `GET {{baseUrl}}/api/users/profile`
- `PUT {{baseUrl}}/api/users/profile`

Grupo:

- `POST {{baseUrl}}/api/groups`
- `POST {{baseUrl}}/api/groups/{{groupId}}/members`
- `GET {{baseUrl}}/api/groups/user/{{profileIdUser1}}`
- `GET {{baseUrl}}/api/groups/{{groupId}}/activities?userId={{profileIdUser1}}&limit=50`
- `DELETE {{baseUrl}}/api/groups/{{groupId}}`

Despesas:

- `POST {{baseUrl}}/api/expenses`
- `GET {{baseUrl}}/api/expenses/group/{{groupId}}?userId={{profileIdUser1}}`
- `POST {{baseUrl}}/api/expenses/{{expenseId}}/settle`
- `GET {{baseUrl}}/api/expenses/group/{{groupId}}/balances?userId={{profileIdUser1}}`

### 9.5 Erros esperados (checklist)

1. Sem token em rota protegida -> `401`
2. Token inválido/expirado -> `401`
3. ObjectId inválido -> `400`
4. Usuário sem permissão -> `403`
5. Recurso inexistente -> `404`

## 10. Troubleshooting rápido

### ENOENT package.json

Causa: comando executado fora de `src/backend`.

Correção:

```bash
cd src/backend
npm run dev
```

### Erro de autenticação MongoDB

Verifique:

1. Usuário e senha.
2. URL encode da senha.
3. Permissões no Atlas.
4. IP liberado em Network Access.

### Erro 401 no Postman

Verifique:

1. Bearer Token preenchido corretamente.
2. Token atualizado após novo login.

## 11. Boas práticas

1. Não versionar `src/backend/.env`.
2. Versionar somente `src/backend/.env.example`.
3. Rodar `npm run format` e `npm run lint` antes de commit.
4. Usar branch por contexto (`feature/...`, `bugfix/...`, `docs/...`, `test/...`).

## 12. Checklist de onboarding

1. Clonei o repositório.
2. Configurei `src/backend/.env`.
3. Instalei dependências.
4. Subi a API (Docker ou Node local).
5. Validei `GET /health`.
6. Rodei lint/format.
7. Testei fluxo principal no Postman.
