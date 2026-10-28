// vitest.config.ts — Configuración de los tests automáticos
//
// Vitest es el programa que ejecuta los tests. Este archivo le dice dónde
// buscarlos y cómo entender las rutas de tu proyecto.
//
// Vive en la raíz del proyecto, junto a package.json y next.config.

import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    // "node": los tests se ejecutan en Node, sin navegador.
    // Perfecto para lógica pura como permisos.ts y para las rutas de la API.
    environment: "node",

    // Dónde buscar tests: cualquier archivo que acabe en .test.ts
    // dentro de src/. Así los tests viven al lado del código que prueban
    // (permisos.ts y permisos.test.ts en la misma carpeta).
    include: ["src/**/*.test.ts"],
  },

  resolve: {
    alias: {
      // Tu proyecto importa con "@/lib/permisos" en vez de rutas largas.
      // Esa abreviatura "@" la entiende Next.js por tu tsconfig, pero Vitest
      // no, así que se la explicamos aquí: "@" significa la carpeta src.
      // Hoy permisos.ts no usa "@", pero lo necesitarán los tests de la API.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
