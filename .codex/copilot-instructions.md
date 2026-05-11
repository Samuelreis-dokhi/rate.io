# Instrucoes para Copiloto IA

Voce atua como copiloto tecnico do RATE.IO. Seu objetivo e preservar a arquitetura existente, reduzir regressao entre frontend/backend e manter o projeto facil de testar.

## Prioridades

1. Manter contratos REST estaveis.
2. Manter regras financeiras no backend.
3. Validar seguranca de acesso por token e pertencimento a grupos.
4. Preferir alteracoes pequenas, testaveis e alinhadas aos padroes do repositorio.
5. Atualizar testes quando mudar regra de negocio ou contrato.
6. Manter web e mobile consumindo a mesma API, sem contratos paralelos.

## Regras de backend

- Sempre validar `ObjectId` antes de consultar por ID.
- Sempre validar se usuario e membro do grupo antes de expor ou alterar dados do grupo.
- Criacao/alteracao de despesas deve usar `splitService`.
- Calculo de saldos deve usar `balanceService`.
- Nao misturar ID de `Auth` com ID de `User`; o token carrega `Auth`, o perfil funcional e buscado por `authId`.
- Preservar envelopes atuais: `{ expenses }`, `{ balance }`, `{ message, expense }`.

## Regras de frontend

- Usar `api.js` para chamadas HTTP.
- Usar `useAuth()` para usuario autenticado.
- Evitar URL fixa; base de API deve vir de `VITE_API_BASE`.
- Manter telas autenticadas dentro de `ProtectedRoute`.
- Usar `formatMoney` e `formatDate` quando exibir valores financeiros/datas.

## Regras de mobile

- Seguir `src/mobile/playbook.md`.
- Usar Expo e React Native como base da aplicacao.
- Centralizar HTTP em `src/mobile/src/services/apiClient.*`.
- Nao usar URL fixa; base de API deve vir de variavel publica do Expo.
- Guardar token por camada dedicada de storage; preferir storage seguro quando disponivel.
- Apos login, buscar `GET /api/users/profile` e usar o `_id` de `User`.
- Preservar envelopes atuais: `{ expenses }`, `{ balance }`, `{ message, expense }`.
- Tratar loading, erro, vazio e sessao expirada em telas que consomem API.
- Nao duplicar regra financeira no app; consumir `splitService` e `balanceService` indiretamente pela API.

## Ao revisar codigo

Verifique primeiro:

- Quebra de contrato API/frontend.
- Falta de validacao de membro do grupo.
- Uso incorreto de `authId` versus `_id` de perfil.
- Falta de teste para regra financeira.
- Dependencias usadas mas nao declaradas.
- Variaveis de ambiente divergentes entre Docker, README e codigo.
- No mobile, URL fixa, uso do ID de `Auth` como perfil funcional ou `fetch` espalhado fora do cliente central.
