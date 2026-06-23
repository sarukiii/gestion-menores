// route.ts — Ruta API de NextAuth
//
// NextAuth necesita una ruta API para procesar las peticiones de login.
// Esta ruta recibe las peticiones GET y POST que hace el formulario
// y las delega a la configuración que definimos en auth.ts.
//
// La ruta [...nextauth] es una "catch-all route" de Next.js —
// captura cualquier ruta que empiece por /api/auth/
// Por ejemplo: /api/auth/signin, /api/auth/signout, /api/auth/session
//
// IMPORTANTE: este archivo no se toca — solo importa y exporta los handlers.
// Toda la lógica está en src/lib/auth.ts

import { handlers } from "@/lib/auth";

// Exportamos GET y POST para que Next.js sepa qué métodos HTTP acepta esta ruta
// GET: para obtener la sesión actual
// POST: para procesar el login y el logout
export const { GET, POST } = handlers;
