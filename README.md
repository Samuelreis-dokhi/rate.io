# RATE.IO

`Análise e Desenvolvimento de Sistemas`

`Projeto - Desenvolvimento de uma Aplicação Distribuída - Turma 01 - 2026/1`

`Eixo 4`

O projeto consiste no desenvolvimento de uma aplicação distribuída voltada para a gestão financeira e o rateio de despesas coletivas em diversos cenários, como viagens, moradias compartilhadas (repúblicas) e eventos sociais. A solução utiliza uma arquitetura cliente-servidor onde uma API REST centralizada na nuvem, integrada a um banco de dados NoSQL, serve simultaneamente a uma interface Web e a um aplicativo Mobile. Enquanto o foco do dispositivo móvel é a agilidade nos lançamentos cotidianos e notificações em tempo real, a plataforma Web oferece uma visão macro e gerencial dos gastos.

## Integrantes

- Samuel Filipe dos reis
- Louise Dias Santos
- Heitor Oliveiro Soares Domingos
- Vinícius Nogueira
- Rondinelli Silva de Oliveira
- Icaro de Jesus Souza e Cota

## Orientador

- Leonardo Vilela Cardoso

## Instruções de utilização

Atualmente o projeto possui backend em Node.js com MongoDB Atlas e duas formas de execução no ambiente de desenvolvimento:

1. Com Docker (recomendado para padronização da equipe).
2. Sem Docker (Node.js local).

### Pré-requisitos

Obrigatórios:

1. Git.
2. Docker e Docker Compose.
3. Postman.
4. Acesso ao MongoDB Atlas (usuário, senha e permissão).

Opcionais (fluxo sem Docker):

1. Node.js 18+.
2. npm 9+.

### Instalar Docker (se ainda não estiver instalado)

Escolha o passo a passo de acordo com seu sistema operacional.

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Após executar o `usermod`, finalize e abra a sessão novamente (ou reinicie a máquina) para aplicar o grupo `docker` ao seu usuário.

#### Windows

1. Baixe e instale o Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Durante a instalação, mantenha a opção de WSL2 habilitada.
3. Reinicie a máquina se o instalador solicitar.

#### macOS

1. Baixe e instale o Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Abra o Docker Desktop e aguarde o status ficar como "Engine running".

#### Validação da instalação (todos os sistemas)

```bash
docker --version
docker compose version
```

Comandos úteis de validação:

```bash
git --version
docker --version
docker compose version
node -v
npm -v
```

### Estrutura de execução do backend

Arquivos principais para execução em container:

1. `docker-compose.yml` (raiz do repositório).
2. `src/backend/Dockerfile`.
3. `src/backend/.dockerignore`.
4. `src/backend/.env.example`.

### Passo a passo rápido (Docker)

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd pmv-ads-2026-1-e4-infra-t1-segunda-20h
```

2. Crie o arquivo de ambiente do backend com base no exemplo:

```bash
cp src/backend/.env.example src/backend/.env
```

3. Edite `src/backend/.env` e preencha, no mínimo:

```env
PORT=3000
JWT_SECRET=<sua-chave-jwt>
MONGO_URI_AUTH=<uri-do-mongo-auth>
MONGO_URI_USERS=<uri-do-mongo-users>
```

Observações:

1. `MONGO_URI_GROUPS` e `MONGO_URI_EXPENSES` são opcionais neste estágio.
2. Se a senha do Atlas tiver caracteres especiais, aplique URL encode.

4. Suba a API em container:

```bash
docker compose up --build
```

5. Valide se a API está online:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

### Passo a passo alternativo (sem Docker)

1. Acesse a pasta do backend:

```bash
cd src/backend
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o `.env` a partir do `.env.example` e preencha as variáveis.

4. Rode em desenvolvimento:

```bash
npm run dev
```

### Scripts disponíveis no backend

```bash
npm run start      # executa com node
npm run dev        # executa com nodemon
npm run lint       # valida padrão de código
npm run lint:fix   # tenta corrigir automaticamente
npm run format     # formata com prettier
```

# Guia de Testes da API no Postman

## Visão Geral
Este guia permite testar todo o fluxo da API na máquina de outra pessoa, do zero, com Postman:
1. Autenticação
2. Perfil
3. Grupo
4. Despesa
5. Liquidação (settle)
6. Balanço
7. Atividades
8. Exclusão de grupo

---

## Pré-requisitos
1. Docker e Docker Compose instalados
2. Postman instalado
3. Projeto clonado
4. Backend configurado com variáveis de ambiente

---

## Subindo o backend
1. Entrar na pasta do backend
2. Subir os serviços
3. Validar saúde da API

### Healthcheck
Método: GET  
URL: `http://localhost:3000/health`  
Esperado: `200 OK` com status da API

---

