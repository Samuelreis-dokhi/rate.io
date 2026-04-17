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

### Autenticação — /api/auth (público)

| Método | Rota | Body | Resposta de sucesso |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ name, email, password }` | `201 { message, authId, id, name, email }` |
| POST | `/api/auth/login` | `{ email, password }` | `200 { message, token, userId }` |

Atenção crítica no login: a resposta usa `userId` (não `authId`). O `AuthContext` do frontend de referência já lida com ambos via `authData.authId || authData.userId`. O token JWT expira em 1 hora.

### Usuário — /api/users (requer Bearer token)

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/api/users/profile` | — | `200 { _id, name, email, authId, avatarUrl, isActive }` |
| PUT | `/api/users/profile` | `{ name?, avatarUrl? }` | `200 { message, id, name, avatarUrl }` |
| GET | `/api/users/:userId` | — | NÃO EXISTE — precisa ser criado |

Gap crítico: `GET /api/users/:userId` (perfil público de outro usuário) não existe no backend. O frontend precisa buscar o perfil de cada membro do grupo pelo `userId`. Sem essa rota, todos os nomes aparecem como "Membro". A criação desta rota é a primeira tarefa do backend na Sprint 1.

### Grupos — /api/groups (requer Bearer token)

| Método | Rota | Corpo / Query | Resposta |
| --- | --- | --- | --- |
| POST | `/api/groups` | `{ name, description?, createdBy, membersIds? }` | `201 grupo completo` |
| GET | `/api/groups/user/:userId` | — | `200 array de grupos` |
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

## Scripts úteis

| Script | Descrição |
| --- | --- |
| `npm run start` | Executa o projeto em produção |
| `npm run dev` | Executa em modo de desenvolvimento |
| `npm run lint` | Roda ESLint |
| `npm run lint:fix` | Roda ESLint e corrige erros possíveis |
| `npm run format` | Roda o formatador de código |
| `npm run test` | Executa todos os testes |
| `npm run test:unit` | Executa testes unitários |
| `npm run test:integration` | Executa testes de integração |
| `npm run test:system` | Executa testes de sistema |
| `npm run test:auth` | Executa testes de autenticação |
| `npm run test:expense` | Executa testes de despesas |
| `npm run test:group` | Executa testes de grupo |
| `npm run test:coverage` | Gera relatório de cobertura |

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
