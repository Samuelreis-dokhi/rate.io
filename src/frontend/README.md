# Frontend Web — Rate.io

Aplicação web em React + Vite que consome a API REST do backend. A autenticação fica centralizada em `src/context/AuthContext.jsx`, as chamadas HTTP em `src/services/api.js` e as telas em `src/pages`.

## Como rodar

```bash
cd src/frontend
npm install
npm run dev
```

Configure `VITE_API_BASE` quando a API não estiver em `http://localhost:3000`.

```env
VITE_API_BASE=http://localhost:3000
```

## Testes

A suíte usa Vitest, Testing Library e JSDOM. Os testes são separados por nível:

| Nível | Pasta | Comando | Escopo |
| --- | --- | --- | --- |
| Unitário | `src/tests/unit` | `npm run test:unit` | Cliente HTTP e contexto de autenticação |
| Integração | `src/tests/integration` | `npm run test:integration` | Composição de componentes como `ProtectedRoute` |
| E2E web | `src/tests/e2e` | `npm run test:e2e` | Fluxo autenticado da tela de login até dashboard com API mockada |

Execução completa:

```bash
npm test
```

Última validação: 4 suítes e 13 testes aprovados em 2026-06-20.

## Estrutura CSS

- `src/index.css`: tema global, reset, variáveis e tipografia base.
- `src/App.css`: estilos compartilhados de layout.
- `src/pages/styles/`: estilos específicos por página.

Imagens públicas devem ficar em `public/`.
