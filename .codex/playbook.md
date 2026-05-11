# Playbook Detalhado de Desenvolvimento Mobile - RATE.IO

## 1. Objetivo

Este playbook orienta a construção completa do segundo front-end do RATE.IO, agora no contexto mobile, usando Expo e React Native. Ele organiza o trabalho em 3 sprints de 1 semana, de 11/05/2026 a 31/05/2026, mantendo cada sprint como um milestone no GitHub.

O objetivo não é apenas codificar telas. A Etapa 4 exige evolução da aplicação distribuída, documentação de processos, requisitos, projeto de interface, testes de integração, gestão do trabalho, evidências de contribuição e vídeo de apresentação. Por isso, cada tarefa abaixo inclui:

- passo a passo;
- arquivos esperados;
- exemplos de código;
- critérios de aceite;
- evidências para documentação;
- relação com qualidade de software, usabilidade e integração com backend.

## 2. Princípios de Arquitetura

O mobile é um cliente da API REST existente. Ele não acessa MongoDB diretamente, não replica regra financeira crítica e não cria contratos paralelos.

Regras obrigatórias:

- Usar Expo e React Native.
- Centralizar HTTP em `src/mobile/src/services/apiClient.*`.
- Usar variável de ambiente pública do Expo para a API, como `EXPO_PUBLIC_API_BASE_URL`.
- Salvar token por camada de storage dedicada, preferencialmente `expo-secure-store`.
- Buscar `GET /api/users/profile` após login.
- Usar o `_id` do perfil `User` em grupos e despesas.
- Não usar o `userId` retornado no login como perfil funcional.
- Preservar envelopes REST: `{ expenses }`, `{ balance }`, `{ message, expense }`.
- Manter regras de split, saldo e quitação no backend.
- Tratar loading, erro, vazio e sessão expirada em toda tela integrada à API.

## 3. Fonte da Verdade

Antes de implementar qualquer issue, leia:

1. `.codex/project-context.md`
2. `.codex/copilot-instructions.md`
3. `.codex/development-workflow.md`
4. `.agents/mobile-agent.md`
5. `docs/05-Arquitetura da Solução.md`
6. `docs/14-Relatorio Tecnico de Desenvolvimento e Arquitetura.md`
7. `src/frontend/src/services/api.js`
8. `src/backend/routes/*.js`
9. `src/backend/controllers/*.js`

Se documentação e código divergirem, confirme o contrato real no backend e atualize a documentação na mesma entrega.

## 4. Contratos REST que o Mobile Deve Consumir

### Auth

| Método | Rota | Body | Resposta |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ name, email, password }` | `{ message, authId, id, name, email }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ message, token, userId }` |
| PUT | `/api/auth/change-password` | `{ currentPassword, newPassword }` | `{ message }` |

Atenção: `userId` no login é o ID de `Auth`. Depois do login, sempre chamar `GET /api/users/profile` para obter o `_id` de `User`.

### Users

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/api/users/profile` | Buscar perfil autenticado |
| PUT | `/api/users/profile` | Atualizar nome/avatar |
| GET | `/api/users/:userId` | Buscar perfil público de membro |

### Groups

| Método | Rota | Uso |
| --- | --- | --- |
| POST | `/api/groups` | Criar grupo |
| GET | `/api/groups/user/:userId` | Listar grupos do usuário |
| POST | `/api/groups/:groupId/invite` | Convidar membro por email |
| GET | `/api/groups/:groupId/activities?userId=&limit=` | Listar atividades |
| DELETE | `/api/groups/:groupId` | Remover grupo logicamente |

### Expenses

| Método | Rota | Uso |
| --- | --- | --- |
| POST | `/api/expenses` | Criar despesa |
| GET | `/api/expenses/group/:groupId?userId=` | Listar despesas. Retorna `{ expenses }` |
| GET | `/api/expenses/group/:groupId/balances?userId=` | Consultar saldo. Retorna `{ balance }` |
| POST | `/api/expenses/:expenseId/settle` | Quitar parcela |
| PUT | `/api/expenses/:expenseId` | Editar despesa |
| DELETE | `/api/expenses/:expenseId` | Excluir despesa |

## 5. Estrutura Final Esperada

```text
src/mobile/
├── App.js
├── app.json
├── babel.config.js
├── jest.config.js
├── package.json
├── README.md
├── src/
│   ├── components/
│   │   ├── AppButton.js
│   │   ├── EmptyState.js
│   │   ├── ErrorState.js
│   │   ├── LoadingState.js
│   │   └── Screen.js
│   ├── features/
│   │   ├── activities/
│   │   │   ├── ActivityListScreen.js
│   │   │   └── activityService.js
│   │   ├── auth/
│   │   │   ├── AuthProvider.js
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── authService.js
│   │   ├── expenses/
│   │   │   ├── BalanceScreen.js
│   │   │   ├── ExpenseFormScreen.js
│   │   │   ├── ExpenseListScreen.js
│   │   │   └── expenseService.js
│   │   ├── groups/
│   │   │   ├── CreateGroupScreen.js
│   │   │   ├── GroupDetailScreen.js
│   │   │   ├── GroupListScreen.js
│   │   │   ├── InviteMemberScreen.js
│   │   │   └── groupService.js
│   │   └── profile/
│   │       ├── ProfileScreen.js
│   │       └── userService.js
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── RootNavigator.js
│   ├── services/
│   │   ├── apiClient.js
│   │   └── storage.js
│   ├── theme/
│   │   └── theme.js
│   └── utils/
│       ├── format.js
│       └── validation.js
└── __tests__/
    ├── apiClient.test.js
    ├── authProvider.test.js
    └── groupService.test.js
```

