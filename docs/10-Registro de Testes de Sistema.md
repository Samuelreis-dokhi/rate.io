# Registro de Testes de Sistema e E2E

## Objetivo

Registrar os testes que validam jornadas completas do RATE.IO em nível de sistema, cobrindo fluxos críticos de usuário e integração entre funcionalidades principais.

## Backend: E2E de API

Diretório: `src/backend/tests/system`

Comando:

```bash
cd src/backend
npm run test:system
```

Fluxo coberto por `userJourney.test.js`:

1. Cadastro de dois usuários.
2. Login e emissão de JWT.
3. Consulta de perfil autenticado.
4. Criação de grupo.
5. Inclusão de membro.
6. Criação de despesa com divisão igual.
7. Consulta de saldo antes da quitação.
8. Quitação de parcela.
9. Consulta de saldo final.
10. Consulta de despesas e atividades.
11. Remoção lógica do grupo.

Resultado validado em 2026-06-20: 1 suíte, 1 jornada aprovada.

## Frontend Web: E2E com API mockada

Diretório: `src/frontend/src/tests/e2e`

Comando:

```bash
cd src/frontend
npm run test:e2e
```

Fluxo coberto por `authenticated-flow.test.jsx`:

1. Renderização da rota `/auth`.
2. Preenchimento de email e senha.
3. Login pelo `AuthProvider`.
4. Persistência do token.
5. Redirecionamento para dashboard.
6. Carregamento de grupos, perfis e despesas por contrato de serviço mockado.
7. Exibição do resumo financeiro e pendência.

Resultado validado em 2026-06-20: 1 suíte, 1 fluxo aprovado.

## Mobile: E2E com serviços mockados

Diretório: `src/mobile/__tests__/e2e`

Comando:

```bash
cd src/mobile
npm run test:e2e
```

Fluxo coberto por `authenticated-mobile-flow.e2e.test.tsx`:

1. Renderização da tela mobile de login dentro do `AuthProvider`.
2. Preenchimento de email e senha.
3. Normalização do email e autenticação pelo serviço de auth mockado.
4. Persistência do token e perfil no storage mockado.
5. Troca automática para o dashboard autenticado.
6. Carregamento de grupos, perfis públicos e despesas.
7. Exibição da pendência financeira no dashboard mobile.

Resultado validado em 2026-06-20: 1 suíte, 1 fluxo aprovado.

## Critérios F.I.R.S.T.

- **Fast:** os testes E2E automatizados evitam infraestrutura externa.
- **Independent:** cada jornada cria sua própria massa ou mocka sua API.
- **Repeatable:** backend usa MongoDB em memória; frontend usa MemoryRouter e mocks; mobile usa provider real com serviços e storage mockados.
- **Self-validating:** o sucesso depende apenas das assertivas da suíte.
- **Timely:** os fluxos refletem o contrato atual de autenticação, grupos e despesas.

## Execução consolidada

| Data | Módulo | Comando | Resultado |
| --- | --- | --- | --- |
| 2026-06-20 | Backend | `npm run test:system` | PASS, 1/1 jornada |
| 2026-06-20 | Frontend | `npm run test:e2e` | PASS, 1/1 fluxo |
| 2026-06-20 | Mobile | `npm run test:e2e` | PASS, 1/1 fluxo |
