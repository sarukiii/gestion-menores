// page.tsx — Listado de menores (ruta "/menores")
//
// Muestra una tabla con todos los menores registrados, con acceso
// rápido a crear uno nuevo y, próximamente, a ver la ficha de cada uno.
//
// Es un Server Component (sin "use client") porque obtenemos los datos
// directamente en el servidor mediante Prisma, sin pasar por la API REST.
// Esto es más eficiente que hacer fetch a /api/menores desde el cliente:
// nos ahorramos una petición HTTP completa al renderizar la página inicial.

import { prisma } from "@/lib/prisma"; // Prisma Client para acceder a la base de datos
import Link from "next/link"; // Componente de Next.js para enlaces internos (sin recargar la página)

// Mapeo de estados técnicos a etiquetas legibles con color asociado
// Centralizarlo aquí evita repetir esta lógica en cada sitio donde
// se muestre el estado de un menor
const estiloEstado: Record<string, { texto: string; clase: string }> = {
  ACTIVA: { texto: "Activa", clase: "bg-green-500/10 text-green-400" },
  SUSPENDIDA: { texto: "Suspendida", clase: "bg-yellow-500/10 text-yellow-400" },
  FINALIZADA: { texto: "Finalizada", clase: "bg-gray-500/10 text-gray-400" },
};

export default async function MenoresPage() {
  // Consulta directa a la base de datos desde el Server Component
  // select: solo traemos los campos que realmente se muestran en la tabla,
  // evitando cargar los más de 30 campos completos de cada menor
  const menores = await prisma.menor.findMany({
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      expediente: true,
      tipoMedida: true,
      estadoMedida: true,
      fechaInicio: true,
    },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Cabecera con título y botón de alta */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold">Menores</h1>
            <p className="text-gray-400 text-sm">
              {menores.length} {menores.length === 1 ? "menor registrado" : "menores registrados"}
            </p>
          </div>
          <Link
            href="/menores/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            + Nuevo menor
          </Link>
        </div>

        {/* Estado vacío — cuando todavía no hay ningún menor registrado */}
        {menores.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
            <p className="text-gray-400 mb-4">
              Todavía no hay ningún menor registrado.
            </p>
            <Link
              href="/menores/nuevo"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Crear el primer registro →
            </Link>
          </div>
        ) : (
          // Tabla de menores — solo se muestra si hay al menos un registro
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="px-6 py-3 font-medium">Nombre</th>
                  <th className="px-6 py-3 font-medium">Expediente</th>
                  <th className="px-6 py-3 font-medium">Tipo de medida</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Fecha de inicio</th>
                </tr>
              </thead>
              <tbody>
                {/* map recorre el array de menores y genera una fila por cada uno */}
                {menores.map((menor) => {
                  // Buscamos el estilo correspondiente al estado de este menor
                  // Si por algún motivo no coincide ningún estado conocido,
                  // usamos un estilo neutro por defecto en lugar de romper la UI
                  const estado = estiloEstado[menor.estadoMedida] ?? {
                    texto: menor.estadoMedida,
                    clase: "bg-gray-500/10 text-gray-400",
                  };

                  return (
                    // Cada fila enlaza a la ficha individual del menor
                    // (esa página /menores/[id] la construiremos a continuación)
                    <tr
                      key={menor.id}
                      className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/menores/${menor.id}`}
                          className="text-white font-medium hover:text-blue-400 transition-colors"
                        >
                          {menor.nombre} {menor.apellidos}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {menor.expediente}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {menor.tipoMedida}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${estado.clase}`}
                        >
                          {estado.texto}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {/* toLocaleDateString formatea la fecha al formato español */}
                        {new Date(menor.fechaInicio).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}