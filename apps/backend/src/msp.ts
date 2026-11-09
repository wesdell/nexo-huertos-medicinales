import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Header,
  HttpCode,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CicloPlanta, CualidadPlanta, EstadoSolicitud, MAX_INTENTOS, NOMBRE_DISENO, NOMBRE_NIVEL, PASO_POR_TIPO, type EstadoSolicitud as TEstado } from '@nexo/shared';
import { aArchivos, borrarArchivos, opcionesArchivos } from './archivos';
import { Auth, claveTemporal, hashClave, Usuario, UsuarioJwt } from './auth';
import { CorreoService } from './correo';
import { ImportarPlantasDto, MotivoDto, PlantaDto, ResponsableDto } from './dto';
import { deFecha, GamificacionService } from './gamificacion';
import { PrismaService } from './prisma.service';

const estadoValido = (e?: string): TEstado | undefined => (e && Object.hasOwn(EstadoSolicitud, e) ? (e as TEstado) : undefined);
const csv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/** Técnico del MSP: aprueba solicitudes, valida evidencias y mantiene el registro centralizado. */
@Injectable()
export class MspService {
  constructor(
    private readonly db: PrismaService,
    private readonly gam: GamificacionService,
    private readonly correo: CorreoService,
  ) {}

  async resumen() {
    const [solicitudes, evidencias, plantas, niveles, reportes, huertos] = await Promise.all([
      this.db.solicitudHuerto.count({ where: { estado: 'PENDIENTE' } }),
      this.db.actividad.count({ where: { estadoEvidencia: 'PENDIENTE' } }),
      this.db.planta.count({ where: { estado: 'PENDIENTE' } }),
      this.db.solicitudNivel.count({ where: { estado: 'PENDIENTE' } }),
      this.db.aporte.count({ where: { reportes: { gt: 0 }, retirado: false } }),
      this.db.huerto.count({ where: { activo: true } }),
    ]);
    return { solicitudes, evidencias, plantas, niveles, reportes, huertos };
  }

  // ─────────── Solicitudes de huerto ───────────
  solicitudes(estado?: TEstado) {
    return this.db.solicitudHuerto.findMany({
      where: { estado: estado ?? 'PENDIENTE' },
      orderBy: { creadaEn: estado && estado !== 'PENDIENTE' ? 'desc' : 'asc' },
      include: { provincia: { select: { nombre: true } }, parroquia: { select: { nombre: true } }, revisadaPor: { select: { nombre: true } } },
      take: 100,
    });
  }

  /**
   * Aprueba el huerto y su responsable. Crea la cuenta (o reutiliza la existente) y envía usuario
   * y clave temporal por correo. Si el correo falla, no se aprueba nada.
   */
  async aprobar(tecnicoId: string, id: string) {
    const s = await this.db.solicitudHuerto.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Solicitud no encontrada.');
    if (s.estado !== 'PENDIENTE') throw new ConflictException('La solicitud ya fue revisada.');
    return this.db.$transaction(
      async (tx) => {
        let u = await tx.usuario.findUnique({ where: { email: s.email } });
        if (u && u.rol !== 'RESPONSABLE') throw new ConflictException('Ese correo pertenece a una cuenta del MSP. Pide otro correo a la persona.');
        const otraCedula = await tx.usuario.findUnique({ where: { cedula: s.cedula } });
        if (otraCedula && otraCedula.id !== u?.id) throw new ConflictException('Esa cédula ya tiene una cuenta con otro correo.');
        let clave: string | null = null;
        if (!u) {
          clave = claveTemporal();
          u = await tx.usuario.create({
            data: {
              nombre: s.nombreResponsable,
              email: s.email,
              cedula: s.cedula,
              celular: s.celular,
              rol: 'RESPONSABLE',
              passwordHash: await hashClave(clave),
              debeCambiarClave: true,
              consentimientoDatosEn: s.consentimientoDatosEn,
              versionPolitica: s.versionPolitica,
            },
          });
        }
        const h = await tx.huerto.create({
          data: {
            nombre: s.nombreHuerto,
            tipo: s.tipo,
            subtipos: s.subtipos,
            responsableId: u.id,
            provinciaId: s.provinciaId,
            parroquiaId: s.parroquiaId,
            direccion: s.direccion,
            latitud: s.latitud,
            longitud: s.longitud,
            altitud: s.altitud,
            historial: { create: { usuarioId: u.id, motivo: 'Solicitud aprobada' } },
          },
        });
        await tx.solicitudHuerto.update({ where: { id }, data: { estado: 'APROBADA', revisadaPorId: tecnicoId, revisadaEn: new Date(), huertoId: h.id } });
        await this.correo.credenciales(
          s.email,
          s.nombreResponsable,
          clave,
          `El Ministerio de Salud Pública aprobó tu huerto «${s.nombreHuerto}». Ya puedes registrar tus voluntarios, plantas y actividades.`,
        );
        return { huertoId: h.id, cuentaNueva: !!clave };
      },
      { timeout: 20_000 },
    );
  }

