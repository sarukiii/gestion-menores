// page.tsx — Listado de menores (ruta "/menores")
//
// Muestra todos los menores registrados con búsqueda en tiempo real
// y filtrado por estado de medida.
//
// Es un Client Component porque necesitamos estado local para el
// buscador y el filtro — onChange actualiza el estado y React
// vuelve a renderizar el listado filtrado sin ir al servidor.
// Los datos se cargan una sola vez al montar el componente.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
};

// Estilos para los badges de estado de medida
const estiloEstado: Record<string, { texto: string; clase: string }> = {
  ACTIVA: { texto: "Activa", clase: "bg-green-500/10 text-green-400" },
  SUSPENDIDA: { texto: "Suspendida", clase: "bg-yellow-500/10 text-yellow-400" },
  FINALIZADA: { texto: "Finalizada", clase: "bg-gray-500/10 text-gray-400" },
};

export default function MenoresPage() {
  // Lista completa de menores — se carga una vez desde la API
  const [menores, setMenores] = useState<MenorResumen[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estado del buscador y el filtro de estado
  // Estos estados controlan qué menores se muestran en la tabla
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

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

    // Solo mostramos el menor si cumple AMBAS condiciones
    return coincideBusqueda && coincideEstado;
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
          <Link
            href="/menores/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            + Nuevo menor
          </Link>
        </div>

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
              <Link
                href="/menores/nuevo"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Crear el primer registro →
              </Link>
            ) : (
              // Botón para limpiar los filtros y ver todos los menores
              <button
                onClick={() => { setBusqueda(""); setFiltroEstado("TODOS"); }}
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