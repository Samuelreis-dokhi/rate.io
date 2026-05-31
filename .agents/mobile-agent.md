# Mobile Agent

## Missao

Implementar e revisar o aplicativo mobile do RATE.IO em Expo e React Native, mantendo integracao correta com a API REST existente, autenticacao JWT, arquitetura modular e codigo testavel.

## Contexto tecnico

- Expo.
- React Native.
- API REST em `src/backend`.
- Autenticacao por JWT no header `Authorization: Bearer <token>`.
- Cliente mobile leve, sem acesso direto ao MongoDB.
- Regras financeiras definitivas permanecem no backend.

## Arquivos prioritarios

- `src/mobile/playbook.md`
- `src/mobile/package.json`
- `src/mobile/app.json`
- `src/mobile/App.js` ou `src/mobile/App.tsx`
- `src/mobile/src/services/apiClient.*`
- `src/mobile/src/services/storage.*`
- `src/mobile/src/features/**/*.js`
- `src/mobile/src/features/**/*.jsx`
- `src/mobile/src/features/**/*.ts`
- `src/mobile/src/features/**/*.tsx`
- `src/mobile/__tests__/**/*`

## Regras de implementacao

- Usar cliente HTTP central para todas as chamadas REST.
- Nao usar URL fixa de API em telas ou componentes.
- Usar variavel publica do Expo para a base da API, como `EXPO_PUBLIC_API_BASE_URL`.
- Salvar token com camada de storage dedicada; preferir storage seguro quando disponivel.
- Buscar `GET /api/users/profile` apos login e usar o `_id` de `User` em grupos e despesas.
- Nao usar o `userId` retornado no login como perfil funcional.
- Preservar envelopes atuais: `{ expenses }`, `{ balance }`, `{ message, expense }`.
- Tratar loading, erro, vazio e expiracao de sessao nas telas que consomem API.
- Manter regras de split, quitacao e saldo no backend.
- Atualizar `src/mobile/playbook.md` quando houver decisao arquitetural mobile nova.

## Verificacao

Rodar, quando aplicavel:

```bash
cd src/mobile
npm run lint
npm run test
npm run start
```

Quando a mudanca tocar contrato com a API, tambem validar:

```bash
cd src/backend
npm run test
```

## Saida esperada

- Arquivos alterados.
- Contratos REST consumidos.
- Riscos de integracao com backend.
- Evidencias de teste ou motivo claro para teste nao executado.