  /** Rechazada: queda archivada con el motivo y se avisa a la persona. */
  async rechazar(tecnicoId: string, id: string, d: MotivoDto) {
    const s = await this.db.solicitudHuerto.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Solicitud no encontrada.');
    if (s.estado !== 'PENDIENTE') throw new ConflictException('La solicitud ya fue revisada.');
    await this.db.solicitudHuerto.update({ where: { id }, data: { estado: 'RECHAZADA', motivo: d.motivo.trim(), revisadaPorId: tecnicoId, revisadaEn: new Date() } });
    await this.correo
      .enviar(
        s.email,
        'Nexo: tu solicitud de huerto',
        `Hola, ${s.nombreResponsable}:\n\nEl MSP revisó tu solicitud del huerto «${s.nombreHuerto}» y no pudo aprobarla por este motivo:\n\n${d.motivo.trim()}\n\nPuedes enviar una nueva solicitud cuando lo tengas resuelto.\n\nMinisterio de Salud Pública · Nexo Huertos Medicinales`,
      )
      .catch(() => undefined); // el rechazo queda archivado aunque el aviso no salga
    return { estado: 'RECHAZADA' };
  }

  // ─────────── Evidencias ───────────
  async evidencias(estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' = 'PENDIENTE') {
    const as = await this.db.actividad.findMany({
      where: { estadoEvidencia: estado },
      orderBy: { creadaEn: estado === 'PENDIENTE' ? 'asc' : 'desc' },
      take: 50,
      include: {
        huerto: { select: { id: true, nombre: true, provincia: { select: { nombre: true } } } },
        ciclo: { select: { planta: { select: { nombreComun: true, cualidad: true } } } },
        participaciones: { select: { horas: true, voluntario: { select: { nombre: true } } } },
        archivos: { orderBy: { creadoEn: 'asc' } },
        revisadaPor: { select: { nombre: true } },
      },
    });
    return as.map((a) => ({
      ...a,
      fecha: deFecha(a.fecha),
      paso: PASO_POR_TIPO[a.tipo].nombre,
      horas: a.participaciones.reduce((s, p) => s + Number(p.horas), 0),
      participaciones: a.participaciones.map((p) => ({ nombre: p.voluntario.nombre, horas: Number(p.horas) })),
    }));
  }

  /** Evidencia válida: se otorgan los puntos a los voluntarios y se recalculan niveles y ranking. */
  async aprobarEvidencia(tecnicoId: string, id: string) {
    const a = await this.db.actividad.findUnique({ where: { id } });
    if (!a) throw new NotFoundException('Actividad no encontrada.');
    if (a.estadoEvidencia !== 'PENDIENTE') throw new ConflictException('Esta evidencia ya fue revisada.');
    return this.db.$transaction(
      async (tx) => {
        await tx.actividad.update({ where: { id }, data: { estadoEvidencia: 'APROBADA', revisadaPorId: tecnicoId, revisadaEn: new Date(), motivoRechazo: null } });
        return { puntos: await this.gam.acreditar(tx, id) };
      },
      { timeout: 20_000 },
    );
  }

