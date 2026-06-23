// prisma.ts — Cliente singleton de Prisma
//
// Prisma es el ORM (Object Relational Mapper) que conecta
// el código TypeScript con la base de datos PostgreSQL.
// En lugar de escribir SQL a mano, usamos métodos de Prisma
// que se traducen automáticamente a consultas SQL.
//
// PROBLEMA QUE RESUELVE ESTE ARCHIVO:
// En desarrollo, Next.js recarga el servidor constantemente.
// Sin este patrón, cada recarga crearía una nueva conexión a PostgreSQL
// hasta agotar el límite de conexiones.
// Solución: guardamos UNA instancia en el objeto global de Node.js
// y la reutilizamos en todas las recargas.

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ADAPTADOR DE POSTGRESQL
// En Prisma 7 la conexión a la BD se hace mediante un adaptador externo
// PrismaPg usa el driver oficial de PostgreSQL para Node.js
// Lee la URL de conexión desde el archivo .env
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// PATRÓN SINGLETON
// Guardamos la instancia de Prisma en globalThis (objeto global de Node.js)
// para que persista entre recargas del servidor de desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Si ya existe una instancia global la reutilizamos
// Si no existe, creamos una nueva con el adaptador de PostgreSQL
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// Solo en desarrollo guardamos la instancia en el objeto global
// En producción Next.js no recarga el servidor, así que no es necesario
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
