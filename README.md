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

## Dependências do Back-end

Dependências principais (instaladas via `npm install`):

- express
- cors
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv

Dependências de desenvolvimento:

- nodemon
- jest
- supertest
- eslint
- prettier
- mongodb-memory-server

## Estrutura do Projeto

Principais caminhos:

- `src/backend` -> API Node.js
- `docs` -> documentação técnica
- `setupconfig.md` -> guia detalhado de setup e testes Postman

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

## Scripts Úteis (src/backend)

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

## Passo a Passo Rápido de Uso

1. Suba a API (Docker ou Node local).
2. Verifique o healthcheck em `GET /health`.
3. Faça registro e login para obter token JWT.
4. Use o token para acessar rotas protegidas (`/api/users`, `/api/groups`, `/api/expenses`).

## Postman

O guia de Postman foi movido para `setupconfig.md` para reaproveitamento e manutenção centralizada.

Acesse diretamente:

- `setupconfig.md` -> seção **Guia Reutilizável de Testes no Postman**

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
- [Apresentação da Solução](presentation/README.md)
