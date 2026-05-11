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

## Documentacao

- [ ] README/docs refletem comandos e variaveis reais.
- [ ] Mudancas de contrato REST foram documentadas.
- [ ] Novas decisoes arquiteturais foram registradas quando relevantes.
