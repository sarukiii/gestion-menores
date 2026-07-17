// page.tsx — Ficha individual de un menor (ruta "/menores/[id]")
//
// Muestra todos los datos de un menor organizados por secciones,
// con posibilidad de editar directamente cada campo.
//
// Es un Client Component porque necesitamos interactividad:
// modo lectura / modo edición, estado del formulario, etc.
// Los datos se cargan desde la API al montar el componente.

"use client"; // indica a Next.js que este componente se ejecuta en el navegador

import { useState, useEffect } from "react"; // hooks de React para estado y efectos
import { useRouter, useParams } from "next/navigation"; // hooks de Next.js para navegación y parámetros de URL
import Link from "next/link"; // componente de Next.js para enlaces internos sin recarga de página

// Tipo que representa la ficha completa de un menor
// Coincide exactamente con el modelo Menor de Prisma
type Menor = {
  id: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  dni: string | null;
  nacionalidad: string | null;
  domicilio: string | null;
  telefono: string | null;
  expediente: string;
  tipoMedida: string;
  estadoMedida: string;
  fechaInicio: string;
  fechaFin: string | null;
  juzgado: string | null;
  tutorNombre: string | null;
  tutorTelefono: string | null;
  tutorRelacion: string | null;
  situacionFamiliar: string | null;
  centroEducativo: string | null;
  cursoNivel: string | null;
  situacionEscolar: string | null;
  medicoAsignado: string | null;
  centroSalud: string | null;
  observacionesSalud: string | null;
  psicologoAsignado: string | null;
  diagnostico: string | null;
  medicacion: string | null;
  trabajadorSocial: string | null;
  serviciosSociales: string | null;
  perfilPsicologico: string | null;
  objetivos_generales: string | null;
  objetivos_especificos: string | null;
};

// Tipo para los informes iniciales que se muestran en la ficha
// Solo necesitamos los campos básicos para el listado — no la ficha completa
type InformeInicialResumen = {
  id: string;
  fecha: string;
  motivoIngreso: string;
  usuario: { nombre: string; rol: string };
};

