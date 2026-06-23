// middleware.ts — Guardián de rutas protegidas
//
// El middleware es código que se ejecuta ANTES de que Next.js
// procese cualquier petición. Es el primer filtro que ve cada visita.
//
// Su función aquí es proteger las rutas privadas:
// si un usuario no autenticado intenta acceder al dashboard
// o a cualquier página protegida, lo redirigimos al login.
//
// Next.js busca este archivo automáticamente en src/middleware.ts

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// auth() actúa como middleware cuando se usa de esta forma
export default auth((req) => {
  const isLoggedIn = !!req.auth; // req.auth contiene la sesión si está autenticado
  const isOnLoginPage = req.nextUrl.pathname === "/";

  // RUTAS PROTEGIDAS — requieren autenticación
  // Si el usuario no está autenticado y no está en el login, lo redirigimos
  if (!isLoggedIn && !isOnLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // REDIRECCIÓN POST-LOGIN
  // Si el usuario ya está autenticado y visita el login, lo mandamos al dashboard
  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // En cualquier otro caso, dejamos pasar la petición
  return NextResponse.next();
});

// CONFIGURACIÓN DEL MATCHER
// Le dice a Next.js a qué rutas aplicar el middleware
// Excluimos archivos estáticos, imágenes y la ruta API de NextAuth
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
};
