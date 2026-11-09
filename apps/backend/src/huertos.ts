import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  cicloTerminado,
  estadoPasos,
  MAX_INTENTOS,
  PASO_POR_TIPO,
  plantaAptaAltitud,
  puedeRegistrar,
  recomendacionDelDia,
  validarActividad,
  VARIANTES_POR_DISENO,
  type TipoActividad,
  type TipoDiseno,
} from '@nexo/shared';
import { aArchivos, borrarArchivos, MAX_EVIDENCIAS, opcionesArchivos } from './archivos';
import { Auth, Usuario, UsuarioJwt } from './auth';
import {
  ActividadEntrada,
  BodegaItemDto,
  CicloDto,
  ElegirPlantaDto,
  EstadoVoluntarioDto,
  FracasoDto,
  HuertoOperativoDto,
  OmitirPasoDto,
  PlantaDto,
  SolicitudNivelDto,
  VoluntarioDto,
} from './dto';
import { aFecha, deFecha, GamificacionService, hoyEcuador } from './gamificacion';
import { PrismaService } from './prisma.service';

const ACTIVIDAD_DETALLE = {
  id: true,
  tipo: true,
  fecha: true,
  hora: true,
  faseLunar: true,
  detalle: true,
  advertencias: true,
  cumplida: true,
  estadoEvidencia: true,
  intento: true,
  motivoRechazo: true,
  puntosOtorgados: true,
  creadaEn: true,
  participaciones: { select: { horas: true, voluntario: { select: { id: true, nombre: true } } } },
  archivos: { select: { id: true, url: true, tipo: true, nombre: true, intento: true }, orderBy: { creadoEn: 'asc' as const } },
} as const;

/** Lo que registra el responsable: el único con cuenta en su huerto (reunión MSP). */
@Injectable()
export class HuertosService {
  constructor(
    private readonly db: PrismaService,
    private readonly gam: GamificacionService,
  ) {}

  /** El huerto existe, está activo y el usuario es su responsable actual. */
  async propio(usuarioId: string, huertoId: string) {
    const h = await this.db.huerto.findUnique({ where: { id: huertoId } });
    if (!h || !h.activo) throw new NotFoundException('Huerto no encontrado.');
    if (h.responsableId !== usuarioId) throw new ForbiddenException('Solo el responsable del huerto puede hacer esto.');
    return h;
  }

  private async cicloPropio(usuarioId: string, cicloId: string) {
    const c = await this.db.ciclo.findUnique({ where: { id: cicloId }, include: { planta: true } });
    if (!c) throw new NotFoundException('Ciclo no encontrado.');
    const huerto = await this.propio(usuarioId, c.huertoId);
    return { ciclo: c, huerto };
  }

  async detalle(usuarioId: string, id: string) {
    await this.propio(usuarioId, id);
    const h = await this.db.huerto.findUniqueOrThrow({
      where: { id },
      include: {
        provincia: { select: { nombre: true } },
        parroquia: { select: { nombre: true } },
        plantas: { include: { planta: true }, orderBy: { desde: 'asc' } },
        _count: { select: { voluntarios: { where: { activo: true } } } },
      },
    });
    const [ciclos, pendientes, rechazadas] = await Promise.all([
      this.ciclos(usuarioId, id, true),
      this.db.actividad.count({ where: { huertoId: id, estadoEvidencia: 'PENDIENTE' } }),
      this.db.actividad.count({ where: { huertoId: id, estadoEvidencia: 'RECHAZADA', intento: { lt: MAX_INTENTOS } } }),
    ]);
    return { ...h, ciclosActivos: ciclos, evidencias: { pendientes, rechazadas }, recomendacion: recomendacionDelDia(hoyEcuador()) };
  }

  async actualizar(usuarioId: string, id: string, d: HuertoOperativoDto) {
    const h = await this.propio(usuarioId, id);
    if (d.subtipos?.some((s) => !(VARIANTES_POR_DISENO[h.tipo] as string[]).includes(s)))
      throw new BadRequestException({ errores: [{ campo: 'subtipos', mensaje: 'Algún subtipo no corresponde al tipo de huerto.' }] });
    return this.db.huerto.update({ where: { id }, data: d as never, select: { id: true } });
  }