// Estilos visuales para cada estado posible de la medida judicial
const estiloEstado: Record<string, { texto: string; clase: string }> = {
  ACTIVA: { texto: "Activa", clase: "bg-green-500/10 text-green-400 border border-green-500/20" },
  SUSPENDIDA: { texto: "Suspendida", clase: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" },
  FINALIZADA: { texto: "Finalizada", clase: "bg-gray-500/10 text-gray-400 border border-gray-500/20" },
};

// Formatea una fecha ISO a formato español (dd/mm/aaaa)
function formatearFecha(fecha: string | null): string {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-ES");
}

// Extrae solo la parte de la fecha (aaaa-mm-dd) para inputs type="date"
// Los inputs de fecha en HTML esperan formato ISO, no formato español
function fechaParaInput(fecha: string | null): string {
  if (!fecha) return "";
  return new Date(fecha).toISOString().split("T")[0];
}

// COMPONENTE Campo — muestra un dato en modo lectura o un input en modo edición
// Definido FUERA del componente principal para evitar recreaciones en cada render
function Campo({
  label,
  valor,
  campo,
  tipo = "text",
  editando,
  onChange,
}: {
  label: string;
  valor: string | null;
  campo: string;
  tipo?: string;
  editando: boolean;
  onChange: (campo: string, valor: string) => void;
}) {
  return (
    <div>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {editando ? (
        <input
          type={tipo}
          value={tipo === "date" ? fechaParaInput(valor) : (valor ?? "")}
          onChange={(e) => onChange(campo, e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        // "—" cuando el campo está vacío para indicar que no hay dato
        <p className="text-white text-sm">
          {tipo === "date" ? formatearFecha(valor) : (valor || "—")}
        </p>
      )}
    </div>
  );
}

// COMPONENTE Seccion — agrupa campos relacionados en un bloque visual
function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <h3 className="text-white font-semibold mb-4 pb-3 border-b border-gray-800">
        {titulo}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

export default function FichaMenorPage() {
  const router = useRouter();
  // useParams extrae el segmento dinámico [id] de la URL actual
  const params = useParams();
  const id = params.id as string;

  const [menor, setMenor] = useState<Menor | null>(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Lista de informes iniciales del menor — se carga junto con la ficha
  const [informesIniciales, setInformesIniciales] = useState<InformeInicialResumen[]>([]);

  // Cargamos la ficha y los informes al montar el componente
  // useEffect con [id] como dependencia se ejecuta cuando cambia el ID en la URL
  useEffect(() => {
    const cargarDatos = async () => {
      // Cargamos la ficha del menor
      const respuestaMenor = await fetch(`/api/menores/${id}`);
      if (!respuestaMenor.ok) {
        setError("No se pudo cargar la ficha del menor");
        setCargando(false);
        return;
      }
      const datosMenor = await respuestaMenor.json();
      setMenor(datosMenor);

      // Cargamos los informes iniciales en paralelo con la ficha
      // para no hacer dos peticiones secuenciales innecesarias
      const respuestaInformes = await fetch(
        `/api/informes/inicial?menorId=${id}`
      );
      if (respuestaInformes.ok) {
        const datosInformes = await respuestaInformes.json();
        setInformesIniciales(datosInformes);
      }

      setCargando(false);
    };
    cargarDatos();
  }, [id]);

  // Actualiza un campo concreto del objeto menor en el estado local
  // No guarda en la BD todavía — eso ocurre al pulsar "Guardar cambios"
  const actualizarCampo = (campo: string, valor: string) => {
    setMenor((anterior) =>
      anterior ? { ...anterior, [campo]: valor } : anterior
    );
  };

  // Envía todos los cambios a la API (PUT) y sale del modo edición
  const handleGuardar = async () => {
    if (!menor) return;
    setGuardando(true);
    setError("");

    const respuesta = await fetch(`/api/menores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menor),
    });

    setGuardando(false);

    if (!respuesta.ok) {
      const data = await respuesta.json();
      setError(data.error || "Error al guardar los cambios");
      return;
    }

    setEditando(false);
  };

  // Cancela la edición recargando los datos originales desde la API
  // Así descartamos cualquier cambio no guardado
  const handleCancelar = async () => {
    setCargando(true);
    const respuesta = await fetch(`/api/menores/${id}`);
    const datos = await respuesta.json();
    setMenor(datos);
    setCargando(false);
    setEditando(false);
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando ficha...</p>
      </main>
    );
  }

  if (error && !menor) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  if (!menor) return null;

  const estado = estiloEstado[menor.estadoMedida] ?? {
    texto: menor.estadoMedida,
    clase: "bg-gray-500/10 text-gray-400",
  };

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">

        {/* CABECERA — nombre, expediente, estado y botones de acción */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link
              href="/menores"
              className="text-gray-400 hover:text-white text-sm mb-2 inline-block transition-colors"
            >
              ← Volver al listado
            </Link>
            <h1 className="text-white text-2xl font-bold">
              {menor.nombre} {menor.apellidos}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-gray-400 text-sm">
                Expediente: {menor.expediente}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estado.clase}`}>
                {estado.texto}
              </span>
            </div>
          </div>

          {/* Botones de edición / guardado */}
          <div className="flex gap-2">
            {editando ? (
              <>
                <button
                  onClick={handleCancelar}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditando(true)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Editar ficha
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Selector de estado — solo visible en modo edición */}
        {editando && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-4 flex items-center gap-4">
            <p className="text-gray-400 text-sm">Estado de la medida:</p>
            <select
              value={menor.estadoMedida}
              onChange={(e) => actualizarCampo("estadoMedida", e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVA">Activa</option>
              <option value="SUSPENDIDA">Suspendida</option>
              <option value="FINALIZADA">Finalizada</option>
            </select>
          </div>
        )}

        {/* SECCIONES DE LA FICHA */}
        <div className="space-y-4">
          <Seccion titulo="Datos personales">
            <Campo label="Nombre" valor={menor.nombre} campo="nombre" editando={editando} onChange={actualizarCampo} />
            <Campo label="Apellidos" valor={menor.apellidos} campo="apellidos" editando={editando} onChange={actualizarCampo} />
            <Campo label="Fecha de nacimiento" valor={menor.fechaNacimiento} campo="fechaNacimiento" tipo="date" editando={editando} onChange={actualizarCampo} />
            <Campo label="DNI" valor={menor.dni} campo="dni" editando={editando} onChange={actualizarCampo} />
            <Campo label="Nacionalidad" valor={menor.nacionalidad} campo="nacionalidad" editando={editando} onChange={actualizarCampo} />
            <Campo label="Domicilio" valor={menor.domicilio} campo="domicilio" editando={editando} onChange={actualizarCampo} />
            <Campo label="Teléfono" valor={menor.telefono} campo="telefono" editando={editando} onChange={actualizarCampo} />
          </Seccion>

          <Seccion titulo="Medida judicial">
            <Campo label="Nº de expediente" valor={menor.expediente} campo="expediente" editando={editando} onChange={actualizarCampo} />
            <Campo label="Tipo de medida" valor={menor.tipoMedida} campo="tipoMedida" editando={editando} onChange={actualizarCampo} />
            <Campo label="Fecha de inicio" valor={menor.fechaInicio} campo="fechaInicio" tipo="date" editando={editando} onChange={actualizarCampo} />
            <Campo label="Fecha de fin" valor={menor.fechaFin} campo="fechaFin" tipo="date" editando={editando} onChange={actualizarCampo} />
            <Campo label="Juzgado" valor={menor.juzgado} campo="juzgado" editando={editando} onChange={actualizarCampo} />
          </Seccion>

          <Seccion titulo="Familia">
            <Campo label="Nombre del tutor/a" valor={menor.tutorNombre} campo="tutorNombre" editando={editando} onChange={actualizarCampo} />
            <Campo label="Teléfono del tutor/a" valor={menor.tutorTelefono} campo="tutorTelefono" editando={editando} onChange={actualizarCampo} />
            <Campo label="Relación con el menor" valor={menor.tutorRelacion} campo="tutorRelacion" editando={editando} onChange={actualizarCampo} />
            <Campo label="Situación familiar" valor={menor.situacionFamiliar} campo="situacionFamiliar" editando={editando} onChange={actualizarCampo} />
          </Seccion>

          <Seccion titulo="Educación">
            <Campo label="Centro educativo" valor={menor.centroEducativo} campo="centroEducativo" editando={editando} onChange={actualizarCampo} />
            <Campo label="Curso / nivel" valor={menor.cursoNivel} campo="cursoNivel" editando={editando} onChange={actualizarCampo} />
            <Campo label="Situación escolar" valor={menor.situacionEscolar} campo="situacionEscolar" editando={editando} onChange={actualizarCampo} />
          </Seccion>

          <Seccion titulo="Salud">
            <Campo label="Médico asignado" valor={menor.medicoAsignado} campo="medicoAsignado" editando={editando} onChange={actualizarCampo} />
            <Campo label="Centro de salud" valor={menor.centroSalud} campo="centroSalud" editando={editando} onChange={actualizarCampo} />
            <Campo label="Observaciones de salud" valor={menor.observacionesSalud} campo="observacionesSalud" editando={editando} onChange={actualizarCampo} />
          </Seccion>

          <Seccion titulo="Salud mental">
            <Campo label="Psicólogo/a asignado" valor={menor.psicologoAsignado} campo="psicologoAsignado" editando={editando} onChange={actualizarCampo} />
            <Campo label="Diagnóstico" valor={menor.diagnostico} campo="diagnostico" editando={editando} onChange={actualizarCampo} />
            <Campo label="Medicación" valor={menor.medicacion} campo="medicacion" editando={editando} onChange={actualizarCampo} />
          </Seccion>

          <Seccion titulo="Servicios sociales">
            <Campo label="Trabajador/a social" valor={menor.trabajadorSocial} campo="trabajadorSocial" editando={editando} onChange={actualizarCampo} />
            <Campo label="Servicios sociales de referencia" valor={menor.serviciosSociales} campo="serviciosSociales" editando={editando} onChange={actualizarCampo} />
          </Seccion>

          <Seccion titulo="Perfil y objetivos">
            <Campo label="Perfil psicológico" valor={menor.perfilPsicologico} campo="perfilPsicologico" editando={editando} onChange={actualizarCampo} />
            <Campo label="Objetivos generales" valor={menor.objetivos_generales} campo="objetivos_generales" editando={editando} onChange={actualizarCampo} />
            <Campo label="Objetivos específicos" valor={menor.objetivos_especificos} campo="objetivos_especificos" editando={editando} onChange={actualizarCampo} />
          </Seccion>

          {/* SECCIÓN DE INFORMES
              Muestra los informes ya creados para este menor.
              Se carga en paralelo con la ficha al montar el componente.
              A medida que se añadan más tipos de informe, se listan aquí. */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-800">
              <h3 className="text-white font-semibold">Informes</h3>
              {/* El botón de nuevo informe solo aparece en modo lectura
                  para evitar navegar fuera con cambios sin guardar */}
              {!editando && (
                <Link
                  href={`/menores/${id}/informes/inicial`}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Informe inicial
                </Link>
              )}
            </div>

            {/* Estado vacío — cuando todavía no hay ningún informe */}
            {informesIniciales.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No hay informes registrados todavía.
              </p>
            ) : (
              <div className="space-y-2">
                {informesIniciales.map((informe) => (
                  <div
                    key={informe.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        Informe inicial
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {/* Fecha en formato español y nombre del profesional que lo redactó */}
                        {new Date(informe.fecha).toLocaleDateString("es-ES")} ·{" "}
                        {informe.usuario.nombre}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                      Inicial
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}