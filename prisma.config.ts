// prisma.config.ts — Configuración central de Prisma.
// Aquí se indica dónde está el schema, dónde guardar las migraciones
// y cómo conectarse a la base de datos.
// En Prisma 7 la URL de conexión ya no va en schema.prisma sino aquí.

import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Carga las variables del archivo .env para que process.env las pueda leer
dotenv.config();

export default defineConfig({
  // Ruta al archivo que define los modelos de la base de datos
  schema: "prisma/schema.prisma",

  migrations: {
    // Carpeta donde se guardan los archivos SQL de cada migración
    path: "prisma/migrations",
  },

  datasource: {
    // URL de conexión leída desde el archivo .env
    // Formato: postgresql://usuario:contraseña@host:puerto/nombre_bd
    url: process.env.DATABASE_URL,
  },
});