// route.ts — API del Informe Extraordinario
//
// El informe extraordinario se genera ante situaciones relevantes que
// pueden afectar a la medida judicial: cambios en salud mental, cambios
// familiares graves, embarazo, nuevo delito, crisis de adicción, etc.
// A diferencia de los informes periódicos, este se crea cuando ocurre
// el hecho, no en una fecha programada.
//
// PATRÓN REST aplicado:
// GET  /api/informes/extraordinario?menorId=xxx → lista los informes de un menor
// POST /api/informes/extraordinario             → crea un nuevo informe extraordinario

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/informes/extraordinario?menorId=xxx
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const menorId = request.nextUrl.searchParams.get("menorId");
  if (!menorId) {
    return NextResponse.json(
      { error: "Se requiere el parámetro menorId" },
      { status: 400 },
    );
  }

  const informes = await prisma.informeExtraordinario.findMany({
    where: { menorId },
    orderBy: { fecha: "desc" },
    include: {
      usuario: {
        select: { nombre: true, rol: true },
      },
    },
  });

  return NextResponse.json(informes);
}

// POST /api/informes/extraordinario
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const datos = await request.json();

    // Validación — menorId, tipo y descripción son obligatorios
    // El tipo determina la categoría del hecho extraordinario
    if (!datos.menorId || !datos.tipo || !datos.descripcionHecho) {
      return NextResponse.json(
        {
          error:
            "El menor, el tipo y la descripción del hecho son obligatorios",
        },
        { status: 400 },
      );
    }

    // Validamos que el tipo sea uno de los valores del enum TipoExtraordinario
    // definido en el schema de Prisma — evitamos valores arbitrarios en la BD
    const tiposValidos = [
      "SALUD_MENTAL",
      "CAMBIO_FAMILIAR",
      "EMBARAZO",
      "NUEVO_DELITO",
      "ADICCION",
      "OTRO",
    ];
    if (!tiposValidos.includes(datos.tipo)) {
      return NextResponse.json(
        { error: "Tipo de informe extraordinario no válido" },
        { status: 400 },
      );
    }

    const nuevoInforme = await prisma.informeExtraordinario.create({
      data: {
        // Relación con el menor
        menorId: datos.menorId,
        // Autoría — siempre desde la sesión, nunca desde el body
        usuarioId: session.user.id,

        // Tipo de situación extraordinaria (enum de Prisma)
        tipo: datos.tipo,

        // Descripción del hecho que motiva el informe
        descripcionHecho: datos.descripcionHecho,

        // Impacto y medidas adoptadas
        impactoEnMedida: datos.impactoEnMedida || null,
        medidasAdoptadas: datos.medidasAdoptadas || null,

        // A quién se ha comunicado: juzgado, familia, servicios sociales...
        comunicadoA: datos.comunicadoA || null,

        // Si el hecho requiere modificación formal de la medida judicial
        // ?? false porque || false también convertiría 0 a false
        requiereModificacion: datos.requiereModificacion ?? false,
      },
    });

    return NextResponse.json(nuevoInforme, { status: 201 });
  } catch (error) {
    console.error("Error al crear informe extraordinario:", error);
    return NextResponse.json(
      { error: "Error al crear el informe extraordinario" },
      { status: 500 },
    );
  }
}
