// page.tsx — Dashboard principal (ruta "/dashboard")
//
// El Sidebar y el layout protegido gestionan la cabecera y la navegación,
// así que esta página solo contiene el contenido específico del dashboard:
// cada archivo con una única responsabilidad.
//
// Si el usuario es EDUCADOR, al entrar ve un recuadro que le dice de cuántos
// menores es tutor/a (o que todavía no tiene ninguno asignado), sin tener que
// abrir cada ficha. Esta página es un Server Component, así que puede consultar
// la base de datos directamente con Prisma: no hace falta una llamada a la API.
// El botón del recuadro lleva al listado ya filtrado a sus tutorías (/menores?tutorias=1).

import { auth } from "@/lib/auth";  // Verifica sesión y devuelve datos del usuario
import { prisma } from "@/lib/prisma"; // Cliente de base de datos
import Link from "next/link"; // Componente de Next.js para enlaces internos (client-side navigation)

export default async function DashboardPage() { // Función asíncrona porque necesitamos esperar a la verificación de sesión
  // Verificamos sesión y obtenemos datos del usuario
  const session = await auth();

  // Solo el educador tiene tutorías. Para el resto de roles no consultamos nada.
  const esEducador = session?.user?.rol === "EDUCADOR";

  // count() solo cuenta las filas, sin traer los datos de los menores:
  // es la forma más ligera de responder "¿cuántos?"
  const numTutorias =
    esEducador && session?.user?.id
      ? await prisma.menor.count({
          where: { tutorEducativoId: session.user.id },
        })
      : 0;

  return (
    <main className="p-8">
      <h2 className="text-white text-2xl font-bold mb-2">Panel principal</h2>
      <p className="text-gray-400 mb-8">
        Bienvenido/a de nuevo, {session?.user?.name}
      </p>

      {/* RECUADRO DE TUTORÍAS — solo para educadores */}
      {esEducador && (
        <div
          className={
            numTutorias > 0
              ? "bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-4 flex items-center justify-between gap-4 flex-wrap"
              : "bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4"
          }
        >
          {numTutorias > 0 ? (
            <>
              <div>
                <h3 className="text-white font-semibold mb-1">Tus tutorías</h3>
                <p className="text-blue-300 text-sm">
                  Eres tutor/a de {numTutorias} {numTutorias === 1 ? "menor" : "menores"}.
                </p>
              </div>
              <Link
                href="/menores?tutorias=1"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Ver mis tutorías
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-white font-semibold mb-1">Tus tutorías</h3>
              <p className="text-gray-400 text-sm">
                Todavía no tienes menores asignados como tutor/a. Puedes consultar los datos generales de cualquier menor y registrar incidencias.
              </p>
            </>
          )}
        </div>
      )}

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
