// layout.tsx — Layout protegido para todas las páginas interiores
//
// Envuelve todas las páginas protegidas con:
// 1. SessionProvider — necesario para que useSession() funcione en Client Components
// 2. Sidebar — navegación lateral que aparece en todas las páginas interiores
//
// SessionProvider es el contexto de NextAuth que permite a cualquier
// componente cliente acceder a la sesión con useSession() sin tener
// que pasarla como prop manualmente por toda la jerarquía de componentes.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificación de sesión en el servidor — capa extra de seguridad
  // además del middleware que ya protege las rutas
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return (
    // SessionProvider hace la sesión disponible para todos los Client Components
    // que usen useSession() dentro de este layout.
    // Le pasamos la sesión del servidor para evitar un flash de "sin sesión"
    // al cargar la página — el cliente ya tiene los datos desde el primer render.
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar
          nombreUsuario={session.user.name ?? "Usuario"}
          rolUsuario={session.user.rol ?? ""}
        />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}