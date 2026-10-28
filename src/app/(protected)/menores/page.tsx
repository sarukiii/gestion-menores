// page.tsx — Listado de menores (ruta "/menores")
//
// Muestra todos los menores registrados con búsqueda en tiempo real
// y filtrado por estado de medida.
//
// Es un Client Component porque necesitamos estado local para el
// buscador y el filtro — onChange actualiza el estado y React
// vuelve a renderizar el listado filtrado sin ir al servidor.
// Los datos se cargan una sola vez al montar el componente.
//
// Además de listar y filtrar:
// 1. Cada menor trae `esMiTutorado` (lo calcula la API). Si el usuario es su
//    tutor, la fila muestra la insignia "Tu tutoría".
// 2. Si el usuario tiene al menos una tutoría, aparece un aviso con el número
//    y una casilla para ver solo esos menores. Si no tiene ninguna, el aviso
//    no aparece, así que el listado queda igual para el resto de roles.
// 3. El filtro de tutorías vive en la URL (/menores?tutorias=1). Así el botón
//    del dashboard puede abrir el listado ya filtrado, y el enlace se puede
//    guardar o compartir. Leer la URL en un Client Component exige envolverlo
//    en <Suspense>, por eso el componente se divide en dos al final del archivo.
// 4. El botón "+ Nuevo menor" solo lo ven dirección y coordinación.

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { puedeCrearMenores } from "@/lib/permisos";

// Tipo para cada menor en el listado
// Solo los campos necesarios para la tabla — no la ficha completa
type MenorResumen = {
  id: string;
  nombre: string;
  apellidos: string;
  expediente: string;
  tipoMedida: string;
  estadoMedida: string;
  fechaInicio: string;
  // True si el usuario actual es el tutor educativo de este menor
  esMiTutorado: boolean;
};

// Estilos para los badges de estado de medida
const estiloEstado: Record<string, { texto: string; clase: string }> = {
  ACTIVA: { texto: "Activa", clase: "bg-green-500/10 text-green-400" },
  SUSPENDIDA: { texto: "Suspendida", clase: "bg-yellow-500/10 text-yellow-400" },
  FINALIZADA: { texto: "Finalizada", clase: "bg-gray-500/10 text-gray-400" },
};

