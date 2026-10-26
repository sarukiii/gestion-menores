// route.ts — API de un menor concreto: obtener (GET) y actualizar (PUT)
//
// Además de las operaciones CRUD, este archivo aplica el control de acceso
// por rol usando las funciones centralizadas de src/lib/permisos.ts.
//
// Un usuario puede VER un menor así:
// - Acceso completo: DIRECCION, COORDINACION, PSICOLOGO, TRABAJADOR_SOCIAL,
//   y el EDUCADOR que es tutor asignado de ese menor
// - Acceso básico: ATE y el EDUCADOR que NO es su tutor (datos generales,
//   sin información sensible; pueden registrar incidencias)
//
// Un usuario puede EDITAR un menor solo con acceso completo.
//
// CAMBIO DE ESTA VERSIÓN:
// Antes, el educador que no era tutor recibía un 403 y la pantalla mostraba
// "No se pudo cargar la ficha". Ahora recibe la versión básica. Lo importante
// de la seguridad no cambia: los datos sensibles (salud, diagnóstico,
// medicación, perfil psicológico...) SOLO salen del servidor para quien
// tiene acceso completo. Esconder campos en la pantalla no basta, porque
// cualquiera puede ver la respuesta en la pestaña Red del navegador.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  puedeVerFichaCompleta,
  puedeVerFichaBasica,
  puedeEditarFicha,
} from "@/lib/permisos";

// GET /api/menores/[id] — Devuelve la ficha de un menor,
// completa o básica según el rol y la asignación del usuario
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  // Primero buscamos el menor para conocer su tutorEducativoId
  // y poder evaluar los permisos correctamente
  const menor = await prisma.menor.findUnique({
    where: { id },
  });

  if (!menor) {
    return NextResponse.json({ error: "Menor no encontrado" }, { status: 404 });
  }

  // Comprobamos si el usuario tiene acceso a la ficha completa
  // usando la lógica centralizada de permisos
  const tieneAccesoCompleto = puedeVerFichaCompleta({
    rolUsuario: session.user.rol,
    usuarioId: session.user.id,
    tutorEducativoId: menor.tutorEducativoId ?? null,
  });

  // 1. Acceso completo → devolvemos toda la ficha
  if (tieneAccesoCompleto) {
    return NextResponse.json(menor);
  }

  // 2. Sin acceso completo: comprobamos que al menos sea un rol válido.
  // Un rol desconocido no recibe nada (403 Forbidden).
  if (!puedeVerFichaBasica(session.user.rol)) {
    return NextResponse.json(
      { error: "No tienes acceso a este menor" },
      { status: 403 },
    );
  }

  // 3. Acceso básico (ATE y educador que no es tutor):
  // devolvemos solo los campos generales — no datos sensibles
  // como salud mental, perfil psicológico o diagnósticos
  return NextResponse.json({
    id: menor.id,
    nombre: menor.nombre,
    apellidos: menor.apellidos,
    expediente: menor.expediente,
    tipoMedida: menor.tipoMedida,
    estadoMedida: menor.estadoMedida,
    fechaInicio: menor.fechaInicio,
    fechaFin: menor.fechaFin,
    tutorNombre: menor.tutorNombre,
    tutorTelefono: menor.tutorTelefono,
    tutorRelacion: menor.tutorRelacion,
    // No incluimos: DNI, domicilio, educación, salud, salud mental,
    // diagnóstico, medicación, perfil psicológico, etc.
    // Tampoco tutorEducativoId: no hace falta para el modo básico.
  });
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

  // Buscamos el menor para evaluar permisos de edición
  const menor = await prisma.menor.findUnique({
    where: { id },
  });

  if (!menor) {
    return NextResponse.json({ error: "Menor no encontrado" }, { status: 404 });
  }

  // Comprobamos si puede editar — con acceso básico (ATE, o educador que
  // no es tutor) se puede ver pero no editar
  const tieneAcceso = puedeEditarFicha({
    rolUsuario: session.user.rol,
    usuarioId: session.user.id,
    tutorEducativoId: menor.tutorEducativoId ?? null,
  });

  if (!tieneAcceso) {
    return NextResponse.json(
      { error: "No tienes permisos para editar este menor" },
      { status: 403 },
    );
  }

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
        // tutorEducativoId solo puede ser modificado por COORDINACION y DIRECCION
        // lo gestionamos en un endpoint separado para mayor claridad
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
