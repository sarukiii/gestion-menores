// auth.ts — Configuración central de NextAuth (Auth.js)
// NextAuth es la librería que gestiona toda la autenticación de la app:
// login, sesiones, tokens y control de acceso.
// Este archivo es el corazón del sistema de autenticación.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// NextAuth devuelve 4 elementos que exportamos para usar en toda la app:
// - handlers: las rutas API del login (GET y POST)
// - signIn: función para iniciar sesión
// - signOut: función para cerrar sesión
// - auth: función para obtener la sesión actual
export const { handlers, signIn, signOut, auth } = NextAuth({
  // ESTRATEGIA DE SESIÓN
  // "jwt" significa que la sesión se guarda en un token cifrado en el navegador
  // La alternativa sería "database" (guardar sesiones en una tabla de BD)
  // JWT es más sencillo y no requiere tabla adicional en PostgreSQL
  session: { strategy: "jwt" },

  // PÁGINAS PERSONALIZADAS
  // Le decimos a NextAuth dónde está nuestra página de login
  // Sin esto, NextAuth usaría su propia página por defecto
  pages: {
    signIn: "/", // La ruta raíz "/" es nuestra pantalla de login
  },

  // PROVEEDORES DE AUTENTICACIÓN
  // Define cómo puede autenticarse un usuario
  // Usamos "Credentials": email y contraseña propios
  // Otras opciones serían Google, GitHub, Microsoft...
  providers: [
    Credentials({
      // Campos que espera recibir del formulario de login
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },

      // FUNCIÓN AUTHORIZE
      // Se ejecuta cuando el usuario pulsa "Iniciar sesión"
      // Recibe las credenciales del formulario
      // Devuelve el usuario si el login es correcto, null si no
      authorize: async (credentials) => {
        // Paso 1: comprobamos que llegaron email y contraseña
        if (!credentials?.email || !credentials?.password) return null;

        // Paso 2: buscamos el usuario en la base de datos por email
        // findUnique busca exactamente un registro — email es único
        const usuario = await prisma.usuario.findUnique({
          where: { email: String(credentials.email) },
        });

        // Paso 3: si no existe el usuario o está dado de baja, rechazamos
        // "activo: false" es la forma de deshabilitar un usuario sin borrarlo
        if (!usuario || !usuario.activo) return null;

        // Paso 4: comparamos la contraseña introducida con el hash de la BD
        // bcrypt.compare hace la comparación de forma segura
        // Nunca se descifra el hash — bcrypt rehashea y compara
        const passwordCorrecta = await bcrypt.compare(
          String(credentials.password),
          usuario.password,
        );

        // Paso 5: si la contraseña no coincide, rechazamos
        if (!passwordCorrecta) return null;

        // Paso 6: todo correcto — devolvemos los datos del usuario
        // Estos datos se pasarán al token JWT en el callback "jwt"
        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          rol: usuario.rol,
        };
      },
    }),
  ],

  // CALLBACKS
  // Funciones que se ejecutan automáticamente en momentos clave del flujo
  callbacks: {
    // CALLBACK JWT
    // Se ejecuta justo después del login y cada vez que se renueva el token
    // "token" es el JWT actual, "user" son los datos devueltos por authorize
    // Aquí añadimos id y rol al token para tenerlos disponibles en la sesión
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.rol = user.rol; // rol viene de nuestro tipo personalizado
      }
      return token; // devolvemos el token enriquecido con nuestros datos
    },

    // CALLBACK SESSION
    // Se ejecuta cuando cualquier parte de la app pide la sesión actual
    // "session" es el objeto de sesión que verá la app
    // "token" es el JWT con los datos que guardamos en el callback anterior
    // Aquí pasamos id y rol del token a la sesión para usarlos en la UI
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as string;
      }
      return session; // devolvemos la sesión enriquecida con nuestros datos
    },
  },
});
