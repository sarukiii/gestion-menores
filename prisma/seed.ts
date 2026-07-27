// seed.ts — Script para poblar la base de datos con datos de prueba realistas
//
// Un "seed" es un script que crea datos iniciales en la base de datos
// de forma reproducible. Cada vez que se ejecuta con "npx prisma db seed"
// recrea los mismos datos, lo que es útil para:
// - Tener datos consistentes en desarrollo
// - Mostrar la app en entrevistas con datos realistas
// - Resetear el entorno de pruebas
//
// upsert: si el registro ya existe lo actualiza, si no lo crea.
// Esto permite ejecutar el seed múltiples veces sin errores de duplicados.

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── USUARIOS ────────────────────────────────────────────────────────────
  // Creamos un usuario por cada rol para poder probar el control de acceso

  const passwordHash = await bcrypt.hash("Test1234", 10);

  const coordinacion = await prisma.usuario.upsert({
    where: { email: "coordinacion@test.com" },
    update: {},
    create: {
      nombre: "Carmen López",
      email: "coordinacion@test.com",
      password: passwordHash,
      rol: "COORDINACION",
      activo: true,
    },
  });
  console.log("✓ Usuario creado:", coordinacion.email);

  const direccion = await prisma.usuario.upsert({
    where: { email: "direccion@test.com" },
    update: {},
    create: {
      nombre: "Miguel Fernández",
      email: "direccion@test.com",
      password: passwordHash,
      rol: "DIRECCION",
      activo: true,
    },
  });
  console.log("✓ Usuario creado:", direccion.email);

  const educador1 = await prisma.usuario.upsert({
    where: { email: "educador1@test.com" },
    update: {},
    create: {
      nombre: "Sara Martínez",
      email: "educador1@test.com",
      password: passwordHash,
      rol: "EDUCADOR",
      activo: true,
    },
  });
  console.log("✓ Usuario creado:", educador1.email);

  const educador2 = await prisma.usuario.upsert({
    where: { email: "educador2@test.com" },
    update: {},
    create: {
      nombre: "Pablo García",
      email: "educador2@test.com",
      password: passwordHash,
      rol: "EDUCADOR",
      activo: true,
    },
  });
  console.log("✓ Usuario creado:", educador2.email);

  const psicologo = await prisma.usuario.upsert({
    where: { email: "psicologo@test.com" },
    update: {},
    create: {
      nombre: "Ana Ruiz",
      email: "psicologo@test.com",
      password: passwordHash,
      rol: "PSICOLOGO",
      activo: true,
    },
  });
  console.log("✓ Usuario creado:", psicologo.email);

  const trabajadorSocial = await prisma.usuario.upsert({
    where: { email: "trabajadorsocial@test.com" },
    update: {},
    create: {
      nombre: "Laura Sánchez",
      email: "trabajadorsocial@test.com",
      password: passwordHash,
      rol: "TRABAJADOR_SOCIAL",
      activo: true,
    },
  });
  console.log("✓ Usuario creado:", trabajadorSocial.email);

  const ate = await prisma.usuario.upsert({
    where: { email: "ate@test.com" },
    update: {},
    create: {
      nombre: "Jorge Pérez",
      email: "ate@test.com",
      password: passwordHash,
      rol: "ATE",
      activo: true,
    },
  });
  console.log("✓ Usuario creado:", ate.email);

  // ─── MENORES ─────────────────────────────────────────────────────────────
  // Creamos menores con datos ficticios pero realistas
  // Los datos son completamente inventados — ninguno corresponde a personas reales

  const menor1 = await prisma.menor.upsert({
    where: { expediente: "EXP-2024-001" },
    update: {},
    create: {
      nombre: "Alejandro",
      apellidos: "Moreno Vega",
      fechaNacimiento: new Date("2008-03-15"),
      expediente: "EXP-2024-001",
      tipoMedida: "Internamiento en régimen semiabierto",
      estadoMedida: "ACTIVA",
      fechaInicio: new Date("2024-01-10"),
      juzgado: "Juzgado de Menores nº 2 de Sevilla",
      nacionalidad: "Española",
      domicilio: "Calle Reyes Católicos 14, Sevilla",
      telefono: "600111222",
      tutorNombre: "Rosa Vega",
      tutorTelefono: "600333444",
      tutorRelacion: "Madre",
      situacionFamiliar:
        "Familia monoparental. Madre con escasos recursos económicos. Ausencia de figura paterna desde los 5 años.",
      centroEducativo: "IES Pino Montano",
      cursoNivel: "2º ESO",
      situacionEscolar:
        "Absentismo elevado previo al ingreso. Actualmente retomando la escolarización.",
      medicoAsignado: "Dr. Ramírez",
      centroSalud: "Centro de Salud Pino Montano",
      psicologoAsignado: "Ana Ruiz",
      diagnostico: "Trastorno negativista desafiante",
      perfilPsicologico:
        "Menor con dificultades en el control de impulsos y gestión emocional. Buena capacidad cognitiva.",
      objetivos_generales:
        "Reducir conductas disruptivas. Mejorar vinculación familiar. Retomar proceso educativo.",
      objetivos_especificos:
        "Asistencia regular al centro educativo. Participación en talleres de control de ira.",
      tutorEducativoId: educador1.id,
    },
  });
  console.log("✓ Menor creado:", menor1.nombre, menor1.apellidos);

  const menor2 = await prisma.menor.upsert({
    where: { expediente: "EXP-2024-002" },
    update: {},
    create: {
      nombre: "Cristina",
      apellidos: "Torres Molina",
      fechaNacimiento: new Date("2007-11-22"),
      expediente: "EXP-2024-002",
      tipoMedida: "Libertad vigilada",
      estadoMedida: "ACTIVA",
      fechaInicio: new Date("2024-03-01"),
      juzgado: "Juzgado de Menores nº 1 de Sevilla",
      nacionalidad: "Española",
      domicilio: "Avenida de la Paz 33, Sevilla",
      telefono: "600555666",
      tutorNombre: "Antonio Torres",
      tutorTelefono: "600777888",
      tutorRelacion: "Padre",
      situacionFamiliar:
        "Familia nuclear con conflictividad entre los progenitores. Proceso de separación en curso.",
      centroEducativo: "IES Nervión",
      cursoNivel: "3º ESO",
      situacionEscolar:
        "Rendimiento académico bajo. Relaciones con iguales problemáticas.",
      psicologoAsignado: "Ana Ruiz",
      diagnostico: "Ansiedad generalizada",
      medicacion: "Sertralina 50mg",
      trabajadorSocial: "Laura Sánchez",
      serviciosSociales: "Servicios Sociales Comunitarios Nervión",
      tutorEducativoId: educador1.id,
    },
  });
  console.log("✓ Menor creado:", menor2.nombre, menor2.apellidos);

  const menor3 = await prisma.menor.upsert({
    where: { expediente: "EXP-2024-003" },
    update: {},
    create: {
      nombre: "Iván",
      apellidos: "Domínguez Reyes",
      fechaNacimiento: new Date("2006-07-08"),
      expediente: "EXP-2024-003",
      tipoMedida: "Internamiento en régimen cerrado",
      estadoMedida: "ACTIVA",
      fechaInicio: new Date("2024-02-15"),
      juzgado: "Juzgado de Menores nº 3 de Sevilla",
      nacionalidad: "Española",
      domicilio: "Calle Feria 7, Sevilla",
      tutorNombre: "Dolores Reyes",
      tutorTelefono: "600999000",
      tutorRelacion: "Abuela materna",
      situacionFamiliar:
        "Menor en tutela de abuela materna. Progenitores con problemas de adicción.",
      centroEducativo: "Formación interna en el centro",
      cursoNivel: "4º ESO (adaptación curricular)",
      situacionEscolar:
        "Sin escolarización regular desde 1º ESO. Proceso de recuperación educativa.",
      medicoAsignado: "Dra. Castro",
      centroSalud: "Centro de Salud Macarena",
      psicologoAsignado: "Ana Ruiz",
      diagnostico: "Trastorno de conducta. Consumo de sustancias.",
      perfilPsicologico:
        "Menor con historial de trauma temprano. Dificultades severas en regulación emocional.",
      objetivos_generales:
        "Desintoxicación y mantenimiento de abstinencia. Recuperación del proceso educativo.",
      tutorEducativoId: educador2.id,
    },
  });
  console.log("✓ Menor creado:", menor3.nombre, menor3.apellidos);

  const menor4 = await prisma.menor.upsert({
    where: { expediente: "EXP-2023-015" },
    update: {},
    create: {
      nombre: "Patricia",
      apellidos: "Jiménez Castillo",
      fechaNacimiento: new Date("2007-04-30"),
      expediente: "EXP-2023-015",
      tipoMedida: "Tareas socioeducativas",
      estadoMedida: "FINALIZADA",
      fechaInicio: new Date("2023-06-01"),
      fechaFin: new Date("2024-06-01"),
      juzgado: "Juzgado de Menores nº 2 de Sevilla",
      nacionalidad: "Española",
      tutorNombre: "María Castillo",
      tutorTelefono: "600123456",
      tutorRelacion: "Madre",
      situacionFamiliar: "Familia estable con buena red de apoyo.",
      centroEducativo: "IES San Pablo",
      cursoNivel: "4º ESO",
      situacionEscolar: "Buena evolución académica durante la medida.",
      trabajadorSocial: "Laura Sánchez",
      tutorEducativoId: educador2.id,
    },
  });
  console.log("✓ Menor creado:", menor4.nombre, menor4.apellidos);

  // ─── INFORMES DE EJEMPLO ─────────────────────────────────────────────────

  // Informe inicial para menor1
  await prisma.informeInicial.upsert({
    where: { id: "seed-informe-inicial-1" },
    update: {},
    create: {
      id: "seed-informe-inicial-1",
      menorId: menor1.id,
      usuarioId: educador1.id,
      motivoIngreso:
        "Condena por robo con violencia. Sentencia de 6 meses en régimen semiabierto.",
      situacionFamiliarIngreso:
        "Convive con madre en situación económica precaria. Sin contacto con padre.",
      situacionEducativaIngreso:
        "Abandono escolar desde hace 8 meses. Sin título de ESO.",
      situacionSaludIngreso: "Sin patologías físicas relevantes.",
      situacionSaludMentalIngreso:
        "Diagnóstico previo de TND. Sin tratamiento en el momento del ingreso.",
      consumoSustancias: true,
      sustanciasConsumidas: "Cannabis",
      frecuenciaConsumo: "Diario",
      edadInicioConsumo: "13 años",
      tratamientoPrevio: false,
      riesgosDetectados:
        "Riesgo de reincidencia. Grupo de iguales con conductas delictivas.",
      necesidadesDetectadas:
        "Intervención en control de impulsos. Recuperación educativa. Apoyo familiar.",
      objetivosInicio:
        "Reducir consumo de cannabis. Retomar escolarización. Mejorar relación con la madre.",
      recursosPlanificados:
        "Psicología individual semanal. Taller de habilidades sociales. Escuela interna.",
    },
  });
  console.log("✓ Informe inicial creado para:", menor1.nombre);

  // Informe de seguimiento para menor1
  await prisma.informeSeguimiento.upsert({
    where: { id: "seed-seguimiento-1" },
    update: {},
    create: {
      id: "seed-seguimiento-1",
      menorId: menor1.id,
      usuarioId: educador1.id,
      periodo: "1er trimestre 2024",
      evolucionEducativa:
        "Ha retomado la escolarización con regularidad. Aprobado matemáticas y lengua.",
      evolucionFamiliar:
        "Mejora en la comunicación con la madre. Visitas familiares regulares.",
      evolucionConducta:
        "Reducción de episodios disruptivos. Mejor gestión del enfado.",
      evolucionConsumo: "Reducción significativa del consumo de cannabis.",
      enTratamientoAdicciones: false,
      objetivosConseguidos:
        "Asistencia regular al centro educativo. Reducción del consumo.",
      objetivosPendientes: "Mejorar relaciones con iguales dentro del centro.",
      valoracionGeneral:
        "Evolución positiva en todos los ámbitos. Se mantiene la medida actual.",
      propuestaContinuacion: "Continuar con el plan de intervención actual.",
    },
  });
  console.log("✓ Informe de seguimiento creado para:", menor1.nombre);

  // Informe extraordinario para menor3
  await prisma.informeExtraordinario.upsert({
    where: { id: "seed-extraordinario-1" },
    update: {},
    create: {
      id: "seed-extraordinario-1",
      menorId: menor3.id,
      usuarioId: educador2.id,
      tipo: "ADICCION",
      descripcionHecho:
        "El menor presentó síndrome de abstinencia durante el tercer día de internamiento. Fue necesaria atención médica urgente.",
      impactoEnMedida:
        "Requiere desintoxicación supervisada antes de continuar con el plan de intervención.",
      medidasAdoptadas:
        "Derivación a unidad de desintoxicación. Comunicación a juzgado y familia.",
      comunicadoA:
        "Juzgado de Menores nº 3, abuela tutora, servicio médico del centro",
      requiereModificacion: false,
    },
  });
  console.log("✓ Informe extraordinario creado para:", menor3.nombre);

  // Incidencia para menor1
  await prisma.incidencia.upsert({
    where: { id: "seed-incidencia-1" },
    update: {},
    create: {
      id: "seed-incidencia-1",
      menorId: menor1.id,
      usuarioId: ate.id,
      descripcion:
        "El menor se negó a participar en el taller de la tarde y se encerró en su habitación durante 2 horas. Se calmó tras intervención del educador de guardia.",
      gravedad: "leve",
      resuelta: true,
    },
  });
  console.log("✓ Incidencia creada para:", menor1.nombre);

  console.log("\n✅ Seed completado con éxito");
  console.log("\n📋 Usuarios de prueba (contraseña: Test1234):");
  console.log("   coordinacion@test.com — Coordinación");
  console.log("   direccion@test.com — Dirección");
  console.log("   educador1@test.com — Educador/a");
  console.log("   educador2@test.com — Educador/a");
  console.log("   psicologo@test.com — Psicólogo/a");
  console.log("   trabajadorsocial@test.com — Trabajador/a Social");
  console.log("   ate@test.com — ATE");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