  /** Evidencia inválida (no es real, es de otro huerto, hecha con IA…): segunda oportunidad con menos puntos. */
  async rechazarEvidencia(tecnicoId: string, id: string, d: MotivoDto) {
    const a = await this.db.actividad.findUnique({ where: { id } });
    if (!a) throw new NotFoundException('Actividad no encontrada.');
    if (a.estadoEvidencia !== 'PENDIENTE') throw new ConflictException('Esta evidencia ya fue revisada.');
    await this.db.actividad.update({
      where: { id },
      data: { estadoEvidencia: 'RECHAZADA', motivoRechazo: d.motivo.trim(), revisadaPorId: tecnicoId, revisadaEn: new Date() },
    });
    return { estado: 'RECHAZADA', puedeReenviar: a.intento < MAX_INTENTOS };
  }

  // ─────────── Catálogo de plantas ───────────
  plantas(estado?: TEstado) {
    return this.db.planta.findMany({
      where: { estado: estado ?? 'APROBADA' },
      orderBy: { nombreComun: 'asc' },
      include: { propuestaPor: { select: { nombre: true } }, _count: { select: { huertos: true } } },
    });
  }

  async crearPlanta(d: PlantaDto) {
    if (await this.db.planta.findUnique({ where: { nombreCientifico: d.nombreCientifico.trim() } }))
      throw new ConflictException({ errores: [{ campo: 'nombreCientifico', mensaje: 'Esa planta ya está en el catálogo.' }] });
    const { esMedicinal: _, ...datos } = d;
    return this.db.planta.create({
      data: { ...datos, nombreCientifico: d.nombreCientifico.trim(), otrosNombres: d.otrosNombres ?? [], provincias: d.provincias ?? [], ciclo: d.ciclo as never, cualidad: d.cualidad as never },
      select: { id: true },
    });
  }

  async editarPlanta(id: string, d: PlantaDto) {
    const { esMedicinal: _, ...datos } = d;
    const r = await this.db.planta.updateMany({
      where: { id },
      data: { ...datos, otrosNombres: d.otrosNombres ?? [], provincias: d.provincias ?? [], ciclo: d.ciclo as never, cualidad: d.cualidad as never },
    });
    if (!r.count) throw new NotFoundException('Planta no encontrada.');
    return { id };
  }

  async fotoPlanta(id: string, foto?: Express.Multer.File) {
    const [a] = aArchivos(foto ? [foto] : []);
    if (a.tipo !== 'FOTO') {
      borrarArchivos([foto!]);
      throw new BadRequestException({ errores: [{ campo: 'foto', mensaje: 'Adjunta una foto, no un video.' }] });
    }
    await this.db.planta.update({ where: { id }, data: { fotoUrl: a.url } });
    return { fotoUrl: a.url };
  }

  async revisarPlanta(id: string, aprobar: boolean, motivo?: string) {
    const p = await this.db.planta.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Planta no encontrada.');
    if (p.estado !== 'PENDIENTE') throw new ConflictException('La planta ya fue revisada.');
    await this.db.planta.update({ where: { id }, data: aprobar ? { estado: 'APROBADA', motivo: null } : { estado: 'RECHAZADA', motivo } });
    return { estado: aprobar ? 'APROBADA' : 'RECHAZADA' };
  }

