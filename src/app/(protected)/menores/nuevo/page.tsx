// page.tsx — Formulario de alta de un nuevo menor (ruta "/menores/nuevo")
//
// Formulario extenso organizado en secciones colapsables para no abrumar
// al usuario con 30 campos de golpe. Solo los campos imprescindibles
// para el alta (datos personales y medida judicial) son obligatorios;
// el resto se puede completar después editando la ficha.
//
// NOTA TÉCNICA IMPORTANTE: los subcomponentes "Campo" y "Seccion" están
// definidos FUERA del componente principal, a nivel de módulo. Si se
// definen dentro de NuevoMenorPage, React los recrea como una función
// distinta en cada render, lo que provoca que pierdan el foco al escribir
// y lance el error "Cannot create components during render".

"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Tipo TypeScript que describe la forma de los datos del formulario
type FormularioMenor = {
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  dni: string;
  nacionalidad: string;
  domicilio: string;
  telefono: string;
  expediente: string;
  tipoMedida: string;
  fechaInicio: string;
  juzgado: string;
  tutorNombre: string;
  tutorTelefono: string;
  tutorRelacion: string;
  situacionFamiliar: string;
  centroEducativo: string;
  cursoNivel: string;
  situacionEscolar: string;
  medicoAsignado: string;
  centroSalud: string;
  observacionesSalud: string;
  psicologoAsignado: string;
  diagnostico: string;
  medicacion: string;
  trabajadorSocial: string;
  serviciosSociales: string;
  perfilPsicologico: string;
  objetivos_generales: string;
  objetivos_especificos: string;
};

const estadoInicial: FormularioMenor = {
  nombre: "",
  apellidos: "",
  fechaNacimiento: "",
  dni: "",
  nacionalidad: "",
  domicilio: "",
  telefono: "",
  expediente: "",
  tipoMedida: "",
  fechaInicio: "",
  juzgado: "",
  tutorNombre: "",
  tutorTelefono: "",
  tutorRelacion: "",
  situacionFamiliar: "",
  centroEducativo: "",
  cursoNivel: "",
  situacionEscolar: "",
  medicoAsignado: "",
  centroSalud: "",
  observacionesSalud: "",
  psicologoAsignado: "",
  diagnostico: "",
  medicacion: "",
  trabajadorSocial: "",
  serviciosSociales: "",
  perfilPsicologico: "",
  objetivos_generales: "",
  objetivos_especificos: "",
};