## 6. Setup Base do Mobile

### Passo a passo

1. Entrar em `src`.
2. Criar ou inicializar app Expo dentro de `mobile`.
3. Instalar dependências de navegação, storage, testes e qualidade.
4. Criar `.env` local com a URL da API.
5. Criar estrutura de pastas.
6. Confirmar que o app abre no Expo.

### Comandos sugeridos

```bash
cd src
npx create-expo-app mobile
cd mobile
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npx expo install expo-secure-store
npm install -D jest-expo @testing-library/react-native eslint prettier
```

Arquivo `.env` local:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

Para Android Emulator:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
```

### `package.json` esperado

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint .",
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

### Critérios de aceite

- `npm run start` abre o Expo.
- App renderiza uma tela inicial simples.
- Estrutura de pastas foi criada.
- Variável `EXPO_PUBLIC_API_BASE_URL` está documentada.

## 7. Código Base Compartilhado

### 7.1 Cliente HTTP

Arquivo: `src/mobile/src/services/apiClient.js`

```js
import { getToken, clearSession } from './storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request(endpoint, options = {}) {
  if (!API_BASE_URL) {
    throw new ApiError('Base URL da API nao configurada', 0, {});
  }

  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      await clearSession();
    }

    throw new ApiError(data.message || data.error || 'Erro na requisicao', response.status, data);
  }

  return data;
}
```

### 7.2 Storage de sessão

Arquivo: `src/mobile/src/services/storage.js`

```js
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'rateio.token';
const PROFILE_KEY = 'rateio.profile';

export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveProfile(profile) {
  await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profile));
}

export async function getProfile() {
  const value = await SecureStore.getItemAsync(PROFILE_KEY);
  return value ? JSON.parse(value) : null;
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(PROFILE_KEY);
}
```

### 7.3 Formatadores

Arquivo: `src/mobile/src/utils/format.js`

```js
export function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
```

### 7.4 Componentes comuns

Arquivo: `src/mobile/src/components/Screen.js`

```js
import { SafeAreaView, StyleSheet } from 'react-native';

export function Screen({ children }) {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f8',
    padding: 16,
  },
});
```

Arquivo: `src/mobile/src/components/AppButton.js`

```js
import { Pressable, StyleSheet, Text } from 'react-native';

export function AppButton({ title, onPress, disabled }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.disabled]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#1f7a5c',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
```

## 8. Milestones, Issues e Passo a Passo

## Milestone 1 - Sprint 1: Fundação Mobile e Autenticação

Período: 11/05/2026 a 17/05/2026

Objetivo: entregar app Expo funcional, arquitetura base, cliente HTTP, sessão, navegação pública/privada e autenticação integrada ao backend.

### Issue 1.1 - Bootstrap do app Expo

#### Sub-issues

- Criar projeto Expo em `src/mobile`.
- Configurar scripts.
- Criar estrutura de pastas.
- Criar tela inicial temporária.
- Criar README mobile.
- Registrar evidência visual da primeira execução.

#### Passo a passo

1. Criar projeto Expo.
2. Instalar dependências de navegação, storage e testes.
3. Criar diretórios de `src`, `components`, `features`, `navigation`, `services`, `utils` e `theme`.
4. Criar `src/mobile/README.md` com comandos locais.
5. Criar `App.js` inicial apontando para `RootNavigator`.
6. Executar `npm run start`.
7. Capturar print da tela inicial para a documentação da Etapa 4.

#### Exemplo de `App.js`

```js
import { AuthProvider } from './src/features/auth/AuthProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
```

#### Evidências esperadas

- Print do Expo rodando.
- Print da tela inicial no emulador ou dispositivo.
- Link do PR no GitHub.
- Issue marcada como concluída no milestone Sprint 1.

### Issue 1.2 - Cliente HTTP e storage de sessão

#### Sub-issues

- Implementar `apiClient`.
- Implementar `storage`.
- Criar testes unitários do cliente HTTP.
- Documentar tratamento de erro 401.

#### Passo a passo

1. Criar `src/services/storage.js`.
2. Criar `src/services/apiClient.js`.
3. Criar mock de `fetch` para testes.
4. Testar resposta de sucesso.
5. Testar erro com `{ error }` e `{ message }`.
6. Testar limpeza de sessão em `401`.

#### Teste exemplo

Arquivo: `src/mobile/__tests__/apiClient.test.js`

```js
import { request } from '../src/services/apiClient';

