"use client"; 


// page.tsx — Formulario del Informe Inicial (ruta "/menores/[id]/informes/inicial")
//
// El informe inicial se redacta cuando un menor ingresa en el centro.
// Recoge su situación en todas las áreas de intervención al inicio
// de la medida judicial.
//
// Es un Client Component porque el formulario necesita estado local
// (los valores de los campos) y eventos del navegador (onChange, onClick).
// Los datos del menor (nombre, expediente) los cargamos desde la API
// al montar el componente para mostrarlos en la cabecera del informe.

import { useState, useEffect } from "react"; // useState y useEffect son hooks de React para manejar estado y efectos secundarios
import { useRouter, useParams } from "next/navigation"; // useRouter y useParams son hooks de Next.js para navegación y parámetros de ruta
import Link from "next/link"; // Link de Next.js para navegación interna sin recarga de página

// Tipo que describe la estructura del formulario del informe inicial
// Coincide exactamente con los campos del modelo InformeInicial de Prisma
type FormularioInformeInicial = {
  // Situación al ingreso — cada área tiene su campo de texto libre
  // para que el profesional pueda describir con detalle
  motivoIngreso: string;
  situacionFamiliarIngreso: string;
  situacionEducativaIngreso: string;
  situacionSaludIngreso: string;
  situacionSaludMentalIngreso: string;
  redSocialApoyo: string;

  // Adicciones — combinamos boolean (¿consume?) con texto (¿qué consume?)
  consumoSustancias: boolean;
  sustanciasConsumidas: string;
  frecuenciaConsumo: string;
  edadInicioConsumo: string;
  tratamientoPrevio: boolean;
  observacionesConsumo: string;

  // Valoración del equipo al ingreso
  valoracionEducativa: string;
  riesgosDetectados: string;
  necesidadesDetectadas: string;
  objetivosInicio: string;
  recursosPlanificados: string;
};

// Estado inicial del formulario — todos los campos vacíos o en false
const estadoInicial: FormularioInformeInicial = {
  motivoIngreso: "",
  situacionFamiliarIngreso: "",
  situacionEducativaIngreso: "",
  situacionSaludIngreso: "",
  situacionSaludMentalIngreso: "",
  redSocialApoyo: "",
  consumoSustancias: false,
  sustanciasConsumidas: "",
  frecuenciaConsumo: "",
  edadInicioConsumo: "",
  tratamientoPrevio: false,
  observacionesConsumo: "",
  valoracionEducativa: "",
  riesgosDetectados: "",
  necesidadesDetectadas: "",
  objetivosInicio: "",
  recursosPlanificados: "",
};

// COMPONENTE Campo de texto — reutilizable para todos los campos de texto largo
// Usamos textarea en lugar de input porque los informes son textos extensos
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
      {/* textarea en lugar de input para textos largos de informe */}
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

