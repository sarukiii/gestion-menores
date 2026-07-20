// route.ts — API del Informe Final
//
// El informe final se redacta cuando el menor finaliza la medida judicial
// y abandona el centro. Recoge el balance completo de la intervención,
// la situación en todas las áreas al cierre y las derivaciones a recursos
// externos para garantizar la continuidad de la intervención.
//
// PATRÓN REST aplicado:
// GET  /api/informes/final?menorId=xxx → lista los informes de un menor
// POST /api/informes/final             → crea un nuevo informe final

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/informes/final?menorId=xxx
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

  const informes = await prisma.informeFinal.findMany({
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

// POST /api/informes/final
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const datos = await request.json();

    // El menorId es el único campo verdaderamente obligatorio —
    // el resto puede completarse progresivamente antes de cerrar el expediente
    if (!datos.menorId) {
      return NextResponse.json(
        { error: "El menor es obligatorio" },
        { status: 400 },
      );
    }

    const nuevoInforme = await prisma.informeFinal.create({
      data: {
        // Relación con el menor
        menorId: datos.menorId,
        // Autoría — siempre desde la sesión
        usuarioId: session.user.id,

        // RESUMEN DE LA INTERVENCIÓN
        resumenIntervencion: datos.resumenIntervencion || null,
        duracionMedida: datos.duracionMedida || null,

        // BALANCE DE OBJETIVOS AL CIERRE
        objetivosAlcanzados: datos.objetivosAlcanzados || null,
        objetivosNoCumplidos: datos.objetivosNoCumplidos || null,

        // SITUACIÓN EN TODAS LAS ÁREAS AL CIERRE
        situacionFamiliarCierre: datos.situacionFamiliarCierre || null,
        situacionEducativaCierre: datos.situacionEducativaCierre || null,
        situacionSaludCierre: datos.situacionSaludCierre || null,
        redApoyoCierre: datos.redApoyoCierre || null,

        // SITUACIÓN DE CONSUMO AL CIERRE
        situacionConsumoCierre: datos.situacionConsumoCierre || null,
        enTratamientoAlCierre: datos.enTratamientoAlCierre ?? false,
        recursoAdiccionesCierre: datos.recursoAdiccionesCierre || null,
        observacionesConsumoCierre: datos.observacionesConsumoCierre || null,

        // PRONÓSTICO Y DERIVACIONES
        // Las derivaciones son los recursos externos a los que se remite
        // al menor al salir del centro para garantizar la continuidad
        pronostico: datos.pronostico || null,
        recomendaciones: datos.recomendaciones || null,
        derivaciones: datos.derivaciones || null,
      },
    });

    return NextResponse.json(nuevoInforme, { status: 201 });
  } catch (error) {
    console.error("Error al crear informe final:", error);
    return NextResponse.json(
      { error: "Error al crear el informe final" },
      { status: 500 },
    );
  }
}