  // ─────────── Voluntarios ───────────
  async voluntarios(usuarioId: string, huertoId: string) {
    await this.propio(usuarioId, huertoId);
    const vs = await this.db.voluntarioHuerto.findMany({
      where: { huertoId },
      orderBy: [{ activo: 'desc' }, { desde: 'asc' }],
      select: {
        activo: true,
        desde: true,
        voluntario: {
          select: {
            id: true,
            nombre: true,
            fechaNacimiento: true,
            genero: true,
            nivel: true,
            puntos: true,
            horasValidadas: true,
            _count: { select: { huertos: true } },
            solicitudesNivel: { where: { huertoId }, orderBy: { creadaEn: 'desc' }, take: 1, select: { nivel: true, estado: true, motivo: true } },
          },
        },
      },
    });
    return Promise.all(
      vs.map(async ({ voluntario: v, activo, desde }) => ({
        id: v.id,
        nombre: v.nombre,
        fechaNacimiento: deFecha(v.fechaNacimiento),
        genero: v.genero,
        nivel: v.nivel,
        puntos: v.puntos,
        horas: Number(v.horasValidadas),
        otrosHuertos: v._count.huertos - 1,
        solicitudNivel: v.solicitudesNivel[0] ?? null,
        activo,
        desde,
        ...(await this.gam.perfilVoluntario(v.id, v.nivel)),
      })),
    );
  }

  async agregarVoluntario(usuarioId: string, huertoId: string, d: VoluntarioDto) {
    await this.propio(usuarioId, huertoId);
    if (d.fechaNacimiento > hoyEcuador())
      throw new BadRequestException({ errores: [{ campo: 'fechaNacimiento', mensaje: 'La fecha de nacimiento no puede ser futura.' }] });
    if (d.nivelSolicitado && (d.justificacion?.trim().length ?? 0) < 20)
      throw new BadRequestException({ errores: [{ campo: 'justificacion', mensaje: 'Explica la experiencia del voluntario (al menos 20 caracteres).' }] });
    return this.db.$transaction(async (tx) => {
      // Un voluntario puede estar en varios huertos: si la cédula ya existe, se reutiliza su registro.
      let v = d.cedula ? await tx.voluntario.findUnique({ where: { cedula: d.cedula } }) : null;
      const existia = !!v;
      if (v && (await tx.voluntarioHuerto.findUnique({ where: { voluntarioId_huertoId: { voluntarioId: v.id, huertoId } } })))
        throw new ConflictException({ errores: [{ campo: 'cedula', mensaje: 'Ese voluntario ya está en este huerto.' }] });
      v ??= await tx.voluntario.create({
        data: { nombre: d.nombre.trim(), cedula: d.cedula || null, fechaNacimiento: aFecha(d.fechaNacimiento), genero: d.genero as never },
      });
      await tx.voluntarioHuerto.create({ data: { voluntarioId: v.id, huertoId } });
      if (d.nivelSolicitado)
        await tx.solicitudNivel.create({ data: { voluntarioId: v.id, huertoId, nivel: d.nivelSolicitado as never, justificacion: d.justificacion!.trim() } });
      return { id: v.id, reutilizado: existia };
    });
  }

  /** No se expulsa a nadie: el responsable marca al voluntario como inactivo o lo reactiva. */
  async estadoVoluntario(usuarioId: string, huertoId: string, voluntarioId: string, d: EstadoVoluntarioDto) {
    await this.propio(usuarioId, huertoId);
    await this.db.voluntarioHuerto.update({ where: { voluntarioId_huertoId: { voluntarioId, huertoId } }, data: { activo: d.activo } });
    return { activo: d.activo };
  }

