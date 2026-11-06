-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('VOLUNTARIO', 'MODERADOR');

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
    "passwordHash" TEXT NOT NULL,
    "fechaNacimiento" DATE NOT NULL,
    "genero" "Genero" NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'VOLUNTARIO',
    "nivel" "NivelMiembro" NOT NULL DEFAULT 'APRENDIZ',
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "consentimientoDatosEn" TIMESTAMP(3) NOT NULL,
    "versionPolitica" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunidades" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "contactoNombre" TEXT,
    "contactoTelefono" TEXT,
    "contactoCorreo" TEXT,
    "puntosTotales" INTEGER NOT NULL DEFAULT 0,
    "ultimoCambioPuntos" TIMESTAMP(3),
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comunidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membresias" (
    "usuarioId" TEXT NOT NULL,
    "comunidadId" TEXT NOT NULL,
    "esResponsable" BOOLEAN NOT NULL DEFAULT false,
    "desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membresias_pkey" PRIMARY KEY ("usuarioId","comunidadId")
);

-- CreateTable
CREATE TABLE "huertos" (
    "id" TEXT NOT NULL,
    "comunidadId" TEXT NOT NULL,
    "nombre" TEXT,
    "provinciaId" INTEGER NOT NULL,
    "parroquiaId" INTEGER NOT NULL,
    "direccion" TEXT,
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "tipoCerca" "TipoCerca",
    "materialCerca" TEXT,
    "areaM2" DECIMAL(10,2),
    "tipoSuelo" "TipoSuelo",
    "tipoAgua" "TipoAgua",
    "detalleAgua" TEXT,
    "tipoAbono" "TipoAbono",
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "huertos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "huerto_disenos" (
    "id" TEXT NOT NULL,
    "huertoId" TEXT NOT NULL,
    "tipo" "TipoDiseno" NOT NULL,
    "variante" "VarianteDiseno" NOT NULL,

    CONSTRAINT "huerto_disenos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodega_espacios" (
    "id" TEXT NOT NULL,
    "huertoId" TEXT NOT NULL,
    "espacio" "EspacioBodega" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "contenido" TEXT,

    CONSTRAINT "bodega_espacios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantas" (
    "id" TEXT NOT NULL,
    "huertoId" TEXT NOT NULL,
    "nombreCientifico" TEXT,
    "nombreComun" TEXT NOT NULL,
    "otrosNombres" TEXT[],
    "familiaBotanica" TEXT,
    "altitudMin" INTEGER,
    "altitudMax" INTEGER,
    "provincias" TEXT[],
    "ciclo" "CicloPlanta" NOT NULL,
    "cualidad" "CualidadPlanta" NOT NULL,
    "usosMedicinales" TEXT NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plantas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_planta" (
    "id" TEXT NOT NULL,
    "plantaId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,

    CONSTRAINT "fotos_planta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" TEXT NOT NULL,
    "huertoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "plantaId" TEXT,
    "tipo" "TipoActividad" NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TEXT,
    "faseLunar" "FaseLunar",
    "detalle" JSONB NOT NULL,
    "advertencias" TEXT[],
    "puntosBase" INTEGER NOT NULL DEFAULT 0,
    "puntosBono" INTEGER NOT NULL DEFAULT 0,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivos_actividad" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "tipo" "TipoArchivo" NOT NULL,
    "url" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivos_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paquetes" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "plantaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "indicacionesUso" TEXT NOT NULL,
    "dosificacion" TEXT NOT NULL,
    "contraindicaciones" TEXT NOT NULL,
    "fechaEmpaquetado" DATE NOT NULL,
    "fechaCaducidad" DATE NOT NULL,
    "cualidad" "CualidadPlanta" NOT NULL,

    CONSTRAINT "paquetes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_puntos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "comunidadId" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "actividadId" TEXT,
    "codigoRef" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_puntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talentos_miembro" (
    "usuarioId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "certificadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talentos_miembro_pkey" PRIMARY KEY ("usuarioId","codigo")
);

-- CreateTable
CREATE TABLE "insignias_miembro" (
    "usuarioId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "otorgadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insignias_miembro_pkey" PRIMARY KEY ("usuarioId","codigo")
);

-- CreateTable
CREATE TABLE "misiones_miembro" (
    "usuarioId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "completadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "misiones_miembro_pkey" PRIMARY KEY ("usuarioId","codigo")
);

-- CreateTable
CREATE TABLE "aportes" (
    "id" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retirado" BOOLEAN NOT NULL DEFAULT false,
    "retiradoPorId" TEXT,
    "retiradoEn" TIMESTAMP(3),

    CONSTRAINT "aportes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provincias_nombre_key" ON "provincias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "parroquias_provinciaId_nombre_key" ON "parroquias"("provinciaId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "comunidades_puntosTotales_idx" ON "comunidades"("puntosTotales" DESC);

-- CreateIndex
CREATE INDEX "membresias_comunidadId_idx" ON "membresias"("comunidadId");

-- CreateIndex
CREATE INDEX "huertos_comunidadId_idx" ON "huertos"("comunidadId");

-- CreateIndex
CREATE UNIQUE INDEX "huerto_disenos_huertoId_tipo_variante_key" ON "huerto_disenos"("huertoId", "tipo", "variante");

-- CreateIndex
CREATE UNIQUE INDEX "bodega_espacios_huertoId_espacio_key" ON "bodega_espacios"("huertoId", "espacio");

-- CreateIndex
CREATE INDEX "plantas_huertoId_idx" ON "plantas"("huertoId");

-- CreateIndex
CREATE INDEX "actividades_huertoId_fecha_idx" ON "actividades"("huertoId", "fecha");

-- CreateIndex
CREATE INDEX "actividades_usuarioId_tipo_idx" ON "actividades"("usuarioId", "tipo");

-- CreateIndex
CREATE INDEX "actividades_plantaId_tipo_idx" ON "actividades"("plantaId", "tipo");

-- CreateIndex
CREATE INDEX "archivos_actividad_actividadId_idx" ON "archivos_actividad"("actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "paquetes_actividadId_key" ON "paquetes"("actividadId");

-- CreateIndex
CREATE INDEX "movimientos_puntos_usuarioId_idx" ON "movimientos_puntos"("usuarioId");

-- CreateIndex
CREATE INDEX "movimientos_puntos_comunidadId_idx" ON "movimientos_puntos"("comunidadId");

-- CreateIndex
CREATE INDEX "aportes_creadoEn_idx" ON "aportes"("creadoEn" DESC);

-- AddForeignKey
ALTER TABLE "parroquias" ADD CONSTRAINT "parroquias_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_comunidadId_fkey" FOREIGN KEY ("comunidadId") REFERENCES "comunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huertos" ADD CONSTRAINT "huertos_comunidadId_fkey" FOREIGN KEY ("comunidadId") REFERENCES "comunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huertos" ADD CONSTRAINT "huertos_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huertos" ADD CONSTRAINT "huertos_parroquiaId_fkey" FOREIGN KEY ("parroquiaId") REFERENCES "parroquias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huerto_disenos" ADD CONSTRAINT "huerto_disenos_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bodega_espacios" ADD CONSTRAINT "bodega_espacios_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantas" ADD CONSTRAINT "plantas_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_planta" ADD CONSTRAINT "fotos_planta_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "plantas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_huertoId_fkey" FOREIGN KEY ("huertoId") REFERENCES "huertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "plantas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_actividad" ADD CONSTRAINT "archivos_actividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paquetes" ADD CONSTRAINT "paquetes_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paquetes" ADD CONSTRAINT "paquetes_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "plantas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_puntos" ADD CONSTRAINT "movimientos_puntos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_puntos" ADD CONSTRAINT "movimientos_puntos_comunidadId_fkey" FOREIGN KEY ("comunidadId") REFERENCES "comunidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_puntos" ADD CONSTRAINT "movimientos_puntos_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talentos_miembro" ADD CONSTRAINT "talentos_miembro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insignias_miembro" ADD CONSTRAINT "insignias_miembro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "misiones_miembro" ADD CONSTRAINT "misiones_miembro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aportes" ADD CONSTRAINT "aportes_retiradoPorId_fkey" FOREIGN KEY ("retiradoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

