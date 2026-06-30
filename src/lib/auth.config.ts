// auth.config.ts — Configuración "ligera" de NextAuth, SIN acceso a Prisma
//
// ¿POR QUÉ EXISTE ESTE ARCHIVO SEPARADO DE auth.ts?
//
// El middleware de Next.js no se ejecuta en un servidor Node.js normal,
// sino en "Edge Runtime" — un entorno mucho más limitado, pensado para
// ejecutarse muy rápido y cerca del usuario (en el edge de la red).
//
// Edge Runtime NO soporta módulos nativos de Node como "node:path" o
// "node:fs", que es justo lo que usa internamente el cliente generado
// por Prisma 7. Si el middleware importa (aunque sea indirectamente)
// algo que toque Prisma, la app rompe con un error de módulo nativo.
//
// SOLUCIÓN: dividimos la configuración de NextAuth en dos partes:
//   1. auth.config.ts (este archivo) — solo páginas y reglas de autorización,
//      sin tocar la base de datos. Es lo único que puede ejecutarse en Edge.
//   2. auth.ts — la configuración completa, con Prisma y bcrypt,
//      que se usa en rutas API y componentes de servidor (Node normal).
//
// Este patrón de "config dividida" es una práctica recomendada oficialmente
// por la documentación de NextAuth para proyectos con middleware + Prisma.

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  // Le decimos a NextAuth que nuestra pantalla de login está en la raíz "/"
  // en lugar de usar la página de login por defecto de NextAuth
  pages: {
    signIn: "/",
  },

  callbacks: {
    // CALLBACK "authorized"
    // Se ejecuta en CADA petición que pasa por el middleware.
    // Decide si se permite el acceso a la ruta solicitada o no.
    //
    // Recibe:
    // - auth: la sesión actual (o null si no hay usuario logueado)
    // - request.nextUrl: información de la URL que se está visitando
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user; // true si hay sesión activa
      const isOnLoginPage = nextUrl.pathname === "/";

      // CASO 1: usuario NO logueado intentando acceder a una ruta privada
      // (cualquier ruta que no sea el login)
      // Devolver "false" hace que NextAuth redirija automáticamente al login
      if (!isLoggedIn && !isOnLoginPage) {
        return false;
      }

      // CASO 2: usuario YA logueado intentando volver al login
      // No tiene sentido que vea el formulario otra vez — lo mandamos al dashboard
      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // CASO 3: cualquier otra combinación es válida — dejamos pasar
      return true;
    },
  },

  // En esta configuración ligera no definimos proveedores de login
  // (eso requeriría Prisma para consultar usuarios).
  // Los proveedores reales se añaden en auth.ts, que extiende este archivo.
  providers: [],
};
