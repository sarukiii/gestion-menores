// route.ts — API de menores: crear (POST) y listar (GET)
//
// Esta ruta vive en /api/menores y gestiona las operaciones más básicas
// del CRUD: GET para listar todos los menores, POST para crear uno nuevo.
// Las operaciones sobre un menor concreto (ver uno, editar, borrar) irán
// en /api/menores/[id]/route.ts — patrón estándar de REST en Next.js.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/menores — Devuelve el listado de todos los menores
export async function GET() {
  // Comprobamos que hay una sesión activa antes de devolver datos sensibles
  // Esto es una capa extra de seguridad además del middleware
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Traemos solo los campos necesarios para el listado — no toda la ficha
  // completa, que sería innecesariamente pesado para una tabla de resumen
  const menores = await prisma.menor.findMany({
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      expediente: true,
      estadoMedida: true,
      fechaInicio: true,
    },
    // Ordenamos por fecha de creación, los más recientes primero
    orderBy: { creadoEn: "desc" },
  });

  return NextResponse.json(menores);
}

// POST /api/menores — Crea un nuevo menor en la base de datos -- POST es la operación que se llama cuando el formulario de creación se envía
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Leemos el cuerpo de la petición — el JSON que envía el formulario
    const datos = await request.json();

    // Creamos el registro en PostgreSQL a través de Prisma
    // Prisma valida automáticamente los tipos según el schema:
    // si falta un campo obligatorio o el tipo no coincide, lanza un error
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
    return NextResponse.json(nuevoMenor, { status: 201 }); // 201 = Created
  } catch (error) {
    // Prisma lanza un error específico (P2002) cuando se viola una
    // restricción @unique — por ejemplo, un expediente o DNI duplicado
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002" // P2002 = Unique constraint failed
    ) {
      return NextResponse.json(
        { error: "Ya existe un menor con ese expediente o DNI" },
        { status: 409 }, // 409 = Conflict
      );
    }

    console.error("Error al crear menor:", error);
    return NextResponse.json(
      { error: "Error al crear el menor" },
      { status: 500 }, // 500 = Internal Server Error
    );
  }
}