jest.mock('../src/services/storage', () => ({
  getToken: jest.fn(() => Promise.resolve('token-teste')),
  clearSession: jest.fn(() => Promise.resolve()),
}));

describe('apiClient', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('retorna JSON em resposta de sucesso', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'ok' }),
    });

    await expect(request('/health')).resolves.toEqual({ message: 'ok' });
  });

  it('lança erro quando API retorna falha', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Payload invalido' }),
    });

    await expect(request('/api/groups')).rejects.toThrow('Payload invalido');
  });
});
```

#### Critérios de aceite

- Nenhuma tela usa `fetch` diretamente.
- Token é anexado automaticamente.
- `401` limpa sessão.
- Testes de `apiClient` passam.

### Issue 1.3 - Serviços de autenticação

#### Sub-issues

- Criar `authService`.
- Criar `userService`.
- Criar provider de sessão.
- Buscar perfil após login.

#### Passo a passo

1. Criar `features/auth/authService.js`.
2. Criar `features/profile/userService.js`.
3. Implementar `login`, `register`, `logout`, `bootstrapSession`.
4. Após `POST /api/auth/login`, salvar token.
5. Chamar `GET /api/users/profile`.
6. Salvar perfil funcional.
7. Expor `user`, `isAuthenticated`, `loading`, `login`, `register`, `logout`.

#### `authService.js`

```js
import { request } from '../../services/apiClient';

export function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
```

#### `userService.js`

```js
import { request } from '../../services/apiClient';

export function getCurrentUser() {
  return request('/api/users/profile');
}