  async solicitarNivel(usuarioId: string, huertoId: string, voluntarioId: string, d: SolicitudNivelDto) {
    await this.propio(usuarioId, huertoId);
    const vh = await this.db.voluntarioHuerto.findUnique({ where: { voluntarioId_huertoId: { voluntarioId, huertoId } }, include: { voluntario: true } });
    if (!vh) throw new NotFoundException('Voluntario no encontrado en este huerto.');
    const orden = ['APRENDIZ', 'OFICIAL', 'MAESTRO'];
    if (orden.indexOf(d.nivel) <= orden.indexOf(vh.voluntario.nivel)) throw new ConflictException('El voluntario ya tiene ese nivel o uno mayor.');
    if (await this.db.solicitudNivel.findFirst({ where: { voluntarioId, estado: 'PENDIENTE' } }))
      throw new ConflictException('Ya hay una solicitud de nivel pendiente para este voluntario.');
    return this.db.solicitudNivel.create({ data: { voluntarioId, huertoId, nivel: d.nivel as never, justificacion: d.justificacion.trim() }, select: { id: true } });
  }

  // ─────────── Plantas ───────────
  /** Catálogo filtrado por la altitud del huerto; las de otra altitud se marcan para advertir. */
  async catalogo(usuarioId: string, huertoId: string) {
    const h = await this.propio(usuarioId, huertoId);
    const [plantas, elegidas, propuestas] = await Promise.all([
      this.db.planta.findMany({ where: { estado: 'APROBADA' }, orderBy: { nombreComun: 'asc' } }),
      this.db.huertoPlanta.findMany({ where: { huertoId }, select: { plantaId: true } }),
      this.db.planta.findMany({ where: { propuestaPorId: huertoId, estado: { not: 'APROBADA' } }, orderBy: { creadaEn: 'desc' } }),
    ]);
    const ya = new Set(elegidas.map((e) => e.plantaId));
    return {
      altitud: h.altitud,
      plantas: plantas.map((p) => ({ ...p, apta: plantaAptaAltitud(h.altitud, p.altitudMin, p.altitudMax), elegida: ya.has(p.id) })),
      propuestas,
    };
  }

  async elegirPlanta(usuarioId: string, huertoId: string, d: ElegirPlantaDto) {
    const h = await this.propio(usuarioId, huertoId);
    const p = await this.db.planta.findFirst({ where: { id: d.plantaId, estado: 'APROBADA' } });
    if (!p) throw new BadRequestException({ errores: [{ campo: 'plantaId', mensaje: 'Elige una planta del catálogo del MSP.' }] });
    if (await this.db.huertoPlanta.findUnique({ where: { huertoId_plantaId: { huertoId, plantaId: p.id } } }))
      throw new ConflictException('Esa planta ya está en tu huerto.');
    const apta = plantaAptaAltitud(h.altitud, p.altitudMin, p.altitudMax);
    // Reunión MSP: si la planta es de otra altitud, el sistema solo advierte («¿está seguro?») pero lo permite.
    if (!apta && !d.confirmarAltitud)
      throw new ConflictException({
        requiereConfirmacion: true,
        advertencias: [
          {
            codigo: 'ALTITUD',
            mensaje: `${p.nombreComun} crece entre ${p.altitudMin ?? 0} y ${p.altitudMax ?? '—'} m y tu huerto está a ${h.altitud} m. Puede que no se adapte.`,
          },
        ],
      });
    await this.db.huertoPlanta.create({ data: { huertoId, plantaId: p.id, fueraDeAltitud: !apta } });
    return { plantaId: p.id, fueraDeAltitud: !apta };
  }

