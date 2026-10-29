# Dockerfile — Imagen de producción de la aplicación
#
# Usamos una imagen multi-stage (múltiples etapas) para reducir
# el tamaño final de la imagen:
# - Etapa "builder": instala dependencias y construye la app
# - Etapa "runner": solo copia lo necesario para ejecutar la app
#
# Esto es importante porque node_modules en desarrollo pesa mucho
# más que lo que realmente necesita la app en producción.

# ── ETAPA 1: Builder ──────────────────────────────────────────────
# Node 24 Alpine: la misma versión de Node que se usa en desarrollo,
# en una imagen ligera basada en Alpine Linux.
FROM node:24-alpine AS builder

WORKDIR /app

# VALORES FALSOS, solo para poder CONSTRUIR la imagen.
# El archivo .env no se copia a la imagen (está en .dockerignore, y es
# lo correcto: las claves reales nunca deben quedar dentro de una imagen).
# Pero algunos módulos leen estas variables al compilar.
# Los valores reales llegan al ARRANCAR el contenedor, desde docker-compose.yml.
# Estas variables no pasan a la etapa final (runner).
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV NEXTAUTH_SECRET="valor-falso-solo-para-el-build"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXT_TELEMETRY_DISABLED=1

# Copiamos primero los archivos de dependencias
# Docker cachea cada capa — si package.json no cambia,
# no reinstala dependencias en cada build
COPY package*.json ./
COPY prisma ./prisma/

# Instalamos todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiamos el resto del código fuente
COPY . .

# Si el proyecto no tiene carpeta "public", la creamos vacía para que
# el COPY de la etapa final no falle
RUN mkdir -p public

# Generamos el cliente de Prisma
RUN npx prisma generate

# Construimos la app para producción
RUN npm run build

# ── ETAPA 2: Runner ───────────────────────────────────────────────
# Imagen limpia solo con lo necesario para ejecutar la app
FROM node:24-alpine AS runner

WORKDIR /app

# Configuramos el entorno como producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Creamos un usuario no-root por seguridad
# Nunca ejecutar apps en producción como root
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copiamos solo los archivos necesarios desde el builder.
# --chown deja los archivos a nombre del usuario no-root, para que la app
# pueda escribir en .next si lo necesita (por ejemplo, su caché).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

# A partir de aquí, todo se ejecuta como usuario no-root
USER nextjs

# Puerto que expone la app
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para arrancar la app
CMD ["node", "server.js"]