export function updateProfile(payload) {
  return request('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getPublicProfile(userId) {
  return request(`/api/users/${userId}`);
}
```

#### `AuthProvider.js`

```js
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearSession, getProfile, getToken, saveProfile, saveToken } from '../../services/storage';
import * as authService from './authService';
import { getCurrentUser } from '../profile/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const token = await getToken();
      const profile = await getProfile();

      if (token && profile) {
        setUser(profile);
      }

      setBootstrapping(false);
    }

    bootstrap();
  }, []);

  async function login(payload) {
    const authData = await authService.login(payload);
    await saveToken(authData.token);

    const profile = await getCurrentUser();
    await saveProfile(profile);
    setUser(profile);
  }

  async function register(payload) {
    await authService.register(payload);
    await login({ email: payload.email, password: payload.password });
  }

  async function logout() {
    await clearSession();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      bootstrapping,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, bootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
```

#### Critérios de aceite

- Login salva token e perfil.
- Cadastro já autentica o usuário.
- O `_id` usado no app vem de `GET /api/users/profile`.
- Logout remove sessão local.

### Issue 1.4 - Navegação e telas de login/cadastro

#### Sub-issues

- Criar `RootNavigator`.
- Criar `AuthNavigator`.
- Criar `AppNavigator`.
- Criar `LoginScreen`.
- Criar `RegisterScreen`.
- Criar estados de loading/erro.

#### Passo a passo

1. Criar navegadores.
2. Renderizar fluxo público se não autenticado.
3. Renderizar fluxo privado se autenticado.
4. Criar formulário de login.
5. Criar formulário de cadastro.
6. Validar campos obrigatórios.
7. Exibir erro amigável.

#### `RootNavigator.js`

```js
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';
import { useAuth } from '../features/auth/AuthProvider';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

export function RootNavigator() {
  const { bootstrapping, isAuthenticated } = useAuth();

  if (bootstrapping) {
    return <Text>Carregando...</Text>;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
```

#### `LoginScreen.js`

```js
import { useState } from 'react';
import { Text, TextInput } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { Screen } from '../../components/Screen';
import { useAuth } from './AuthProvider';

export function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text>Entrar</Text>
      <TextInput
        accessibilityLabel="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        accessibilityLabel="Senha"
        onChangeText={setPassword}
        secureTextEntry
        value={password}
      />
      {!!error && <Text>{error}</Text>}
      <AppButton disabled={loading} title={loading ? 'Entrando...' : 'Entrar'} onPress={handleSubmit} />
      <AppButton title="Criar conta" onPress={() => navigation.navigate('Register')} />
    </Screen>
  );
}
```

#### Critérios de aceite

- Fluxo público e privado separados.
- Usuário consegue registrar, entrar e sair.
- Estado de erro aparece sem quebrar a tela.
- Bootstrap evita piscar tela de login quando já há sessão.

### Issue 1.5 - Documentação acadêmica da Sprint 1

#### Sub-issues

- Atualizar documentação de contexto se houver correções da etapa anterior.
- Registrar requisitos derivados do processo mobile.
- Criar primeira versão do processo BPMN.
- Criar primeira versão do diagrama de fluxo mobile.
- Registrar prints das telas de login/cadastro.

#### Passo a passo

1. Revisar `docs/01-Documentação de Contexto.md`.
2. Revisar `docs/02-Especificação do Projeto.md`.
3. Criar seção "Front-end Mobile" nos documentos aplicáveis.
4. Modelar processo "Registrar despesa em grupo" em BPMN.
5. Registrar requisitos funcionais e não funcionais em tabela.
6. Criar fluxograma de navegação inicial.
7. Adicionar prints em `docs/img`.

#### Tabela exemplo de requisitos

| ID | Tipo | Requisito | Prioridade | Sprint |
| --- | --- | --- | --- | --- |
| RF-MOB-01 | Funcional | O usuário deve conseguir registrar e autenticar-se pelo app mobile | Alta | 1 |
| RF-MOB-02 | Funcional | O usuário deve listar grupos dos quais participa | Alta | 2 |
| RF-MOB-03 | Funcional | O usuário deve criar despesas em grupos | Alta | 3 |
| RNF-MOB-01 | Não funcional | O app deve centralizar chamadas HTTP em cliente único | Alta | 1 |
| RNF-MOB-02 | Não funcional | O app deve tratar loading, erro e vazio em telas integradas | Alta | 2 |

#### Critérios de aceite

- Documentação cita que o mobile consome rotas da Web API.
- Requisitos mobile estão categorizados.
- BPMN inicial está salvo em `docs/img`.
- Prints da Sprint 1 estão disponíveis.

## Milestone 2 - Sprint 2: Grupos, Membros, Atividades e Interface

Período: 18/05/2026 a 24/05/2026

Objetivo: entregar o núcleo de grupos no mobile, avançar o projeto de interface e produzir documentação de processos, wireframes e indicadores.

### Issue 2.1 - Serviços de grupos

#### Sub-issues

- Criar `groupService`.
- Implementar listagem.
- Implementar criação.
- Implementar convite.
- Implementar exclusão.
- Criar testes do service.

#### `groupService.js`

```js
import { request } from '../../services/apiClient';

export function getUserGroups(userId) {
  return request(`/api/groups/user/${userId}`);
}

export function createGroup(payload) {
  return request('/api/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function inviteToGroup(groupId, payload) {
  return request(`/api/groups/${groupId}/invite`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getGroupActivities(groupId, userId, limit = 50) {
  return request(`/api/groups/${groupId}/activities?userId=${userId}&limit=${limit}`);
}

export function deleteGroup(groupId, userId) {
  return request(`/api/groups/${groupId}`, {
    method: 'DELETE',
    body: JSON.stringify({ userId }),
  });
}
```

#### Critérios de aceite

- Service usa `_id` do perfil `User`.
- Nenhum componente monta URL manualmente.
- Erros são propagados para telas.

### Issue 2.2 - Tela de listagem de grupos

#### Sub-issues

- Criar `GroupListScreen`.
- Consumir `getUserGroups`.
- Exibir loading, erro e vazio.
- Implementar refresh manual.
- Navegar para detalhe.

#### `GroupListScreen.js`

```js
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, Text } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { Screen } from '../../components/Screen';
import { useAuth } from '../auth/AuthProvider';
import { getUserGroups } from './groupService';

export function GroupListScreen({ navigation }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGroups = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const data = await getUserGroups(user._id);
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  if (loading) return <LoadingState label="Carregando grupos..." />;
  if (error) return <ErrorState message={error} onRetry={loadGroups} />;

  return (
    <Screen>
      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<EmptyState title="Nenhum grupo ainda" />}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('GroupDetail', { group: item })}>
            <Text>{item.name}</Text>
            {!!item.description && <Text>{item.description}</Text>}
          </Pressable>
        )}
      />
    </Screen>
  );
}
```

#### Critérios de aceite

- Lista carrega grupos reais.
- Estado vazio aparece quando não há grupos.
- Tela permite acessar detalhe do grupo.

### Issue 2.3 - Criação de grupo

#### Sub-issues

- Criar `CreateGroupScreen`.
- Criar formulário com nome e descrição.
- Enviar `createdBy`.
- Atualizar listagem depois do sucesso.
- Registrar print do fluxo.

#### Exemplo de submit

```js
async function handleCreate() {
  if (!name.trim()) {
    setError('Informe o nome do grupo');
    return;
  }

  await createGroup({
    name: name.trim(),
    description: description.trim(),
    createdBy: user._id,
  });

  navigation.goBack();
}
```

#### Critérios de aceite

- Grupo criado aparece na listagem.
- Campos obrigatórios são validados.
- Erros da API são exibidos.

### Issue 2.4 - Detalhe do grupo e perfis públicos

#### Sub-issues

- Criar `GroupDetailScreen`.
- Exibir nome e descrição.
- Exibir membros.
- Buscar perfis públicos quando necessário.
- Criar ações para despesas, saldo, convite e atividades.

#### Exemplo de busca de perfis

```js
import { getPublicProfile } from '../profile/userService';

