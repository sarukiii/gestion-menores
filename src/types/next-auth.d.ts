// next-auth.d.ts — Extensión de tipos de NextAuth para TypeScript
//
// Por defecto NextAuth solo conoce estos campos en el usuario:
// id, name, email, image
//
// Nuestros usuarios también tienen "rol" — necesitamos decírselo a TypeScript
// para que no de error cuando usamos session.user.rol en la app.
//
// Los archivos .d.ts son "declaration files" — solo contienen tipos,
// no código que se ejecute. TypeScript los lee automáticamente.

import { DefaultSession } from "next-auth";

// Extendemos el módulo "next-auth" añadiendo nuestros campos personalizados
declare module "next-auth" {
  // Extendemos la interfaz Session — lo que devuelve auth() en la app
  // Añadimos id y rol al objeto session.user
  interface Session {
    user: {
      id: string;
      rol: string;
    } & DefaultSession["user"]; // mantenemos los campos originales (name, email, image)
  }

  // Extendemos la interfaz User — lo que devuelve authorize()
  // Añadimos rol para que TypeScript lo reconozca cuando lo usamos en auth.ts
  interface User {
    rol: string;
  }
}

// Extendemos el módulo "next-auth/jwt" — el token JWT interno
// Añadimos id y rol para que TypeScript los reconozca en el callback jwt
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: string;
  }
}
