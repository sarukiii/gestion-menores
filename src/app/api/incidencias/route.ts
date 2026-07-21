// route.ts — API de incidencias
// (ruta /api/incidencias)
//
// Las incidencias son notificaciones al juzgado de hechos puntuales
// que ocurren durante el cumplimiento de la medida judicial.
// A diferencia de los informes extraordinarios (que solicitan cambio
// de medida), las incidencias son registros de hechos que el juzgado
// debe conocer pero que no necesariamente implican un cambio de medida.
//
// TODOS los roles autenticados pueden crear incidencias — es la única
// funcionalidad accesible para ATE además de ver la ficha básica.
//
// PATRÓN REST:
// GET  /api/incidencias?menorId=xxx → lista las incidencias de un menor
// POST /api/incidencias             → crea una nueva incidencia

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/incidencias?menorId=xxx
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

  const incidencias = await prisma.incidencia.findMany({
    where: { menorId },
    orderBy: { fecha: "desc" },
    include: {
      // Incluimos el usuario que registró la incidencia para trazabilidad
      usuario: {
        select: { nombre: true, rol: true },
      },
    },
  });

  return NextResponse.json(incidencias);
}

// POST /api/incidencias
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const datos = await request.json();

    // Validación — menorId, descripción y gravedad son obligatorios
    if (!datos.menorId || !datos.descripcion || !datos.gravedad) {
      return NextResponse.json(
        { error: "El menor, la descripción y la gravedad son obligatorios" },
        { status: 400 },
      );
    }

    // Validamos que la gravedad sea uno de los valores permitidos
    const gravedadesValidas = ["leve", "moderada", "grave"];
    if (!gravedadesValidas.includes(datos.gravedad)) {
      return NextResponse.json(
        { error: "La gravedad debe ser: leve, moderada o grave" },
        { status: 400 },
      );
    }

    const nuevaIncidencia = await prisma.incidencia.create({
      data: {
        menorId: datos.menorId,
        // Autoría — siempre desde la sesión para garantizar trazabilidad
        usuarioId: session.user.id,
        descripcion: datos.descripcion,
        gravedad: datos.gravedad,
        // Por defecto no resuelta — se marcará como resuelta posteriormente
        resuelta: false,
      },
    });

    return NextResponse.json(nuevaIncidencia, { status: 201 });
  } catch (error) {
    console.error("Error al crear incidencia:", error);
    return NextResponse.json(
      { error: "Error al crear la incidencia" },
      { status: 500 },
    );
  }
}
