// route.ts — API de un menor concreto: obtener (GET) y actualizar (PUT)
//
// Esta ruta vive en /api/menores/[id] y gestiona las operaciones
// sobre un menor específico. El [id] es dinámico — Next.js lo extrae
// automáticamente de la URL y lo pasa como parámetro a las funciones.
//
// GET /api/menores/[id] — devuelve la ficha completa de un menor
// PUT /api/menores/[id] — actualiza los datos de un menor

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/menores/[id] — Devuelve la ficha completa de un menor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // En Next.js 15+ los params son una Promise — hay que awaitar
  const { id } = await params;

  const menor = await prisma.menor.findUnique({
    where: { id },
  });

  if (!menor) {
    return NextResponse.json({ error: "Menor no encontrado" }, { status: 404 });
  }

  return NextResponse.json(menor);
}

// PUT /api/menores/[id] — Actualiza los datos de un menor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const datos = await request.json();

  try {
    const menorActualizado = await prisma.menor.update({
      where: { id },
      data: {
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        fechaNacimiento: new Date(datos.fechaNacimiento),
        dni: datos.dni || null,
        nacionalidad: datos.nacionalidad || null,
        domicilio: datos.domicilio || null,
        telefono: datos.telefono || null,
        expediente: datos.expediente,
        tipoMedida: datos.tipoMedida,
        estadoMedida: datos.estadoMedida,
        fechaInicio: new Date(datos.fechaInicio),
        fechaFin: datos.fechaFin ? new Date(datos.fechaFin) : null,
        juzgado: datos.juzgado || null,
        tutorNombre: datos.tutorNombre || null,
        tutorTelefono: datos.tutorTelefono || null,
        tutorRelacion: datos.tutorRelacion || null,
        situacionFamiliar: datos.situacionFamiliar || null,
        centroEducativo: datos.centroEducativo || null,
        cursoNivel: datos.cursoNivel || null,
        situacionEscolar: datos.situacionEscolar || null,
        medicoAsignado: datos.medicoAsignado || null,
        centroSalud: datos.centroSalud || null,
        observacionesSalud: datos.observacionesSalud || null,
        psicologoAsignado: datos.psicologoAsignado || null,
        diagnostico: datos.diagnostico || null,
        medicacion: datos.medicacion || null,
        trabajadorSocial: datos.trabajadorSocial || null,
        serviciosSociales: datos.serviciosSociales || null,
        perfilPsicologico: datos.perfilPsicologico || null,
        objetivos_generales: datos.objetivos_generales || null,
        objetivos_especificos: datos.objetivos_especificos || null,
      },
    });

    return NextResponse.json(menorActualizado);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe un menor con ese expediente o DNI" },
        { status: 409 },
      );
    }

    console.error("Error al actualizar menor:", error);
    return NextResponse.json(
      { error: "Error al actualizar el menor" },
      { status: 500 },
    );
  }
}
