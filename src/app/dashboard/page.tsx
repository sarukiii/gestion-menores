// page.tsx — Dashboard principal (ruta "/dashboard")
//
// Esta es la primera pantalla que ve un usuario autenticado.
// Es un Server Component (sin "use client") porque obtenemos la sesión
// directamente en el servidor, antes de renderizar nada — más seguro
// y más rápido que pedirla desde el cliente con un useEffect.

import { auth, signOut } from "@/lib/auth";
import Link from "next/link";

// Mapeo de roles técnicos a nombres legibles para mostrar en la UI
// El enum de Prisma usa MAYÚSCULAS_CON_GUION, pero la UI debe ser amigable
const nombresRol: Record<string, string> = {
  MONITOR: "Monitor",
  ATE: "ATE",
  EDUCADOR: "Educador/a",
  TRABAJADOR_SOCIAL: "Trabajador/a Social",
  PSICOLOGO: "Psicólogo/a",
  COORDINACION: "Coordinación",
  DIRECCION: "Dirección",
};

export default async function DashboardPage() {
  // auth() en un Server Component nos da la sesión actual directamente.
  // Si llegamos hasta aquí es porque el middleware ya comprobó que existe,
  // pero seguimos comprobando por seguridad — TypeScript no sabe que
  // el middleware garantiza la sesión
  const session = await auth();

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Cabecera con datos del usuario y botón de cerrar sesión */}
      <header className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-white font-bold text-lg">Gestión de Menores</h1>
          <p className="text-gray-400 text-sm">
            {/* session?.user accede de forma segura por si fuera undefined */}
            {session?.user?.name} ·{" "}
            {nombresRol[session?.user?.rol ?? ""] ?? session?.user?.rol}
          </p>
        </div>

        {/* Formulario de logout — NextAuth requiere un Server Action para esto.
            Un Server Action es una función que se ejecuta en el servidor al
            enviar el formulario, sin necesidad de una API Route explícita */}
        <form
          action={async () => {
            "use server"; // indica que esta función se ejecuta en el servidor
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      {/* Contenido principal del dashboard */}
      <div className="p-8">
        <h2 className="text-white text-2xl font-bold mb-2">Panel principal</h2>
        <p className="text-gray-400 mb-8">
          Bienvenido/a de nuevo, {session?.user?.name}
        </p>

        {/* Tarjetas de acceso rápido a las secciones principales.
            La tarjeta de Menores es un Link clicable.
            Las demás están deshabilitadas visualmente hasta que se construyan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tarjeta activa — enlaza al listado de menores */}
          <Link
            href="/menores"
            className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all"
          >
            <h3 className="text-white font-semibold mb-1">Menores</h3>
            <p className="text-gray-400 text-sm">
              Listado y fichas de menores
            </p>
          </Link>

          {/* Tarjeta deshabilitada — seguimientos pendientes de construir */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 opacity-50 cursor-not-allowed">
            <h3 className="text-white font-semibold mb-1">Seguimientos</h3>
            <p className="text-gray-400 text-sm">
              Próximamente — informes trimestrales
            </p>
          </div>

          {/* Tarjeta deshabilitada — incidencias pendientes de construir */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 opacity-50 cursor-not-allowed">
            <h3 className="text-white font-semibold mb-1">Incidencias</h3>
            <p className="text-gray-400 text-sm">
              Próximamente — registro de incidentes
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}