// El contenido real del listado. No se exporta: lo usa MenoresPage, más abajo.
function MenoresContenido() {
  // Lista completa de menores — se carga una vez desde la API
  const [menores, setMenores] = useState<MenorResumen[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estado del buscador y el filtro de estado
  // Estos estados controlan qué menores se muestran en la tabla
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  // El filtro "solo mis tutorías" se lee de la URL (?tutorias=1)
  // en vez de guardarse en un estado. Así hay una única fuente de verdad:
  // si la URL dice tutorias=1 se filtra, y si no, no.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const soloMisTutorias = searchParams.get("tutorias") === "1";

  // Cambiar el filtro = cambiar la URL. `replace` no llena el historial del
  // navegador con un paso por cada vez que se marca o desmarca la casilla.
  const cambiarSoloMisTutorias = (activo: boolean) => {
    router.replace(activo ? `${pathname}?tutorias=1` : pathname);
  };

  // Solo dirección y coordinación ven el botón de dar de alta
  const { data: session } = useSession();
  const puedeCrear = session?.user ? puedeCrearMenores(session.user.rol) : false;

  // Cargamos todos los menores al montar el componente
  // El filtrado se hace en el cliente — no hace falta volver al servidor
  // cada vez que el usuario escribe en el buscador
  useEffect(() => {
    const cargarMenores = async () => {
      const respuesta = await fetch("/api/menores");
      if (respuesta.ok) {
        setMenores(await respuesta.json());
      }
      setCargando(false);
    };
    cargarMenores();
  }, []);

  // Cuántos menores tiene el usuario como tutor
  const numMisTutorias = menores.filter((menor) => menor.esMiTutorado).length;

  // FILTRADO EN EL CLIENTE
  // Aplicamos búsqueda y filtro de estado sobre la lista completa
  // filter devuelve un nuevo array con solo los elementos que cumplen la condición
  const menoresFiltrados = menores.filter((menor) => {
    // Búsqueda por nombre completo o expediente (insensible a mayúsculas)
    const terminoBusqueda = busqueda.toLowerCase();
    const coincideBusqueda =
      busqueda === "" ||
      `${menor.nombre} ${menor.apellidos}`.toLowerCase().includes(terminoBusqueda) ||
      menor.expediente.toLowerCase().includes(terminoBusqueda);

    // Filtro por estado de medida
    const coincideEstado =
      filtroEstado === "TODOS" || menor.estadoMedida === filtroEstado;

    // Si la casilla está marcada, solo los menores de los que soy tutor
    const coincideTutoria = !soloMisTutorias || menor.esMiTutorado;

    // Solo mostramos el menor si cumple TODAS las condiciones
    return coincideBusqueda && coincideEstado && coincideTutoria;
  });

  return (
    <main className="p-8">
      <div className="max-w-5xl mx-auto">

        {/* Cabecera con título y botón de nuevo menor */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold">Menores</h1>
            <p className="text-gray-400 text-sm">
              {/* Mostramos cuántos resultados hay tras aplicar los filtros */}
              {cargando
                ? "Cargando..."
                : `${menoresFiltrados.length} de ${menores.length} ${menores.length === 1 ? "menor" : "menores"}`}
            </p>
          </div>
          {puedeCrear && (
            <Link
              href="/menores/nuevo"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              + Nuevo menor
            </Link>
          )}
        </div>

        {/* AVISO DE TUTORÍAS
            Solo aparece si el usuario es tutor de algún menor.
            Le dice cuántos son y le deja filtrarlos con una casilla. */}
        {!cargando && numMisTutorias > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
            <span>
              Eres tutor/a de {numMisTutorias} {numMisTutorias === 1 ? "menor" : "menores"}.
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={soloMisTutorias}
                onChange={(e) => cambiarSoloMisTutorias(e.target.checked)}
              />
              Mostrar solo mis tutorías
            </label>
          </div>
        )}

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="flex gap-3 mb-4">
          {/* Buscador — filtra por nombre o expediente en tiempo real */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por nombre o expediente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {/* Botón para limpiar la búsqueda — aparece solo cuando hay texto */}
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro por estado de medida */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVA">Activa</option>
            <option value="SUSPENDIDA">Suspendida</option>
            <option value="FINALIZADA">Finalizada</option>
          </select>
        </div>

        {/* TABLA DE MENORES */}
        {cargando ? (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
            <p className="text-gray-400">Cargando menores...</p>
          </div>
        ) : menoresFiltrados.length === 0 ? (
          // Estado vacío — cuando no hay resultados (lista vacía o sin coincidencias)
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
            <p className="text-gray-400 mb-2">
              {menores.length === 0
                ? "Todavía no hay ningún menor registrado."
                : "No hay menores que coincidan con la búsqueda."}
            </p>
            {menores.length === 0 ? (
              // Solo quien puede dar de alta ve el enlace para crear el primero
              puedeCrear && (
                <Link
                  href="/menores/nuevo"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Crear el primer registro →
                </Link>
              )
            ) : (
              // Botón para limpiar los filtros y ver todos los menores
              // También desmarca la casilla de mis tutorías
              <button
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado("TODOS");
                  cambiarSoloMisTutorias(false);
                }}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Limpiar filtros →
              </button>
            )}
          </div>
        ) : (
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
                {menoresFiltrados.map((menor) => {
                  const estado = estiloEstado[menor.estadoMedida] ?? {
                    texto: menor.estadoMedida,
                    clase: "bg-gray-500/10 text-gray-400",
                  };

                  return (
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
                        {/* Insignia si el usuario es el tutor de este menor */}
                        {menor.esMiTutorado && (
                          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Tu tutoría
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {menor.expediente}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {menor.tipoMedida}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estado.clase}`}>
                          {estado.texto}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
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

// Componente exportado. Next.js exige que un componente que lee la URL
// con useSearchParams esté dentro de <Suspense>; mientras se resuelve, se
// muestra el texto de carga.
export default function MenoresPage() {
  return (
    <Suspense
      fallback={
        <main className="p-8">
          <p className="text-gray-400">Cargando menores...</p>
        </main>
      }
    >
      <MenoresContenido />
    </Suspense>
  );
}
