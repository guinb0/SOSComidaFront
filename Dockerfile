# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar código fonte e buildar
COPY . .
RUN pnpm build

# Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos necessários
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public

# Expor porta
EXPOSE 3000

# Iniciar aplicação
CMD ["pnpm", "start"]
