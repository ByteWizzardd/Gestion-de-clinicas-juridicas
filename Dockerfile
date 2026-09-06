# =========================================================
# Multi-stage Dockerfile para Next.js 16 (App Router)
# =========================================================

# ---------------------------------------------------------
# 1. Dependencias (deps)
# ---------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar manifiestos de dependencias
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------
# 2. Compilación (builder)
# ---------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivar telemetría de Next.js durante la construcción
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Variables dummy para evitar errores de evaluación durante el build
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gestion_clinicas"
ENV JWT_SECRET="build_dummy_jwt_secret_key"

RUN npm run build

# ---------------------------------------------------------
# 3. Entorno de Ejecución (runner)
# ---------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Crear usuario no privilegiado por seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos públicos y estáticos
COPY --from=builder /app/public ./public

# Crear carpeta .next y asignar permisos al usuario nextjs
RUN mkdir .next && chown nextjs:nodejs .next

# Copiar artefactos compilados en modo standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar archivos SQL requeridos en tiempo de ejecución por process.cwd() y sql-loader
COPY --from=builder --chown=nextjs:nodejs /app/database ./database

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