  /**
   * Interfaz de carga del catálogo: CSV separado por punto y coma, una planta por línea.
   * Columnas: nombreComun;nombreCientifico;familiaBotanica;altitudMin;altitudMax;ciclo;cualidad;usosMedicinales;provincias
   * Actualiza las que ya existen (por nombre científico) y reporta las líneas con error.
   */
  async importar(d: ImportarPlantasDto) {
    const lineas = d.csv.replace(/^\uFEFF/, '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (/nombreComun/i.test(lineas[0] ?? '')) lineas.shift();
    const errores: { linea: number; mensaje: string }[] = [];
    let creadas = 0;
    let actualizadas = 0;
    for (const [i, linea] of lineas.entries()) {
      const c = linea.split(';').map((x) => x.trim());
      const [nombreComun, nombreCientifico, familiaBotanica, aMin, aMax, ciclo, cualidad, usos, provincias] = c;
      const num = (x: string) => (x ? Number(x) : null);
      const altitudMin = num(aMin);
      const altitudMax = num(aMax);
      const problema = !nombreComun || !nombreCientifico
        ? 'Faltan el nombre común o el científico.'
        : !Object.hasOwn(CicloPlanta, ciclo?.toUpperCase())
          ? 'El ciclo debe ser CORTO o LARGO.'
          : !Object.hasOwn(CualidadPlanta, cualidad?.toUpperCase())
            ? 'La cualidad debe ser CALIENTE o FRIA.'
            : !usos
              ? 'Faltan los usos medicinales.'
              : [altitudMin, altitudMax].some((n) => n !== null && !(Number.isInteger(n) && n >= 0 && n <= 6300))
                ? 'La altitud debe ser un entero entre 0 y 6300.'
                : null;
      if (problema) {
        errores.push({ linea: i + 1, mensaje: problema });
        continue;
      }
      const datos = {
        nombreComun,
        familiaBotanica: familiaBotanica || null,
        altitudMin,
        altitudMax,
        ciclo: ciclo.toUpperCase() as never,
        cualidad: cualidad.toUpperCase() as never,
        usosMedicinales: usos,
        provincias: provincias ? provincias.split('|').map((p) => p.trim()).filter(Boolean) : [],
      };
      const existe = await this.db.planta.findUnique({ where: { nombreCientifico } });
      if (existe) {
        await this.db.planta.update({ where: { id: existe.id }, data: datos });
        actualizadas++;
      } else {
        await this.db.planta.create({ data: { ...datos, nombreCientifico } });
        creadas++;
      }
    }
    return { creadas, actualizadas, errores };
  }

  // ─────────── Niveles con experiencia ───────────
  niveles(estado?: TEstado) {
    return this.db.solicitudNivel.findMany({
      where: { estado: estado ?? 'PENDIENTE' },
      orderBy: { creadaEn: 'asc' },
      include: { voluntario: { select: { nombre: true, nivel: true } }, huerto: { select: { nombre: true } } },
    });
  }

  async revisarNivel(id: string, aprobar: boolean, motivo?: string) {
    const s = await this.db.solicitudNivel.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Solicitud no encontrada.');
    if (s.estado !== 'PENDIENTE') throw new ConflictException('La solicitud ya fue revisada.');
    await this.db.$transaction([
      this.db.solicitudNivel.update({ where: { id }, data: aprobar ? { estado: 'APROBADA', revisadaEn: new Date() } : { estado: 'RECHAZADA', motivo, revisadaEn: new Date() } }),
      ...(aprobar ? [this.db.voluntario.update({ where: { id: s.voluntarioId }, data: { nivel: s.nivel } })] : []),
    ]);
    return { estado: aprobar ? 'APROBADA' : 'RECHAZADA' };
  }

  // ─────────── Registro centralizado ───────────
  async huertos() {
    const hs = await this.db.huerto.findMany({
      orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
      include: {
        provincia: { select: { nombre: true } },
        parroquia: { select: { nombre: true } },
        responsable: { select: { id: true, nombre: true, email: true, cedula: true, celular: true } },
        voluntarios: { where: { activo: true }, select: { voluntario: { select: { id: true, nombre: true, cedula: true, nivel: true, puntos: true } } } },
        _count: { select: { plantas: true, ciclos: true } },
      },
    });
    return hs.map(({ voluntarios, ...h }) => ({ ...h, voluntarios: voluntarios.map((v) => v.voluntario) }));
  }

  /** Cambio de responsable: un solo responsable a la vez. La persona nueva recibe su acceso por correo. */
  async cambiarResponsable(tecnicoId: string, huertoId: string, d: ResponsableDto) {
    const h = await this.db.huerto.findUnique({ where: { id: huertoId } });
    if (!h) throw new NotFoundException('Huerto no encontrado.');
    const email = d.email.trim().toLowerCase();
    return this.db.$transaction(
      async (tx) => {
        let u = await tx.usuario.findUnique({ where: { email } });
        if (u && u.rol !== 'RESPONSABLE') throw new ConflictException('Ese correo pertenece a una cuenta del MSP.');
        if (u?.id === h.responsableId) throw new ConflictException('Esa persona ya es la responsable del huerto.');
        const otraCedula = await tx.usuario.findUnique({ where: { cedula: d.cedula } });
        if (otraCedula && otraCedula.id !== u?.id) throw new ConflictException('Esa cédula ya tiene una cuenta con otro correo.');
        let clave: string | null = null;
        if (!u) {
          clave = claveTemporal();
          u = await tx.usuario.create({
            data: { nombre: d.nombre.trim(), email, cedula: d.cedula, celular: d.celular, rol: 'RESPONSABLE', passwordHash: await hashClave(clave), debeCambiarClave: true },
          });
        }
        await tx.historialResponsable.updateMany({ where: { huertoId, hasta: null }, data: { hasta: new Date() } });
        await tx.historialResponsable.create({ data: { huertoId, usuarioId: u.id, motivo: d.motivo?.trim() || 'Cambio registrado por el MSP' } });
        await tx.huerto.update({ where: { id: huertoId }, data: { responsableId: u.id } });
        await this.correo.credenciales(email, u.nombre, clave, `El MSP te registró como responsable del huerto «${h.nombre}».`);
        return { responsableId: u.id, cuentaNueva: !!clave };
      },
      { timeout: 20_000 },
    );
  }

  async activarHuerto(huertoId: string, activo: boolean) {
    await this.db.huerto.update({ where: { id: huertoId }, data: { activo } });
    return { activo };
  }

  /** Olvido de contraseña: el MSP genera una nueva clave temporal y la envía por correo. */
  async restablecerClave(usuarioId: string) {
    const u = await this.db.usuario.findUnique({ where: { id: usuarioId } });
    if (!u || u.rol !== 'RESPONSABLE') throw new NotFoundException('Responsable no encontrado.');
    const clave = claveTemporal();
    await this.db.$transaction(
      async (tx) => {
        await tx.usuario.update({ where: { id: u.id }, data: { passwordHash: await hashClave(clave), debeCambiarClave: true } });
        await this.correo.credenciales(u.email, u.nombre, clave, 'El MSP restableció tu contraseña.');
      },
      { timeout: 20_000 },
    );
    return { mensaje: 'Se envió una nueva contraseña temporal por correo.' };
  }

  /** Exporta el registro centralizado (huertos, responsables y voluntarios) para el financiamiento. */
  async registroCsv() {
    const hs = await this.huertos();
    const filas = [
      ['Huerto', 'Tipo', 'Activo', 'Provincia', 'Parroquia', 'Altitud', 'Responsable', 'Cédula responsable', 'Correo', 'Celular', 'Puntos', 'Voluntario', 'Cédula voluntario', 'Nivel'],
    ];
    for (const h of hs) {
      const base = [h.nombre, NOMBRE_DISENO[h.tipo], h.activo ? 'Sí' : 'No', h.provincia.nombre, h.parroquia.nombre, h.altitud, h.responsable.nombre, h.responsable.cedula, h.responsable.email, h.responsable.celular, h.puntosTotales];
      if (!h.voluntarios.length) filas.push([...base, '', '', ''].map(String));
      for (const v of h.voluntarios) filas.push([...base, v.nombre, v.cedula ?? '', NOMBRE_NIVEL[v.nivel]].map(String));
    }
    return '\uFEFF' + filas.map((f) => f.map(csv).join(';')).join('\r\n');
  }
}

@ApiTags('msp')
@Auth('TECNICO_MSP')
@Controller('msp')
export class MspController {
  constructor(private readonly svc: MspService) {}

