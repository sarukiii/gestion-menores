// page.tsx — Dashboard principal (ruta "/dashboard")
//
// Esta es la primera pantalla que ve un usuario autenticado.
// Es un Server Component (sin "use client") porque obtenemos la sesión
// directamente en el servidor, antes de renderizar nada — más seguro
// y más rápido que pedirla desde el cliente con un useEffect.

import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";

export default async function DashboardPage() {
  // auth() en un Server Component nos da la sesión actual directamente.
  // Si llegamos hasta aquí es porque el middleware ya comprobó que existe,
  // pero TypeScript no lo sabe, así que seguimos comprobando por seguridad.
  const session = await auth();

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

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Cabecera con datos del usuario y botón de cerrar sesión */}
      <header className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-white font-bold text-lg">
            Gestión de Menores
          </h1>
          <p className="text-gray-400 text-sm">
            {/* session?.user accede de forma segura por si fuera undefined */}
            {session?.user?.name} ·{" "}
            {nombresRol[session?.user?.rol ?? ""] ?? session?.user?.rol}
          </p>
        </div>

        {/* Formulario de logout — NextAuth requiere un Server Action para esto */}
        <form
          action={async () => {
            "use server"; // se ejecuta en el servidor, no en el navegador
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
        <h2 className="text-white text-2xl font-bold mb-2">
          Panel principal
        </h2>
        <p className="text-gray-400 mb-8">
          Bienvenido/a de nuevo, {session?.user?.name}
        </p>

        {/* Tarjetas de acceso rápido — placeholder hasta construir el resto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-white font-semibold mb-1">Menores</h3>
            <p className="text-gray-400 text-sm">
              Próximamente — listado y fichas
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-white font-semibold mb-1">Seguimientos</h3>
            <p className="text-gray-400 text-sm">
              Próximamente — informes trimestrales
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
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