  /** «Solicitar añadir planta»: el MSP la analiza antes de que entre al catálogo. */
  async proponerPlanta(usuarioId: string, huertoId: string, d: PlantaDto, foto?: Express.Multer.File) {
    await this.propio(usuarioId, huertoId);
    const archivos = aArchivos(foto ? [foto] : [], { requerido: false });
    if (archivos[0] && archivos[0].tipo !== 'FOTO') {
      borrarArchivos([foto!]);
      throw new BadRequestException({ errores: [{ campo: 'foto', mensaje: 'Adjunta una foto, no un video.' }] });
    }
    if (await this.db.planta.findUnique({ where: { nombreCientifico: d.nombreCientifico.trim() } }))
      throw new ConflictException({ errores: [{ campo: 'nombreCientifico', mensaje: 'Esa planta ya está en el catálogo o en revisión.' }] });
    const { esMedicinal: _, ...datos } = d;
    return this.db.planta.create({
      data: {
        ...datos,
        nombreCientifico: d.nombreCientifico.trim(),
        otrosNombres: d.otrosNombres ?? [],
        provincias: d.provincias ?? [],
        ciclo: d.ciclo as never,
        cualidad: d.cualidad as never,
        fotoUrl: archivos[0]?.url ?? null,
        estado: 'PENDIENTE',
        propuestaPorId: huertoId,
      },
      select: { id: true },
    });
  }

  // ─────────── Ciclos y actividades ───────────
  async ciclos(usuarioId: string, huertoId: string, soloActivos = false) {
    await this.propio(usuarioId, huertoId);
    const cs = await this.db.ciclo.findMany({
      where: { huertoId, ...(soloActivos ? { estado: 'ACTIVO' } : {}) },
      orderBy: [{ estado: 'asc' }, { iniciadoEn: 'desc' }],
      include: {
        planta: { select: { id: true, nombreComun: true, nombreCientifico: true, cualidad: true, ciclo: true } },
        actividades: { orderBy: [{ fecha: 'asc' }, { creadaEn: 'asc' }], select: ACTIVIDAD_DETALLE },
      },
    });
    return cs.map((c) => {
      const e = estadoPasos(c.actividades.map((a) => a.tipo));
      return {
        ...c,
        actividades: c.actividades.map((a) => ({ ...a, fecha: deFecha(a.fecha), participaciones: a.participaciones.map((p) => ({ ...p, horas: Number(p.horas) })) })),
        siguiente: c.estado === 'ACTIVO' ? e.siguiente : null,
        repetibles: c.estado === 'ACTIVO' ? e.repetibles : [],
      };
    });
  }

  async iniciarCiclo(usuarioId: string, huertoId: string, d: CicloDto) {
    await this.propio(usuarioId, huertoId);
    if (!(await this.db.huertoPlanta.findUnique({ where: { huertoId_plantaId: { huertoId, plantaId: d.plantaId } } })))
      throw new BadRequestException({ errores: [{ campo: 'plantaId', mensaje: 'Primero agrega la planta al huerto.' }] });
    if (await this.db.ciclo.findFirst({ where: { huertoId, plantaId: d.plantaId, estado: 'ACTIVO' } }))
      throw new ConflictException('Esa planta ya tiene un ciclo activo: las plantas del mismo tipo se siembran y cosechan juntas.');
    return this.db.ciclo.create({ data: { huertoId, plantaId: d.plantaId }, select: { id: true } });
  }

  /** Cosecha dañada (helada, descuido…): el ciclo queda fallido con su causa; deja de ganar los puntos restantes. */
  async fracaso(usuarioId: string, cicloId: string, d: FracasoDto) {
    const { ciclo } = await this.cicloPropio(usuarioId, cicloId);
    if (ciclo.estado !== 'ACTIVO') throw new ConflictException('El ciclo ya está cerrado.');
    await this.db.ciclo.update({
      where: { id: cicloId },
      data: { estado: 'FALLIDO', causaFracaso: d.causa as never, justificacion: d.justificacion.trim(), cerradoEn: new Date() },
    });
    return { estado: 'FALLIDO' };
  }

