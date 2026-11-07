import { Body, ConflictException, Controller, Get, Injectable, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard, Usuario, UsuarioJwt } from './auth';
import { ComunidadDto } from './dto';
import { PrismaService } from './prisma.service';

@Injectable()
export class ComunidadesService {
  constructor(private readonly db: PrismaService) {}

  /** HU-004: quien crea la comunidad queda como responsable. En v1 cada voluntario pertenece a una sola comunidad. */
  async crear(usuarioId: string, d: ComunidadDto) {
    if (await this.db.membresia.findFirst({ where: { usuarioId } })) throw new ConflictException('Ya perteneces a una comunidad.');
    return this.db.comunidad.create({
      data: { ...d, membresias: { create: { usuarioId, esResponsable: true } } },
      select: { id: true, nombre: true },
    });
  }
}

@ApiTags('comunidades')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('comunidades')
export class ComunidadesController {
  constructor(private readonly svc: ComunidadesService) {}

  @Post()
  crear(@Usuario() u: UsuarioJwt, @Body() d: ComunidadDto) {
    return this.svc.crear(u.sub, d);
  }
}

@ApiTags('geografia')
@Controller('provincias')
export class GeografiaController {
  constructor(private readonly db: PrismaService) {}

  // ponytail: lectura directa de un catálogo estático; pasa a servicio si gana lógica.
  @Get()
  provincias() {
    return this.db.provincia.findMany({
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, region: true, parroquias: { select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } } },
    });
  }
}
