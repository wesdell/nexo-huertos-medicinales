-- v2: modelo acordado con el MSP (06/11/2026). Reemplaza el modelo de v1 (auto-registro y comunidades).
-- Los datos de v1 eran de demostración; se eliminan y el seed vuelve a cargarlos.
DROP TABLE IF EXISTS "aportes", "misiones_miembro", "insignias_miembro", "talentos_miembro", "movimientos_puntos",
  "paquetes", "archivos_actividad", "actividades", "fotos_planta", "plantas", "bodega_espacios", "huerto_disenos",
  "huertos", "membresias", "comunidades", "usuarios", "parroquias", "provincias" CASCADE;
DROP TYPE IF EXISTS "Rol", "NivelMiembro", "Genero", "Region", "FaseLunar", "TipoActividad", "TipoDiseno", "VarianteDiseno",
  "TipoCerca", "TipoSuelo", "TipoAgua", "TipoAbono", "CicloPlanta", "CualidadPlanta", "EspacioBodega", "TipoArchivo" CASCADE;

-- CreateSchema

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('RESPONSABLE', 'TECNICO_MSP', 'ADMIN');

-- CreateEnum
CREATE TYPE "NivelMiembro" AS ENUM ('APRENDIZ', 'OFICIAL', 'MAESTRO');

-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('FEMENINO', 'MASCULINO', 'OTRO', 'PREFIERO_NO_DECIR');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('SIERRA', 'COSTA', 'AMAZONIA', 'GALAPAGOS');

-- CreateEnum
CREATE TYPE "FaseLunar" AS ENUM ('LUNA_NUEVA', 'CRECIENTE', 'LLENA', 'MENGUANTE');

-- CreateEnum
CREATE TYPE "TipoActividad" AS ENUM ('PREPARACION_TIERRA', 'ESTRUCTURA_SIEMBRA', 'RITUAL_SIEMBRA', 'SIEMBRA', 'SENALETICA', 'CUIDADO_CRECIMIENTO', 'RIEGO', 'BANO_PREVIO_COSECHA', 'RITUAL_GRATITUD', 'COSECHA', 'LIMPIEZA', 'SECADO', 'EMPAQUETADO');

-- CreateEnum
CREATE TYPE "TipoDiseno" AS ENUM ('EN_TIERRA', 'VERTICAL', 'COLGANTE', 'EN_PISO');

-- CreateEnum
CREATE TYPE "VarianteDiseno" AS ENUM ('SURCO', 'CAMADA', 'CAMELLON', 'TERRAZA', 'PARED', 'TECHO', 'MACETERO', 'BOTELLA', 'LLANTA_PATIO', 'TERRAZA_PISO', 'GRADA', 'BALCON', 'FILO_VENTANA');

-- CreateEnum
CREATE TYPE "TipoCerca" AS ENUM ('VIVA', 'MATERIAL_NATURAL', 'MATERIAL_RECICLADO', 'METALICA', 'CONVENCIONAL');

-- CreateEnum
CREATE TYPE "TipoSuelo" AS ENUM ('ARCILLOSO', 'LIMOSO', 'ARENOSO', 'MARGOSO', 'GREDOSO', 'PANTANOSO');

