"use client";

// page.tsx — Formulario de incidencias (ruta "/menores/[id]/incidencias")
//
// Las incidencias son notificaciones al juzgado de hechos puntuales
// que ocurren durante el cumplimiento de la medida judicial.
// Accesible para TODOS los roles autenticados — es la única funcionalidad
// que ATE puede usar además de ver la ficha básica del menor.
//
// Diferencia clave con el informe extraordinario:
// - Incidencia → notificación de un hecho puntual al juzgado
// - Informe extraordinario → solicitud de cambio de medida judicial

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

// Niveles de gravedad de una incidencia
// Determinan la urgencia de la comunicación al juzgado
const GRAVEDADES = [
  {
    valor: "leve",
    etiqueta: "Leve",
    descripcion: "Hecho menor sin impacto significativo en la medida",
    clase: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  },
  {
    valor: "moderada",
    etiqueta: "Moderada",
    descripcion: "Hecho relevante que requiere seguimiento",
    clase: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  },
  {
    valor: "grave",
    etiqueta: "Grave",
    descripcion: "Hecho grave que requiere comunicación urgente al juzgado",
    clase: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
];

type FormularioIncidencia = {
  descripcion: string;
  gravedad: string;
};

const estadoInicial: FormularioIncidencia = {
  descripcion: "",
  gravedad: "",
};

export default function IncidenciaPage() {
  const router = useRouter();
  const params = useParams();
  const menorId = params.id as string;

  const [form, setForm] = useState<FormularioIncidencia>(estadoInicial);
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

  const handleGuardar = async () => {
    setError("");

    if (!form.descripcion || !form.gravedad) {
      setError("La descripción y la gravedad son obligatorias");
      return;
    }

    setGuardando(true);

    const respuesta = await fetch("/api/incidencias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, menorId }),
    });

    setGuardando(false);

    if (!respuesta.ok) {
      const data = await respuesta.json();
      setError(data.error || "Error al guardar la incidencia");
      return;
    }

    router.push(`/menores/${menorId}`);
  };

  return (
    <main className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/menores/${menorId}`}
            className="text-gray-400 hover:text-white text-sm mb-2 inline-block transition-colors"
          >
            ← Volver a la ficha
          </Link>
          <h1 className="text-white text-2xl font-bold">Nueva incidencia</h1>
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
          {/* SELECCIÓN DE GRAVEDAD
              Usamos botones visuales en lugar de un select para hacer
              más evidente la diferencia entre niveles de gravedad */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-white font-semibold mb-4 pb-3 border-b border-gray-800">
              Gravedad de la incidencia <span className="text-red-400">*</span>
            </h3>
            <div className="space-y-3">
              {GRAVEDADES.map((gravedad) => (
                <button
                  key={gravedad.valor}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, gravedad: gravedad.valor }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    form.gravedad === gravedad.valor
                      ? gravedad.clase + " border-current"
                      : "border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <p className="font-semibold text-sm">{gravedad.etiqueta}</p>
                  <p className="text-xs mt-0.5 opacity-75">{gravedad.descripcion}</p>
                </button>
              ))}
            </div>
          </div>

          {/* DESCRIPCIÓN DE LA INCIDENCIA */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-white font-semibold mb-4 pb-3 border-b border-gray-800">
              Descripción <span className="text-red-400">*</span>
            </h3>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="Describe con detalle el hecho ocurrido, cuándo ocurrió, quiénes estaban presentes y qué medidas se adoptaron..."
              rows={6}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
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
            className="px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-semibold transition-colors"
          >
            {guardando ? "Guardando..." : "Registrar incidencia"}
          </button>
        </div>
      </div>
    </main>
  );
}