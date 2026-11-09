import { Body, ConflictException, Controller, Get, HttpCode, Injectable, NotFoundException, Param, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { spawn } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DIR_ARCHIVOS } from './archivos';
import { Auth, claveTemporal, hashClave, Usuario, UsuarioJwt } from './auth';
import { CorreoService } from './correo';
import { PersonaCuentaDto } from './dto';
import { PrismaService } from './prisma.service';

/** Administrador técnico: respaldos, base de datos, cuentas del MSP y soporte. Distinto del técnico del MSP. */
@Injectable()
export class AdminService {
  constructor(
    private readonly db: PrismaService,
    private readonly correo: CorreoService,
  ) {}

  usuarios() {
    return this.db.usuario.findMany({
      orderBy: [{ rol: 'asc' }, { nombre: 'asc' }],
      select: { id: true, nombre: true, email: true, rol: true, activo: true, debeCambiarClave: true, creadoEn: true, _count: { select: { huertos: true } } },
    });
  }

  async crearTecnico(d: PersonaCuentaDto) {
    const email = d.email.trim().toLowerCase();
    if (await this.db.usuario.findUnique({ where: { email } })) throw new ConflictException({ errores: [{ campo: 'email', mensaje: 'Ese correo ya tiene una cuenta.' }] });
    const clave = claveTemporal();
    return this.db.$transaction(
      async (tx) => {
        const u = await tx.usuario.create({
          data: { nombre: d.nombre.trim(), email, rol: 'TECNICO_MSP', passwordHash: await hashClave(clave), debeCambiarClave: true },
          select: { id: true },
        });
        await this.correo.enviar(
          email,
          'Nexo: tu cuenta de técnico del MSP',
          `Hola, ${d.nombre.trim()}:\n\nSe creó tu cuenta de técnico del MSP en Nexo.\n\nUsuario: ${email}\nContraseña temporal: ${clave}\n\nAl ingresar te pediremos cambiarla.`,
        );
        return u;
      },
      { timeout: 20_000 },
    );
  }

  async activo(adminId: string, id: string, activo: boolean) {
    if (id === adminId && !activo) throw new ConflictException('No puedes desactivar tu propia cuenta.');
    const r = await this.db.usuario.updateMany({ where: { id }, data: { activo } });
    if (!r.count) throw new NotFoundException('Usuario no encontrado.');
    return { activo };
  }

  async estado() {
    const t0 = Date.now();
    await this.db.$queryRaw`SELECT 1`;
    const latencia = Date.now() - t0;
    const [tamano] = await this.db.$queryRaw<{ bytes: bigint }[]>`SELECT pg_database_size(current_database()) AS bytes`;
    const tablas = await this.db.$queryRaw<{ tabla: string; filas: bigint }[]>`
      SELECT relname AS tabla, n_live_tup AS filas FROM pg_stat_user_tables WHERE relname <> '_prisma_migrations' ORDER BY relname`;
    let archivos = 0;
    let bytesArchivos = 0;
    for (const f of readdirSync(DIR_ARCHIVOS)) {
      archivos++;
      bytesArchivos += statSync(join(DIR_ARCHIVOS, f)).size;
    }
    return {
      version: process.env.npm_package_version ?? '2.0.0',
      baseDatos: { latenciaMs: latencia, bytes: Number(tamano.bytes), tablas: tablas.map((t) => ({ tabla: t.tabla, filas: Number(t.filas) })) },
      archivos: { cantidad: archivos, bytes: bytesArchivos },
      memoriaMb: Math.round(process.memoryUsage().rss / 1048576),
      activoDesde: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    };
  }

  /** Respaldo completo de la base con pg_dump (formato SQL plano), descargado al navegador. */
  respaldo(res: Response) {
    const url = new URL(process.env.DATABASE_URL!);
    const p = spawn('pg_dump', ['--no-owner', '--no-privileges', '-h', url.hostname, '-p', url.port || '5432', '-U', decodeURIComponent(url.username), url.pathname.slice(1)], {
      env: { ...process.env, PGPASSWORD: decodeURIComponent(url.password) },
    });
    let iniciado = false;
    p.on('error', () => {
      if (!iniciado) res.status(503).json({ message: 'pg_dump no está disponible en el servidor.' });
    });
    p.stdout.once('data', () => {
      iniciado = true;
      const fecha = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
      res.setHeader('Content-Type', 'application/sql; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="respaldo-nexo-${fecha}.sql"`);
    });
    p.stdout.pipe(res);
  }
}

@ApiTags('admin')
@Auth('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('usuarios')
  usuarios() {
    return this.svc.usuarios();
  }

  @Post('tecnicos')
  crearTecnico(@Body() d: PersonaCuentaDto) {
    return this.svc.crearTecnico(d);
  }

  @Post('usuarios/:id/activar')
  @HttpCode(200)
  activar(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.activo(u.sub, id, true);
  }

  @Post('usuarios/:id/desactivar')
  @HttpCode(200)
  desactivar(@Usuario() u: UsuarioJwt, @Param('id') id: string) {
    return this.svc.activo(u.sub, id, false);
  }

  @Get('estado')
  estado() {
    return this.svc.estado();
  }

  @Get('respaldo')
  respaldo(@Res() res: Response) {
    this.svc.respaldo(res);
  }
}
