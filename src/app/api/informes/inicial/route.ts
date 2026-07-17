// route.ts — API del Informe Inicial
//
// Gestiona la creación (POST) y listado (GET) de informes iniciales.
// El informe inicial se genera cuando un menor ingresa en el centro
// y recoge su situación en todas las áreas al inicio de la medida judicial.
//
// PATRÓN REST aplicado:
// GET  /api/informes/inicial?menorId=xxx → lista los informes de un menor
// POST /api/informes/inicial             → crea un nuevo informe inicial
//
// Las operaciones sobre un informe concreto (ver, editar) irán en
// /api/informes/inicial/[id]/route.ts — mismo patrón que usamos con menores.

import { NextRequest, NextResponse } from "next/server"; // Next.js abstrae la petición y respuesta HTTP en objetos más fáciles de usar
import { prisma } from "@/lib/prisma"; // Prisma Client para acceder a la base de datos
import { auth } from "@/lib/auth"; // función que obtiene la sesión del usuario desde el servidor

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/informes/inicial?menorId=xxx
// Devuelve todos los informes iniciales de un menor concreto.
//
// Usamos un query parameter (?menorId=) en lugar de un segmento de URL
// (/api/menores/[id]/informes) porque este endpoint podría en el futuro
// admitir más filtros (por fecha, por usuario, etc.) de forma más natural.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  // La función GET maneja las peticiones HTTP GET a este endpoint
  // Verificamos autenticación — nunca devolvemos datos sensibles sin sesión válida
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // nextUrl.searchParams es la forma de leer parámetros de URL en Next.js
  // Por ejemplo: /api/informes/inicial?menorId=abc123 → menorId = "abc123"
  const menorId = request.nextUrl.searchParams.get("menorId"); //sirve para obtener el valor del parámetro menorId de la URL de la petición

  // Si no se proporciona el ID del menor, la consulta no tiene sentido
  // Devolvemos 400 Bad Request en lugar de devolver todos los informes
  // de todos los menores — eso sería un problema de privacidad grave
  if (!menorId) {
    return NextResponse.json(
      { error: "Se requiere el parámetro menorId" },
      { status: 400 },
    );
  }

  const informes = await prisma.informeInicial.findMany({
    //sirve para buscar todos los informes iniciales de un menor concreto en la base de datos usando Prisma
    where: { menorId },
    // Los más recientes primero — útil para ver la evolución cronológica
    orderBy: { fecha: "desc" },
    // "include" hace un JOIN con la tabla Usuario para traer
    // el nombre y rol del profesional que redactó cada informe.
    // Usamos "select" dentro de include para traer solo los campos
    // necesarios — nunca traemos el hash de la contraseña por accidente
    include: {
      usuario: {
        select: { nombre: true, rol: true },
      },
    },
  });

  return NextResponse.json(informes);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/informes/inicial
// Crea un nuevo informe inicial para un menor.
//
// El usuarioId se toma de la sesión activa, no del body de la petición.
// Esto es importante por seguridad: el cliente no puede falsificar quién
// firma el informe — siempre será el usuario autenticado en ese momento.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // request.json() parsea el body de la petición HTTP como JSON
    // Es el equivalente a JSON.parse(body) pero adaptado a Next.js
    const datos = await request.json();

    // Validación mínima en el servidor — aunque el formulario ya valida
    // en el cliente, siempre validamos también en el servidor porque
    // cualquiera puede hacer una petición directa a la API sin pasar por el formulario
    if (!datos.menorId || !datos.motivoIngreso) {
      return NextResponse.json(
        { error: "El menor y el motivo de ingreso son obligatorios" },
        { status: 400 },
      );
    }

    const nuevoInforme = await prisma.informeInicial.create({
      data: {
        // RELACIÓN CON EL MENOR
        // menorId es la clave foránea que conecta este informe con su menor
        // Definida en el schema como: menor Menor @relation(fields: [menorId], references: [id])
        menorId: datos.menorId,

        // AUTORÍA DEL INFORME
        // Tomamos el ID del usuario de la sesión JWT, no del body.
        // Así garantizamos que el informe queda firmado por quien realmente
        // lo redactó, sin posibilidad de suplantación.
        usuarioId: session.user.id,

        // SITUACIÓN AL INGRESO
        // Campos opcionales (|| null) porque en el momento del alta inicial
        // puede que no se tenga toda la información disponible todavía
        motivoIngreso: datos.motivoIngreso,
        situacionFamiliarIngreso: datos.situacionFamiliarIngreso || null,
        situacionEducativaIngreso: datos.situacionEducativaIngreso || null,
        situacionSaludIngreso: datos.situacionSaludIngreso || null,
        situacionSaludMentalIngreso: datos.situacionSaludMentalIngreso || null,
        redSocialApoyo: datos.redSocialApoyo || null,

        // ADICCIONES Y CONSUMO DE TÓXICOS AL INGRESO
        // Usamos ?? false (nullish coalescing) en lugar de || false
        // porque || false también convertiría 0 a false, lo cual sería
        // un bug sutil con valores numéricos. ?? solo actúa si el valor
        // es null o undefined, que es exactamente lo que queremos aquí.
        consumoSustancias: datos.consumoSustancias ?? false,
        sustanciasConsumidas: datos.sustanciasConsumidas || null,
        frecuenciaConsumo: datos.frecuenciaConsumo || null,
        edadInicioConsumo: datos.edadInicioConsumo || null,
        tratamientoPrevio: datos.tratamientoPrevio ?? false,
        observacionesConsumo: datos.observacionesConsumo || null,

        // VALORACIÓN INICIAL DEL EQUIPO EDUCATIVO
        // Estos campos los rellenan los distintos profesionales
        // según su área de intervención
        valoracionEducativa: datos.valoracionEducativa || null,
        riesgosDetectados: datos.riesgosDetectados || null,
        necesidadesDetectadas: datos.necesidadesDetectadas || null,
        objetivosInicio: datos.objetivosInicio || null,
        recursosPlanificados: datos.recursosPlanificados || null,
      },
    });

    // 201 Created — código HTTP semánticamente correcto para recursos nuevos
    // (a diferencia de 200 OK que se usa para operaciones ya existentes)
    return NextResponse.json(nuevoInforme, { status: 201 });
  } catch (error) {
    // Logueamos el error completo en el servidor para debugging
    // pero devolvemos un mensaje genérico al cliente — nunca exponemos
    // detalles internos del servidor en respuestas de error de producción
    console.error("Error al crear informe inicial:", error);
    return NextResponse.json(
      { error: "Error al crear el informe inicial" },
      { status: 500 },
    );
  }
}
