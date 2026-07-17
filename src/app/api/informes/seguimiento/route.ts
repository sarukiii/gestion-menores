// route.ts — API del Informe de Seguimiento Trimestral
//
// El informe de seguimiento se genera cada 3 meses durante el cumplimiento
// de la medida judicial. Recoge la evolución del menor en todas las áreas
// de intervención y revisa los objetivos planteados al inicio.
//
// PATRÓN REST aplicado:
// GET  /api/informes/seguimiento?menorId=xxx → lista los informes de un menor
// POST /api/informes/seguimiento             → crea un nuevo informe de seguimiento

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/informes/seguimiento?menorId=xxx
// Devuelve todos los informes de seguimiento de un menor concreto,
// ordenados del más reciente al más antiguo para ver la evolución.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  // Verificamos autenticación antes de devolver datos sensibles
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Leemos el parámetro menorId de la URL
  // Ejemplo: /api/informes/seguimiento?menorId=abc123
  const menorId = request.nextUrl.searchParams.get("menorId");

  // Sin menorId la consulta no tiene sentido y sería un riesgo de privacidad
  if (!menorId) {
    return NextResponse.json(
      { error: "Se requiere el parámetro menorId" },
      { status: 400 },
    );
  }

  const informes = await prisma.informeSeguimiento.findMany({
    where: { menorId },
    // Más recientes primero para ver la evolución cronológica fácilmente
    orderBy: { fecha: "desc" },
    // JOIN con Usuario para mostrar quién redactó cada informe
    // Solo traemos nombre y rol — nunca el hash de la contraseña
    include: {
      usuario: {
        select: { nombre: true, rol: true },
      },
    },
  });

  return NextResponse.json(informes);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/informes/seguimiento
// Crea un nuevo informe de seguimiento trimestral para un menor.
//
// El usuarioId se toma siempre de la sesión activa, nunca del body,
// para garantizar que el informe queda firmado por quien realmente lo redactó.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const datos = await request.json();

    // Validación en el servidor — aunque el formulario ya valida en el cliente,
    // siempre validamos también aquí porque cualquiera puede hacer peticiones
    // directas a la API sin pasar por el formulario
    if (!datos.menorId || !datos.periodo) {
      return NextResponse.json(
        { error: "El menor y el periodo son obligatorios" },
        { status: 400 },
      );
    }

    const nuevoInforme = await prisma.informeSeguimiento.create({
      data: {
        // Relación con el menor — clave foránea definida en el schema
        menorId: datos.menorId,

        // Autoría del informe — siempre desde la sesión, nunca desde el body
        usuarioId: session.user.id,

        // PERIODO DEL SEGUIMIENTO
        // Ejemplo: "1er trimestre 2025", "2º trimestre 2025"
        periodo: datos.periodo,

        // EVOLUCIÓN POR ÁREAS DE INTERVENCIÓN
        // Cada área recoge la evolución durante el trimestre
        evolucionEducativa: datos.evolucionEducativa || null,
        evolucionFamiliar: datos.evolucionFamiliar || null,
        evolucionSalud: datos.evolucionSalud || null,
        evolucionSaludMental: datos.evolucionSaludMental || null,
        evolucionServiciosSociales: datos.evolucionServiciosSociales || null,
        evolucionConducta: datos.evolucionConducta || null,

        // EVOLUCIÓN EN CONSUMO DE SUSTANCIAS
        evolucionConsumo: datos.evolucionConsumo || null,
        sustanciasActuales: datos.sustanciasActuales || null,
        // ?? false porque || false convertiría 0 a false (bug sutil con booleanos)
        enTratamientoAdicciones: datos.enTratamientoAdicciones ?? false,
        recursoAdicciones: datos.recursoAdicciones || null,
        observacionesConsumo: datos.observacionesConsumo || null,

        // REVISIÓN DE OBJETIVOS DEL TRIMESTRE
        objetivosConseguidos: datos.objetivosConseguidos || null,
        objetivosPendientes: datos.objetivosPendientes || null,
        objetivosNuevos: datos.objetivosNuevos || null,

        // VALORACIÓN GLOBAL — habitualmente la rellena coordinación
        valoracionGeneral: datos.valoracionGeneral || null,
        propuestaContinuacion: datos.propuestaContinuacion || null,
      },
    });

    // 201 Created — código HTTP correcto para recursos recién creados
    return NextResponse.json(nuevoInforme, { status: 201 });
  } catch (error) {
    console.error("Error al crear informe de seguimiento:", error);
    return NextResponse.json(
      { error: "Error al crear el informe de seguimiento" },
      { status: 500 },
    );
  }
}
