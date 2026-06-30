// auth.ts — Configuración COMPLETA de NextAuth (incluye Prisma y bcrypt)
//
// Este archivo es el que realmente gestiona el login: busca usuarios en
// PostgreSQL, compara contraseñas cifradas y genera los tokens de sesión.
//
// IMPORTANTE: este archivo NUNCA debe importarse desde middleware.ts,
// porque arrastra Prisma y rompería en Edge Runtime (ver auth.config.ts
// para la explicación completa de por qué).
//
// Se usa en:
// - La ruta API de NextAuth (src/app/api/auth/[...nextauth]/route.ts)
// - Server Components y Server Actions que necesiten la sesión completa

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Heredamos la configuración ligera (páginas + reglas de autorización)
  // y la combinamos con lo que solo puede vivir en entorno Node completo
  ...authConfig,

  // ESTRATEGIA DE SESIÓN: JWT
  // La sesión se guarda como un token cifrado en el navegador,
  // no en una tabla de la base de datos. Más simple de mantener
  // y no requiere consultar la BD en cada petición para validar sesión.
  session: { strategy: "jwt" },

  // PROVEEDORES DE AUTENTICACIÓN
  // "Credentials" = login propio con email/contraseña,
  // en contraposición a login social (Google, GitHub, etc.)
  providers: [
    Credentials({
      // Campos que el formulario de login debe enviar
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },

      // FUNCIÓN AUTHORIZE — el corazón de la validación del login
      // Se ejecuta cada vez que alguien intenta iniciar sesión.
      // Debe devolver el usuario si las credenciales son correctas,
      // o "null" si hay que rechazar el login (NextAuth no da detalles
      // del motivo exacto al cliente, por seguridad).
      authorize: async (credentials) => {
        // PASO 1 — Validación básica: ¿llegaron ambos campos?
        if (!credentials?.email || !credentials?.password) return null;

        // PASO 2 — Buscamos el usuario en PostgreSQL a través de Prisma
        // findUnique funciona porque "email" tiene la restricción @unique
        // en el modelo Usuario (ver prisma/schema.prisma)
        const usuario = await prisma.usuario.findUnique({
          where: { email: String(credentials.email) },
        });

        // PASO 3 — Rechazamos si no existe el usuario o está dado de baja
        // El campo "activo" permite desactivar a un profesional sin
        // borrar su historial de informes y seguimientos (trazabilidad)
        if (!usuario || !usuario.activo) return null;

        // PASO 4 — Comparamos la contraseña introducida con el hash guardado
        // bcrypt.compare NUNCA descifra el hash (es irreversible por diseño):
        // vuelve a cifrar la contraseña introducida con la misma sal
        // y compara los resultados
        const passwordCorrecta = await bcrypt.compare(
          String(credentials.password),
          usuario.password,
        );

        if (!passwordCorrecta) return null;

        // PASO 5 — Login correcto: devolvemos solo los datos necesarios
        // ¡NUNCA devolver el hash de la contraseña aquí! Estos datos
        // viajarán al callback "jwt" y de ahí al token del navegador.
        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          rol: usuario.rol,
        };
      },
    }),
  ],

  callbacks: {
    // Mantenemos el callback "authorized" heredado de auth.config.ts
    // y añadimos los callbacks que SÍ necesitan tocar el token completo
    ...authConfig.callbacks,

    // CALLBACK "jwt" — se ejecuta al crear o renovar el token
    // "user" solo está disponible justo después del login (viene de authorize)
    // En las siguientes peticiones "user" es undefined y el token ya
    // mantiene los datos que guardamos aquí la primera vez
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.rol = user.rol; // tipado gracias a next-auth.d.ts
      }
      return token;
    },

    // CALLBACK "session" — se ejecuta cuando cualquier parte de la app
    // pide la sesión actual (por ejemplo con el hook useSession())
    // Aquí trasladamos id y rol del token a la sesión visible para la UI
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as string;
      }
      return session;
    },
  },
});
