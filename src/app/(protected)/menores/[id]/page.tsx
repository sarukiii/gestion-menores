"use client";

// page.tsx — Ficha individual de un menor (ruta "/menores/[id]")
//
// Además de mostrar y editar la ficha, ahora aplica control de acceso por rol:
// - DIRECCION, COORDINACION, PSICOLOGO, TRABAJADOR_SOCIAL → acceso completo
// - EDUCADOR → acceso completo solo si es el tutor asignado del menor
// - ATE → acceso básico: solo datos generales e incidencias
//
// COORDINACION y DIRECCION pueden además asignar el tutor educativo del menor
// desde un selector que aparece en la cabecera de la ficha.

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  puedeVerFichaCompleta,
  puedeEditarFicha,
  puedeAsignarTutor,
  puedeCrearIncidencias,
} from "@/lib/permisos";

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
  tutorEducativoId: string | null;
};

type InformeResumen = {
  id: string;
  fecha: string;
  usuario: { nombre: string; rol: string };
  tipo: "Inicial" | "Seguimiento" | "Extraordinario" | "Final";
  motivoIngreso?: string;
  periodo?: string;
  tipoExtraordinario?: string;
};

// Tipo para los educadores disponibles para asignar como tutor
type Educador = {
  id: string;
  nombre: string;
  email: string;
};

