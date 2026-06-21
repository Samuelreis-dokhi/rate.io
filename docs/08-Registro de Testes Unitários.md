# Registro de Testes Unitários

## Objetivo

Registrar a cobertura unitária atual do RATE.IO para backend, frontend web e mobile, garantindo detecção rápida de defeitos nas regras de domínio, contratos de serviço e estado de autenticação.

## Critérios F.I.R.S.T. adotados

- **Fast:** testes unitários rodam sem dependências externas reais.
- **Independent:** cada caso prepara seus mocks e limpa estado compartilhado.
- **Repeatable:** não dependem de MongoDB Atlas, rede externa ou relógio de produção.
- **Self-validating:** cada teste possui `expect` objetivo e resultado PASS/FAIL automático.
- **Timely:** testes cobrem contratos implementados e bugs corrigidos durante o desenvolvimento.

## Backend

Diretório: `src/backend/tests/unit`

Comando:

```bash
cd src/backend
npm run test:unit
```

Escopo coberto:

| Arquivo | Escopo |
| --- | --- |
| `spliteService.test.js` | Tipos de divisão `igual`, `porcentagem` e `exato`, validações e arredondamento |
| `balanceService.test.js` | Cálculo de saldo, resumo por usuário e grafo de pagamentos |
| `ChangePasswordService.test.js` | Validação de senha atual, confirmação, hash e regras de troca |

Resultado validado em 2026-06-20: 3 suítes, 39 testes aprovados.

## Frontend Web

Diretório: `src/frontend/src/tests/unit`

Comando:

```bash
cd src/frontend
npm run test:unit
```

Escopo coberto:

| Arquivo | Escopo |
| --- | --- |
| `api.test.jsx` | Headers de autenticação, serialização de payloads, erros HTTP e liquidação de despesa |
| `aut-context.test.jsx` | Login, logout, restauração de sessão e limpeza de token inválido |

Resultado validado em 2026-06-20: 2 suítes, 9 testes aprovados.

## Mobile

Diretório: `src/mobile/__tests__`

Comando:

```bash
cd src/mobile
npm run test:unit
```

Escopo coberto:

| Arquivo | Escopo |
| --- | --- |
| `api-client.test.ts` | Respostas de sucesso, `ApiError`, status HTTP e limpeza de sessão em 401 |
| `auth-service.test.ts` | Contratos de login, cadastro e troca de senha via `PUT` |
| `domain-services.test.ts` | Endpoints e envelopes de grupos, despesas, saldos, quitação e exclusão |

Resultado validado em 2026-06-20: 3 suítes, 11 testes aprovados.

## Procedimento padrão

1. Instalar dependências do módulo alvo com `npm install`.
2. Executar o comando unitário do módulo.
3. Corrigir falhas mantendo independência dos casos.
4. Reexecutar a suíte completa antes do merge.

## Execução consolidada

| Data | Módulo | Comando | Resultado |
| --- | --- | --- | --- |
| 2026-06-20 | Backend | `npm run test:unit` | PASS, 39/39 |
| 2026-06-20 | Frontend | `npm run test:unit` | PASS, 9/9 |
| 2026-06-20 | Mobile | `npm run test:unit` | PASS, 11/11 |
