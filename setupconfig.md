# Setup Inicial do Projeto (Back-end)

Este documento descreve o passo a passo para configurar o ambiente de desenvolvimento do back-end, executar a API localmente e validar os endpoints iniciais no Postman.

## 1. Objetivo

Padronizar o setup da equipe para evitar problemas de ambiente, garantir consistência de código e facilitar o onboarding de novos integrantes.

## 2. Pré-requisitos

Antes de começar, confirme que sua máquina possui:

1. Git instalado.
2. Node.js 18+ e npm 9+.
3. VS Code (recomendado).
4. Postman para testes de API.
5. Acesso ao MongoDB (Atlas ou local via Docker).

Comandos úteis para validar:

```bash
git --version
node -v
npm -v
```

## 3. Clonar repositório e acessar pasta correta

Clone o projeto e acesse a pasta do backend (importante: o package.json está no backend, nao na raiz):

```bash
git clone <url-do-repositorio>
cd pmv-ads-2026-1-e4-infra-t1-segunda-20h/src/backend
```

## 4. Instalar dependências

Na pasta src/backend, instale todas as dependências:

```bash
npm install
```

Dependências principais usadas no projeto:

- express
- dotenv
- cors
- mongoose
- bcryptjs
- jsonwebtoken

Dependências de desenvolvimento:

- nodemon
- eslint
- prettier
- eslint-config-prettier
- eslint-plugin-prettier

## 5. Estrutura de pastas esperada

A estrutura inicial do backend deve ficar assim:

```text
src/backend/
├── config/
│   └── db.js
├── controllers/
│   └── authController.js
├── middleware/
├── models/
│   └── Auth.js
├── routes/
│   └── authRoutes.js
├── .env
├── .prettierrc
├── .prettierignore
├── eslint.config.js
├── nodemon.json
├── package.json
└── server.js
```

## 6. Configurar variáveis de ambiente (.env)

Crie ou atualize o arquivo .env em src/backend com os dados do ambiente:

```env
PORT=3000
JWT_SECRET=<sua-chave-jwt>

MONGO_URI_AUTH=<uri-do-mongo-auth>
MONGO_URI_USERS=<uri-do-mongo-users>
MONGO_URI_EXPENSES=<uri-do-mongo-expenses>
MONGO_URI_GROUPS=<uri-do-mongo-groups>
```

Exemplo Atlas:

```env
MONGO_URI_AUTH=mongodb+srv://usuario:senha@cluster.mongodb.net/auth?retryWrites=true&w=majority
```

Observacoes:

1. Se a senha tiver caracteres especiais, faca URL encode.
2. No Atlas, liberar IP em Network Access.
3. No Atlas, garantir usuario com permissao de leitura/escrita.

## 7. Rodar o projeto em desenvolvimento

Ainda em src/backend:

```bash
npm run dev
```

Saida esperada:

1. Servidor rodando na porta configurada.
2. Mensagem de conexao MongoDB estabelecida.

Se aparecer erro ENOENT de package.json, voce esta na pasta errada. Entre em src/backend e rode novamente.

## 8. Scripts disponiveis

```bash
npm run start      # executa com node
npm run dev        # executa com nodemon
npm run lint       # valida padrao de codigo
npm run lint:fix   # tenta corrigir automaticamente
npm run format     # formata com prettier
```

## 9. Padronizacao com ESLint e Prettier

O projeto usa ESLint 9 no formato Flat Config (arquivo eslint.config.js).

Fluxo recomendado no dia a dia:

```bash
npm run format
npm run lint
```

Boas praticas:

1. Rodar format e lint antes de commit.
2. Nao desativar regras globalmente sem alinhamento com o time.
3. Manter consistencia de estilo para facilitar code review.

## 10. Testes iniciais no Postman

Com o servidor ativo, testar endpoints de autenticacao.

### 10.1 Registrar usuario

- Metodo: POST
- URL: http://localhost:3000/api/auth/register
- Header: Content-Type: application/json
- Body:

```json
{
  "email": "seuemail@dominio.com",
  "password": "123456"
}
```

![Teste de registro com Postman](../pmv-ads-2026-1-e4-infra-t1-segunda-20h/docs/img/registroPostman.png)

Resposta esperada:

- 201 Created
- id do usuario e email retornados.

### 10.2 Login

- Metodo: POST
- URL: http://localhost:3000/api/auth/login
- Header: Content-Type: application/json
- Body:

```json
{
  "email": "seuemail@dominio.com",
  "password": "123456"
}
```

![Teste de registro com Postman](../pmv-ads-2026-1-e4-infra-t1-segunda-20h/docs/img/loginPostman.png)

Resposta esperada:

- 200 OK
- token JWT para uso em rotas protegidas.

## 11. Problemas comuns e como resolver

### 11.1 ENOENT package.json

Erro comum:

```text
npm ERR! enoent ENOENT: no such file or directory, open '.../package.json'
```

Causa: comando executado fora da pasta src/backend.

Correcao:

```bash
cd src/backend
npm run dev
```

### 11.2 Erro de autenticacao no Mongo (bad auth)

Causas:

1. Usuario/senha incorretos.
2. Senha sem URL encode.
3. Usuario sem permissao no Atlas.

Correcao: revisar URI, permissao de usuario e acesso de rede no Atlas.

### 11.3 next is not a function

Causa: middleware pre('save') do Mongoose com assinatura incorreta para async.

Correcao aplicada no projeto: hook async sem callback next.

### 11.4 Erro 500 no registro

Verificar:

1. Conexao com Mongo ativa.
2. Colecao com indice unico e email duplicado.
3. Campo email/senha validos no body.

## 12. Convenção de branch e commit (sugestão)

1. Criar branch por funcionalidade:

```bash
git checkout -b feature/<nome-da-feature>
```

2. Commitar com mensagem clara:

```bash
git add .
git commit -m "feat(auth): configura registro e login com JWT"
```

## 13. Checklist rapido de onboarding

1. Clonei o repositório.
2. Entrei em src/backend.
3. Rodei npm install.
4. Configurei .env com URI valida.
5. Rodei npm run dev sem erro.
6. Rodei npm run format e npm run lint.
7. Testei register e login no Postman.

Se todos os itens acima estiverem ok, seu ambiente esta pronto para desenvolvimento.
