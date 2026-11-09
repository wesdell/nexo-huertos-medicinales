import {
  applyDecorators,
  BadRequestException,
  Body,
  CanActivate,
  Controller,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Get,
  HttpCode,
  Injectable,
  Post,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Rol } from '@nexo/shared';
import { compare, hash } from 'bcryptjs';
import { randomInt } from 'node:crypto';
import { CambioClaveDto, LoginDto } from './dto';
import { PrismaService } from './prisma.service';

export const VERSION_POLITICA = '2026-11-09';

export interface UsuarioJwt {
  sub: string;
  nombre: string;
  rol: Rol;
}

const ROLES = 'roles';
const CLAVE_TEMPORAL = 'claveTemporal';

/**
 * Verifica el token, que la cuenta siga activa y el rol. Con la clave temporal
 * solo se permite cambiarla (reunión MSP: la clave inicial llega por correo y debe cambiarse).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly db: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const [tipo, token] = String(req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException('Inicia sesión para continuar.');
    let datos: UsuarioJwt;
    try {
      datos = this.jwt.verify<UsuarioJwt>(token);
    } catch {
      throw new UnauthorizedException('Tu sesión expiró. Inicia sesión de nuevo.');
    }
    const u = await this.db.usuario.findUnique({ where: { id: datos.sub }, select: { rol: true, activo: true, debeCambiarClave: true } });
    if (!u?.activo) throw new UnauthorizedException('Tu cuenta no está activa. Comunícate con el MSP.');
    const permitirTemporal = this.reflector.getAllAndOverride<boolean>(CLAVE_TEMPORAL, [ctx.getHandler(), ctx.getClass()]);
    if (u.debeCambiarClave && !permitirTemporal) throw new ForbiddenException('Primero cambia tu contraseña temporal.');
    const roles = this.reflector.getAllAndOverride<Rol[]>(ROLES, [ctx.getHandler(), ctx.getClass()]) ?? [];
    if (roles.length && !roles.includes(u.rol)) throw new ForbiddenException('No tienes permiso para esta acción.');
    req.usuario = { ...datos, rol: u.rol };
    return true;
  }
}

/** Ruta protegida; sin roles, basta con iniciar sesión. */
export const Auth = (...roles: Rol[]) => applyDecorators(SetMetadata(ROLES, roles), UseGuards(AuthGuard), ApiBearerAuth());
const PermitirClaveTemporal = () => SetMetadata(CLAVE_TEMPORAL, true);

export const Usuario = createParamDecorator((_: unknown, ctx: ExecutionContext): UsuarioJwt => ctx.switchToHttp().getRequest().usuario);

/** Clave temporal legible: 3 bloques sin caracteres ambiguos (0/O, 1/l). */
export function claveTemporal() {
  const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bloque = () => Array.from({ length: 4 }, () => letras[randomInt(letras.length)]).join('');
  return `${bloque()}-${bloque()}-${bloque()}`;
}
export const hashClave = (clave: string) => hash(clave, 10);

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private token(u: { id: string; nombre: string; rol: Rol }) {
    return this.jwt.sign({ sub: u.id, nombre: u.nombre, rol: u.rol } satisfies UsuarioJwt);
  }

  async login(d: LoginDto) {
    const u = await this.db.usuario.findUnique({ where: { email: d.email.trim().toLowerCase() } });
    // Mensaje genérico: no revela cuál dato falló.
    if (!u || !(await compare(d.password, u.passwordHash))) throw new UnauthorizedException('Correo o contraseña incorrectos.');
    if (!u.activo) throw new UnauthorizedException('Tu cuenta no está activa. Comunícate con el MSP.');
    return { token: this.token(u), debeCambiarClave: u.debeCambiarClave };
  }

  async cambiarClave(id: string, d: CambioClaveDto) {
    const u = await this.db.usuario.findUniqueOrThrow({ where: { id } });
    if (!(await compare(d.actual, u.passwordHash)))
      throw new BadRequestException({ errores: [{ campo: 'actual', mensaje: 'La contraseña actual no es correcta.' }] });
    if (d.actual === d.nueva)
      throw new BadRequestException({ errores: [{ campo: 'nueva', mensaje: 'La nueva contraseña debe ser distinta de la temporal.' }] });
    await this.db.usuario.update({ where: { id }, data: { passwordHash: await hashClave(d.nueva), debeCambiarClave: false } });
    return { mensaje: 'Contraseña actualizada.' };
  }

  async yo(id: string) {
    const u = await this.db.usuario.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        debeCambiarClave: true,
        huertos: { where: { activo: true }, select: { id: true, nombre: true, tipo: true, puntosTotales: true }, orderBy: { creadoEn: 'asc' } },
      },
    });
    return u;
  }
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() d: LoginDto) {
    return this.auth.login(d);
  }

  @Get('yo')
  @Auth()
  @PermitirClaveTemporal()
  yo(@Usuario() u: UsuarioJwt) {
    return this.auth.yo(u.sub);
  }

  @Post('clave')
  @HttpCode(200)
  @Auth()
  @PermitirClaveTemporal()
  clave(@Usuario() u: UsuarioJwt, @Body() d: CambioClaveDto) {
    return this.auth.cambiarClave(u.sub, d);
  }
}
