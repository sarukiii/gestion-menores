// permisos.test.ts — Tests automáticos de las reglas de acceso (src/lib/permisos.ts)
//
// Un test es un pequeño programa que llama a tu código con unos datos
// concretos y comprueba que el resultado es el esperado.
//
// Analogía: la prueba manual que ya hiciste es como comprobar a mano, un día,
// que todas las puertas de la casa cierran bien. Los tests automáticos son la
// alarma: cada vez que alguien toca el código, comprueban solos las puertas.
// Si mañana un cambio deja una puerta abierta, el test falla y te avisa antes
// de que lo vea nadie.
//
// Cada test sigue tres pasos:
//   1. Preparar los datos (qué rol, qué ids)
//   2. Ejecutar la función
//   3. Comprobar el resultado con expect(...)
//
// Se ejecutan con:   npm test

import { describe, it, expect } from "vitest";
import {
  ROLES_ACCESO_COMPLETO,
  puedeVerFichaCompleta,
  puedeVerFichaBasica,
  puedeCrearInformes,
  puedeCrearIncidencias,
  puedeAsignarTutor,
  puedeCrearMenores,
  puedeEditarFicha,
} from "./permisos";

// ─────────────────────────────────────────────────────────────────────────────
// Datos de prueba reutilizables
// ─────────────────────────────────────────────────────────────────────────────

// Los seis roles del sistema
const TODOS_LOS_ROLES = [
  "DIRECCION",
  "COORDINACION",
  "PSICOLOGO",
  "TRABAJADOR_SOCIAL",
  "EDUCADOR",
  "ATE",
] as const;

// Ids inventados para los tests (no existen en tu base de datos real)
const ID_EDUCADOR_TUTOR = "educador-tutor";
const ID_OTRO_EDUCADOR = "otro-educador";