// COMPONENTE CampoBoolean — para campos sí/no como "¿consume sustancias?"
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
      {/* Checkbox nativo del navegador — accesible y semántico */}
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
function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <h3 className="text-white font-semibold mb-4 pb-3 border-b border-gray-800">
        {titulo}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function InformeInicialPage() {
  const router = useRouter();
  const params = useParams();
  // El [id] de la URL es el ID del menor al que pertenece el informe
  const menorId = params.id as string;

  const [form, setForm] = useState<FormularioInformeInicial>(estadoInicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Datos básicos del menor para mostrar en la cabecera del informe
  // No necesitamos la ficha completa, solo nombre y expediente
  const [nombreMenor, setNombreMenor] = useState("");
  const [expediente, setExpediente] = useState("");

  // Al montar el componente cargamos los datos básicos del menor
  // para contextualizar el informe (mostrar de quién es)
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

  // Función genérica para actualizar cualquier campo de texto del formulario
  // El tipo keyof garantiza que solo se pueden actualizar campos que existen
  const actualizarCampo = (
    campo: keyof FormularioInformeInicial,
    valor: string | boolean
  ) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const handleGuardar = async () => {
    setError("");

    // Validación mínima en el cliente — el servidor también valida,
    // pero esto evita peticiones innecesarias con datos incompletos
    if (!form.motivoIngreso) {
      setError("El motivo de ingreso es obligatorio");
      return;
    }

    setGuardando(true);

    const respuesta = await fetch("/api/informes/inicial", {
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
          <h1 className="text-white text-2xl font-bold">Informe Inicial</h1>
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
          {/* SECCIÓN 1: Situación al ingreso */}
          <Seccion titulo="Situación al ingreso">
            <CampoTexto
              label="Motivo de ingreso"
              valor={form.motivoIngreso}
              onChange={(v) => actualizarCampo("motivoIngreso", v)}
              obligatorio
              placeholder="Describe el motivo por el que el menor ingresa en el centro..."
            />
            <CampoTexto
              label="Situación familiar al ingreso"
              valor={form.situacionFamiliarIngreso}
              onChange={(v) => actualizarCampo("situacionFamiliarIngreso", v)}
              placeholder="Describe la situación familiar del menor al momento del ingreso..."
            />
            <CampoTexto
              label="Situación educativa al ingreso"
              valor={form.situacionEducativaIngreso}
              onChange={(v) => actualizarCampo("situacionEducativaIngreso", v)}
              placeholder="Centro educativo, curso, absentismo, relación con el estudio..."
            />
            <CampoTexto
              label="Situación de salud al ingreso"
              valor={form.situacionSaludIngreso}
              onChange={(v) => actualizarCampo("situacionSaludIngreso", v)}
              placeholder="Estado de salud general, enfermedades, medicación..."
            />
            <CampoTexto
              label="Situación de salud mental al ingreso"
              valor={form.situacionSaludMentalIngreso}
              onChange={(v) => actualizarCampo("situacionSaludMentalIngreso", v)}
              placeholder="Diagnósticos, tratamientos previos, estado emocional..."
            />
            <CampoTexto
              label="Red social de apoyo"
              valor={form.redSocialApoyo}
              onChange={(v) => actualizarCampo("redSocialApoyo", v)}
              placeholder="Personas de referencia, vínculos familiares y sociales..."
            />
          </Seccion>

          {/* SECCIÓN 2: Consumo de sustancias */}
          <Seccion titulo="Consumo de sustancias">
            <CampoBoolean
              label="¿Hay consumo de sustancias?"
              valor={form.consumoSustancias}
              onChange={(v) => actualizarCampo("consumoSustancias", v)}
            />

            {/* Solo mostramos los campos de detalle si hay consumo confirmado
                Esto evita confusión y mantiene el formulario limpio */}
            {form.consumoSustancias && (
              <>
                <CampoTexto
                  label="Sustancias consumidas"
                  valor={form.sustanciasConsumidas}
                  onChange={(v) => actualizarCampo("sustanciasConsumidas", v)}
                  placeholder="Alcohol, cannabis, cocaína, otras..."
                />
                <CampoTexto
                  label="Frecuencia de consumo"
                  valor={form.frecuenciaConsumo}
                  onChange={(v) => actualizarCampo("frecuenciaConsumo", v)}
                  placeholder="Diario, semanal, ocasional..."
                />
                <CampoTexto
                  label="Edad de inicio del consumo"
                  valor={form.edadInicioConsumo}
                  onChange={(v) => actualizarCampo("edadInicioConsumo", v)}
                  placeholder="Edad aproximada de inicio..."
                />
                <CampoBoolean
                  label="¿Ha tenido tratamiento previo por adicciones?"
                  valor={form.tratamientoPrevio}
                  onChange={(v) => actualizarCampo("tratamientoPrevio", v)}
                />
                <CampoTexto
                  label="Observaciones sobre el consumo"
                  valor={form.observacionesConsumo}
                  onChange={(v) => actualizarCampo("observacionesConsumo", v)}
                  placeholder="Observaciones adicionales relevantes..."
                />
              </>
            )}
          </Seccion>

          {/* SECCIÓN 3: Valoración inicial del equipo */}
          <Seccion titulo="Valoración inicial del equipo">
            <CampoTexto
              label="Valoración educativa"
              valor={form.valoracionEducativa}
              onChange={(v) => actualizarCampo("valoracionEducativa", v)}
              placeholder="Valoración inicial desde el área educativa..."
            />
            <CampoTexto
              label="Riesgos detectados"
              valor={form.riesgosDetectados}
              onChange={(v) => actualizarCampo("riesgosDetectados", v)}
              placeholder="Factores de riesgo identificados al ingreso..."
            />
            <CampoTexto
              label="Necesidades detectadas"
              valor={form.necesidadesDetectadas}
              onChange={(v) => actualizarCampo("necesidadesDetectadas", v)}
              placeholder="Necesidades prioritarias identificadas..."
            />
            <CampoTexto
              label="Objetivos al inicio de la intervención"
              valor={form.objetivosInicio}
              onChange={(v) => actualizarCampo("objetivosInicio", v)}
              placeholder="Objetivos planteados para el inicio de la medida..."
            />
            <CampoTexto
              label="Recursos planificados"
              valor={form.recursosPlanificados}
              onChange={(v) => actualizarCampo("recursosPlanificados", v)}
              placeholder="Recursos internos y externos planificados para la intervención..."
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