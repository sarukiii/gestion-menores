// middleware.ts — Guardián de rutas protegidas
//
// Se ejecuta en Edge Runtime, ANTES de que Next.js procese cualquier
// petición. Es el primer filtro de seguridad de toda la aplicación.
//
// CRÍTICO: este archivo solo puede importar auth.config.ts (versión
// SIN Prisma). Si importase auth.ts directamente, la app rompería
// porque Edge Runtime no soporta los módulos nativos de Node que
// usa el cliente generado por Prisma 7.
// (Explicación completa del problema en auth.config.ts)

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Creamos una instancia de NextAuth SOLO con la config ligera
// y usamos su función "auth" como middleware
export const { auth: middleware } = NextAuth(authConfig);
export default middleware;

// CONFIGURACIÓN DEL MATCHER
// Define a qué rutas se aplica este middleware.
// Excluimos:
// - api/auth: las propias rutas de login, no deben quedar bloqueadas
// - _next/static y _next/image: archivos internos de Next.js
// - favicon.ico y public: recursos estáticos
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
};