// COMPONENTE "Campo" — definido a nivel de módulo, no dentro de la página
// Recibe el valor y la función de cambio como props en lugar de acceder
// directamente al estado del padre, manteniéndolo reutilizable y aislado
function Campo({
  label,
  tipo = "text",
  obligatorio = false,
  valor,
  onChange,
}: {
  label: string;
  tipo?: string;
  obligatorio?: boolean;
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div>
      <label className="text-gray-300 text-sm block mb-1">
        {label} {obligatorio && <span className="text-red-400">*</span>}
      </label>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

// COMPONENTE "Seccion" — también a nivel de módulo
// Recibe si está abierta y la función para alternarla como props
function Seccion({
  titulo,
  abierta,
  onToggle,
  children,
}: {
  titulo: string;
  abierta: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center px-6 py-4 text-left"
      >
        <span className="text-white font-semibold">{titulo}</span>
        <span className="text-gray-400">{abierta ? "−" : "+"}</span>
      </button>
      {abierta && (
        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function NuevoMenorPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormularioMenor>(estadoInicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [seccionAbierta, setSeccionAbierta] = useState<string>("personales");

  // Función genérica para actualizar cualquier campo del formulario
  const actualizarCampo = (campo: keyof FormularioMenor, valor: string) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const handleGuardar = async () => {
    setError("");

    if (
      !form.nombre ||
      !form.apellidos ||
      !form.fechaNacimiento ||
      !form.expediente ||
      !form.tipoMedida ||
      !form.fechaInicio
    ) {
      setError("Completa los campos obligatorios marcados con *");
      return;
    }

    setGuardando(true);

    const respuesta = await fetch("/api/menores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setGuardando(false);

    if (!respuesta.ok) {
      const data = await respuesta.json();
      setError(data.error || "Error al guardar el menor");
      return;
    }

    router.push("/menores");
  };

  // Helper para alternar qué sección está abierta —
  // si se pulsa la que ya está abierta, se cierra
  const toggleSeccion = (id: string) => {
    setSeccionAbierta((actual) => (actual === id ? "" : id));
  };

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-2">Nuevo menor</h1>
        <p className="text-gray-400 mb-6">
          Los campos marcados con * son obligatorios para el alta inicial.
          El resto se puede completar después.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Seccion
            titulo="Datos personales"
            abierta={seccionAbierta === "personales"}
            onToggle={() => toggleSeccion("personales")}
          >
            <Campo label="Nombre" obligatorio valor={form.nombre} onChange={(v) => actualizarCampo("nombre", v)} />
            <Campo label="Apellidos" obligatorio valor={form.apellidos} onChange={(v) => actualizarCampo("apellidos", v)} />
            <Campo label="Fecha de nacimiento" tipo="date" obligatorio valor={form.fechaNacimiento} onChange={(v) => actualizarCampo("fechaNacimiento", v)} />
            <Campo label="DNI" valor={form.dni} onChange={(v) => actualizarCampo("dni", v)} />
            <Campo label="Nacionalidad" valor={form.nacionalidad} onChange={(v) => actualizarCampo("nacionalidad", v)} />
            <Campo label="Domicilio" valor={form.domicilio} onChange={(v) => actualizarCampo("domicilio", v)} />
            <Campo label="Teléfono" valor={form.telefono} onChange={(v) => actualizarCampo("telefono", v)} />
          </Seccion>

          <Seccion
            titulo="Medida judicial"
            abierta={seccionAbierta === "judicial"}
            onToggle={() => toggleSeccion("judicial")}
          >
            <Campo label="Nº de expediente" obligatorio valor={form.expediente} onChange={(v) => actualizarCampo("expediente", v)} />
            <Campo label="Tipo de medida" obligatorio valor={form.tipoMedida} onChange={(v) => actualizarCampo("tipoMedida", v)} />
            <Campo label="Fecha de inicio" tipo="date" obligatorio valor={form.fechaInicio} onChange={(v) => actualizarCampo("fechaInicio", v)} />
            <Campo label="Juzgado" valor={form.juzgado} onChange={(v) => actualizarCampo("juzgado", v)} />
          </Seccion>

          <Seccion
            titulo="Familia"
            abierta={seccionAbierta === "familia"}
            onToggle={() => toggleSeccion("familia")}
          >
            <Campo label="Nombre del tutor/a" valor={form.tutorNombre} onChange={(v) => actualizarCampo("tutorNombre", v)} />
            <Campo label="Teléfono del tutor/a" valor={form.tutorTelefono} onChange={(v) => actualizarCampo("tutorTelefono", v)} />
            <Campo label="Relación con el menor" valor={form.tutorRelacion} onChange={(v) => actualizarCampo("tutorRelacion", v)} />
            <Campo label="Situación familiar" valor={form.situacionFamiliar} onChange={(v) => actualizarCampo("situacionFamiliar", v)} />
          </Seccion>

          <Seccion
            titulo="Educación"
            abierta={seccionAbierta === "educacion"}
            onToggle={() => toggleSeccion("educacion")}
          >
            <Campo label="Centro educativo" valor={form.centroEducativo} onChange={(v) => actualizarCampo("centroEducativo", v)} />
            <Campo label="Curso / nivel" valor={form.cursoNivel} onChange={(v) => actualizarCampo("cursoNivel", v)} />
            <Campo label="Situación escolar" valor={form.situacionEscolar} onChange={(v) => actualizarCampo("situacionEscolar", v)} />
          </Seccion>

          <Seccion
            titulo="Salud"
            abierta={seccionAbierta === "salud"}
            onToggle={() => toggleSeccion("salud")}
          >
            <Campo label="Médico asignado" valor={form.medicoAsignado} onChange={(v) => actualizarCampo("medicoAsignado", v)} />
            <Campo label="Centro de salud" valor={form.centroSalud} onChange={(v) => actualizarCampo("centroSalud", v)} />
            <Campo label="Observaciones de salud" valor={form.observacionesSalud} onChange={(v) => actualizarCampo("observacionesSalud", v)} />
          </Seccion>

          <Seccion
            titulo="Salud mental"
            abierta={seccionAbierta === "saludmental"}
            onToggle={() => toggleSeccion("saludmental")}
          >
            <Campo label="Psicólogo/a asignado" valor={form.psicologoAsignado} onChange={(v) => actualizarCampo("psicologoAsignado", v)} />
            <Campo label="Diagnóstico" valor={form.diagnostico} onChange={(v) => actualizarCampo("diagnostico", v)} />
            <Campo label="Medicación" valor={form.medicacion} onChange={(v) => actualizarCampo("medicacion", v)} />
          </Seccion>

          <Seccion
            titulo="Servicios sociales"
            abierta={seccionAbierta === "social"}
            onToggle={() => toggleSeccion("social")}
          >
            <Campo label="Trabajador/a social" valor={form.trabajadorSocial} onChange={(v) => actualizarCampo("trabajadorSocial", v)} />
            <Campo label="Servicios sociales de referencia" valor={form.serviciosSociales} onChange={(v) => actualizarCampo("serviciosSociales", v)} />
          </Seccion>

          <Seccion
            titulo="Perfil y objetivos"
            abierta={seccionAbierta === "objetivos"}
            onToggle={() => toggleSeccion("objetivos")}
          >
            <Campo label="Perfil psicológico" valor={form.perfilPsicologico} onChange={(v) => actualizarCampo("perfilPsicologico", v)} />
            <Campo label="Objetivos generales" valor={form.objetivos_generales} onChange={(v) => actualizarCampo("objetivos_generales", v)} />
            <Campo label="Objetivos específicos" valor={form.objetivos_especificos} onChange={(v) => actualizarCampo("objetivos_especificos", v)} />
          </Seccion>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => router.push("/dashboard")}
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
            {guardando ? "Guardando..." : "Guardar menor"}
          </button>
        </div>
      </div>
    </main>
  );
}