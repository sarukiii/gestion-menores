// page.tsx — Dashboard principal (ruta "/dashboard")
//
// Ahora que el Sidebar y el layout protegido gestionan la cabecera
// y la navegación, esta página solo contiene el contenido específico
// del dashboard — más limpio y con responsabilidades bien separadas.

import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="p-8">
      <h2 className="text-white text-2xl font-bold mb-2">Panel principal</h2>
      <p className="text-gray-400 mb-8">
        Bienvenido/a de nuevo, {session?.user?.name}
      </p>

      {/* Tarjetas de acceso rápido */}
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

        {/* Tarjeta deshabilitada — seguimientos pendientes */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 opacity-50 cursor-not-allowed">
          <h3 className="text-white font-semibold mb-1">Seguimientos</h3>
          <p className="text-gray-400 text-sm">
            Próximamente — informes trimestrales
          </p>
        </div>

        {/* Tarjeta deshabilitada — incidencias pendientes */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 opacity-50 cursor-not-allowed">
          <h3 className="text-white font-semibold mb-1">Incidencias</h3>
          <p className="text-gray-400 text-sm">
            Próximamente — registro de incidentes
          </p>
        </div>
      </div>
    </main>
  );
}