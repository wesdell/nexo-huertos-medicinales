import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Injectable,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { huertoVirtual, puntosPorActividad, recomendacionDelDia, validarActividad, type TipoActividad } from '@nexo/shared';
import { JwtGuard, Usuario, UsuarioJwt } from './auth';
import { ActividadDto, HuertoDto, PlantaDto } from './dto';
import { PrismaService } from './prisma.service';

/** Fecha local de Ecuador (UTC−5) en formato AAAA-MM-DD. */
export const hoyEcuador = () => new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10);
const aFecha = (s: string) => new Date(`${s}T00:00:00Z`);

@Injectable()
export class HuertosService {
  constructor(private readonly db: PrismaService) {}

  private async membresia(usuarioId: string) {
    const m = await this.db.membresia.findFirst({ where: { usuarioId } });
    if (!m) throw new ForbiddenException('Primero crea o únete a una comunidad.');
    return m;
  }

  /** Huerto de la comunidad del usuario; verifica pertenencia y, si se pide, que sea responsable. */
  private async huerto(usuarioId: string, huertoId: string, soloResponsable = false) {
    const m = await this.membresia(usuarioId);
    const h = await this.db.huerto.findUnique({ where: { id: huertoId } });
    if (!h) throw new NotFoundException('Huerto no encontrado.');
    if (h.comunidadId !== m.comunidadId) throw new ForbiddenException('No tienes permiso para esta acción.');
    if (soloResponsable && !m.esResponsable) throw new ForbiddenException('Solo el responsable de la comunidad puede hacer esto.');
    return { huerto: h, membresia: m };
  }

  async crear(usuarioId: string, d: HuertoDto) {
    const m = await this.membresia(usuarioId);
    if (!m.esResponsable) throw new ForbiddenException('Solo el responsable de la comunidad puede registrar el huerto.');
    // ponytail: un huerto por comunidad en v1.
    if (await this.db.huerto.findFirst({ where: { comunidadId: m.comunidadId } }))
      throw new ConflictException('Tu comunidad ya tiene un huerto registrado.');
    const parroquia = await this.db.parroquia.findUnique({ where: { id: d.parroquiaId } });
    if (!parroquia || parroquia.provinciaId !== d.provinciaId)
      throw new BadRequestException({ errores: [{ campo: 'parroquiaId', mensaje: 'La parroquia no pertenece a la provincia elegida.' }] });
    return this.db.huerto.create({ data: { ...d, comunidadId: m.comunidadId } });
  }

  /** Inicio: huerto, plantas, puntos y recomendación del día. */
  async mio(usuarioId: string) {
    const m = await this.db.membresia.findFirst({ where: { usuarioId } });
    const huerto = m
      ? await this.db.huerto.findFirst({
          where: { comunidadId: m.comunidadId },
          include: {
            provincia: { select: { nombre: true } },
            parroquia: { select: { nombre: true } },
            plantas: { orderBy: { creadaEn: 'asc' } },
          },
        })
      : null;
    return { huerto, recomendacion: recomendacionDelDia(hoyEcuador()) };
  }

  async crearPlanta(usuarioId: string, huertoId: string, d: PlantaDto) {
    await this.huerto(usuarioId, huertoId, true);
    return this.db.planta.create({ data: { ...d, ciclo: d.ciclo as never, cualidad: d.cualidad as never, huertoId } });
  }

  async virtual(usuarioId: string, huertoId: string) {
    await this.huerto(usuarioId, huertoId);
    const [plantas, actividades] = await Promise.all([
      this.db.planta.findMany({ where: { huertoId }, orderBy: { creadaEn: 'asc' }, select: { id: true, nombreComun: true } }),
      this.db.actividad.findMany({ where: { huertoId }, select: { tipo: true, plantaId: true } }),
    ]);
    const v = huertoVirtual(
      plantas.map((p) => p.id),
      actividades,
    );
    return {
      progreso: v.progreso,
      plantas: v.plantas.map((r, i) => ({ ...r, nombreComun: plantas[i].nombreComun })),
    };
  }

  /**
   * HU-018 a HU-030: valida con @nexo/shared, pide confirmación si hay advertencias,
   * guarda y acredita puntos en una sola transacción.
   */
  async registrarActividad(usuarioId: string, huertoId: string, d: ActividadDto) {
    const { membresia } = await this.huerto(usuarioId, huertoId);
    const [plantas, siembras] = await Promise.all([
      this.db.planta.findMany({ where: { huertoId }, select: { id: true } }),
      this.db.actividad.findMany({ where: { huertoId, tipo: 'SIEMBRA' }, select: { plantaId: true }, distinct: ['plantaId'] }),
    ]);
    const r = validarActividad(d, {
      plantasDelHuerto: plantas.map((p) => p.id),
      plantasSembradas: siembras.map((s) => s.plantaId).filter((id): id is string => !!id),
      hoy: hoyEcuador(),
    });
    if (r.errores.length) throw new BadRequestException({ errores: r.errores });
    if (r.advertencias.length && !d.confirmarAdvertencias)
      throw new ConflictException({ requiereConfirmacion: true, advertencias: r.advertencias });

    const tipo = d.tipo as TipoActividad;
    const fecha = aFecha(d.fecha!);
    const repetida = !!(await this.db.actividad.findFirst({
      where: { usuarioId, huertoId, tipo, fecha, plantaId: d.plantaId ?? null },
    }));
    const pts = puntosPorActividad(tipo, r.advertencias.length > 0, repetida);
    const total = pts.base + pts.bono;

    return this.db.$transaction(async (tx) => {
      const actividad = await tx.actividad.create({
        data: {
          huertoId,
          usuarioId,
          plantaId: d.plantaId || null,
          tipo,
          fecha,
          hora: d.hora || null,
          faseLunar: r.faseLunar,
          detalle: (d.detalle ?? {}) as object,
          advertencias: r.advertencias.map((a) => a.codigo),
          puntosBase: pts.base,
          puntosBono: pts.bono,
        },
      });
      let puntosUsuario: number | undefined;
      if (total > 0) {
        await tx.movimientoPuntos.create({
          data: { usuarioId, comunidadId: membresia.comunidadId, puntos: total, motivo: 'ACTIVIDAD', actividadId: actividad.id },
        });
        puntosUsuario = (await tx.usuario.update({ where: { id: usuarioId }, data: { puntos: { increment: total } } })).puntos;
        await tx.comunidad.update({
          where: { id: membresia.comunidadId },
          data: { puntosTotales: { increment: total }, ultimoCambioPuntos: new Date() },
        });
      }
      return { id: actividad.id, puntos: pts, repetida, puntosUsuario };
    });
  }
}

@ApiTags('huertos')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('huertos')
export class HuertosController {
  constructor(private readonly svc: HuertosService) {}

  @Post()
  crear(@Usuario() u: UsuarioJwt, @Body() d: HuertoDto) {
    return this.svc.crear(u.sub, d);
  }

  @Get('mio')
  mio(@Usuario() u: UsuarioJwt) {
    return this.svc.mio(u.sub);
  }

  @Post(':id/plantas')
  crearPlanta(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body() d: PlantaDto) {
    return this.svc.crearPlanta(u.sub, id, d);
  }

  @Get(':id/virtual')
  virtual(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.virtual(u.sub, id);
  }

  @Post(':id/actividades')
  registrarActividad(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body() d: ActividadDto) {
    return this.svc.registrarActividad(u.sub, id, d);
  }
}
