-- CreateEnum
CREATE TYPE "EstadoMedida" AS ENUM ('ACTIVA', 'SUSPENDIDA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "TipoExtraordinario" AS ENUM ('SALUD_MENTAL', 'CAMBIO_FAMILIAR', 'EMBARAZO', 'NUEVO_DELITO', 'ADICCION', 'OTRO');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ATE', 'EDUCADOR', 'TRABAJADOR_SOCIAL', 'PSICOLOGO', 'COORDINACION', 'DIRECCION');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'EDUCADOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "dni" TEXT,
    "nacionalidad" TEXT,
    "domicilio" TEXT,
    "telefono" TEXT,
    "expediente" TEXT NOT NULL,
    "tipoMedida" TEXT NOT NULL,
    "estadoMedida" "EstadoMedida" NOT NULL DEFAULT 'ACTIVA',
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "juzgado" TEXT,
    "tutorNombre" TEXT,
    "tutorTelefono" TEXT,
    "tutorRelacion" TEXT,
    "situacionFamiliar" TEXT,
    "centroEducativo" TEXT,
    "cursoNivel" TEXT,
    "situacionEscolar" TEXT,
    "medicoAsignado" TEXT,
    "centroSalud" TEXT,
    "observacionesSalud" TEXT,
    "psicologoAsignado" TEXT,
    "diagnostico" TEXT,
    "medicacion" TEXT,
    "trabajadorSocial" TEXT,
    "serviciosSociales" TEXT,
    "perfilPsicologico" TEXT,
    "objetivos_generales" TEXT,
    "objetivos_especificos" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InformeInicial" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivoIngreso" TEXT NOT NULL,
    "situacionFamiliarIngreso" TEXT,
    "situacionEducativaIngreso" TEXT,
    "situacionSaludIngreso" TEXT,
    "situacionSaludMentalIngreso" TEXT,
    "redSocialApoyo" TEXT,
    "consumoSustancias" BOOLEAN NOT NULL DEFAULT false,
    "sustanciasConsumidas" TEXT,
    "frecuenciaConsumo" TEXT,
    "edadInicioConsumo" TEXT,
    "tratamientoPrevio" BOOLEAN NOT NULL DEFAULT false,
    "observacionesConsumo" TEXT,
    "valoracionEducativa" TEXT,
    "riesgosDetectados" TEXT,
    "necesidadesDetectadas" TEXT,
    "objetivosInicio" TEXT,
    "recursosPlanificados" TEXT,
    "menorId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InformeInicial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InformeSeguimiento" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodo" TEXT NOT NULL,
    "evolucionEducativa" TEXT,
    "evolucionFamiliar" TEXT,
    "evolucionSalud" TEXT,
    "evolucionSaludMental" TEXT,
    "evolucionServiciosSociales" TEXT,
    "evolucionConducta" TEXT,
    "evolucionConsumo" TEXT,
    "sustanciasActuales" TEXT,
    "enTratamientoAdicciones" BOOLEAN NOT NULL DEFAULT false,
    "recursoAdicciones" TEXT,
    "observacionesConsumo" TEXT,
    "objetivosConseguidos" TEXT,
    "objetivosPendientes" TEXT,
    "objetivosNuevos" TEXT,
    "valoracionGeneral" TEXT,
    "propuestaContinuacion" TEXT,
    "menorId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InformeSeguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InformeExtraordinario" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoExtraordinario" NOT NULL,
    "descripcionHecho" TEXT NOT NULL,
    "impactoEnMedida" TEXT,
    "medidasAdoptadas" TEXT,
    "comunicadoA" TEXT,
    "requiereModificacion" BOOLEAN NOT NULL DEFAULT false,
    "menorId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InformeExtraordinario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InformeFinal" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumenIntervencion" TEXT,
    "duracionMedida" TEXT,
    "objetivosAlcanzados" TEXT,
    "objetivosNoCumplidos" TEXT,
    "situacionFamiliarCierre" TEXT,
    "situacionEducativaCierre" TEXT,
    "situacionSaludCierre" TEXT,
    "redApoyoCierre" TEXT,
    "situacionConsumoCierre" TEXT,
    "enTratamientoAlCierre" BOOLEAN NOT NULL DEFAULT false,
    "recursoAdiccionesCierre" TEXT,
    "observacionesConsumoCierre" TEXT,
    "pronostico" TEXT,
    "recomendaciones" TEXT,
    "derivaciones" TEXT,
    "menorId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InformeFinal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incidencia" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT NOT NULL,
    "gravedad" TEXT NOT NULL,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "menorId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Incidencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Menor_dni_key" ON "Menor"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Menor_expediente_key" ON "Menor"("expediente");

-- AddForeignKey
ALTER TABLE "InformeInicial" ADD CONSTRAINT "InformeInicial_menorId_fkey" FOREIGN KEY ("menorId") REFERENCES "Menor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformeInicial" ADD CONSTRAINT "InformeInicial_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformeSeguimiento" ADD CONSTRAINT "InformeSeguimiento_menorId_fkey" FOREIGN KEY ("menorId") REFERENCES "Menor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformeSeguimiento" ADD CONSTRAINT "InformeSeguimiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformeExtraordinario" ADD CONSTRAINT "InformeExtraordinario_menorId_fkey" FOREIGN KEY ("menorId") REFERENCES "Menor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformeExtraordinario" ADD CONSTRAINT "InformeExtraordinario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformeFinal" ADD CONSTRAINT "InformeFinal_menorId_fkey" FOREIGN KEY ("menorId") REFERENCES "Menor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformeFinal" ADD CONSTRAINT "InformeFinal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_menorId_fkey" FOREIGN KEY ("menorId") REFERENCES "Menor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