  /**
   * Registra el paso del ciclo con sus participantes, horas y evidencia (multipart: `datos` en JSON + `evidencias`).
   * Errores bloquean; advertencias del calendario se confirman. Los puntos llegan cuando el MSP valida la evidencia.
   */
  async registrar(usuarioId: string, cicloId: string, datos: string, archivos: Express.Multer.File[] = []) {
    try {
      let e: ActividadEntrada;
      try {
        e = JSON.parse(datos ?? '');
      } catch {
        throw new BadRequestException('Faltan los datos de la actividad.');
      }
      const { ciclo, huerto } = await this.cicloPropio(usuarioId, cicloId);
      if (ciclo.estado !== 'ACTIVO') throw new ConflictException('El ciclo ya está cerrado.');

      const previas = await this.db.actividad.findMany({ where: { cicloId }, orderBy: { fecha: 'asc' }, select: { tipo: true, fecha: true } });
      if (!puedeRegistrar(e.tipo as TipoActividad, previas.map((a) => a.tipo))) {
        const sig = estadoPasos(previas.map((a) => a.tipo)).siguiente;
        throw new ConflictException(sig ? `Ahora corresponde: ${sig.nombre}. Registra los pasos en orden.` : 'El ciclo ya terminó.');
      }
      const voluntarios = (await this.db.voluntarioHuerto.findMany({ where: { huertoId: huerto.id, activo: true }, select: { voluntarioId: true } })).map(
        (v) => v.voluntarioId,
      );
      const horasDelDia: Record<string, number> = {};
      if (e.fecha && /^\d{4}-\d{2}-\d{2}$/.test(e.fecha) && e.participantes?.length) {
        const ya = await this.db.participacion.groupBy({
          by: ['voluntarioId'],
          where: { voluntarioId: { in: e.participantes.map((p) => String(p.voluntarioId)) }, actividad: { fecha: aFecha(e.fecha) } },
          _sum: { horas: true },
        });
        for (const y of ya) horasDelDia[y.voluntarioId] = Number(y._sum.horas ?? 0);
      }
      const bano = previas.find((a) => a.tipo === 'BANO_PREVIO_COSECHA');
      const r = validarActividad(
        { ...e, participantes: e.participantes?.map((p) => ({ voluntarioId: String(p.voluntarioId), horas: Number(p.horas) })) },
        {
          hoy: hoyEcuador(),
          cualidad: ciclo.planta.cualidad,
          voluntarios,
          horasDelDia,
          fechaPasoAnterior: previas.length ? deFecha(previas[previas.length - 1].fecha) : undefined,
          fechaBano: bano ? deFecha(bano.fecha) : undefined,
        },
      );
      if (r.errores.length) throw new BadRequestException({ errores: r.errores });
      if (r.advertencias.length && !e.confirmarAdvertencias) throw new ConflictException({ requiereConfirmacion: true, advertencias: r.advertencias });
      const evidencias = aArchivos(archivos);

      const tipo = e.tipo as TipoActividad;
      const d = e.detalle ?? {};
      const actividad = await this.db.$transaction(async (tx) => {
        const a = await tx.actividad.create({
          data: {
            huertoId: huerto.id,
            cicloId,
            registradaPorId: usuarioId,
            tipo,
            fecha: aFecha(e.fecha!),
            hora: e.hora || null,
            faseLunar: r.faseLunar,
            detalle: d as object,
            advertencias: r.advertencias.map((x) => x.codigo),
            participaciones: { create: e.participantes!.map((p) => ({ voluntarioId: String(p.voluntarioId), horas: Number(p.horas) })) },
            archivos: { create: evidencias },
          },
        });
        if (tipo === 'EMPAQUETADO') {
          await tx.paquete.create({
            data: {
              actividadId: a.id,
              cantidad: Number(d.cantidad),
              indicacionesUso: String(d.indicacionesUso).trim(),
              dosificacion: String(d.dosificacion).trim(),
              contraindicaciones: String(d.contraindicaciones).trim(),
              fechaEmpaquetado: aFecha(e.fecha!),
              fechaCaducidad: aFecha(String(d.fechaCaducidad)),
              cualidad: ciclo.planta.cualidad,
            },
          });
        }
        if (cicloTerminado([...previas.map((x) => x.tipo), tipo]))
          await tx.ciclo.update({ where: { id: cicloId }, data: { estado: 'COMPLETADO', cerradoEn: new Date() } });
        return a;
      });
      const siguiente = estadoPasos([...previas.map((x) => x.tipo), tipo]).siguiente;
      return { id: actividad.id, conBono: r.advertencias.length === 0, siguiente };
    } catch (err) {
      borrarArchivos(archivos);
      throw err;
    }
  }

