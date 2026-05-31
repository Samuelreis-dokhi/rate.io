# Mobile — Rate.io

Aplicação mobile do Rate.io construída com **Expo**, **React Native** e **Expo Router**. O módulo já possui a base do fluxo autenticado, telas de login e cadastro, navegação inferior da área logada e integração inicial com a API do backend.

> **Status atual**
>
> O objetivo desta etapa foi fechar o fluxo principal do app, não construir a dashboard completa. Hoje o usuário já consegue:
>
> 1. acessar login e cadastro;
> 2. autenticar-se na API;
> 3. entrar na área logada;
> 4. visualizar a mensagem `Você está logado`;
> 5. navegar pelas abas `Dash`, `Grupos`, `Atividades` e `Logout`;
> 6. sair e retornar à tela de login.

---

## Como rodar o projeto

Antes de iniciar o mobile, garanta que:

- o backend esteja rodando na porta `3000`;
- as dependências do mobile estejam instaladas;
- no caso de uso com **Expo Go em celular físico**, o celular e o computador estejam na mesma rede Wi-Fi.

### 1. Instalar dependências

No diretório do mobile:

```bash
cd src/mobile
npm install
```

### 2. Iniciar o projeto

```bash
npm start
```

Esse comando inicia o servidor do Expo e mostra as opções disponíveis no terminal.

> Em ambiente de desenvolvimento, o app inicia **sempre deslogado** por decisão de fluxo. Isso facilita testes repetidos de login e cadastro. Em produção, a sessão persistida poderá ser reaproveitada normalmente.

---

## Rodando com Expo Go

### Passo a passo

1. Inicie o backend na raiz do repositório:

   ```bash
   docker compose up api
   ```

   ou, se preferir executar manualmente:

   ```bash
   cd src/backend
   npm install
   npm run dev
   ```

2. Em outro terminal, inicie o mobile:

   ```bash
   cd src/mobile
   npm start
   ```

3. No celular, abra o aplicativo **Expo Go**.

4. Leia o QR Code exibido pelo Expo.

5. O app será carregado no dispositivo e usará automaticamente o IP do host do bundler para alcançar a API local em `:3000`.

### Como a URL da API funciona no Expo Go

Durante o desenvolvimento, se nenhuma variável explícita for definida, o app tenta inferir a API a partir do host do Expo. Exemplo:

- bundler acessível em `192.168.2.126:8081`;
- API inferida como `http://192.168.2.126:3000`.

Isso evita precisar trocar manualmente o `.env` toda vez que alternamos entre web e dispositivo físico.

### Problemas comuns no Expo Go

#### `Failed to fetch`

Verifique:

- se o backend está rodando;
- se o celular e o computador estão na mesma rede Wi-Fi;
- se o firewall do sistema não está bloqueando conexões locais;
- se a API responde em `http://SEU_IP_LOCAL:3000/health` a partir de outro dispositivo da mesma rede.

#### O celular não consegue acessar `localhost`

Isso é esperado. No celular, `localhost` aponta para o próprio celular, não para o computador. Por isso, em Expo Go usamos o IP da máquina local.

---

## Rodando no navegador (Web)

### Passo a passo

1. Inicie o backend na porta `3000`.

2. No diretório do mobile, execute:

   ```bash
   npm run web
   ```

3. Abra a URL informada pelo Expo no navegador.

### Como a URL da API funciona no Web

No navegador, em desenvolvimento, o app monta automaticamente a URL da API usando o host atual do browser e a porta `3000`.

Exemplo:

- app em `http://localhost:8081`;
- API usada automaticamente: `http://localhost:3000`.

### CORS no desenvolvimento web

O backend foi ajustado para aceitar origens locais durante o desenvolvimento, inclusive diferentes portas de `localhost` e `127.0.0.1`. Isso permite que o Expo Web faça requisições para a API local sem gerar erro de CORS.

---


## Testes automatizados

A suíte mobile usa Jest Expo. Os testes unitários isolam a camada de serviços com mocks do `api-client`, validam montagem de endpoints, métodos HTTP, envelopes de resposta e limpeza de sessão em erro 401.

| Nível | Pasta | Comando | Escopo |
| --- | --- | --- | --- |
| Unitário | `__tests__` | `npm run test:unit` | `api-client`, serviços de auth, grupos e despesas |
| Integração | `__tests__/integration` | `npm run test:integration` | `AuthProvider` real integrado a serviços e storage mockados |
| E2E | `__tests__/e2e` | `npm run test:e2e` | Fluxo da tela de login ao dashboard mobile com dados financeiros |
| Cobertura | `__tests__` | `npm run test:coverage` | Relatório de cobertura Jest |

Execução completa:

```bash
cd src/mobile
npm test
```

Última validação: 5 suítes e 15 testes aprovados em 2026-05-30.

Observação de contrato: a troca de senha usa `PUT /api/auth/change-password`, igual ao backend.

## Variáveis de ambiente

O mobile suporta override explícito por variável de ambiente:

```env
EXPO_PUBLIC_API_BASE_URL=https://sua-api.com
```

### Comportamento atual

- se `EXPO_PUBLIC_API_BASE_URL` existir, ela tem prioridade;
- se não existir e o app estiver em desenvolvimento:
  - no **web**, a URL é inferida pelo host do navegador;
  - no **Expo Go**, a URL é inferida pelo host do bundler;
- se não existir em produção, o app lança erro de configuração.