## Configuração do Environment no Postman
Crie um Environment com estas variáveis:
1. `baseUrl` = `http://localhost:3000`
2. `tokenUser1`
3. `tokenUser2`
4. `profileIdUser1`
5. `profileIdUser2`
6. `groupId`
7. `expenseId`

---

## Regras importantes
1. Rotas de users, groups e expenses exigem Bearer Token.
2. Para groups/expenses, use ID de perfil do usuário (não authId do login).
3. Requests com body devem estar em `raw -> JSON`.
4. `update profile` é `PUT`, não `POST`.
5. `settle` exige body com `userId` e `paidBy`.

---

## Fluxo completo (ordem recomendada)

## 1) Registrar usuário 1
Método: POST  
URL: `{{baseUrl}}/api/auth/register`  
Auth: sem token  
Body:
```json
{
  "name": "User 1",
  "email": "user1@puc.com",
  "password": "123456"
}
```
Esperado:
1. 201
2. Usuário criado

## 2) Login usuário 1
Método: POST  
URL: `{{baseUrl}}/api/auth/login`  
Auth: sem token  
Body:
```json
{
  "email": "user1@puc.com",
  "password": "123456"
}
```
Esperado:
1. 200
2. Salvar `token` em `tokenUser1`

## 3) Registrar usuário 2
Método: POST  
URL: `{{baseUrl}}/api/auth/register`  
Auth: sem token  
Body:
```json
{
  "name": "User 2",
  "email": "user2@puc.com",
  "password": "123456"
}
```
Esperado:
1. 201

## 4) Login usuário 2
Método: POST  
URL: `{{baseUrl}}/api/auth/login`  
Auth: sem token  
Body:
```json
{
  "email": "user2@puc.com",
  "password": "123456"
}
```
Esperado:
1. 200
2. Salvar `token` em `tokenUser2`

## 5) Buscar perfil usuário 1
Método: GET  
URL: `{{baseUrl}}/api/users/profile`  
Auth: Bearer `{{tokenUser1}}`  
Body: vazio  
Esperado:
1. 200
2. Copiar `_id` para `profileIdUser1`

## 6) Buscar perfil usuário 2
Método: GET  
URL: `{{baseUrl}}/api/users/profile`  
Auth: Bearer `{{tokenUser2}}`  
Body: vazio  
Esperado:
1. 200
2. Copiar `_id` para `profileIdUser2`

## 7) Atualizar perfil usuário 1
Método: PUT  
URL: `{{baseUrl}}/api/users/profile`  
Auth: Bearer `{{tokenUser1}}`  
Body:
```json
{
  "name": "User 1 Updated",
  "avatarUrl": "https://example.com/avatar.png"
}
```
Esperado:
1. 200
2. Perfil atualizado

## 8) Criar grupo
Método: POST  
URL: `{{baseUrl}}/api/groups`  
Auth: Bearer `{{tokenUser1}}`  
Body:
```json
{
  "name": "Viagem Floripa",
  "description": "Despesas da viagem",
  "createdBy": "{{profileIdUser1}}",
  "membersIds": []
}
```
Esperado:
1. 201
2. Copiar `_id` para `groupId`

## 9) Adicionar usuário 2 no grupo
Método: POST  
URL: `{{baseUrl}}/api/groups/{{groupId}}/members`  
Auth: Bearer `{{tokenUser1}}`  
Body:
```json
{
  "userId": "{{profileIdUser2}}",
  "addedBy": "{{profileIdUser1}}"
}
```
Esperado:
1. 200
2. Membro incluído no array `members`

## 10) Listar grupos do usuário 1
Método: GET  
URL: `{{baseUrl}}/api/groups/user/{{profileIdUser1}}`  
Auth: Bearer `{{tokenUser1}}`  
Body: vazio  
Esperado:
1. 200
2. Lista com o grupo criado

## 11) Criar despesa (split igual)
Método: POST  
URL: `{{baseUrl}}/api/expenses`  
Auth: Bearer `{{tokenUser1}}`  
Body:
```json
{
  "groupId": "{{groupId}}",
  "description": "Jantar",
  "amount": 120,
  "currency": "BRL",
  "paidBy": "{{profileIdUser1}}",
  "createdBy": "{{profileIdUser1}}",
  "splitType": "igual",
  "splitsData": [
    { "userId": "{{profileIdUser1}}" },
    { "userId": "{{profileIdUser2}}" }
  ]
}
```
Esperado:
1. 201
2. Copiar `expense._id` para `expenseId`

## 12) Listar despesas do grupo
Método: GET  
URL: `{{baseUrl}}/api/expenses/group/{{groupId}}?userId={{profileIdUser1}}`  
Auth: Bearer `{{tokenUser1}}`  
Body: vazio  
Esperado:
1. 200
2. Array `expenses` contendo a despesa

