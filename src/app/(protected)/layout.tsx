// layout.tsx — Layout protegido para todas las páginas interiores
//
// Una Route Group en Next.js es una carpeta con paréntesis — (protected) —
// que agrupa rutas sin añadir ese nombre a la URL. Es decir, las páginas
// dentro de (protected) siguen siendo accesibles en /dashboard, /menores, etc.
// pero comparten este layout automáticamente.
//
// Este layout añade el Sidebar a todas las páginas interiores de la app
// sin tener que importarlo manualmente en cada una.
//
// Es un Server Component porque obtiene la sesión en el servidor
// para pasársela al Sidebar como props.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Doble verificación de sesión — el middleware ya protege las rutas,
  // pero añadimos esta comprobación como capa extra de seguridad
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return (
    // Layout de dos columnas: sidebar fijo a la izquierda + contenido a la derecha
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar
        nombreUsuario={session.user.name ?? "Usuario"}
        rolUsuario={session.user.rol ?? ""}
      />
      {/* El children es la página actual que se está renderizando */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}