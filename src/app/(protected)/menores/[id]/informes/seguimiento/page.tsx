"use client";

// page.tsx — Formulario del Informe de Seguimiento Trimestral
// (ruta "/menores/[id]/informes/seguimiento")
//
// El informe de seguimiento se redacta cada 3 meses durante el cumplimiento
// de la medida judicial. Recoge la evolución del menor en todas las áreas
// de intervención y revisa los objetivos planteados al inicio o en el
// trimestre anterior.
//
// Es un Client Component porque el formulario necesita estado local
// y eventos del navegador (onChange, onClick).

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

// Tipo que describe la estructura del formulario del informe de seguimiento
// Coincide exactamente con los campos del modelo InformeSeguimiento de Prisma
type FormularioSeguimiento = {
  // Periodo del seguimiento — identifica a qué trimestre corresponde
  periodo: string;

  // Evolución por áreas de intervención durante el trimestre
  evolucionEducativa: string;
  evolucionFamiliar: string;
  evolucionSalud: string;
  evolucionSaludMental: string;
  evolucionServiciosSociales: string;
  evolucionConducta: string;

  // Evolución en consumo de sustancias
  evolucionConsumo: string;
  sustanciasActuales: string;
  enTratamientoAdicciones: boolean;
  recursoAdicciones: string;
  observacionesConsumo: string;

  // Revisión de objetivos del trimestre
  objetivosConseguidos: string;
  objetivosPendientes: string;
  objetivosNuevos: string;

  // Valoración global — habitualmente la rellena coordinación
  valoracionGeneral: string;
  propuestaContinuacion: string;
};

// Estado inicial — todos los campos vacíos o en false
const estadoInicial: FormularioSeguimiento = {
  periodo: "",
  evolucionEducativa: "",
  evolucionFamiliar: "",
  evolucionSalud: "",
  evolucionSaludMental: "",
  evolucionServiciosSociales: "",
  evolucionConducta: "",
  evolucionConsumo: "",
  sustanciasActuales: "",
  enTratamientoAdicciones: false,
  recursoAdicciones: "",
  observacionesConsumo: "",
  objetivosConseguidos: "",
  objetivosPendientes: "",
  objetivosNuevos: "",
  valoracionGeneral: "",
  propuestaContinuacion: "",
};

// COMPONENTE CampoTexto — reutilizable para todos los campos de texto largo
// Usamos textarea porque los informes son textos extensos, no datos cortos
function CampoTexto({
  label,
  valor,
  onChange,
  obligatorio = false,
  placeholder = "",
}: {
  label: string;
  valor: string;
  onChange: (valor: string) => void;
  obligatorio?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-gray-300 text-sm block mb-1">
        {label} {obligatorio && <span className="text-red-400">*</span>}
      </label>
      <textarea
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </div>
  );
}