### Arquivos envolvidos

- `app.config.js`
- `services/api-client.ts`
- `.env`

### Recomendação de uso

- **desenvolvimento local:** deixar sem valor fixo e usar inferência automática;
- **staging/produção:** definir explicitamente `EXPO_PUBLIC_API_BASE_URL`.

---

## Arquitetura do mobile

A aplicação está organizada em torno de quatro responsabilidades principais:

```text
src/mobile
├── app/                    # Rotas e layouts do Expo Router
├── components/             # Componentes reutilizáveis de UI
├── constants/              # Tokens visuais e tema
├── hooks/                  # Hooks compartilhados
├── services/               # Infraestrutura: API e storage
└── src/features/           # Regras de negócio por domínio
```

### Rotas e navegação

O app usa **Expo Router** com grupos de rota:

```text
app/
├── (auth)/                 # Rotas públicas
│   ├── login.tsx
│   ├── register.tsx
│   └── _layout.tsx
├── (app)/                  # Área autenticada
│   ├── index.tsx           # Dash inicial
│   ├── groups/index.tsx
│   ├── activities.tsx
│   ├── logout.tsx
│   └── _layout.tsx         # Bottom tabs
└── _layout.tsx             # AuthGate + providers globais
```

### Fluxo de autenticação

O fluxo está centralizado em `src/features/auth/auth-context.tsx`.

Responsabilidades principais:

- manter o usuário autenticado em memória;
- executar login, cadastro, logout e atualização de perfil;
- decidir se a sessão salva deve ser restaurada;
- no ambiente de desenvolvimento, limpar a sessão ao iniciar para facilitar testes.

O `AuthGate`, em `app/_layout.tsx`, observa o estado de autenticação e redireciona:

- usuário não autenticado → `/(auth)/login`;
- usuário autenticado em rota pública → `/(app)`.

### Camada de serviços

#### `services/api-client.ts`

Responsável por:

- descobrir a URL base da API;
- incluir o token JWT no header `Authorization`;
- tratar erros HTTP;
- limpar a sessão automaticamente em respostas `401`.

#### `services/storage.ts`

Responsável por persistir:

- token de autenticação;
- perfil do usuário.

A implementação muda conforme a plataforma:

- **iOS/Android:** `expo-secure-store`;
- **Web:** `localStorage`;
- **fallback em memória:** usado quando o storage do navegador não está disponível.

Essa separação evita falhas no web, onde o `expo-secure-store` não fornece a mesma API nativa disponível em dispositivos móveis.

---

## Componentes reutilizáveis

### Componentes de UI próprios

Os principais componentes já disponíveis estão em `components/ui/`:

- `app-button.tsx` — botão padronizado da aplicação;
- `app-input.tsx` — campo de formulário reutilizável;
- `activity-item.tsx` — item de atividade;
- `empty-state.tsx` — estado vazio;
- `stat-card.tsx` — cartão de métrica;
- `icon-symbol.tsx` e `icon-symbol.ios.tsx` — abstração de ícones por plataforma.

### Componentes de apoio

Também existem componentes herdados ou auxiliares:

- `haptic-tab.tsx` — interação háptica nas abas;
- `themed-text.tsx` e `themed-view.tsx` — suporte a tema;
- `parallax-scroll-view.tsx` — layout legado do template inicial.

> Observação: alguns componentes e rotas do template original do Expo ainda existem no projeto, como `app/(tabs)/index.tsx` e `modal.tsx`, mas não fazem parte do fluxo principal atual.

---

## UX/UI atual

### Identidade visual

A aplicação já possui uma base visual centralizada em `constants/theme.ts`, com:

- paleta para tema claro e escuro;
- tokens de espaçamento;
- raios de borda;
- estilos tipográficos.

### Login e cadastro

As telas públicas seguem uma estrutura simples e consistente:

- foco em um único objetivo por tela;
- campos bem rotulados;
- mensagens de erro no próprio fluxo;
- CTA principal destacado;
- alternância direta entre login e cadastro.

### Área autenticada

Nesta etapa, a área logada privilegia validação de fluxo:

- `Dash` confirma visualmente que a autenticação ocorreu;
- `Grupos` e `Atividades` já existem como destinos navegáveis;
- `Logout` foi colocado temporariamente como aba para tornar o ciclo completo fácil de testar.

> Evolução recomendada: substituir futuramente a aba `Logout` por uma aba de `Perfil` ou `Conta`, movendo a ação de sair para dentro dessa tela.

---

## Fluxo funcional implementado

```text
Login ou Cadastro
      ↓
AuthContext salva token e perfil
      ↓
AuthGate detecta autenticação
      ↓
Usuário entra em /(app)
      ↓
Bottom navigation disponível
      ↓
Logout limpa sessão
      ↓
AuthGate redireciona para Login
```

---

## Scripts disponíveis

```bash
npm start       # inicia o Expo
npm run web     # inicia o app no navegador
npm run android # inicia no Android
npm run ios     # inicia no iOS
npm run lint    # roda lint do projeto mobile
npm test        # executa testes
```

---

## Próximos passos sugeridos

1. Evoluir a tela `Dash` para uma dashboard real.
2. Implementar listagem de grupos e estados vazios reais.
3. Implementar feed de atividades conectado à API.
4. Substituir a aba `Logout` por `Perfil`.
5. Remover ou arquivar definitivamente arquivos remanescentes do template Expo que não participam do fluxo principal.
