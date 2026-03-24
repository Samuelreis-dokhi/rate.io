# ESTAGIO BASE
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ESTAGIO DE DESENVOLVIMENTO (USADO PELO DOCKER COMPOSE)
FROM base AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ESTAGIO DE PRODUÇÃO
FROM base AS production
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["npm", "start"]