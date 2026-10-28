// layout.tsx — Guarda de acceso para la ruta "/menores/nuevo"
//
// Un layout envuelve a la página que hay dentro de su carpeta. Aquí lo usamos
// como "portero": antes de mostrar el formulario de alta, comprobamos en el
// servidor si el usuario puede dar de alta menores (solo DIRECCION y
// COORDINACION). Si no puede, ve un mensaje claro y el formulario ni siquiera
// se envía a su navegador.
//
// Importante: esto mejora la experiencia, pero lo que de verdad protege es la
// comprobación del POST en /api/menores. Si alguien se saltara esta pantalla,
// la API le respondería 403 igualmente.
//
// Es un Server Component (no lleva "use client"), por eso puede llamar
// directamente a auth() sin pasar por la API.

import Link from "next/link";
import { auth } from "@/lib/auth";
import { puedeCrearMenores } from "@/lib/permisos";

export default async function NuevoMenorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Sin sesión o sin permiso: mostramos el mensaje en lugar del formulario
  if (!session?.user || !puedeCrearMenores(session.user.rol)) {
    return (
      <main className="p-8">
        <div className="max-w-xl mx-auto bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
          <h1 className="text-white text-xl font-bold mb-2">Acceso restringido</h1>
          <p className="text-gray-400 text-sm mb-6">
            No tienes permiso para dar de alta menores. Esta acción está reservada a dirección y coordinación.
          </p>
          <Link
            href="/menores"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            ← Volver al listado
          </Link>
        </div>
      </main>
    );
  }

  // Con permiso: mostramos la página normal (el formulario de alta)
  return <>{children}</>;
}
