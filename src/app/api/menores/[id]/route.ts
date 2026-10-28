// route.ts — API de menores: listar (GET) y crear (POST)
//
// Esta ruta vive en /api/menores y gestiona las operaciones sobre
// la colección completa de menores.
// Las operaciones sobre un menor concreto van en /api/menores/[id]/route.ts
//
// El listado indica, para cada menor, si el usuario que lo consulta es su
// tutor educativo (`esMiTutorado`), para que la pantalla pueda mostrar la
// insignia "Tu tutoría" sin abrir cada ficha. El dato se calcula AQUÍ, en el
// servidor: la pantalla recibe un simple verdadero/falso y no necesita
// conocer el id del tutor de cada menor.
//
// El POST (dar de alta un menor) está restringido a DIRECCION y COORDINACION.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeCrearMenores } from "@/lib/permisos";

// GET /api/menores — Devuelve el listado de todos los menores
export async function GET() {
  // Verificamos sesión activa antes de devolver datos sensibles
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Solo traemos los campos necesarios para el listado
  // no la ficha completa, que sería innecesariamente pesado.
  // Pedimos también tutorEducativoId, solo para poder calcular
  // esMiTutorado. No lo enviaremos tal cual a la pantalla.
  const menores = await prisma.menor.findMany({
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      expediente: true,
      tipoMedida: true,
      estadoMedida: true,
      fechaInicio: true,
      tutorEducativoId: true,
    },
    orderBy: { creadoEn: "desc" },
  });

  // Convertimos cada menor: quitamos tutorEducativoId (el id de otra persona
  // no hace falta en el listado) y añadimos esMiTutorado.
  // `...resto` son todos los demás campos, tal cual.
  const respuesta = menores.map(({ tutorEducativoId, ...resto }) => ({
    ...resto,
    esMiTutorado: tutorEducativoId === session.user.id,
  }));

  return NextResponse.json(respuesta);
}

// POST /api/menores — Crea un nuevo menor en la base de datos
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Solo dirección y coordinación pueden dar de alta menores.
  // Esta comprobación es la que de verdad protege: aunque alguien llame a la
  // API directamente sin pasar por la pantalla, recibe un 403.
  if (!puedeCrearMenores(session.user.rol)) {
    return NextResponse.json(
      { error: "No tienes permiso para dar de alta menores" },
      { status: 403 },
    );
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