  @Get('resumen')
  resumen() {
    return this.svc.resumen();
  }

  @Get('solicitudes')
  solicitudes(@Query('estado') estado?: string) {
    return this.svc.solicitudes(estadoValido(estado));
  }

  @Post('solicitudes/:id/aprobar')
  @HttpCode(200)
  aprobar(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.aprobar(u.sub, id);
  }

  @Post('solicitudes/:id/rechazar')
  @HttpCode(200)
  rechazar(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body() d: MotivoDto) {
    return this.svc.rechazar(u.sub, id, d);
  }

  @Get('evidencias')
  evidencias(@Query('estado') estado?: string) {
    return this.svc.evidencias(estado === 'APROBADA' || estado === 'RECHAZADA' ? estado : 'PENDIENTE');
  }

  @Post('evidencias/:id/aprobar')
  @HttpCode(200)
  aprobarEvidencia(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.aprobarEvidencia(u.sub, id);
  }

  @Post('evidencias/:id/rechazar')
  @HttpCode(200)
  rechazarEvidencia(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body() d: MotivoDto) {
    return this.svc.rechazarEvidencia(u.sub, id, d);
  }

  @Get('plantas')
  plantas(@Query('estado') estado?: string) {
    return this.svc.plantas(estadoValido(estado));
  }

