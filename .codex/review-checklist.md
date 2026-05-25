# Checklist de Revisao

## Backend

- [ ] Endpoint protegido usa JWT quando necessario.
- [ ] Payload obrigatorio e validado.
- [ ] IDs sao validados com `mongoose.Types.ObjectId.isValid`.
- [ ] Usuario pertence ao grupo antes de acessar grupos/despesas/atividades.
- [ ] Regras de split passam por `splitService`.
- [ ] Regras de saldo passam por `balanceService`.
- [ ] Response mantem contrato consumido pelo frontend.
- [ ] Erros retornam status HTTP coerente.
- [ ] Testes relevantes foram adicionados ou ajustados.

## Frontend

- [ ] Chamadas HTTP passam por `src/frontend/src/services/api.js`.
- [ ] Nao ha URL fixa de backend.
- [ ] Rotas privadas usam `ProtectedRoute`.
- [ ] Estados de loading, erro e vazio foram considerados.
- [ ] ID usado nas operacoes e o `_id` do perfil `User`, nao o ID de `Auth`.
- [ ] Variavel de ambiente usada e `VITE_API_BASE`.

<<<<<<< HEAD
## Mobile

- [ ] Chamadas HTTP passam por `src/mobile/src/services/apiClient.*`.
- [ ] Nao ha URL fixa de backend em telas ou componentes.
- [ ] Base da API vem de variavel publica do Expo.
- [ ] Token JWT e lido/escrito por camada dedicada de storage.
- [ ] ID usado nas operacoes e o `_id` do perfil `User`, nao o ID de `Auth`.
- [ ] Envelopes `{ expenses }`, `{ balance }` e `{ message, expense }` foram preservados.
- [ ] Telas tratam loading, erro, vazio e sessao expirada.
- [ ] Regras financeiras criticas continuam no backend.
- [ ] Testes relevantes de services/hooks foram adicionados ou ajustados.

=======
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
## Documentacao

- [ ] README/docs refletem comandos e variaveis reais.
- [ ] Mudancas de contrato REST foram documentadas.
- [ ] Novas decisoes arquiteturais foram registradas quando relevantes.
<<<<<<< HEAD
- [ ] Mudancas mobile relevantes foram refletidas em `src/mobile/playbook.md`.
=======
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
