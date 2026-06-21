# Registro de Testes de Integração

## Objetivo

Registrar testes que validam a colaboração entre camadas: rotas, controllers, models, banco em memória, componentes React e contratos de serviços.

## Ambiente

| Módulo | Ferramentas | Isolamento |
| --- | --- | --- |
| Backend | Jest, Supertest, mongodb-memory-server | MongoDB em memória e limpeza entre testes |
| Frontend Web | Vitest, Testing Library, JSDOM | Mocks de contexto e roteamento em memória |
| Mobile | Jest Expo, Testing Library React Native | Provider real com serviços e storage mockados |

## Backend

Diretório: `src/backend/tests/integration`

Comando:

```bash
cd src/backend
npm run test:integration
```

Casos cobertos:

| Suite | Escopo | Resultado validado |
| --- | --- | --- |
| `auth.routes.test.js` | Registro, login, troca de senha e middleware JWT | PASS |
| `group.routes.test.js` | Criação, membros, convite, listagem, atividades e remoção lógica | PASS |
| `expense.routes.test.js` | Criação, listagem, quitação, atualização, exclusão e saldos | PASS |

Resultado validado em 2026-06-20: 3 suítes, 69 testes aprovados.

## Frontend Web

Diretório: `src/frontend/src/tests/integration`

Comando:

```bash
cd src/frontend
npm run test:integration
```

Casos cobertos:

| Suite | Escopo | Resultado validado |
| --- | --- | --- |
| `ProtectedRoute.test.jsx` | Redirecionamento sem autenticação, estado de carregamento e renderização autenticada | PASS |

Resultado validado em 2026-06-20: 1 suíte, 3 testes aprovados.

## Mobile

Diretório: `src/mobile/__tests__/integration`

Comando:

```bash
cd src/mobile
npm run test:integration
```

Casos cobertos:

| Suite | Escopo | Resultado validado |
| --- | --- | --- |
| `auth-context.integration.test.tsx` | `AuthProvider` real coordenando bootstrap de desenvolvimento, login, cadastro com login automático, refresh de perfil, logout, storage e serviços mockados | PASS |

Resultado validado em 2026-06-20: 1 suíte, 3 testes aprovados.

## Critérios F.I.R.S.T.

- Integração backend usa banco descartável, garantindo repetibilidade.
- Integração frontend usa roteador em memória e mock do hook de autenticação, garantindo independência.
- Integração mobile usa provider real e mocks de borda para validar coordenação entre autenticação, storage e serviços.
- Todos os testes têm assertivas automáticas e não exigem inspeção manual.

## Execução consolidada

| Data | Módulo | Comando | Resultado |
| --- | --- | --- | --- |
| 2026-06-20 | Backend | `npm run test:integration` | PASS, 69/69 |
| 2026-06-20 | Frontend | `npm run test:integration` | PASS, 3/3 |
| 2026-06-20 | Mobile | `npm run test:integration` | PASS, 3/3 |