-- CreateEnum
CREATE TYPE "TipoAgua" AS ENUM ('RIO', 'CANAL', 'GOTEO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoAbono" AS ENUM ('BARBECHO', 'RESTOS_VEGETALES', 'HOJA', 'COMPOST');

-- CreateEnum
CREATE TYPE "CicloPlanta" AS ENUM ('CORTO', 'LARGO');

-- CreateEnum
CREATE TYPE "CualidadPlanta" AS ENUM ('CALIENTE', 'FRIA');

-- CreateEnum
CREATE TYPE "EspacioBodega" AS ENUM ('HERRAMIENTAS', 'SEMILLAS_PLANTULAS', 'ABONOS');

-- CreateEnum
CREATE TYPE "TipoArchivo" AS ENUM ('FOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "EstadoCiclo" AS ENUM ('ACTIVO', 'COMPLETADO', 'FALLIDO');

-- CreateEnum
CREATE TYPE "EstadoEvidencia" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'SIN_EVIDENCIA');

-- CreateEnum
CREATE TYPE "CausaFracaso" AS ENUM ('HELADA', 'SEQUIA', 'EXCESO_LLUVIA', 'PLAGA', 'ENFERMEDAD', 'ANIMALES', 'DESCUIDO', 'ROBO_DANO', 'OTRA');

-- CreateEnum
CREATE TYPE "CategoriaAporte" AS ENUM ('PRACTICAS', 'SABERES', 'SENTIRES');

-- CreateTable
CREATE TABLE "provincias" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "region" "Region" NOT NULL,

    CONSTRAINT "provincias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parroquias" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "provinciaId" INTEGER NOT NULL,

    CONSTRAINT "parroquias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cedula" TEXT,
    "celular" TEXT,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "debeCambiarClave" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "consentimientoDatosEn" TIMESTAMP(3),
    "versionPolitica" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_huerto" (
    "id" TEXT NOT NULL,
    "nombreHuerto" TEXT NOT NULL,
    "tipo" "TipoDiseno" NOT NULL,
    "subtipos" "VarianteDiseno"[],
    "provinciaId" INTEGER NOT NULL,
    "parroquiaId" INTEGER NOT NULL,
    "direccion" TEXT,
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "altitud" INTEGER NOT NULL,
    "nombreResponsable" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "consentimientoDatosEn" TIMESTAMP(3) NOT NULL,
    "versionPolitica" TEXT NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "motivo" TEXT,
    "revisadaPorId" TEXT,
    "revisadaEn" TIMESTAMP(3),
    "huertoId" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_huerto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "huertos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoDiseno" NOT NULL,
    "subtipos" "VarianteDiseno"[],
    "responsableId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "provinciaId" INTEGER NOT NULL,
    "parroquiaId" INTEGER NOT NULL,
    "direccion" TEXT,
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "altitud" INTEGER NOT NULL,
    "tipoCerca" "TipoCerca",
    "materialCerca" TEXT,
    "areaM2" DECIMAL(10,2),
    "tipoSuelo" "TipoSuelo",
    "tipoAgua" "TipoAgua",
    "detalleAgua" TEXT,
    "tipoAbono" "TipoAbono",
    "puntosTotales" INTEGER NOT NULL DEFAULT 0,
    "ultimoCambioPuntos" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "huertos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_responsables" (
    "id" TEXT NOT NULL,
    "huertoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasta" TIMESTAMP(3),
    "motivo" TEXT,

    CONSTRAINT "historial_responsables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voluntarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cedula" TEXT,
    "fechaNacimiento" DATE NOT NULL,
    "genero" "Genero" NOT NULL,
    "nivel" "NivelMiembro" NOT NULL DEFAULT 'APRENDIZ',
    "horasValidadas" DECIMAL(8,1) NOT NULL DEFAULT 0,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voluntarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voluntarios_huerto" (
    "voluntarioId" TEXT NOT NULL,
    "huertoId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voluntarios_huerto_pkey" PRIMARY KEY ("voluntarioId","huertoId")
);

-- CreateTable
CREATE TABLE "solicitudes_nivel" (
    "id" TEXT NOT NULL,
    "voluntarioId" TEXT NOT NULL,
    "huertoId" TEXT NOT NULL,
    "nivel" "NivelMiembro" NOT NULL,
    "justificacion" TEXT NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "motivo" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisadaEn" TIMESTAMP(3),

    CONSTRAINT "solicitudes_nivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantas" (
    "id" TEXT NOT NULL,
    "nombreComun" TEXT NOT NULL,
    "nombreCientifico" TEXT NOT NULL,
    "otrosNombres" TEXT[],
    "familiaBotanica" TEXT,
    "altitudMin" INTEGER,
    "altitudMax" INTEGER,
    "provincias" TEXT[],
    "ciclo" "CicloPlanta" NOT NULL,
    "cualidad" "CualidadPlanta" NOT NULL,
    "usosMedicinales" TEXT NOT NULL,
    "parteUsada" TEXT,
    "dosificacion" TEXT,
    "contraindicaciones" TEXT,
    "fotoUrl" TEXT,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'APROBADA',
    "motivo" TEXT,
    "propuestaPorId" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plantas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "huerto_plantas" (
    "huertoId" TEXT NOT NULL,
    "plantaId" TEXT NOT NULL,
    "fueraDeAltitud" BOOLEAN NOT NULL DEFAULT false,
    "desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "huerto_plantas_pkey" PRIMARY KEY ("huertoId","plantaId")
);

-- CreateTable
CREATE TABLE "ciclos" (
    "id" TEXT NOT NULL,
    "huertoId" TEXT NOT NULL,
    "plantaId" TEXT NOT NULL,
    "estado" "EstadoCiclo" NOT NULL DEFAULT 'ACTIVO',
    "causaFracaso" "CausaFracaso",
    "justificacion" TEXT,
    "iniciadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerradoEn" TIMESTAMP(3),

    CONSTRAINT "ciclos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" TEXT NOT NULL,
    "huertoId" TEXT NOT NULL,
    "cicloId" TEXT NOT NULL,
    "registradaPorId" TEXT NOT NULL,
    "tipo" "TipoActividad" NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TEXT,
    "faseLunar" "FaseLunar",
    "detalle" JSONB NOT NULL,
    "advertencias" TEXT[],
    "cumplida" BOOLEAN NOT NULL DEFAULT true,
    "estadoEvidencia" "EstadoEvidencia" NOT NULL DEFAULT 'PENDIENTE',
    "intento" INTEGER NOT NULL DEFAULT 1,
    "motivoRechazo" TEXT,
    "revisadaPorId" TEXT,
    "revisadaEn" TIMESTAMP(3),
    "puntosOtorgados" INTEGER NOT NULL DEFAULT 0,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participaciones" (
    "actividadId" TEXT NOT NULL,
    "voluntarioId" TEXT NOT NULL,
    "horas" DECIMAL(4,1) NOT NULL,

    CONSTRAINT "participaciones_pkey" PRIMARY KEY ("actividadId","voluntarioId")
);

-- CreateTable
CREATE TABLE "archivos_actividad" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "intento" INTEGER NOT NULL DEFAULT 1,
    "tipo" "TipoArchivo" NOT NULL,
    "url" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivos_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paquetes" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "indicacionesUso" TEXT NOT NULL,
    "dosificacion" TEXT NOT NULL,
    "contraindicaciones" TEXT NOT NULL,
    "fechaEmpaquetado" DATE NOT NULL,
    "fechaCaducidad" DATE NOT NULL,
    "cualidad" "CualidadPlanta" NOT NULL,

    CONSTRAINT "paquetes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodega_items" (
    "id" TEXT NOT NULL,
    "huertoId" TEXT NOT NULL,
    "espacio" "EspacioBodega" NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "unidad" TEXT NOT NULL,
    "nota" TEXT,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bodega_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_puntos" (
    "id" TEXT NOT NULL,
    "voluntarioId" TEXT NOT NULL,
    "huertoId" TEXT NOT NULL,
    "actividadId" TEXT,
    "puntos" INTEGER NOT NULL,
    "horas" DECIMAL(4,1) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_puntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aportes" (
    "id" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "padreId" TEXT,
    "categoria" "CategoriaAporte" NOT NULL,
    "titulo" TEXT,
    "contenido" TEXT NOT NULL,
    "reportes" INTEGER NOT NULL DEFAULT 0,
    "retirado" BOOLEAN NOT NULL DEFAULT false,
    "motivoRetiro" TEXT,
    "retiradoPorId" TEXT,
    "retiradoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aportes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provincias_nombre_key" ON "provincias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "parroquias_provinciaId_nombre_key" ON "parroquias"("provinciaId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cedula_key" ON "usuarios"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_huerto_huertoId_key" ON "solicitudes_huerto"("huertoId");

-- CreateIndex
CREATE INDEX "solicitudes_huerto_estado_creadaEn_idx" ON "solicitudes_huerto"("estado", "creadaEn");

-- CreateIndex
CREATE INDEX "huertos_tipo_puntosTotales_idx" ON "huertos"("tipo", "puntosTotales" DESC);

-- CreateIndex
CREATE INDEX "historial_responsables_huertoId_idx" ON "historial_responsables"("huertoId");

-- CreateIndex
CREATE UNIQUE INDEX "voluntarios_cedula_key" ON "voluntarios"("cedula");

-- CreateIndex
CREATE INDEX "voluntarios_huerto_huertoId_idx" ON "voluntarios_huerto"("huertoId");

-- CreateIndex
CREATE INDEX "solicitudes_nivel_estado_idx" ON "solicitudes_nivel"("estado");

-- CreateIndex
CREATE INDEX "plantas_estado_idx" ON "plantas"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "plantas_nombreCientifico_key" ON "plantas"("nombreCientifico");

-- CreateIndex
CREATE INDEX "ciclos_huertoId_estado_idx" ON "ciclos"("huertoId", "estado");

-- CreateIndex
CREATE INDEX "actividades_huertoId_fecha_idx" ON "actividades"("huertoId", "fecha");

-- CreateIndex
CREATE INDEX "actividades_cicloId_idx" ON "actividades"("cicloId");

-- CreateIndex
CREATE INDEX "actividades_estadoEvidencia_creadaEn_idx" ON "actividades"("estadoEvidencia", "creadaEn");

-- CreateIndex
CREATE INDEX "participaciones_voluntarioId_idx" ON "participaciones"("voluntarioId");

-- CreateIndex
CREATE INDEX "archivos_actividad_actividadId_idx" ON "archivos_actividad"("actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "paquetes_actividadId_key" ON "paquetes"("actividadId");

-- CreateIndex
CREATE INDEX "bodega_items_huertoId_idx" ON "bodega_items"("huertoId");

-- CreateIndex
CREATE INDEX "movimientos_puntos_huertoId_creadoEn_idx" ON "movimientos_puntos"("huertoId", "creadoEn");

-- CreateIndex
CREATE INDEX "movimientos_puntos_voluntarioId_idx" ON "movimientos_puntos"("voluntarioId");

-- CreateIndex
CREATE INDEX "aportes_creadoEn_idx" ON "aportes"("creadoEn" DESC);

-- CreateIndex
CREATE INDEX "aportes_padreId_idx" ON "aportes"("padreId");

-- AddForeignKey
ALTER TABLE "parroquias" ADD CONSTRAINT "parroquias_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_huerto" ADD CONSTRAINT "solicitudes_huerto_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_huerto" ADD CONSTRAINT "solicitudes_huerto_parroquiaId_fkey" FOREIGN KEY ("parroquiaId") REFERENCES "parroquias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_huerto" ADD CONSTRAINT "solicitudes_huerto_revisadaPorId_fkey" FOREIGN KEY ("revisadaPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_huerto" ADD CONSTRAINT "solicitudes_huerto_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huertos" ADD CONSTRAINT "huertos_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huertos" ADD CONSTRAINT "huertos_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huertos" ADD CONSTRAINT "huertos_parroquiaId_fkey" FOREIGN KEY ("parroquiaId") REFERENCES "parroquias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_responsables" ADD CONSTRAINT "historial_responsables_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_responsables" ADD CONSTRAINT "historial_responsables_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voluntarios_huerto" ADD CONSTRAINT "voluntarios_huerto_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "voluntarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voluntarios_huerto" ADD CONSTRAINT "voluntarios_huerto_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_nivel" ADD CONSTRAINT "solicitudes_nivel_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "voluntarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_nivel" ADD CONSTRAINT "solicitudes_nivel_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantas" ADD CONSTRAINT "plantas_propuestaPorId_fkey" FOREIGN KEY ("propuestaPorId") REFERENCES "huertos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huerto_plantas" ADD CONSTRAINT "huerto_plantas_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huerto_plantas" ADD CONSTRAINT "huerto_plantas_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "plantas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "plantas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "ciclos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_registradaPorId_fkey" FOREIGN KEY ("registradaPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_revisadaPorId_fkey" FOREIGN KEY ("revisadaPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participaciones" ADD CONSTRAINT "participaciones_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participaciones" ADD CONSTRAINT "participaciones_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "voluntarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_actividad" ADD CONSTRAINT "archivos_actividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paquetes" ADD CONSTRAINT "paquetes_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodega_items" ADD CONSTRAINT "bodega_items_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_puntos" ADD CONSTRAINT "movimientos_puntos_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "voluntarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_puntos" ADD CONSTRAINT "movimientos_puntos_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_puntos" ADD CONSTRAINT "movimientos_puntos_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_retiradoPorId_fkey" FOREIGN KEY ("retiradoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "aportes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

