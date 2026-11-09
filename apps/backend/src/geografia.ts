import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma.service';

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
