import { BadRequestException, Body, ConflictException, Controller, Get, Injectable, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { coordenadasEnEcuador, plantaAptaAltitud, recomendacionDelDia, TipoDiseno, type TipoDiseno as TTipoDiseno, VARIANTES_POR_DISENO } from '@nexo/shared';
import { VERSION_POLITICA } from './auth';
import { SolicitudHuertoDto } from './dto';
import { GamificacionService, hoyEcuador } from './gamificacion';
import { PrismaService } from './prisma.service';

/** Coordenadas públicas redondeadas a ~1 km: el huerto puede estar en una casa. */
const aproximar = (n: unknown) => Math.round(Number(n) * 100) / 100;
const PLANTA_PUBLICA = {
  id: true,
  nombreComun: true,
  nombreCientifico: true,
  otrosNombres: true,
  familiaBotanica: true,
  altitudMin: true,
  altitudMax: true,
  provincias: true,
  ciclo: true,
  cualidad: true,
  usosMedicinales: true,
  parteUsada: true,
  dosificacion: true,
  contraindicaciones: true,
  fotoUrl: true,
} as const;

@Injectable()
export class PublicoService {
  constructor(
    private readonly db: PrismaService,
    private readonly gam: GamificacionService,
  ) {}

  /** Reunión MSP: «Solicitar crear huerto» desde la parte pública, con lo mínimo. */
  async solicitar(d: SolicitudHuertoDto) {
    const errores: { campo: string; mensaje: string }[] = [];
    const parroquia = await this.db.parroquia.findUnique({ where: { id: d.parroquiaId } });
    if (!parroquia || parroquia.provinciaId !== d.provinciaId) errores.push({ campo: 'parroquiaId', mensaje: 'La parroquia no pertenece a la provincia elegida.' });
    if (!coordenadasEnEcuador(d.latitud, d.longitud)) errores.push({ campo: 'latitud', mensaje: 'La ubicación debe estar dentro de Ecuador.' });
    const permitidos = VARIANTES_POR_DISENO[d.tipo as TTipoDiseno] as string[];
    if (d.subtipos.some((s) => !permitidos.includes(s))) errores.push({ campo: 'subtipos', mensaje: 'Algún subtipo no corresponde al tipo de huerto elegido.' });
    if (errores.length) throw new BadRequestException({ errores });

    const email = d.email.trim().toLowerCase();
    if (await this.db.solicitudHuerto.findFirst({ where: { cedula: d.cedula, estado: 'PENDIENTE' } }))
      throw new ConflictException('Ya tienes una solicitud pendiente. El MSP se comunicará contigo.');
    const s = await this.db.solicitudHuerto.create({
      data: {
        nombreHuerto: d.nombreHuerto.trim(),
        tipo: d.tipo as never,
        subtipos: d.subtipos as never,
        provinciaId: d.provinciaId,
        parroquiaId: d.parroquiaId,
        direccion: d.direccion?.trim() || null,
        latitud: d.latitud,
        longitud: d.longitud,
        altitud: d.altitud,
        nombreResponsable: d.nombreResponsable.trim(),
        cedula: d.cedula,
        email,
        celular: d.celular,
        consentimientoDatosEn: new Date(),
        versionPolitica: VERSION_POLITICA,
      },
      select: { id: true },
    });
    return { id: s.id, mensaje: 'Solicitud enviada. Un técnico del MSP te contactará para revisarla.' };
  }

  async resumen() {
    const [huertos, voluntarios, provincias, paquetes, plantas] = await Promise.all([
      this.db.huerto.count({ where: { activo: true } }),
      this.db.voluntarioHuerto.count({ where: { activo: true, huerto: { activo: true } } }),
      this.db.huerto.groupBy({ by: ['provinciaId'], where: { activo: true } }),
      this.db.paquete.aggregate({ where: { actividad: { estadoEvidencia: 'APROBADA' } }, _sum: { cantidad: true } }),
      this.db.planta.count({ where: { estado: 'APROBADA' } }),
    ]);
    return {
      huertos,
      voluntarios,
      provincias: provincias.length,
      paquetes: paquetes._sum.cantidad ?? 0,
      plantas,
      recomendacion: recomendacionDelDia(hoyEcuador()),
    };
  }

  async huertos() {
    const hs = await this.db.huerto.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        latitud: true,
        longitud: true,
        puntosTotales: true,
        provincia: { select: { nombre: true } },
        parroquia: { select: { nombre: true } },
        _count: { select: { voluntarios: { where: { activo: true } }, plantas: true } },
      },
    });
    return hs.map(({ latitud, longitud, _count, ...h }) => ({
      ...h,
      latitud: aproximar(latitud),
      longitud: aproximar(longitud),
      voluntarios: _count.voluntarios,
      plantas: _count.plantas,
    }));
  }

  /** Ficha pública y espejo digital de un huerto. */
  async huerto(id: string) {
    const h = await this.db.huerto.findFirst({
      where: { id, activo: true },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        subtipos: true,
        altitud: true,
        latitud: true,
        longitud: true,
        tipoCerca: true,
        tipoSuelo: true,
        tipoAgua: true,
        tipoAbono: true,
        areaM2: true,
        puntosTotales: true,
        creadoEn: true,
        provincia: { select: { nombre: true } },
        parroquia: { select: { nombre: true } },
        plantas: { select: { planta: { select: { id: true, nombreComun: true, nombreCientifico: true, cualidad: true, fotoUrl: true } } } },
        voluntarios: { where: { activo: true }, select: { voluntario: { select: { nivel: true } } } },
      },
    });
    if (!h) throw new NotFoundException('Huerto no encontrado.');
    const [espejo, misiones, ranking, historia, produccion] = await Promise.all([
      this.gam.espejo(id),
      this.gam.misiones(id),
      this.gam.ranking(h.tipo),
      this.db.archivoActividad.findMany({
        where: { tipo: 'FOTO', actividad: { huertoId: id, estadoEvidencia: 'APROBADA' } },
        orderBy: { creadoEn: 'desc' },
        take: 12,
        select: { id: true, url: true, actividad: { select: { tipo: true, fecha: true, ciclo: { select: { planta: { select: { nombreComun: true } } } } } } },
      }),
      this.db.paquete.aggregate({ where: { actividad: { huertoId: id, estadoEvidencia: 'APROBADA' } }, _sum: { cantidad: true } }),
    ]);
    const niveles = { APRENDIZ: 0, OFICIAL: 0, MAESTRO: 0 };
    for (const v of h.voluntarios) niveles[v.voluntario.nivel]++;
    const { voluntarios, plantas, latitud, longitud, ...resto } = h;
    return {
      ...resto,
      latitud: aproximar(latitud),
      longitud: aproximar(longitud),
      plantas: plantas.map((p) => p.planta),
      voluntarios: voluntarios.length,
      niveles,
      espejo,
      insignias: misiones.filter((m) => m.cumplida).map((m) => ({ codigo: m.codigo, insignia: m.insignia, descripcion: m.descripcion })),
      posicion: ranking.find((r) => r.id === id)?.posicion ?? null,
      totalRanking: ranking.length,
      paquetes: produccion._sum.cantidad ?? 0,
      historia,
    };
  }

  async estadisticas() {
    const [provincias, porTipo, porNivel, porAnio, plantas, ciclos] = await Promise.all([
      this.db.provincia.findMany({
        orderBy: { nombre: 'asc' },
        select: { id: true, nombre: true, region: true, _count: { select: { huertos: { where: { activo: true } } } } },
      }),
      this.db.huerto.groupBy({ by: ['tipo'], where: { activo: true }, _count: true }),
      this.db.voluntario.groupBy({ by: ['nivel'], where: { huertos: { some: { activo: true } } }, _count: true }),
      this.db.$queryRaw<{ anio: number; paquetes: bigint }[]>`
        SELECT EXTRACT(YEAR FROM p."fechaEmpaquetado")::int AS anio, SUM(p.cantidad) AS paquetes
        FROM paquetes p JOIN actividades a ON a.id = p."actividadId"
        WHERE a."estadoEvidencia" = 'APROBADA' GROUP BY 1 ORDER BY 1`,
      this.db.huertoPlanta.groupBy({ by: ['plantaId'], _count: true, orderBy: { _count: { plantaId: 'desc' } }, take: 8 }),
      this.db.ciclo.groupBy({ by: ['estado'], _count: true }),
    ]);
    const nombres = await this.db.planta.findMany({ where: { id: { in: plantas.map((p) => p.plantaId) } }, select: { id: true, nombreComun: true } });
    const nombre = new Map(nombres.map((p) => [p.id, p.nombreComun]));
    return {
      porProvincia: provincias.map((p) => ({ id: p.id, nombre: p.nombre, region: p.region, huertos: p._count.huertos })),
      porTipo: Object.values(TipoDiseno).map((t) => ({ tipo: t, huertos: porTipo.find((x) => x.tipo === t)?._count ?? 0 })),
      porNivel: (['APRENDIZ', 'OFICIAL', 'MAESTRO'] as const).map((n) => ({ nivel: n, voluntarios: porNivel.find((x) => x.nivel === n)?._count ?? 0 })),
      produccionPorAnio: porAnio.map((r) => ({ anio: r.anio, paquetes: Number(r.paquetes) })),
      plantasMasCultivadas: plantas.map((p) => ({ planta: nombre.get(p.plantaId) ?? '', huertos: p._count })),
      ciclos: Object.fromEntries(ciclos.map((c) => [c.estado, c._count])),
    };
  }

  async plantas(altitud?: number, q?: string) {
    const ps = await this.db.planta.findMany({
      where: {
        estado: 'APROBADA',
        ...(q ? { OR: [{ nombreComun: { contains: q, mode: 'insensitive' } }, { nombreCientifico: { contains: q, mode: 'insensitive' } }] } : {}),
      },
      orderBy: { nombreComun: 'asc' },
      select: PLANTA_PUBLICA,
    });
    return ps.map((p) => ({ ...p, apta: altitud === undefined ? null : plantaAptaAltitud(altitud, p.altitudMin, p.altitudMax) }));
  }

  async planta(id: string) {
    const p = await this.db.planta.findFirst({ where: { id, estado: 'APROBADA' }, select: { ...PLANTA_PUBLICA, _count: { select: { huertos: true } } } });
    if (!p) throw new NotFoundException('Planta no encontrada.');
    return p;
  }
}

