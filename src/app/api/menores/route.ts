// route.ts — API de menores: listar (GET) y crear (POST)
//
// Esta ruta vive en /api/menores y gestiona las operaciones sobre
// la colección completa de menores.
// Las operaciones sobre un menor concreto van en /api/menores/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/menores — Devuelve el listado de todos los menores
export async function GET() {
  // Verificamos sesión activa antes de devolver datos sensibles
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Solo traemos los campos necesarios para el listado
  // no la ficha completa, que sería innecesariamente pesado
  const menores = await prisma.menor.findMany({
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      expediente: true,
      tipoMedida: true,
      estadoMedida: true,
      fechaInicio: true,
    },
    orderBy: { creadoEn: "desc" },
  });

  return NextResponse.json(menores);
}

// POST /api/menores — Crea un nuevo menor en la base de datos
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const datos = await request.json();

    // Prisma valida automáticamente los tipos según el schema
    const nuevoMenor = await prisma.menor.create({
      data: {
        // Datos personales
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        fechaNacimiento: new Date(datos.fechaNacimiento),
        dni: datos.dni || null,
        nacionalidad: datos.nacionalidad || null,
        domicilio: datos.domicilio || null,
        telefono: datos.telefono || null,

        // Medida judicial
        expediente: datos.expediente,
        tipoMedida: datos.tipoMedida,
        estadoMedida: datos.estadoMedida || "ACTIVA",
        fechaInicio: new Date(datos.fechaInicio),
        fechaFin: datos.fechaFin ? new Date(datos.fechaFin) : null,
        juzgado: datos.juzgado || null,

        // Familia
        tutorNombre: datos.tutorNombre || null,
        tutorTelefono: datos.tutorTelefono || null,
        tutorRelacion: datos.tutorRelacion || null,
        situacionFamiliar: datos.situacionFamiliar || null,

        // Educación
        centroEducativo: datos.centroEducativo || null,
        cursoNivel: datos.cursoNivel || null,
        situacionEscolar: datos.situacionEscolar || null,

        // Salud
        medicoAsignado: datos.medicoAsignado || null,
        centroSalud: datos.centroSalud || null,
        observacionesSalud: datos.observacionesSalud || null,

        // Salud mental
        psicologoAsignado: datos.psicologoAsignado || null,
        diagnostico: datos.diagnostico || null,
        medicacion: datos.medicacion || null,

        // Servicios sociales
        trabajadorSocial: datos.trabajadorSocial || null,
        serviciosSociales: datos.serviciosSociales || null,

        // Perfil psicológico y objetivos
        perfilPsicologico: datos.perfilPsicologico || null,
        objetivos_generales: datos.objetivos_generales || null,
        objetivos_especificos: datos.objetivos_especificos || null,
      },
    });

    // 201 = Created — código HTTP correcto para una creación exitosa
    return NextResponse.json(nuevoMenor, { status: 201 });
  } catch (error) {
    // Error P2002 de Prisma: violación de restricción @unique
    // (expediente o DNI duplicado)
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

    console.error("Error al crear menor:", error);
    return NextResponse.json(
      { error: "Error al crear el menor" },
      { status: 500 },
    );
  }
}
