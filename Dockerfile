# Dockerfile — Imagen de producción de la aplicación
#
# Usamos una imagen multi-stage (múltiples etapas) para reducir
# el tamaño final de la imagen:
# - Etapa "builder": instala dependencias y construye la app
# - Etapa final: solo copia lo necesario para ejecutar la app
#
# Esto es importante porque node_modules en desarrollo pesa mucho
# más que lo que realmente necesita la app en producción.

# ── ETAPA 1: Builder ──────────────────────────────────────────────
# Usamos Node 20 Alpine — imagen ligera basada en Alpine Linux
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos primero los archivos de dependencias
# Docker cachea cada capa — si package.json no cambia,
# no reinstala dependencias en cada build
COPY package*.json ./
COPY prisma ./prisma/

# Instalamos todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiamos el resto del código fuente
COPY . .

# Generamos el cliente de Prisma
RUN npx prisma generate

# Construimos la app para producción
RUN npm run build

# ── ETAPA 2: Runner ───────────────────────────────────────────────
# Imagen limpia solo con lo necesario para ejecutar la app
FROM node:20-alpine AS runner

WORKDIR /app

# Configuramos el entorno como producción
ENV NODE_ENV=production

# Creamos un usuario no-root por seguridad
# Nunca ejecutar apps en producción como root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos solo los archivos necesarios desde el builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/src/generated ./src/generated

# Asignamos los archivos al usuario no-root
USER nextjs

# Puerto que expone la app
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para arrancar la app
CMD ["node", "server.js"]