  /** Reunión MSP: si se saltan un paso no se puede impedir; queda como no cumplido y recibe 0 puntos. */
  async omitir(usuarioId: string, cicloId: string, d: OmitirPasoDto) {
    const { ciclo, huerto } = await this.cicloPropio(usuarioId, cicloId);
    if (ciclo.estado !== 'ACTIVO') throw new ConflictException('El ciclo ya está cerrado.');
    const previas = (await this.db.actividad.findMany({ where: { cicloId }, select: { tipo: true } })).map((a) => a.tipo);
    const sig = estadoPasos(previas).siguiente;
    if (!sig || sig.tipo !== d.tipo) throw new ConflictException('Solo se puede marcar como no realizado el paso que corresponde ahora.');
    await this.db.$transaction(async (tx) => {
      await tx.actividad.create({
        data: {
          huertoId: huerto.id,
          cicloId,
          registradaPorId: usuarioId,
          tipo: sig.tipo,
          fecha: aFecha(hoyEcuador()),
          detalle: d.nota ? { nota: d.nota.trim() } : {},
          cumplida: false,
          estadoEvidencia: 'SIN_EVIDENCIA',
        },
      });
      if (cicloTerminado([...previas, sig.tipo])) await tx.ciclo.update({ where: { id: cicloId }, data: { estado: 'COMPLETADO', cerradoEn: new Date() } });
    });
    return { siguiente: estadoPasos([...previas, sig.tipo]).siguiente };
  }

  /** Evidencia rechazada: segunda oportunidad con nuevas fotos o videos (vale la mitad de los puntos). */
  async reenviarEvidencia(usuarioId: string, actividadId: string, archivos: Express.Multer.File[] = []) {
    try {
      const a = await this.db.actividad.findUnique({ where: { id: actividadId } });
      if (!a) throw new NotFoundException('Actividad no encontrada.');
      await this.propio(usuarioId, a.huertoId);
      if (a.estadoEvidencia !== 'RECHAZADA') throw new ConflictException('Solo se reenvía la evidencia de una actividad rechazada.');
      if (a.intento >= MAX_INTENTOS) throw new ConflictException('Ya usaste la segunda oportunidad: esta actividad no suma puntos, pero el huerto puede seguir.');
      const evidencias = aArchivos(archivos).map((x) => ({ ...x, intento: a.intento + 1 }));
      await this.db.actividad.update({
        where: { id: actividadId },
        data: { intento: a.intento + 1, estadoEvidencia: 'PENDIENTE', archivos: { create: evidencias } },
      });
      return { intento: a.intento + 1 };
    } catch (err) {
      borrarArchivos(archivos);
      throw err;
    }
  }

  async misiones(usuarioId: string, huertoId: string) {
    await this.propio(usuarioId, huertoId);
    return this.gam.misiones(huertoId);
  }

  async espejo(usuarioId: string, huertoId: string) {
    await this.propio(usuarioId, huertoId);
    return this.gam.espejo(huertoId);
  }

  async puntos(usuarioId: string, huertoId: string) {
    const h = await this.propio(usuarioId, huertoId);
    const [ranking, movimientos] = await Promise.all([
      this.gam.ranking(h.tipo as TipoDiseno),
      this.db.movimientoPuntos.findMany({
        where: { huertoId },
        orderBy: { creadoEn: 'desc' },
        take: 30,
        select: { puntos: true, horas: true, creadoEn: true, voluntario: { select: { nombre: true } }, actividad: { select: { tipo: true, intento: true } } },
      }),
    ]);
    const fila = ranking.find((r) => r.id === huertoId);
    return {
      puntosTotales: h.puntosTotales,
      ranking: fila ? { posicion: fila.posicion, total: ranking.length, indice: fila.indice, puntosAnio: fila.puntos } : null,
      movimientos: movimientos.map((m) => ({ ...m, horas: Number(m.horas), paso: m.actividad ? PASO_POR_TIPO[m.actividad.tipo].nombre : null })),
    };
  }

