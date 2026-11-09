import { BadRequestException, Body, Controller, Get, HttpCode, Injectable, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriaAporte, REGLAS_FORO, type CategoriaAporte as TCategoria } from '@nexo/shared';
import { Auth, Usuario, UsuarioJwt } from './auth';
import { AporteDto, MotivoDto } from './dto';
import { PrismaService } from './prisma.service';

const AUTOR = { select: { nombre: true, rol: true, huertos: { where: { activo: true }, select: { nombre: true }, take: 1 } } } as const;

/** Foro de prácticas, saberes y sentires. Lectura pública; publican las personas con cuenta; modera el técnico del MSP. */
@Injectable()
export class ForoService {
  constructor(private readonly db: PrismaService) {}

  private publico<T extends { retirado: boolean; contenido: string; titulo: string | null }>(a: T) {
    return a.retirado ? { ...a, titulo: null, contenido: '' } : a;
  }

  async lista(categoria?: TCategoria) {
    const as = await this.db.aporte.findMany({
      where: { padreId: null, ...(categoria ? { categoria } : {}) },
      orderBy: { creadoEn: 'desc' },
      take: 50,
      include: { autor: AUTOR, _count: { select: { respuestas: { where: { retirado: false } } } } },
    });
    return as.map((a) => this.publico(a));
  }

  async hilo(id: string) {
    const a = await this.db.aporte.findUnique({
      where: { id },
      include: { autor: AUTOR, respuestas: { orderBy: { creadoEn: 'asc' }, include: { autor: AUTOR } } },
    });
    if (!a || a.padreId) throw new NotFoundException('Aporte no encontrado.');
    return { ...this.publico(a), respuestas: a.respuestas.map((r) => this.publico(r)) };
  }

  async publicar(autorId: string, d: AporteDto) {
    if (d.padreId) {
      const padre = await this.db.aporte.findUnique({ where: { id: d.padreId } });
      if (!padre || padre.padreId || padre.retirado) throw new BadRequestException('No se puede responder a ese aporte.');
    } else if (!d.titulo?.trim()) {
      throw new BadRequestException({ errores: [{ campo: 'titulo', mensaje: 'El título es obligatorio.' }] });
    }
    return this.db.aporte.create({
      data: { autorId, categoria: d.categoria as never, titulo: d.padreId ? null : d.titulo!.trim(), contenido: d.contenido.trim(), padreId: d.padreId || null },
      select: { id: true },
    });
  }

  async reportar(id: string) {
    const r = await this.db.aporte.updateMany({ where: { id, retirado: false }, data: { reportes: { increment: 1 } } });
    if (!r.count) throw new NotFoundException('Aporte no encontrado.');
    return { mensaje: 'Gracias. El técnico del MSP revisará el aporte.' };
  }

  reportados() {
    return this.db.aporte.findMany({
      where: { reportes: { gt: 0 }, retirado: false },
      orderBy: { reportes: 'desc' },
      include: { autor: AUTOR },
    });
  }

  async moderar(id: string, moderadorId: string, retirar: boolean, motivo?: string) {
    const r = await this.db.aporte.updateMany({
      where: { id },
      data: retirar
        ? { retirado: true, motivoRetiro: motivo, retiradoPorId: moderadorId, retiradoEn: new Date() }
        : { retirado: false, motivoRetiro: null, retiradoPorId: null, retiradoEn: null, reportes: 0 },
    });
    if (!r.count) throw new NotFoundException('Aporte no encontrado.');
    return { retirado: retirar };
  }
}

@ApiTags('foro')
@Controller('foro')
export class ForoController {
  constructor(private readonly svc: ForoService) {}

  @Get('reglas')
  reglas() {
    return REGLAS_FORO;
  }

  @Get()
  lista(@Query('categoria') categoria?: string) {
    return this.svc.lista(categoria && Object.hasOwn(CategoriaAporte, categoria) ? (categoria as TCategoria) : undefined);
  }

  @Get('moderacion')
  @Auth('TECNICO_MSP')
  reportados() {
    return this.svc.reportados();
  }

  @Get(':id')
  hilo(@Param('id') id: string) {
    return this.svc.hilo(id);
  }

  @Post()
  @Auth()
  publicar(@Usuario() u: UsuarioJwt, @Body() d: AporteDto) {
    return this.svc.publicar(u.sub, d);
  }

  @Post(':id/reportar')
  @HttpCode(200)
  @Auth()
  reportar(@Param('id') id: string) {
    return this.svc.reportar(id);
  }

  @Post(':id/retirar')
  @HttpCode(200)
  @Auth('TECNICO_MSP')
  retirar(@Usuario() u: UsuarioJwt, @Param('id') id: string, @Body() d: MotivoDto) {
    return this.svc.moderar(id, u.sub, true, d.motivo.trim());
  }

  @Post(':id/restaurar')
  @HttpCode(200)
  @Auth('TECNICO_MSP')
  restaurar(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.moderar(id, u.sub, false);
  }
}
