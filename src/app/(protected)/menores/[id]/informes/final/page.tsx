"use client";

// page.tsx — Formulario del Informe Final
// (ruta "/menores/[id]/informes/final")
//
// El informe final se redacta cuando el menor finaliza la medida judicial
// y abandona el centro. Recoge el balance completo de la intervención,
// la situación en todas las áreas al cierre y las derivaciones a recursos
// externos para garantizar la continuidad de la intervención tras la salida.
//
// Es el documento de cierre del expediente del menor en el centro.

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type FormularioFinal = {
  // Resumen de la intervención completa
  resumenIntervencion: string;
  duracionMedida: string;

  // Balance de objetivos al cierre
  objetivosAlcanzados: string;
  objetivosNoCumplidos: string;

  // Situación en todas las áreas al cierre
  situacionFamiliarCierre: string;
  situacionEducativaCierre: string;
  situacionSaludCierre: string;
  redApoyoCierre: string;

  // Situación de consumo al cierre
  situacionConsumoCierre: string;
  enTratamientoAlCierre: boolean;
  recursoAdiccionesCierre: string;
  observacionesConsumoCierre: string;

  // Pronóstico y derivaciones a recursos externos
  pronostico: string;
  recomendaciones: string;
  derivaciones: string;
};

const estadoInicial: FormularioFinal = {
  resumenIntervencion: "",
  duracionMedida: "",
  objetivosAlcanzados: "",
  objetivosNoCumplidos: "",
  situacionFamiliarCierre: "",
  situacionEducativaCierre: "",
  situacionSaludCierre: "",
  redApoyoCierre: "",
  situacionConsumoCierre: "",
  enTratamientoAlCierre: false,
  recursoAdiccionesCierre: "",
  observacionesConsumoCierre: "",
  pronostico: "",
  recomendaciones: "",
  derivaciones: "",
};

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

export default function InformeFinalPage() {
  const router = useRouter();
  const params = useParams();
  const menorId = params.id as string;

  const [form, setForm] = useState<FormularioFinal>(estadoInicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [nombreMenor, setNombreMenor] = useState("");
  const [expediente, setExpediente] = useState("");

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

  const actualizarCampo = (
    campo: keyof FormularioFinal,
    valor: string | boolean
  ) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const handleGuardar = async () => {
    setError("");
    setGuardando(true);

    const respuesta = await fetch("/api/informes/final", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, menorId }),
    });

    setGuardando(false);

    if (!respuesta.ok) {
      const data = await respuesta.json();
      setError(data.error || "Error al guardar el informe");
      return;
    }

    router.push(`/menores/${menorId}`);
  };

  return (
    <main className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/menores/${menorId}`}
            className="text-gray-400 hover:text-white text-sm mb-2 inline-block transition-colors"
          >
            ← Volver a la ficha
          </Link>
          <h1 className="text-white text-2xl font-bold">Informe Final</h1>
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
          {/* SECCIÓN 1: Resumen de la intervención */}
          <Seccion titulo="Resumen de la intervención">
            <CampoTexto
              label="Resumen de la intervención educativa"
              valor={form.resumenIntervencion}
              onChange={(v) => actualizarCampo("resumenIntervencion", v)}
              placeholder="Describe el proceso de intervención durante toda la medida..."
            />
            <CampoTexto
              label="Duración de la medida"
              valor={form.duracionMedida}
              onChange={(v) => actualizarCampo("duracionMedida", v)}
              placeholder="Ej: 12 meses, desde enero 2024 hasta enero 2025..."
            />
          </Seccion>

          {/* SECCIÓN 2: Balance de objetivos */}
          <Seccion titulo="Balance de objetivos">
            <CampoTexto
              label="Objetivos alcanzados"
              valor={form.objetivosAlcanzados}
              onChange={(v) => actualizarCampo("objetivosAlcanzados", v)}
              placeholder="Objetivos conseguidos durante el cumplimiento de la medida..."
            />
            <CampoTexto
              label="Objetivos no cumplidos"
              valor={form.objetivosNoCumplidos}
              onChange={(v) => actualizarCampo("objetivosNoCumplidos", v)}
              placeholder="Objetivos que no se han podido alcanzar y motivos..."
            />
          </Seccion>

          {/* SECCIÓN 3: Situación al cierre por áreas */}
          <Seccion titulo="Situación al cierre">
            <CampoTexto
              label="Situación familiar al cierre"
              valor={form.situacionFamiliarCierre}
              onChange={(v) => actualizarCampo("situacionFamiliarCierre", v)}
              placeholder="Situación familiar en el momento de la salida..."
            />
            <CampoTexto
              label="Situación educativa al cierre"
              valor={form.situacionEducativaCierre}
              onChange={(v) => actualizarCampo("situacionEducativaCierre", v)}
              placeholder="Situación educativa o formativa en el momento de la salida..."
            />
            <CampoTexto
              label="Situación de salud al cierre"
              valor={form.situacionSaludCierre}
              onChange={(v) => actualizarCampo("situacionSaludCierre", v)}
              placeholder="Estado de salud general en el momento de la salida..."
            />
            <CampoTexto
              label="Red de apoyo al cierre"
              valor={form.redApoyoCierre}
              onChange={(v) => actualizarCampo("redApoyoCierre", v)}
              placeholder="Personas y recursos de apoyo con los que cuenta al salir..."
            />
          </Seccion>

          {/* SECCIÓN 4: Situación de consumo al cierre */}
          <Seccion titulo="Consumo de sustancias al cierre">
            <CampoTexto
              label="Situación de consumo al cierre"
              valor={form.situacionConsumoCierre}
              onChange={(v) => actualizarCampo("situacionConsumoCierre", v)}
              placeholder="Abstinente, reducción de consumo, sin cambios..."
            />
            <CampoBoolean
              label="¿Continúa en tratamiento por adicciones al salir?"
              valor={form.enTratamientoAlCierre}
              onChange={(v) => actualizarCampo("enTratamientoAlCierre", v)}
            />
            {/* Solo mostramos el recurso si continúa en tratamiento */}
            {form.enTratamientoAlCierre && (
              <CampoTexto
                label="Recurso de adicciones al cierre"
                valor={form.recursoAdiccionesCierre}
                onChange={(v) => actualizarCampo("recursoAdiccionesCierre", v)}
                placeholder="Centro o programa de tratamiento al que continuará..."
              />
            )}
            <CampoTexto
              label="Observaciones sobre el consumo al cierre"
              valor={form.observacionesConsumoCierre}
              onChange={(v) =>
                actualizarCampo("observacionesConsumoCierre", v)
              }
              placeholder="Observaciones adicionales relevantes..."
            />
          </Seccion>

          {/* SECCIÓN 5: Pronóstico y derivaciones
              Esta sección es clave para garantizar la continuidad
              de la intervención tras la salida del menor del centro */}
          <Seccion titulo="Pronóstico y derivaciones">
            <CampoTexto
              label="Pronóstico"
              valor={form.pronostico}
              onChange={(v) => actualizarCampo("pronostico", v)}
              placeholder="Valoración del pronóstico del menor tras la finalización de la medida..."
            />
            <CampoTexto
              label="Recomendaciones"
              valor={form.recomendaciones}
              onChange={(v) => actualizarCampo("recomendaciones", v)}
              placeholder="Recomendaciones para la continuidad de la intervención..."
            />
            <CampoTexto
              label="Derivaciones"
              valor={form.derivaciones}
              onChange={(v) => actualizarCampo("derivaciones", v)}
              placeholder="Recursos externos a los que se deriva al menor al salir del centro..."
            />
          </Seccion>
        </div>

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