  // ─────────── Bodega y producción ───────────
  async bodega(usuarioId: string, huertoId: string) {
    await this.propio(usuarioId, huertoId);
    const items = await this.db.bodegaItem.findMany({ where: { huertoId }, orderBy: [{ espacio: 'asc' }, { nombre: 'asc' }] });
    return items.map((i) => ({ ...i, cantidad: Number(i.cantidad) }));
  }

  async guardarItem(usuarioId: string, huertoId: string, d: BodegaItemDto, itemId?: string) {
    await this.propio(usuarioId, huertoId);
    const data = { espacio: d.espacio as never, nombre: d.nombre.trim(), cantidad: d.cantidad, unidad: d.unidad.trim(), nota: d.nota?.trim() || null };
    if (!itemId) return this.db.bodegaItem.create({ data: { ...data, huertoId }, select: { id: true } });
    const r = await this.db.bodegaItem.updateMany({ where: { id: itemId, huertoId }, data });
    if (!r.count) throw new NotFoundException('Elemento no encontrado.');
    return { id: itemId };
  }

  async borrarItem(usuarioId: string, huertoId: string, itemId: string) {
    await this.propio(usuarioId, huertoId);
    await this.db.bodegaItem.deleteMany({ where: { id: itemId, huertoId } });
  }

  async produccion(usuarioId: string, huertoId: string) {
    await this.propio(usuarioId, huertoId);
    const ps = await this.db.paquete.findMany({
      where: { actividad: { huertoId } },
      orderBy: { fechaEmpaquetado: 'desc' },
      include: { actividad: { select: { estadoEvidencia: true, ciclo: { select: { planta: { select: { nombreComun: true } } } } } } },
    });
    const hoy = hoyEcuador();
    return ps.map((p) => ({
      id: p.id,
      planta: p.actividad.ciclo.planta.nombreComun,
      cantidad: p.cantidad,
      cualidad: p.cualidad,
      indicacionesUso: p.indicacionesUso,
      dosificacion: p.dosificacion,
      contraindicaciones: p.contraindicaciones,
      fechaEmpaquetado: deFecha(p.fechaEmpaquetado),
      fechaCaducidad: deFecha(p.fechaCaducidad),
      vencido: deFecha(p.fechaCaducidad) < hoy,
      validado: p.actividad.estadoEvidencia === 'APROBADA',
    }));
  }
}

@ApiTags('responsable')
@Auth('RESPONSABLE')
@Controller()
export class HuertosController {
  constructor(private readonly svc: HuertosService) {}

  @Get('huertos/:id')
  detalle(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.detalle(u.sub, id);
  }

  @Patch('huertos/:id')
  actualizar(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body() d: HuertoOperativoDto) {
    return this.svc.actualizar(u.sub, id, d);
  }

  @Get('huertos/:id/voluntarios')
  voluntarios(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.voluntarios(u.sub, id);
  }

  @Post('huertos/:id/voluntarios')
  agregarVoluntario(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body() d: VoluntarioDto) {
    return this.svc.agregarVoluntario(u.sub, id, d);
  }

  @Patch('huertos/:id/voluntarios/:vid')
  estadoVoluntario(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Param('vid') vid: string, @Body() d: EstadoVoluntarioDto) {
    return this.svc.estadoVoluntario(u.sub, id, vid, d);
  }

  @Post('huertos/:id/voluntarios/:vid/nivel')
  solicitarNivel(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Param('vid') vid: string, @Body() d: SolicitudNivelDto) {
    return this.svc.solicitarNivel(u.sub, id, vid, d);
  }