  @Post('plantas')
  crearPlanta(@Body() d: PlantaDto) {
    return this.svc.crearPlanta(d);
  }

  @Patch('plantas/:id')
  editarPlanta(@Param('id') id: string, @Body() d: PlantaDto) {
    return this.svc.editarPlanta(id, d);
  }

  @Post('plantas/:id/foto')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('foto', opcionesArchivos))
  fotoPlanta(@Param('id') id: string, @UploadedFile() foto?: Express.Multer.File) {
    return this.svc.fotoPlanta(id, foto);
  }

  @Post('plantas/importar')
  @HttpCode(200)
  importar(@Body() d: ImportarPlantasDto) {
    return this.svc.importar(d);
  }

  @Post('plantas/:id/aprobar')
  @HttpCode(200)
  aprobarPlanta(@Param('id') id: string) {
    return this.svc.revisarPlanta(id, true);
  }

  @Post('plantas/:id/rechazar')
  @HttpCode(200)
  rechazarPlanta(@Param('id') id: string, @Body() d: MotivoDto) {
    return this.svc.revisarPlanta(id, false, d.motivo.trim());
  }

  @Get('niveles')
  niveles(@Query('estado') estado?: string) {
    return this.svc.niveles(estadoValido(estado));
  }

  @Post('niveles/:id/aprobar')
  @HttpCode(200)
  aprobarNivel(@Param('id') id: string) {
    return this.svc.revisarNivel(id, true);
  }

  @Post('niveles/:id/rechazar')
  @HttpCode(200)
  rechazarNivel(@Param('id') id: string, @Body() d: MotivoDto) {
    return this.svc.revisarNivel(id, false, d.motivo.trim());
  }

  @Get('huertos')
  huertos() {
    return this.svc.huertos();
  }

  @Get('registro.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="registro-huertos.csv"')
  registro() {
    return this.svc.registroCsv();
  }

  @Post('huertos/:id/responsable')
  @HttpCode(200)
  responsable(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body() d: ResponsableDto) {
    return this.svc.cambiarResponsable(u.sub, id, d);
  }

  @Post('huertos/:id/activar')
  @HttpCode(200)
  activar(@Param('id') id: string) {
    return this.svc.activarHuerto(id, true);
  }

  @Post('huertos/:id/desactivar')
  @HttpCode(200)
  desactivar(@Param('id') id: string) {
    return this.svc.activarHuerto(id, false);
  }

  @Post('usuarios/:id/restablecer')
  @HttpCode(200)
  restablecer(@Param('id') id: string) {
    return this.svc.restablecerClave(id);
  }
}