## 13) Marcar parcela como paga (settle)
Método: POST  
URL: `{{baseUrl}}/api/expenses/{{expenseId}}/settle`  
Auth: Bearer `{{tokenUser2}}`  
Body:
```json
{
  "userId": "{{profileIdUser2}}",
  "paidBy": "{{profileIdUser1}}"
}
```
Esperado:
1. 200
2. Mensagem de sucesso

## 14) Consultar balanço do grupo
Método: GET  
URL: `{{baseUrl}}/api/expenses/group/{{groupId}}/balances?userId={{profileIdUser1}}`  
Auth: Bearer `{{tokenUser1}}`  
Body: vazio  
Esperado:
1. 200
2. Objeto `balance` com totais e saldo líquido

## 15) Listar atividades do grupo
Método: GET  
URL: `{{baseUrl}}/api/groups/{{groupId}}/activities?userId={{profileIdUser1}}&limit=50`  
Auth: Bearer `{{tokenUser1}}`  
Body: vazio  
Esperado:
1. 200
2. Lista de atividades

## 16) Deletar grupo
Método: DELETE  
URL: `{{baseUrl}}/api/groups/{{groupId}}`  
Auth: Bearer `{{tokenUser1}}`  
Body:
```json
{
  "userId": "{{profileIdUser1}}"
}
```
Esperado:
1. 200 se não houver despesas pendentes
2. 400 se houver despesas em aberto

---

## Testes de erro obrigatórios (documentação)
1. Rota protegida sem token: esperado 401
2. Token inválido ou expirado: esperado 401
3. ObjectId inválido: esperado 400
4. Usuário sem permissão: esperado 403
5. Recurso inexistente: esperado 404

---

## Troubleshooting rápido

## 401 Token ausente ou mal formatado
1. Confirmar Authorization tipo Bearer Token
2. Gerar token novo com login
3. Não enviar token com espaços extras

## 404 Endpoint não encontrado
1. Conferir método HTTP
2. Exemplo clássico: update profile usa PUT

## 200 com lista vazia em grupos do usuário
1. Pode ser válido
2. Verificar se `userId` é de perfil
3. Verificar se grupo está ativo e usuário é membro

## 500 em add member
1. Body deve estar em JSON
2. Confirmar `groupId`, `userId`, `addedBy` válidos

## 500 em create expense ou settle
1. Validar IDs de perfil
2. Garantir que usuários pertencem ao grupo
3. Em settle, enviar `userId` e `paidBy` no body

---

## Entregáveis recomendados para o relatório
1. Export da Collection do Postman
2. Export do Environment
3. Evidência de sucesso de cada rota
4. Evidência de pelo menos um erro esperado por módulo
5. Tabela final com método, endpoint, payload, esperado e obtido

---

## Observação final
Se quiser padronizar para toda equipe, crie uma pasta por módulo na Collection:
1. Auth
2. Users
3. Groups
4. Expenses
5. Validation Errors

Isso facilita revisão, apresentação e reaproveitamento nos próximos testes.

### Boas práticas para o time

1. Nunca versionar `src/backend/.env`.
2. Versionar apenas `src/backend/.env.example` com placeholders.
3. Rodar `npm run format` e `npm run lint` antes de abrir PR.
4. Usar branch por funcionalidade (`feature/...`, `bugfix/...`, `docs/...`).

# Documentação

<ol>
<li><a href="docs/01-Documentação de Contexto.md"> Documentação de Contexto</a></li>
<li><a href="docs/02-Especificação do Projeto.md"> Especificação do Projeto</a></li>
<li><a href="docs/03-Metodologia.md"> Metodologia</a></li>
<li><a href="docs/04-Projeto de Interface.md"> Projeto de Interface</a></li>
<li><a href="docs/05-Arquitetura da Solução.md"> Arquitetura da Solução</a></li>
<li><a href="docs/06-Template Padrão da Aplicação.md"> Template Padrão da Aplicação</a></li>
<li><a href="docs/07-Programação de Funcionalidades.md"> Programação de Funcionalidades</a></li>
<li><a href="docs/08-Registro de Testes Unitários.md"> Registro de Testes Unitários</a></li>
<li><a href="docs/09-Registro de Testes de Integração.md"> Registro de Testes de Integração</a></li>
<li><a href="docs/10-Registro de Testes de Sistema.md"> Registro de Testes de Sistema</a></li>
<li><a href="docs/11-Registro de Contribuição.md"> Registro de Contribuição</a></li>
<li><a href="docs/12-Apresentação do Projeto.md"> Apresentação do Projeto</a></li>
<li><a href="docs/13-Referências.md"> Referências</a></li>
</ol>

# Código

<li><a href="src/README.md"> Código Fonte</a></li>

# Apresentação

<li><a href="presentation/README.md"> Apresentação da solução</a></li>
