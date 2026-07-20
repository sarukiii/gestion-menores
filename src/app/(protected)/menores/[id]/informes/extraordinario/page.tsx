"use client";

// page.tsx — Formulario del Informe Extraordinario
// (ruta "/menores/[id]/informes/extraordinario")
//
// Se genera ante situaciones relevantes que pueden afectar a la medida
// judicial: cambios en salud mental, cambios familiares graves, embarazo,
// nuevo delito durante el cumplimiento, crisis de adicción, etc.
// A diferencia de los informes periódicos, este se crea cuando ocurre
// el hecho, no en una fecha programada.

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

// Tipos válidos de informe extraordinario
// Coinciden exactamente con el enum TipoExtraordinario definido en schema.prisma
// Si se añade un nuevo tipo al enum, hay que añadirlo también aquí
const TIPOS_EXTRAORDINARIO = [
  { valor: "SALUD_MENTAL", etiqueta: "Salud mental" },
  { valor: "CAMBIO_FAMILIAR", etiqueta: "Cambio familiar" },
  { valor: "EMBARAZO", etiqueta: "Embarazo" },
  { valor: "NUEVO_DELITO", etiqueta: "Nuevo delito" },
  { valor: "ADICCION", etiqueta: "Adicción / consumo" },
  { valor: "OTRO", etiqueta: "Otro" },
];

type FormularioExtraordinario = {
  // Tipo de situación extraordinaria — determina la categoría del hecho
  tipo: string;

  // Descripción detallada del hecho que motiva el informe
  descripcionHecho: string;

  // Consecuencias y actuaciones
  impactoEnMedida: string;
  medidasAdoptadas: string;

  // Comunicaciones realizadas (juzgado, familia, servicios sociales...)
  comunicadoA: string;

  // Si el hecho requiere modificación formal de la medida judicial
  requiereModificacion: boolean;
};

const estadoInicial: FormularioExtraordinario = {
  tipo: "",
  descripcionHecho: "",
  impactoEnMedida: "",
  medidasAdoptadas: "",
  comunicadoA: "",
  requiereModificacion: false,
};

// COMPONENTE CampoTexto — para campos de texto largo (textarea)
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

export default function InformeExtraordinarioPage() {
  const router = useRouter();
  const params = useParams();
  const menorId = params.id as string;

  const [form, setForm] = useState<FormularioExtraordinario>(estadoInicial);
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
    campo: keyof FormularioExtraordinario,
    valor: string | boolean
  ) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const handleGuardar = async () => {
    setError("");

    if (!form.tipo || !form.descripcionHecho) {
      setError("El tipo de informe y la descripción del hecho son obligatorios");
      return;
    }

    setGuardando(true);

    const respuesta = await fetch("/api/informes/extraordinario", {
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
          <h1 className="text-white text-2xl font-bold">
            Informe Extraordinario
          </h1>
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
          {/* SECCIÓN 1: Tipo de hecho extraordinario */}
          <Seccion titulo="Tipo de incidencia">
            <div>
              <label className="text-gray-300 text-sm block mb-1">
                Tipo de informe extraordinario{" "}
                <span className="text-red-400">*</span>
              </label>
              {/* Select con los tipos del enum de Prisma
                  Centralizado en TIPOS_EXTRAORDINARIO para fácil mantenimiento */}
              <select
                value={form.tipo}
                onChange={(e) => actualizarCampo("tipo", e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona el tipo...</option>
                {TIPOS_EXTRAORDINARIO.map((tipo) => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </Seccion>

          {/* SECCIÓN 2: Descripción del hecho */}
          <Seccion titulo="Descripción del hecho">
            <CampoTexto
              label="Descripción detallada del hecho"
              valor={form.descripcionHecho}
              onChange={(v) => actualizarCampo("descripcionHecho", v)}
              obligatorio
              placeholder="Describe con detalle el hecho que motiva este informe extraordinario..."
            />
            <CampoTexto
              label="Impacto en la medida judicial"
              valor={form.impactoEnMedida}
              onChange={(v) => actualizarCampo("impactoEnMedida", v)}
              placeholder="¿Cómo afecta este hecho al cumplimiento de la medida judicial?"
            />
          </Seccion>

          {/* SECCIÓN 3: Actuaciones y comunicaciones */}
          <Seccion titulo="Actuaciones y comunicaciones">
            <CampoTexto
              label="Medidas adoptadas"
              valor={form.medidasAdoptadas}
              onChange={(v) => actualizarCampo("medidasAdoptadas", v)}
              placeholder="Actuaciones realizadas por el equipo ante este hecho..."
            />
            <CampoTexto
              label="Comunicado a"
              valor={form.comunicadoA}
              onChange={(v) => actualizarCampo("comunicadoA", v)}
              placeholder="Juzgado, familia, servicios sociales, dirección del centro..."
            />
            {/* Campo booleano crítico — indica si el hecho requiere
                modificación formal de la medida por el juzgado */}
            <CampoBoolean
              label="¿Requiere modificación de la medida judicial?"
              valor={form.requiereModificacion}
              onChange={(v) => actualizarCampo("requiereModificacion", v)}
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