// COMPONENTE CampoBoolean — para campos sí/no
function CampoBoolean({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: boolean;
  onChange: (valor: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={valor}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-blue-600"
        id={label}
      />
      <label htmlFor={label} className="text-gray-300 text-sm cursor-pointer">
        {label}
      </label>
    </div>
  );
}

// COMPONENTE Seccion — agrupa campos relacionados visualmente
function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <h3 className="text-white font-semibold mb-4 pb-3 border-b border-gray-800">
        {titulo}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function InformeSeguimientoPage() {
  const router = useRouter();
  const params = useParams();
  // El [id] de la URL es el ID del menor al que pertenece el informe
  const menorId = params.id as string;

  const [form, setForm] = useState<FormularioSeguimiento>(estadoInicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Datos básicos del menor para mostrar en la cabecera del informe
  const [nombreMenor, setNombreMenor] = useState("");
  const [expediente, setExpediente] = useState("");

  // Cargamos los datos básicos del menor al montar el componente
  // para contextualizar el informe mostrando de quién es
  useEffect(() => {
    const cargarMenor = async () => {
      const respuesta = await fetch(`/api/menores/${menorId}`);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setNombreMenor(`${datos.nombre} ${datos.apellidos}`);
        setExpediente(datos.expediente);
      }
    };
    cargarMenor();
  }, [menorId]);

  // Función genérica para actualizar cualquier campo del formulario
  const actualizarCampo = (
    campo: keyof FormularioSeguimiento,
    valor: string | boolean
  ) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const handleGuardar = async () => {
    setError("");

    // Validación mínima en el cliente antes de enviar la petición
    if (!form.periodo) {
      setError("El periodo es obligatorio (ej: 1er trimestre 2025)");
      return;
    }

    setGuardando(true);

    const respuesta = await fetch("/api/informes/seguimiento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Añadimos el menorId al body — la API lo necesita para crear la relación
      body: JSON.stringify({ ...form, menorId }),
    });

    setGuardando(false);

    if (!respuesta.ok) {
      const data = await respuesta.json();
      setError(data.error || "Error al guardar el informe");
      return;
    }

    // Al guardar correctamente volvemos a la ficha del menor
    router.push(`/menores/${menorId}`);
  };

  return (
    <main className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Cabecera con navegación de vuelta a la ficha */}
        <div className="mb-6">
          <Link
            href={`/menores/${menorId}`}
            className="text-gray-400 hover:text-white text-sm mb-2 inline-block transition-colors"
          >
            ← Volver a la ficha
          </Link>
          <h1 className="text-white text-2xl font-bold">
            Informe de Seguimiento
          </h1>
          {/* Contextualizamos el informe mostrando de quién es */}
          {nombreMenor && (
            <p className="text-gray-400 text-sm mt-1">
              {nombreMenor} · Expediente {expediente}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* SECCIÓN 1: Identificación del periodo */}
          <Seccion titulo="Periodo del seguimiento">
            <CampoTexto
              label="Periodo"
              valor={form.periodo}
              onChange={(v) => actualizarCampo("periodo", v)}
              obligatorio
              placeholder="Ej: 1er trimestre 2025, 2º trimestre 2025..."
            />
          </Seccion>

          {/* SECCIÓN 2: Evolución por áreas */}
          <Seccion titulo="Evolución por áreas de intervención">
            <CampoTexto
              label="Evolución educativa"
              valor={form.evolucionEducativa}
              onChange={(v) => actualizarCampo("evolucionEducativa", v)}
              placeholder="Evolución en el área educativa durante el trimestre..."
            />
            <CampoTexto
              label="Evolución familiar"
              valor={form.evolucionFamiliar}
              onChange={(v) => actualizarCampo("evolucionFamiliar", v)}
              placeholder="Evolución en la situación familiar durante el trimestre..."
            />
            <CampoTexto
              label="Evolución de salud"
              valor={form.evolucionSalud}
              onChange={(v) => actualizarCampo("evolucionSalud", v)}
              placeholder="Evolución en el área de salud durante el trimestre..."
            />
            <CampoTexto
              label="Evolución de salud mental"
              valor={form.evolucionSaludMental}
              onChange={(v) => actualizarCampo("evolucionSaludMental", v)}
              placeholder="Evolución en salud mental durante el trimestre..."
            />
            <CampoTexto
              label="Evolución en servicios sociales"
              valor={form.evolucionServiciosSociales}
              onChange={(v) =>
                actualizarCampo("evolucionServiciosSociales", v)
              }
              placeholder="Evolución en la intervención de servicios sociales..."
            />
            <CampoTexto
              label="Evolución conductual"
              valor={form.evolucionConducta}
              onChange={(v) => actualizarCampo("evolucionConducta", v)}
              placeholder="Evolución en la conducta y actitud del menor..."
            />
          </Seccion>

          {/* SECCIÓN 3: Consumo de sustancias */}
          <Seccion titulo="Consumo de sustancias">
            <CampoTexto
              label="Evolución del consumo"
              valor={form.evolucionConsumo}
              onChange={(v) => actualizarCampo("evolucionConsumo", v)}
              placeholder="Mejora, estable, empeora... describe la evolución..."
            />
            <CampoTexto
              label="Sustancias consumidas actualmente"
              valor={form.sustanciasActuales}
              onChange={(v) => actualizarCampo("sustanciasActuales", v)}
              placeholder="Sustancias que consume actualmente, si las hay..."
            />
            <CampoBoolean
              label="¿Está actualmente en tratamiento por adicciones?"
              valor={form.enTratamientoAdicciones}
              onChange={(v) => actualizarCampo("enTratamientoAdicciones", v)}
            />
            {/* Solo mostramos el campo de recurso si está en tratamiento */}
            {form.enTratamientoAdicciones && (
              <CampoTexto
                label="Recurso de adicciones"
                valor={form.recursoAdicciones}
                onChange={(v) => actualizarCampo("recursoAdicciones", v)}
                placeholder="Nombre del centro o programa de tratamiento..."
              />
            )}
            <CampoTexto
              label="Observaciones sobre el consumo"
              valor={form.observacionesConsumo}
              onChange={(v) => actualizarCampo("observacionesConsumo", v)}
              placeholder="Observaciones adicionales relevantes..."
            />
          </Seccion>

          {/* SECCIÓN 4: Revisión de objetivos */}
          <Seccion titulo="Revisión de objetivos">
            <CampoTexto
              label="Objetivos conseguidos"
              valor={form.objetivosConseguidos}
              onChange={(v) => actualizarCampo("objetivosConseguidos", v)}
              placeholder="Objetivos alcanzados durante este trimestre..."
            />
            <CampoTexto
              label="Objetivos pendientes"
              valor={form.objetivosPendientes}
              onChange={(v) => actualizarCampo("objetivosPendientes", v)}
              placeholder="Objetivos que continúan pendientes de consecución..."
            />
            <CampoTexto
              label="Nuevos objetivos"
              valor={form.objetivosNuevos}
              onChange={(v) => actualizarCampo("objetivosNuevos", v)}
              placeholder="Nuevos objetivos planteados para el próximo trimestre..."
            />
          </Seccion>

          {/* SECCIÓN 5: Valoración global — habitualmente rellena coordinación */}
          <Seccion titulo="Valoración global">
            <CampoTexto
              label="Valoración general del trimestre"
              valor={form.valoracionGeneral}
              onChange={(v) => actualizarCampo("valoracionGeneral", v)}
              placeholder="Valoración global de la evolución del menor durante el trimestre..."
            />
            <CampoTexto
              label="Propuesta de continuación"
              valor={form.propuestaContinuacion}
              onChange={(v) => actualizarCampo("propuestaContinuacion", v)}
              placeholder="Propuesta para el próximo trimestre: continuación, modificación, finalización..."
            />
          </Seccion>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => router.push(`/menores/${menorId}`)}
            type="button"
            className="px-5 py-2.5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold transition-colors"
          >
            {guardando ? "Guardando..." : "Guardar informe"}
          </button>
        </div>
      </div>
    </main>
  );
}