// permisos.ts — Lógica centralizada de control de acceso por rol
//
// En lugar de dispersar comprobaciones de rol por toda la app,
// centralizamos aquí todas las reglas. Si las reglas cambian,
// solo hay que modificar este archivo.
//
// REGLAS DE ACCESO DEFINIDAS CON EL EQUIPO:
//
// DIRECCION      → acceso completo a todo
// COORDINACION   → acceso completo a todo
// PSICOLOGO      → acceso completo a todo
// TRABAJADOR_SOCIAL → acceso completo a todo
// EDUCADOR       → acceso completo SOLO a los menores que tiene asignados como tutor.
//                  En el resto de menores tiene acceso básico (igual que ATE):
//                  puede ver los datos generales y registrar incidencias
//                  (un educador de turno puede presenciar un hecho con cualquier menor).
// ATE            → acceso básico: ver ficha del menor y crear incidencias
//
// ALTA DE MENORES → solo DIRECCION y COORDINACION

// Roles que tienen acceso completo a todos los menores sin restricción
// Definido como array constante para poder usarlo en comprobaciones
// con el método .includes() de forma tipada
export const ROLES_ACCESO_COMPLETO = [
  "DIRECCION",
  "COORDINACION",
  "PSICOLOGO",
  "TRABAJADOR_SOCIAL",
] as const;

// Tipo derivado del array anterior — evita errores de tipado al comparar roles
type RolAccesoCompleto = (typeof ROLES_ACCESO_COMPLETO)[number];

// Todos los roles que existen en el sistema: los de acceso completo,
// más el educador y el ATE. Sirve para rechazar roles desconocidos
// (por ejemplo, si algún día un dato corrupto trae un rol inventado).
const ROLES_VALIDOS = [...ROLES_ACCESO_COMPLETO, "EDUCADOR", "ATE"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// puedeVerFichaCompleta
// Determina si un usuario puede acceder a la ficha completa de un menor,
// incluyendo datos sensibles (salud mental, perfil psicológico, etc.)
//
// Parámetros:
// - rolUsuario: el rol del usuario que intenta acceder
// - usuarioId: el ID del usuario que intenta acceder
// - tutorEducativoId: el ID del tutor asignado al menor (puede ser null)
// ─────────────────────────────────────────────────────────────────────────────
export function puedeVerFichaCompleta({
  rolUsuario,
  usuarioId,
  tutorEducativoId,
}: {
  rolUsuario: string;
  usuarioId: string;
  tutorEducativoId: string | null;
}): boolean {
  // Los roles con acceso completo siempre pueden ver la ficha
  if (ROLES_ACCESO_COMPLETO.includes(rolUsuario as RolAccesoCompleto)) {
    return true;
  }

  // El educador solo puede ver la ficha completa si es el tutor asignado
  // de ese menor. Comparamos IDs para verificar la asignación.
  if (rolUsuario === "EDUCADOR") {
    return tutorEducativoId === usuarioId;
  }

  // ATE, y el educador que no es tutor, solo tienen acceso básico:
  // no pueden ver la ficha completa
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// puedeVerFichaBasica
// Determina si un usuario puede ver los datos generales de un menor
// (nombre, expediente, medida, datos del tutor legal...) sin datos sensibles.
//
// Cualquier rol del sistema puede hacerlo: así un educador de turno, aunque
// no sea el tutor del menor, puede entrar a registrar una incidencia.
// Un rol desconocido NO tiene acceso.
// ─────────────────────────────────────────────────────────────────────────────
export function puedeVerFichaBasica(rolUsuario: string): boolean {
  // Convertimos el array de literales a string[] solo para poder usar
  // .includes() con un rol que llega como string cualquiera
  return (ROLES_VALIDOS as readonly string[]).includes(rolUsuario);
}

// ─────────────────────────────────────────────────────────────────────────────
// puedeCrearInformes
// Determina si un usuario puede crear o editar informes de un menor.
// Las mismas reglas que para ver la ficha completa — si puedes verla,
// puedes crear informes sobre ese menor.
// ─────────────────────────────────────────────────────────────────────────────
export function puedeCrearInformes({
  rolUsuario,
  usuarioId,
  tutorEducativoId,
}: {
  rolUsuario: string;
  usuarioId: string;
  tutorEducativoId: string | null;
}): boolean {
  return puedeVerFichaCompleta({ rolUsuario, usuarioId, tutorEducativoId });
}

// ─────────────────────────────────────────────────────────────────────────────
// puedeCrearIncidencias
// Todos los roles autenticados pueden crear incidencias.
// Las incidencias son notificaciones al juzgado de hechos puntuales,
// y cualquier profesional del equipo puede registrarlas.
// ─────────────────────────────────────────────────────────────────────────────
export function puedeCrearIncidencias(): boolean {
  // Siempre true — la verificación de autenticación ya la hace el middleware
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// puedeAsignarTutor
// Solo coordinación y dirección pueden asignar tutores a menores.
// Esta operación afecta al acceso de los educadores, por lo que
// debe estar restringida a roles de gestión.
// ─────────────────────────────────────────────────────────────────────────────
export function puedeAsignarTutor(rolUsuario: string): boolean {
  return ["COORDINACION", "DIRECCION"].includes(rolUsuario);
}

// ─────────────────────────────────────────────────────────────────────────────
// puedeCrearMenores
// Solo dirección y coordinación pueden dar de alta a un menor nuevo.
// Hoy coincide con quién puede asignar tutores, pero es una regla distinta
// (puede cambiar por separado), así que tiene su propia función.
// ─────────────────────────────────────────────────────────────────────────────
export function puedeCrearMenores(rolUsuario: string): boolean {
  return ["COORDINACION", "DIRECCION"].includes(rolUsuario);
}

// ─────────────────────────────────────────────────────────────────────────────
// puedeEditarFicha
// Determina si un usuario puede editar los datos de la ficha de un menor.
// Mismas reglas que para ver la ficha completa.
// ─────────────────────────────────────────────────────────────────────────────
export function puedeEditarFicha({
  rolUsuario,
  usuarioId,
  tutorEducativoId,
}: {
  rolUsuario: string;
  usuarioId: string;
  tutorEducativoId: string | null;
}): boolean {
  return puedeVerFichaCompleta({ rolUsuario, usuarioId, tutorEducativoId });
}