export async function hydrateMembers(members = []) {
  const profiles = await Promise.allSettled(
    members.map((member) => getPublicProfile(member.userId)),
  );

  return members.map((member, index) => {
    const result = profiles[index];

    return {
      ...member,
      profile: result.status === 'fulfilled' ? result.value : null,
    };
  });
}
```

#### Critérios de aceite

- Membros aparecem com nome quando disponível.
- Falha de perfil público não quebra tela.
- A tela permite navegar para despesas e saldo.

### Issue 2.5 - Convite e atividades

#### Sub-issues

- Criar `InviteMemberScreen`.
- Criar `ActivityListScreen`.
- Enviar convite por email.
- Listar atividades com data formatada.
- Atualizar atividades depois de convidar.

#### Exemplo de convite

```js
await inviteToGroup(group._id, {
  email: email.trim().toLowerCase(),
  addedBy: user._id,
});
```

#### Exemplo de item de atividade

```js
import { Text, View } from 'react-native';
import { formatDate } from '../../utils/format';

export function ActivityItem({ activity }) {
  return (
    <View>
      <Text>{activity.message}</Text>
      <Text>{formatDate(activity.createdAt)}</Text>
    </View>
  );
}
```

#### Critérios de aceite

- Convite funciona com usuário existente.
- Atividades aparecem com ordem coerente.
- Erros 403/404 são tratados.

### Issue 2.6 - Projeto de interface, fluxograma e wireframes

#### Sub-issues

- Criar visão geral de interação do usuário.
- Criar fluxograma mobile.
- Criar wireframes das telas principais.
- Atualizar documentação de interface.
- Relacionar wireframes às rotas e requisitos.

#### Telas mínimas do wireframe

- Login.
- Cadastro.
- Lista de grupos.
- Criar grupo.
- Detalhe do grupo.
- Convidar membro.
- Lista de despesas.
- Criar despesa.
- Saldo do grupo.
- Atividades.
- Perfil.

#### Fluxo de interação esperado

```text
Abrir app
  -> Sessao existe?
    -> Sim: carregar perfil e ir para Grupos
    -> Nao: Login/Cadastro
  -> Grupos
    -> Criar Grupo
    -> Detalhe do Grupo
      -> Convidar Membro
      -> Despesas
      -> Saldo
      -> Atividades
```

#### Critérios de aceite

- Wireframes representam funcionalidades reais.
- Fluxograma mostra interações do usuário com o sistema.
- Documentação explica decisões de usabilidade.
- Prints ou imagens estão salvos em `docs/img`.

### Issue 2.7 - Indicadores de desempenho e metas do processo

#### Sub-issues

- Definir no mínimo 5 indicadores.
- Criar tabela com fórmula, meta e fonte.
- Criar gráfico ou dashboard simples.
- Relacionar indicadores ao processo de rateio.

#### Tabela exemplo

| Indicador | Fórmula | Meta | Fonte |
| --- | --- | --- | --- |
| Tempo médio para registrar despesa | média entre abrir formulário e salvar | até 2 min | teste de usabilidade |
| Taxa de despesas quitadas | despesas quitadas / despesas criadas | 80% | API de despesas |
| Tempo para convidar membro | início do convite até sucesso | até 1 min | teste manual |
| Erros de autenticação por sessão | erros 401 por usuário | reduzir para menos de 5% | logs/testes |
| Grupos ativos por usuário | grupos ativos / usuários ativos | mínimo 1 | API de grupos |

#### Critérios de aceite

- Existem pelo menos 5 KPIs.
- Cada KPI tem meta objetiva.
- Há tabela, gráfico ou dashboard documentado.

## Milestone 3 - Sprint 3: Despesas, Saldos, Testes, Implantação e Entrega

Período: 25/05/2026 a 31/05/2026

Objetivo: fechar fluxo financeiro principal, registrar testes de integração, organizar gestão do trabalho, preparar implantação e produzir vídeo obrigatório.

### Issue 3.1 - Serviços de despesas e saldo

#### Sub-issues

- Criar `expenseService`.
- Listar despesas.
- Criar despesa.
- Buscar saldo.
- Quitar parcela.
- Editar e excluir despesa.

#### `expenseService.js`

```js
import { request } from '../../services/apiClient';

export function getGroupExpenses(groupId, userId) {
  return request(`/api/expenses/group/${groupId}?userId=${userId}`);
}

export function getGroupBalance(groupId, userId) {
  return request(`/api/expenses/group/${groupId}/balances?userId=${userId}`);
}

