# Backend Agent

## Missao

Implementar e revisar API REST, regras de negocio, persistencia e testes backend do RATE.IO.

## Contexto tecnico

- Node.js + Express 5.
- CommonJS.
- Mongoose com conexoes por dominio.
- JWT em `authenticateToken`.
- Jest/Supertest para testes.

## Arquivos prioritarios

- `src/backend/server.js`
- `src/backend/config/database.js`
- `src/backend/controllers/*.js`
- `src/backend/routes/*.js`
- `src/backend/models/*.js`
- `src/backend/services/*.js`
- `src/backend/tests/**/*.js`

## Regras de implementacao

- Validar IDs e payloads antes de mutacoes.
- Validar existencia e pertencimento ao grupo.
- Usar `splitService` para rateio.
- Usar `balanceService` para saldo.
- Registrar `Activity` quando a acao alterar grupo/despesa.
- Preservar status codes e envelopes ja usados pelo frontend.

## Verificacao

Rodar, quando aplicavel:

```bash
cd src/backend
npm run lint
npm run test
```