  @Get('huertos/:id/catalogo')
  catalogo(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.catalogo(u.sub, id);
  }

  @Post('huertos/:id/plantas')
  elegirPlanta(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body() d: ElegirPlantaDto) {
    return this.svc.elegirPlanta(u.sub, id, d);
  }

  @Post('huertos/:id/plantas/propuestas')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('foto', opcionesArchivos))
  proponerPlanta(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body('datos') datos: string, @UploadedFile() foto?: Express.Multer.File) {
    return this.svc.proponerPlanta(u.sub, id, parsearPlanta(datos), foto);
  }

  @Get('huertos/:id/ciclos')
  ciclos(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.ciclos(u.sub, id);
  }

  @Post('huertos/:id/ciclos')
  iniciarCiclo(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body() d: CicloDto) {
    return this.svc.iniciarCiclo(u.sub, id, d);
  }

  @Post('ciclos/:cid/fracaso')
  @HttpCode(200)
  fracaso(@Usuario() u: UsuarioJwt, @Param('cid') cid: string, @Body() d: FracasoDto) {
    return this.svc.fracaso(u.sub, cid, d);
  }

  @Post('ciclos/:cid/actividades')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('evidencias', MAX_EVIDENCIAS, opcionesArchivos))
  registrar(@Usuario() u: UsuarioJwt, @Param('cid') cid: string, @Body('datos') datos: string, @UploadedFiles() archivos: Express.Multer.File[]) {
    return this.svc.registrar(u.sub, cid, datos, archivos);
  }

  @Post('ciclos/:cid/omitir')
  @HttpCode(200)
  omitir(@Usuario() u: UsuarioJwt, @Param('cid') cid: string, @Body() d: OmitirPasoDto) {
    return this.svc.omitir(u.sub, cid, d);
  }

  @Post('actividades/:aid/evidencia')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('evidencias', MAX_EVIDENCIAS, opcionesArchivos))
  reenviar(@Usuario() u: UsuarioJwt, @Param('aid') aid: string, @UploadedFiles() archivos: Express.Multer.File[]) {
    return this.svc.reenviarEvidencia(u.sub, aid, archivos);
  }

  @Get('huertos/:id/misiones')
  misiones(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.misiones(u.sub, id);
  }

  @Get('huertos/:id/virtual')
  espejo(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.espejo(u.sub, id);
  }

  @Get('huertos/:id/puntos')
  puntos(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.puntos(u.sub, id);
  }

  @Get('huertos/:id/bodega')
  bodega(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.bodega(u.sub, id);
  }

  @Post('huertos/:id/bodega')
  agregarItem(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body() d: BodegaItemDto) {
    return this.svc.guardarItem(u.sub, id, d);
  }

  @Patch('huertos/:id/bodega/:itemId')
  editarItem(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Param('itemId') itemId: string, @Body() d: BodegaItemDto) {
    return this.svc.guardarItem(u.sub, id, d, itemId);
  }

  @Delete('huertos/:id/bodega/:itemId')
  @HttpCode(204)
  borrarItem(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Param('itemId') itemId: string) {
    return this.svc.borrarItem(u.sub, id, itemId);
  }

  @Get('huertos/:id/produccion')
  produccion(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.produccion(u.sub, id);
  }
}

/** Los formularios multipart mandan la planta como JSON en `datos`; se valida igual que un cuerpo JSON. */
export function parsearPlanta(datos: string) {
  let crudo: unknown;
  try {
    crudo = JSON.parse(datos ?? '');
  } catch {
    throw new BadRequestException('Faltan los datos de la planta.');
  }
  const d = plainToInstance(PlantaDto, crudo);
  const errs = validateSync(d, { whitelist: true, stopAtFirstError: true });
  if (errs.length)
    throw new BadRequestException({ errores: errs.map((e) => ({ campo: e.property, mensaje: Object.values(e.constraints ?? {})[0] ?? 'Dato inválido.' })) });
  return d;
}