export function createExpense(payload) {
  return request('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function settleExpenseShare(expenseId, payload) {
  return request(`/api/expenses/${expenseId}/settle`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateExpense(expenseId, payload) {
  return request(`/api/expenses/${expenseId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteExpense(expenseId, payload) {
  return request(`/api/expenses/${expenseId}`, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
}
```

#### Critérios de aceite

- Service respeita `{ expenses }` e `{ balance }`.
- Payloads seguem contrato do backend.
- Telas não fazem cálculo final de saldo.

### Issue 3.2 - Lista e criação de despesas

#### Sub-issues

- Criar `ExpenseListScreen`.
- Criar `ExpenseFormScreen`.
- Exibir despesas por grupo.
- Criar despesa com split igual.
- Preparar suporte a porcentagem e exato, se escopo permitir.

#### Exemplo de listagem

```js
const data = await getGroupExpenses(group._id, user._id);
setExpenses(data.expenses || []);
```

#### Exemplo de criação com divisão igual

```js
await createExpense({
  groupId: group._id,
  description: description.trim(),
  amount: Number(amount),
  currency: 'BRL',
  paidBy: user._id,
  createdBy: user._id,
  splitType: 'igual',
  participants: selectedMemberIds,
});
```

Observação: antes de fechar essa issue, confirme no controller backend o nome esperado para participantes/splits. Se o backend exigir `splits`, adapte o payload no service, não na tela.

#### Critérios de aceite

- Despesas aparecem na lista.
- Criar despesa atualiza lista e saldo.
- Valores são exibidos com `formatMoney`.
- Tela possui loading, erro e vazio.

### Issue 3.3 - Saldo do grupo

#### Sub-issues

- Criar `BalanceScreen`.
- Consumir `getGroupBalance`.
- Exibir total pago, total devido, saldo líquido e resumo.
- Tratar grupo sem despesas.

#### Exemplo de consumo

```js
const data = await getGroupBalance(group._id, user._id);
setBalance(data.balance);
```

#### Exemplo de renderização

```js
<Text>Total pago: {formatMoney(balance.totalPaid)}</Text>
<Text>Total devido: {formatMoney(balance.totalOwed)}</Text>
<Text>Saldo: {formatMoney(balance.netBalance)}</Text>
```

#### Critérios de aceite

- Valores batem com o retorno da API.
- Não há cálculo financeiro duplicado.
- Grupo sem despesas mostra estado vazio.

### Issue 3.4 - Quitação, edição e exclusão

#### Sub-issues

- Criar ação de quitar parcela.
- Criar confirmação antes de excluir.
- Atualizar lista, saldo e atividades após mutações.
- Tratar erro de permissão.

#### Exemplo de quitação

```js
await settleExpenseShare(expense._id, {
  userId: user._id,
  paidBy: expense.paidBy,
});
```

#### Exemplo de confirmação

```js
import { Alert } from 'react-native';

function confirmDelete(expense) {
  Alert.alert('Excluir despesa', 'Esta ação não pode ser desfeita.', [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Excluir',
      style: 'destructive',
      onPress: () => deleteExpense(expense._id, { userId: user._id }),
    },
  ]);
}
```

#### Critérios de aceite

- Quitação altera apenas a parcela correta.
- Exclusão exige confirmação.
- Tela recarrega dados após mutação.

### Issue 3.5 - Testes de integração mobile com API

#### Sub-issues

- Documentar plano de testes de integração.
- Criar casos de teste.
- Executar fluxo contra backend local.
- Registrar resultados em `docs/09-Registro de Testes de Integração.md`.

#### Casos mínimos

| Caso | Passos | Resultado esperado |
| --- | --- | --- |
| Login mobile | Abrir app, inserir credenciais, entrar | App salva token e carrega perfil |
| Criar grupo | Login, criar grupo, voltar à lista | Grupo aparece na lista |
| Convidar membro | Abrir grupo, informar email cadastrado | Membro entra no grupo |
| Criar despesa | Abrir grupo, criar despesa igual | Despesa aparece no grupo |
| Consultar saldo | Abrir saldo após despesa | Valores batem com API |
| Quitar parcela | Quitar split pendente | Saldo é atualizado |

#### Template para registro

```md
### CT-MOB-01 - Login no app mobile

- Data:
- Responsável:
- Ambiente:
- API base:
- Massa de teste:
- Passos executados:
- Resultado esperado:
- Resultado obtido:
- Status: Aprovado/Reprovado
- Evidência: print ou link
```

#### Critérios de aceite

- Testes cobrem integração com API real.
- Resultados estão documentados.
- Falhas têm causa provável e próxima ação.

### Issue 3.6 - Gestão do trabalho no GitHub

#### Sub-issues

- Criar milestones das 3 sprints.
- Criar issues e sub-issues.
- Atualizar status do quadro visual.
- Registrar snapshot do quadro.
- Registrar snapshot das contribuições.
- Documentar responsabilidades do time.

#### Estrutura recomendada de milestones

```text
Sprint 1 - Mobile Fundação e Auth - 11/05 a 17/05
Sprint 2 - Mobile Grupos e Interface - 18/05 a 24/05
Sprint 3 - Mobile Despesas e Entrega - 25/05 a 31/05
```

#### Labels recomendadas

```text
mobile
documentation
integration-test
bug
architecture
ui
api-contract
```

#### Template de issue

```md
## Objetivo

## Contexto

## Subtarefas

- [ ] 
- [ ] 

## Critérios de aceite

- [ ] 

## Evidências

- Prints:
- Testes:
- PR:
```

#### Tabela de responsabilidades

| Membro | Responsabilidade | Evidências esperadas |
| --- | --- | --- |
| Integrante 1 | Autenticação mobile | PRs, testes, prints |
| Integrante 2 | Grupos e membros | PRs, testes, prints |
| Integrante 3 | Despesas e saldo | PRs, testes, prints |
| Integrante 4 | Documentação BPMN/wireframes | Docs, imagens |
| Integrante 5 | Testes de integração | Registro de testes |
| Integrante 6 | Vídeo e gestão GitHub | Prints, roteiro, vídeo |

#### Critérios de aceite

- Quadro GitHub possui retrato atual.
- Contribuições dos membros estão documentadas.
- Responsabilidades estão claras.

### Issue 3.7 - Implantação e build mobile

#### Sub-issues

- Validar execução local contra backend.
- Validar `.env` por ambiente.
- Preparar build de homologação.
- Documentar estratégia de publicação.
- Registrar limitações se o build final não for publicado em loja.

#### Passo a passo local

```bash
docker compose up --build
cd src/mobile
npm install
npm run start
```

#### Opção com Expo Go

1. Rodar `npm run start`.
2. Abrir QR Code no Expo Go.
3. Configurar API base com IP local da máquina.
4. Executar fluxo principal.
5. Registrar prints.

#### Opção com EAS Build

```bash
cd src/mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

Exemplo de `eas.json`:

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://url-da-api-homologacao"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://url-da-api-producao"
      }
    }
  }
}
```

#### Critérios de aceite

- App executa em emulador ou dispositivo físico.
- Base URL de API está documentada por ambiente.
- Estratégia de implantação está descrita.
- Se EAS não for usado, a justificativa está registrada.

### Issue 3.8 - Vídeo obrigatório de apresentação

#### Sub-issues

- Criar roteiro de até 6 minutos.
- Preparar ambiente com dados de teste.
- Gravar demonstração do app mobile.
- Demonstrar integração com backend.
- Mostrar quadro GitHub e contribuições.
- Enviar vídeo no formato exigido pela disciplina.

#### Roteiro sugerido

```text
0:00 - 0:30 | Contexto do RATE.IO e objetivo do mobile
0:30 - 1:10 | Arquitetura distribuída: mobile consumindo Web API
1:10 - 2:20 | Demonstração: login/cadastro e sessão
2:20 - 3:20 | Demonstração: grupos, membros e atividades
3:20 - 4:30 | Demonstração: despesas, saldo e quitação
4:30 - 5:10 | Testes de integração e evidências
5:10 - 5:45 | Quadro GitHub, contribuições e responsabilidades
5:45 - 6:00 | Fechamento e próximos passos
```

#### Checklist antes de gravar

- [ ] Backend rodando.
- [ ] Mobile rodando.
- [ ] Usuários de teste criados.
- [ ] Grupo de teste criado.
- [ ] Fluxo de despesa validado.
- [ ] Prints e docs prontos.
- [ ] GitHub Projects/Milestones atualizados.
- [ ] Roteiro ensaiado para ficar abaixo de 6 minutos.

#### Critérios de aceite

- Vídeo mostra implementação funcionando.
- Vídeo mostra teste da integração.
- Vídeo não passa de 6 minutos.
- Link/arquivo do vídeo está na entrega.

## 9. Documentação da Etapa 4

Além do app, a entrega precisa atualizar os artefatos acadêmicos.

### 9.1 Documentação de contexto

Atualizar:

- problema;
- público-alvo;
- justificativa do front-end mobile;
- impacto da aplicação distribuída;
- limitações conhecidas.

### 9.2 Especificação do projeto

Adicionar:

- requisitos funcionais mobile;
- requisitos não funcionais mobile;
- matriz de rastreabilidade ligando requisitos, telas, endpoints e testes.

Exemplo:

| Requisito | Tela | Endpoint | Teste |
| --- | --- | --- | --- |
| RF-MOB-01 | Login | `POST /api/auth/login` | CT-MOB-01 |
| RF-MOB-02 | Grupos | `GET /api/groups/user/:userId` | CT-MOB-02 |
| RF-MOB-03 | Despesas | `POST /api/expenses` | CT-MOB-04 |

### 9.3 Modelagem de processos e BPMN

Processos mínimos:

- cadastro e autenticação;
- criação de grupo;
- convite de membro;
- registro de despesa;
- quitação de parcela.

Atividades do processo "Registrar despesa":

```text
Usuário abre grupo
Usuário acessa despesas
Usuário preenche despesa
App envia payload para API
API valida membro e grupo
API calcula split
API salva despesa
App atualiza lista e saldo
```

### 9.4 Projeto de interface

Documentar:

- mapa de navegação;
- wireframes;
- fluxo de interação;
- decisões de usabilidade;
- acessibilidade básica;
- prints do app implementado.

### 9.5 Registro de testes de integração

Documentar:

- ambiente;
- massa de dados;
- endpoints envolvidos;
- passos;
- resultado esperado;
- resultado obtido;
- evidências.

### 9.6 Controle de mudanças

Registrar:

- alterações feitas em artefatos da etapa anterior;
- motivo;
- impacto;
- responsável;
- PR ou commit.

### 9.7 Gestão e contribuição

Adicionar:

- print do quadro GitHub;
- print dos milestones;
- print das contribuições;
- tabela de responsabilidades;
- comentários sobre participação do time.

## 10. Indicadores de Desempenho e Metas

A entrega exige no mínimo 5 indicadores. Use a tabela abaixo como base.

| Indicador | Descrição | Meta | Como medir | Evidência |
| --- | --- | --- | --- | --- |
| Tempo de cadastro/login | Tempo para concluir autenticação mobile | até 2 minutos | teste manual cronometrado | vídeo/registro |
| Tempo de criação de grupo | Tempo para criar primeiro grupo | até 1 minuto | teste manual | print |
| Taxa de sucesso na criação de despesas | despesas criadas com sucesso / tentativas | maior que 90% | testes integração | registro |
| Tempo de consulta de saldo | tempo entre abrir tela e exibir saldo | até 3 segundos local | observação/teste | registro |
| Taxa de quitação concluída | quitações com sucesso / tentativas | maior que 90% | testes integração | registro |
| Cobertura de fluxo crítico | fluxos testados / fluxos planejados | 100% dos fluxos principais | checklist | docs |

## 11. Definition of Ready

Uma issue está pronta quando:

- endpoint ou comportamento esperado está identificado;
- payload e response foram confirmados;
- critério de aceite está objetivo;
- dependência de backend/design/documentação está explícita;
- caminho de teste está definido;
- evidência esperada está clara.

## 12. Definition of Done

Uma issue está concluída quando:

- código segue a arquitetura modular;
- chamadas HTTP passam pelo cliente central;
- telas têm loading, erro e vazio;
- testes relevantes foram criados ou atualizados;
- lint e testes aplicáveis foram executados;
- documentação foi atualizada;
- prints/evidências foram salvos;
- PR referencia milestone e issue;
- mudanças de contrato foram refletidas em backend, web, mobile e docs quando aplicável.

## 13. Checklist de Revisão Mobile

- [ ] App usa Expo/React Native.
- [ ] Não há URL fixa de backend em telas ou componentes.
- [ ] Base da API vem de `EXPO_PUBLIC_API_BASE_URL`.
- [ ] HTTP está centralizado em `apiClient`.
- [ ] Token está isolado em `storage`.
- [ ] Login busca perfil via `GET /api/users/profile`.
- [ ] Operações de grupo/despesa usam `_id` de `User`.
- [ ] Envelopes `{ expenses }`, `{ balance }` e `{ message, expense }` foram preservados.
- [ ] Regras financeiras continuam no backend.
- [ ] Telas tratam loading, erro e vazio.
- [ ] Ações destrutivas pedem confirmação.
- [ ] Dados sensíveis não aparecem em logs.
- [ ] Testes de integração foram registrados.
- [ ] Wireframes e fluxograma foram atualizados.
- [ ] GitHub board e contribuições têm prints atuais.
- [ ] Vídeo obrigatório foi gravado e enviado.

## 14. Comandos de Verificação

Backend:

```bash
cd src/backend
npm run lint
npm run test
```

Mobile:

```bash
cd src/mobile
npm run lint
npm run test
npm run start
```

Ambiente integrado:

```bash
docker compose up --build
```

## 15. Riscos e Mitigações

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| API inacessível no emulador | App não autentica | Usar `10.0.2.2` no Android Emulator ou IP local no dispositivo físico |
| Confusão entre `Auth._id` e `User._id` | Grupos/despesas falham | Sempre buscar perfil após login |
| Payload de despesa divergente | Criação falha | Confirmar controller antes de fechar issue |
| Testes sem backend real | Integração não comprovada | Registrar testes com API local |
| Vídeo ausente | Nota zero na etapa | Planejar gravação como issue obrigatória |
| Documentação atrasada | Entrega incompleta | Atualizar docs a cada sprint |

## 16. Entrega Final Esperada em 31/05/2026

Ao fim da Sprint 3, o projeto deve conter:

- app mobile Expo/React Native funcional;
- login/cadastro integrados;
- listagem/criação de grupos;
- convite de membros;
- atividades do grupo;
- listagem/criação de despesas;
- saldo do grupo;
- quitação de parcela;
- testes de integração documentados;
- BPMN e fluxograma atualizados;
- wireframes e prints das telas;
- tabela de requisitos mobile;
- indicadores de desempenho com metas;
- quadro GitHub e contribuições documentados;
- vídeo obrigatório de até 6 minutos.

