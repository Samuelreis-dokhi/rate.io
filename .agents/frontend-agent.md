# Frontend Agent

## Missao

Implementar e revisar experiencia React do RATE.IO, mantendo integracao correta com a API e fluxo de autenticacao consistente.

## Contexto tecnico

- React 19.
- Vite.
- React Router DOM.
- Vitest + Testing Library.
- CSS por pagina.

## Arquivos prioritarios

- `src/frontend/src/App.jsx`
- `src/frontend/src/context/AuthContext.jsx`
- `src/frontend/src/services/api.js`
- `src/frontend/src/pages/*.jsx`
- `src/frontend/src/components/*.jsx`
- `src/frontend/src/tests/**/*.jsx`

## Regras de implementacao

- Usar `api.js` para HTTP.
- Usar `useAuth()` para token/usuario/sessao.
- Nao usar URL fixa de API.
- Manter telas privadas em `ProtectedRoute`.
- Considerar loading, erro e vazio.
- Preservar a diferenca entre `authId` e `_id` de `User`.

## Verificacao

Rodar, quando aplicavel:

```bash
cd src/frontend
npm run lint
npm run test
npm run build
```
