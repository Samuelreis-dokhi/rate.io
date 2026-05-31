# Workflow de Desenvolvimento com IA

## Antes de editar

1. Leia o arquivo ou modulo alvo.
2. Identifique se a mudanca altera contrato entre frontend e backend.
3. Verifique testes existentes em `src/backend/tests` ou `src/frontend/src/tests`.
4. Se houver alteracao de API, atualize cliente frontend, testes e documentacao relacionada.

## Comandos principais

Backend:

```bash
cd src/backend
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run test:system
```

Frontend:

```bash
cd src/frontend
npm run lint
npm run test
npm run build
```

<<<<<<< HEAD
Mobile:

```bash
cd src/mobile
npm run lint
npm run test
npm run start
```

=======
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
Ambiente completo:

```bash
docker compose up --build
```

## Padroes de implementacao

- Backend usa CommonJS (`require`, `module.exports`).
- Frontend usa ES modules.
<<<<<<< HEAD
- Mobile usa Expo/React Native e deve centralizar HTTP em `src/mobile/src/services/apiClient.*`.
- Services devem conter regra de negocio reutilizavel.
- Controllers devem validar entrada, chamar models/services e montar response HTTP.
- Nao duplicar chamadas `fetch`; preferir `src/frontend/src/services/api.js`.
- No mobile, nao duplicar chamadas `fetch`; preferir o cliente central de API mobile.
=======
- Services devem conter regra de negocio reutilizavel.
- Controllers devem validar entrada, chamar models/services e montar response HTTP.
- Nao duplicar chamadas `fetch`; preferir `src/frontend/src/services/api.js`.
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
- Nao inserir segredo em codigo, README ou testes.
- Evitar refatoracoes amplas sem necessidade funcional clara.

## Estrategia de testes

- Regras puras de rateio e saldo: testes unitarios.
- Endpoints REST e validacoes de contrato: testes de integracao.
- Jornada registro/login/grupo/despesa/quitacao: testes de sistema.
- Componentes/rotas protegidas/frontend: Vitest com Testing Library.
<<<<<<< HEAD
- Cliente API, storage de sessao e hooks mobile: Jest/Testing Library para React Native.
=======
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