// ─────────────────────────────────────────────────────────────────────────────
// ROLES_ACCESO_COMPLETO
// Es la lista que decide quién ve todo. Si alguien añadiera por error
// "EDUCADOR" o "ATE" aquí, tendrían acceso a todos los menores.
// ─────────────────────────────────────────────────────────────────────────────
describe("ROLES_ACCESO_COMPLETO", () => {
  it("contiene exactamente los cuatro roles de equipo técnico y gestión", () => {
    expect([...ROLES_ACCESO_COMPLETO].sort()).toEqual([
      "COORDINACION",
      "DIRECCION",
      "PSICOLOGO",
      "TRABAJADOR_SOCIAL",
    ]);
  });

  it("no incluye al educador ni al ATE", () => {
    expect(ROLES_ACCESO_COMPLETO).not.toContain("EDUCADOR");
    expect(ROLES_ACCESO_COMPLETO).not.toContain("ATE");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// puedeVerFichaCompleta
// ─────────────────────────────────────────────────────────────────────────────
describe("puedeVerFichaCompleta", () => {
  // it.each repite el mismo test una vez por cada rol de la lista.
  // %s se sustituye por el nombre del rol en el informe de resultados.
  describe.each(ROLES_ACCESO_COMPLETO)("rol %s", (rol) => {
    it("ve la ficha completa de un menor sin tutor asignado", () => {
      expect(
        puedeVerFichaCompleta({
          rolUsuario: rol,
          usuarioId: "usuario-cualquiera",
          tutorEducativoId: null,
        }),
      ).toBe(true);
    });

    it("ve la ficha completa de un menor cuyo tutor es otra persona", () => {
      expect(
        puedeVerFichaCompleta({
          rolUsuario: rol,
          usuarioId: "usuario-cualquiera",
          tutorEducativoId: ID_OTRO_EDUCADOR,
        }),
      ).toBe(true);
    });
  });

  describe("rol EDUCADOR", () => {
    it("ve la ficha completa si es el tutor asignado del menor", () => {
      expect(
        puedeVerFichaCompleta({
          rolUsuario: "EDUCADOR",
          usuarioId: ID_EDUCADOR_TUTOR,
          tutorEducativoId: ID_EDUCADOR_TUTOR,
        }),
      ).toBe(true);
    });

    // Caso negativo clave: es el que provocaba el error que viste en pantalla
    it("NO ve la ficha completa si el tutor es otro educador", () => {
      expect(
        puedeVerFichaCompleta({
          rolUsuario: "EDUCADOR",
          usuarioId: ID_EDUCADOR_TUTOR,
          tutorEducativoId: ID_OTRO_EDUCADOR,
        }),
      ).toBe(false);
    });

    it("NO ve la ficha completa si el menor no tiene tutor asignado", () => {
      expect(
        puedeVerFichaCompleta({
          rolUsuario: "EDUCADOR",
          usuarioId: ID_EDUCADOR_TUTOR,
          tutorEducativoId: null,
        }),
      ).toBe(false);
    });
  });

  describe("rol ATE", () => {
    it("NO ve la ficha completa de un menor sin tutor", () => {
      expect(
        puedeVerFichaCompleta({
          rolUsuario: "ATE",
          usuarioId: "ate-1",
          tutorEducativoId: null,
        }),
      ).toBe(false);
    });

    // El ATE nunca debe tener acceso completo, ni aunque su id coincidiera
    // con el del tutor (algo que no debería pasar, pero la regla ha de ser firme)
    it("NO ve la ficha completa ni aunque su id coincida con el del tutor", () => {
      expect(
        puedeVerFichaCompleta({
          rolUsuario: "ATE",
          usuarioId: "mismo-id",
          tutorEducativoId: "mismo-id",
        }),
      ).toBe(false);
    });
  });

  describe("roles desconocidos o mal escritos", () => {
    // Si un rol llega mal escrito o inventado, la regla segura es negar el acceso
    it.each(["DIRECCON", "direccion", "ADMIN", ""])(
      'el rol "%s" NO tiene acceso',
      (rol) => {
        expect(
          puedeVerFichaCompleta({
            rolUsuario: rol,
            usuarioId: "usuario-cualquiera",
            tutorEducativoId: null,
          }),
        ).toBe(false);
      },
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// puedeVerFichaBasica
// Cualquier rol válido puede ver los datos generales (para registrar
// incidencias). Un rol desconocido, no.
// ─────────────────────────────────────────────────────────────────────────────
describe("puedeVerFichaBasica", () => {
  it.each(TODOS_LOS_ROLES)("el rol %s puede ver la ficha básica", (rol) => {
    expect(puedeVerFichaBasica(rol)).toBe(true);
  });

  it.each(["DIRECCON", "direccion", "ADMIN", ""])(
    'el rol "%s" NO puede ver la ficha básica',
    (rol) => {
      expect(puedeVerFichaBasica(rol)).toBe(false);
    },
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// puedeCrearInformes y puedeEditarFicha
// Ambas dicen: "si puedes ver la ficha completa, puedes hacerlo".
// En vez de repetir todos los casos, comprobamos que SIEMPRE dan la misma
// respuesta que puedeVerFichaCompleta, para cualquier combinación.
// ─────────────────────────────────────────────────────────────────────────────
describe("puedeCrearInformes y puedeEditarFicha", () => {
  // Combinaciones de rol, usuario y tutor para recorrer
  const casos = TODOS_LOS_ROLES.flatMap((rol) =>
    [null, ID_EDUCADOR_TUTOR, ID_OTRO_EDUCADOR].map((tutorEducativoId) => ({
      rolUsuario: rol as string,
      usuarioId: ID_EDUCADOR_TUTOR,
      tutorEducativoId,
    })),
  );

  it("puedeCrearInformes coincide con puedeVerFichaCompleta en todos los casos", () => {
    for (const caso of casos) {
      expect(puedeCrearInformes(caso)).toBe(puedeVerFichaCompleta(caso));
    }
  });

  it("puedeEditarFicha coincide con puedeVerFichaCompleta en todos los casos", () => {
    for (const caso of casos) {
      expect(puedeEditarFicha(caso)).toBe(puedeVerFichaCompleta(caso));
    }
  });

  // Y un par de ejemplos concretos, para que el test se entienda sin leer el bucle
  it("el ATE no puede editar la ficha ni crear informes", () => {
    const ate = {
      rolUsuario: "ATE",
      usuarioId: "ate-1",
      tutorEducativoId: null,
    };
    expect(puedeEditarFicha(ate)).toBe(false);
    expect(puedeCrearInformes(ate)).toBe(false);
  });

  it("el educador que no es tutor no puede editar la ficha ni crear informes", () => {
    const educadorNoTutor = {
      rolUsuario: "EDUCADOR",
      usuarioId: ID_EDUCADOR_TUTOR,
      tutorEducativoId: ID_OTRO_EDUCADOR,
    };
    expect(puedeEditarFicha(educadorNoTutor)).toBe(false);
    expect(puedeCrearInformes(educadorNoTutor)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// puedeCrearIncidencias
// Todos los profesionales pueden registrar incidencias.
// ─────────────────────────────────────────────────────────────────────────────
describe("puedeCrearIncidencias", () => {
  it("siempre devuelve true", () => {
    expect(puedeCrearIncidencias()).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// puedeAsignarTutor y puedeCrearMenores
// Reglas de gestión: solo dirección y coordinación.
// Se prueban con el mismo patrón: quién SÍ y quién NO.
// ─────────────────────────────────────────────────────────────────────────────
describe.each([
  { nombre: "puedeAsignarTutor", funcion: puedeAsignarTutor },
  { nombre: "puedeCrearMenores", funcion: puedeCrearMenores },
])("$nombre", ({ funcion }) => {
  it.each(["DIRECCION", "COORDINACION"])("el rol %s SÍ puede", (rol) => {
    expect(funcion(rol)).toBe(true);
  });

  it.each(["PSICOLOGO", "TRABAJADOR_SOCIAL", "EDUCADOR", "ATE"])(
    "el rol %s NO puede",
    (rol) => {
      expect(funcion(rol)).toBe(false);
    },
  );

  it.each(["DIRECCON", "direccion", "ADMIN", ""])(
    'el rol desconocido "%s" NO puede',
    (rol) => {
      expect(funcion(rol)).toBe(false);
    },
  );
});
