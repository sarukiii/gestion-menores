// route.ts — API para asignar tutor educativo a un menor
// (ruta PUT /api/menores/[id]/tutor)
//
// Endpoint separado del PUT general de la ficha porque:
// 1. La asignación de tutor afecta directamente a los permisos de acceso
//    de los educadores — es una operación crítica que merece su propio endpoint
// 2. Solo COORDINACION y DIRECCION pueden realizarla, a diferencia de la
//    edición general de la ficha que también pueden hacer los tutores
// 3. Separarlo hace el código más claro y fácil de auditar

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeAsignarTutor } from "@/lib/permisos";

// PUT /api/menores/[id]/tutor
// Asigna o desasigna un tutor educativo a un menor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Solo COORDINACION y DIRECCION pueden asignar tutores
  // Usamos la función centralizada de permisos para esta comprobación
  if (!puedeAsignarTutor(session.user.rol)) {
    return NextResponse.json(
      { error: "Solo coordinación y dirección pueden asignar tutores" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const datos = await request.json();

  // tutorEducativoId puede ser null para desasignar el tutor actual
  // Esto permite quitar un tutor sin necesidad de asignar otro
  const { tutorEducativoId } = datos;

  try {
    // Si se proporciona un tutorEducativoId, verificamos que el usuario
    // existe y tiene rol EDUCADOR — no tiene sentido asignar como tutor
    // a alguien que no es educador
    if (tutorEducativoId) {
      const tutor = await prisma.usuario.findUnique({
        where: { id: tutorEducativoId },
      });

      if (!tutor) {
        return NextResponse.json(
          { error: "El usuario seleccionado no existe" },
          { status: 404 },
        );
      }

      if (tutor.rol !== "EDUCADOR") {
        return NextResponse.json(
          {
            error:
              "Solo se puede asignar como tutor a un usuario con rol EDUCADOR",
          },
          { status: 400 },
        );
      }
    }

    // Actualizamos el tutorEducativoId del menor
    const menorActualizado = await prisma.menor.update({
      where: { id },
      data: { tutorEducativoId: tutorEducativoId || null },
      // Incluimos el tutor en la respuesta para actualizar la UI inmediatamente
      include: {
        tutorEducativo: {
          select: { id: true, nombre: true, email: true },
        },
      },
    });

    return NextResponse.json(menorActualizado);
  } catch (error) {
    console.error("Error al asignar tutor:", error);
    return NextResponse.json(
      { error: "Error al asignar el tutor" },
      { status: 500 },
    );
  }
}