@ApiTags('público')
@Controller('publico')
export class PublicoController {
  constructor(
    private readonly svc: PublicoService,
    private readonly gam: GamificacionService,
  ) {}

  @Post('solicitudes')
  solicitar(@Body() d: SolicitudHuertoDto) {
    return this.svc.solicitar(d);
  }

  @Get('resumen')
  resumen() {
    return this.svc.resumen();
  }

  @Get('huertos')
  huertos() {
    return this.svc.huertos();
  }

  @Get('huertos/:id')
  huerto(@Param('id') id: string) {
    return this.svc.huerto(id);
  }

  @Get('estadisticas')
  estadisticas() {
    return this.svc.estadisticas();
  }

  @Get('ranking')
  ranking(@Query('tipo') tipo?: string) {
    if (tipo && !Object.hasOwn(TipoDiseno, tipo)) throw new BadRequestException('Tipo de huerto no válido.');
    return this.gam.ranking(tipo as TTipoDiseno | undefined);
  }

  @Get('ranking/produccion')
  produccion(@Query('anio') anio?: string) {
    const a = anio ? Number(anio) : undefined;
    if (a !== undefined && !(Number.isInteger(a) && a >= 2000 && a <= 2100)) throw new BadRequestException('Año no válido.');
    return this.gam.rankingProduccion(a);
  }

  @Get('plantas')
  plantas(@Query('altitud') altitud?: string, @Query('q') q?: string) {
    const a = altitud ? Number(altitud) : undefined;
    return this.svc.plantas(Number.isFinite(a) ? a : undefined, q?.trim().slice(0, 60) || undefined);
  }

  @Get('plantas/:id')
  planta(@Param('id') id: string) {
    return this.svc.planta(id);
  }
}