const estiloEstado: Record<string, { texto: string; clase: string }> = {
  ACTIVA: { texto: "Activa", clase: "bg-green-500/10 text-green-400 border border-green-500/20" },
  SUSPENDIDA: { texto: "Suspendida", clase: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" },
  FINALIZADA: { texto: "Finalizada", clase: "bg-gray-500/10 text-gray-400 border border-gray-500/20" },
};

const estiloTipoInforme: Record<string, string> = {
  Inicial: "bg-gray-700 text-gray-300",
  Seguimiento: "bg-blue-500/10 text-blue-400",
  Extraordinario: "bg-red-500/10 text-red-400",
  Final: "bg-purple-500/10 text-purple-400",
};

const etiquetasExtraordinario: Record<string, string> = {
  SALUD_MENTAL: "Salud mental",
  CAMBIO_FAMILIAR: "Cambio familiar",
  EMBARAZO: "Embarazo",
  NUEVO_DELITO: "Nuevo delito",
  ADICCION: "Adicción",
  OTRO: "Otro",
};

function formatearFecha(fecha: string | null): string {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-ES");
}

function fechaParaInput(fecha: string | null): string {
  if (!fecha) return "";
  return new Date(fecha).toISOString().split("T")[0];
}

function Campo({
  label, valor, campo, tipo = "text", editando, onChange,
}: {
  label: string; valor: string | null; campo: string;
  tipo?: string; editando: boolean;
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
        <p className="text-white text-sm">
          {tipo === "date" ? formatearFecha(valor) : (valor || "—")}
        </p>
      )}
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <h3 className="text-white font-semibold mb-4 pb-3 border-b border-gray-800">{titulo}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export default function FichaMenorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // useSession nos da la sesión del usuario actual en el cliente
  // Necesitamos el rol y el id para aplicar los permisos en la UI
  const { data: session } = useSession();

  const [menor, setMenor] = useState<Menor | null>(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [informes, setInformes] = useState<InformeResumen[]>([]);

  // Lista de educadores disponibles para asignar como tutor
  // Solo se carga si el usuario tiene permisos para asignar tutores
  const [educadores, setEducadores] = useState<Educador[]>([]);
  const [asignandoTutor, setAsignandoTutor] = useState(false);
  const [tutorSeleccionado, setTutorSeleccionado] = useState<string>("");

  useEffect(() => {
    const cargarDatos = async () => {
      const respuestaMenor = await fetch(`/api/menores/${id}`);
      if (!respuestaMenor.ok) {
        setError("No se pudo cargar la ficha del menor");
        setCargando(false);
        return;
      }
      const datosMenor = await respuestaMenor.json();
      setMenor(datosMenor);
      setTutorSeleccionado(datosMenor.tutorEducativoId ?? "");

      const [resIniciales, resSeguimiento, resExtraordinario, resFinal] =
        await Promise.all([
          fetch(`/api/informes/inicial?menorId=${id}`),
          fetch(`/api/informes/seguimiento?menorId=${id}`),
          fetch(`/api/informes/extraordinario?menorId=${id}`),
          fetch(`/api/informes/final?menorId=${id}`),
        ]);

      const iniciales = resIniciales.ok
        ? (await resIniciales.json()).map((i: any) => ({ ...i, tipo: "Inicial" as const }))
        : [];
      const seguimiento = resSeguimiento.ok
        ? (await resSeguimiento.json()).map((i: any) => ({ ...i, tipo: "Seguimiento" as const }))
        : [];
      const extraordinario = resExtraordinario.ok
        ? (await resExtraordinario.json()).map((i: any) => ({
            ...i, tipo: "Extraordinario" as const, tipoExtraordinario: i.tipo,
          }))
        : [];
      const final = resFinal.ok
        ? (await resFinal.json()).map((i: any) => ({ ...i, tipo: "Final" as const }))
        : [];

      const todos = [...iniciales, ...seguimiento, ...extraordinario, ...final]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      setInformes(todos);
      setCargando(false);
    };
    cargarDatos();
  }, [id]);

  // Cargamos la lista de educadores solo si el usuario puede asignar tutores
  // Evitamos peticiones innecesarias para roles sin ese permiso
  useEffect(() => {
    if (!session?.user) return;
    if (!puedeAsignarTutor(session.user.rol)) return;

    const cargarEducadores = async () => {
      const respuesta = await fetch("/api/usuarios?rol=EDUCADOR");
      if (respuesta.ok) {
        setEducadores(await respuesta.json());
      }
    };
    cargarEducadores();
  }, [session]);

  const actualizarCampo = (campo: string, valor: string) => {
    setMenor((anterior) => anterior ? { ...anterior, [campo]: valor } : anterior);
  };

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

  const handleCancelar = async () => {
    setCargando(true);
    const respuesta = await fetch(`/api/menores/${id}`);
    setMenor(await respuesta.json());
    setCargando(false);
    setEditando(false);
  };

  // Asigna el tutor seleccionado al menor usando el endpoint específico
  const handleAsignarTutor = async () => {
    setAsignandoTutor(true);
    const respuesta = await fetch(`/api/menores/${id}/tutor`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutorEducativoId: tutorSeleccionado || null }),
    });
    setAsignandoTutor(false);

    if (!respuesta.ok) {
      const data = await respuesta.json();
      setError(data.error || "Error al asignar el tutor");
      return;
    }

    const datos = await respuesta.json();
    setMenor((anterior) =>
      anterior ? { ...anterior, tutorEducativoId: datos.tutorEducativoId } : anterior
    );
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

  if (!menor || !session?.user) return null;

  // Calculamos los permisos del usuario actual sobre este menor concreto
  const accesoCompleto = puedeVerFichaCompleta({
    rolUsuario: session.user.rol,
    usuarioId: session.user.id,
    tutorEducativoId: menor.tutorEducativoId,
  });

  const puedeEditar = puedeEditarFicha({
    rolUsuario: session.user.rol,
    usuarioId: session.user.id,
    tutorEducativoId: menor.tutorEducativoId,
  });

  const puedeGestionarTutor = puedeAsignarTutor(session.user.rol);
  const puedeIncidencias = puedeCrearIncidencias();

  const estado = estiloEstado[menor.estadoMedida] ?? {
    texto: menor.estadoMedida,
    clase: "bg-gray-500/10 text-gray-400",
  };

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">

        {/* CABECERA */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link href="/menores" className="text-gray-400 hover:text-white text-sm mb-2 inline-block transition-colors">
              ← Volver al listado
            </Link>
            <h1 className="text-white text-2xl font-bold">
              {menor.nombre} {menor.apellidos}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-gray-400 text-sm">Expediente: {menor.expediente}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estado.clase}`}>
                {estado.texto}
              </span>
            </div>
          </div>

          {/* Botones de edición — solo visibles si tiene permisos */}
          <div className="flex gap-2">
            {puedeEditar && (
              editando ? (
                <>
                  <button onClick={handleCancelar} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
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
              )
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* SELECTOR DE TUTOR EDUCATIVO
            Solo visible para COORDINACION y DIRECCION.
            Permite asignar qué educador es responsable de este menor,
            lo que a su vez determina quién tiene acceso a su ficha. */}
        {puedeGestionarTutor && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-4 flex items-center gap-4 flex-wrap">
            <p className="text-gray-400 text-sm">Tutor educativo:</p>
            <select
              value={tutorSeleccionado}
              onChange={(e) => setTutorSeleccionado(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            >
              <option value="">Sin tutor asignado</option>
              {educadores.map((educador) => (
                <option key={educador.id} value={educador.id}>
                  {educador.nombre}
                </option>
              ))}
            </select>
            <button
              onClick={handleAsignarTutor}
              disabled={asignandoTutor}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {asignandoTutor ? "Guardando..." : "Guardar tutor"}
            </button>
          </div>
        )}

        {/* Selector de estado — solo visible en modo edición con permisos */}
        {editando && puedeEditar && (
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

        {/* AVISO PARA ATE — acceso básico */}
        {session.user.rol === "ATE" && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm rounded-lg px-4 py-3 mb-4">
            Tienes acceso básico a esta ficha. Solo puedes ver datos generales y registrar incidencias.
          </div>
        )}

        {/* SECCIONES DE LA FICHA
            Las secciones sensibles solo se muestran si tiene acceso completo */}
        <div className="space-y-4">
          <Seccion titulo="Datos personales">
            <Campo label="Nombre" valor={menor.nombre} campo="nombre" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Apellidos" valor={menor.apellidos} campo="apellidos" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Fecha de nacimiento" valor={menor.fechaNacimiento} campo="fechaNacimiento" tipo="date" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="DNI" valor={menor.dni} campo="dni" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Nacionalidad" valor={menor.nacionalidad} campo="nacionalidad" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Domicilio" valor={menor.domicilio} campo="domicilio" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Teléfono" valor={menor.telefono} campo="telefono" editando={editando && puedeEditar} onChange={actualizarCampo} />
          </Seccion>

          <Seccion titulo="Medida judicial">
            <Campo label="Nº de expediente" valor={menor.expediente} campo="expediente" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Tipo de medida" valor={menor.tipoMedida} campo="tipoMedida" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Fecha de inicio" valor={menor.fechaInicio} campo="fechaInicio" tipo="date" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Fecha de fin" valor={menor.fechaFin} campo="fechaFin" tipo="date" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Juzgado" valor={menor.juzgado} campo="juzgado" editando={editando && puedeEditar} onChange={actualizarCampo} />
          </Seccion>

          <Seccion titulo="Familia">
            <Campo label="Nombre del tutor/a" valor={menor.tutorNombre} campo="tutorNombre" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Teléfono del tutor/a" valor={menor.tutorTelefono} campo="tutorTelefono" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Relación con el menor" valor={menor.tutorRelacion} campo="tutorRelacion" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Situación familiar" valor={menor.situacionFamiliar} campo="situacionFamiliar" editando={editando && puedeEditar} onChange={actualizarCampo} />
          </Seccion>

          <Seccion titulo="Educación">
            <Campo label="Centro educativo" valor={menor.centroEducativo} campo="centroEducativo" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Curso / nivel" valor={menor.cursoNivel} campo="cursoNivel" editando={editando && puedeEditar} onChange={actualizarCampo} />
            <Campo label="Situación escolar" valor={menor.situacionEscolar} campo="situacionEscolar" editando={editando && puedeEditar} onChange={actualizarCampo} />
          </Seccion>

          {/* Secciones sensibles — solo visibles con acceso completo */}
          {accesoCompleto && (
            <>
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
            </>
          )}

          {/* SECCIÓN DE INFORMES
              Los botones de informes solo aparecen si tiene acceso completo.
              El botón de incidencias aparece para todos los roles. */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-800">
              <h3 className="text-white font-semibold">Informes e incidencias</h3>
              {!editando && (
                <div className="flex gap-2 flex-wrap">
                  {/* Botones de informes — solo con acceso completo */}
                  {accesoCompleto && (
                    <>
                      <Link href={`/menores/${id}/informes/inicial`} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                        + Inicial
                      </Link>
                      <Link href={`/menores/${id}/informes/seguimiento`} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                        + Seguimiento
                      </Link>
                      <Link href={`/menores/${id}/informes/extraordinario`} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                        + Extraordinario
                      </Link>
                      <Link href={`/menores/${id}/informes/final`} className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                        + Final
                      </Link>
                    </>
                  )}
                  {/* Botón de incidencias — visible para todos los roles */}
                  {puedeIncidencias && (
                    <Link href={`/menores/${id}/incidencias`} className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                      + Incidencia
                    </Link>
                  )}
                </div>
              )}
            </div>

            {informes.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay informes registrados todavía.</p>
            ) : (
              <div className="space-y-2">
                {informes.map((informe) => (
                  <div key={informe.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {informe.tipo === "Seguimiento" && informe.periodo
                          ? `Seguimiento — ${informe.periodo}`
                          : informe.tipo === "Extraordinario" && informe.tipoExtraordinario
                          ? `Extraordinario — ${etiquetasExtraordinario[informe.tipoExtraordinario] ?? informe.tipoExtraordinario}`
                          : informe.tipo === "Inicial"
                          ? "Informe inicial"
                          : "Informe final"}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(informe.fecha).toLocaleDateString("es-ES")} · {informe.usuario.nombre}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${estiloTipoInforme[informe.tipo]}`}>
                      {informe.tipo}
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