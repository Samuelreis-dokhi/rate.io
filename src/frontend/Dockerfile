# ESTAGIO BASE
FROM node:20-bullseye as base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ESTAGIO DE DESENVOLVIMENTO (USADO PELO DOCKER COMPOSE)
FROM base as development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5174
CMD ["npm", "run", "dev" ]

# ESTAGIO DE PRODUÇÃO
FROM base as production
WORKDIR /app
COPY . .
EXPOSE 5174
CMD ["npm", "start" ]