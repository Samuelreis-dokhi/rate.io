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

### Teste inicial no Postman

Com a API em execução, teste os endpoints básicos.

1. Registro
	- Método: POST
	- URL: `http://localhost:3000/api/auth/register`
	- Body JSON:

```json
{
  "name": "Seu Nome",
  "email": "seuemail@dominio.com",
  "password": "123456"
}
```

2. Login
	- Método: POST
	- URL: `http://localhost:3000/api/auth/login`
	- Body JSON:

```json
{
  "email": "seuemail@dominio.com",
  "password": "123456"
}
```

3. Perfil protegido
	- Método: GET
	- URL: `http://localhost:3000/api/users/profile`
	- Header: `Authorization: Bearer <token>`

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
