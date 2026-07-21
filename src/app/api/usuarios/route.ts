// route.ts — API de usuarios
// (ruta GET /api/usuarios)
//
// Devuelve la lista de usuarios del sistema, con filtro opcional por rol.
// Se usa principalmente para obtener la lista de educadores disponibles
// para asignar como tutores a los menores.
//
// Solo COORDINACION y DIRECCION pueden consultar la lista de usuarios
// para evitar que cualquier rol pueda ver quién trabaja en el centro.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { puedeAsignarTutor } from "@/lib/permisos";

// GET /api/usuarios?rol=EDUCADOR
// Devuelve la lista de usuarios, opcionalmente filtrada por rol
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Solo coordinación y dirección pueden ver la lista de usuarios
  if (!puedeAsignarTutor(session.user.rol)) {
    return NextResponse.json(
      { error: "No tienes permisos para ver la lista de usuarios" },
      { status: 403 },
    );
  }

  // Leemos el filtro de rol de la URL
  // Ejemplo: /api/usuarios?rol=EDUCADOR → solo educadores
  const rol = request.nextUrl.searchParams.get("rol");

  const usuarios = await prisma.usuario.findMany({
    where: {
      // Si se proporciona un rol, filtramos por él
      // Si no, devolvemos todos los usuarios activos
      ...(rol
        ? {
            rol: rol as
              | "EDUCADOR"
              | "ATE"
              | "TRABAJADOR_SOCIAL"
              | "PSICOLOGO"
              | "COORDINACION"
              | "DIRECCION",
          }
        : {}),
      // Solo devolvemos usuarios activos — los dados de baja no aparecen
      activo: true,
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
    },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(usuarios);
}
