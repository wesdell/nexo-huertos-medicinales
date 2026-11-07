import {
  BadRequestException,
  Body,
  CanActivate,
  ConflictException,
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get,
  HttpCode,
  Injectable,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { compare, hash } from 'bcryptjs';
import { LoginDto, RegistroDto } from './dto';
import { PrismaService } from './prisma.service';

export const VERSION_POLITICA = '2026-11-05';

export interface UsuarioJwt {
  sub: string;
  nombre: string;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const [tipo, token] = String(req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException('Inicia sesión para continuar.');
    try {
      req.usuario = this.jwt.verify<UsuarioJwt>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Tu sesión expiró. Inicia sesión de nuevo.');
    }
  }
}

export const Usuario = createParamDecorator((_: unknown, ctx: ExecutionContext): UsuarioJwt => ctx.switchToHttp().getRequest().usuario);

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async registrar(d: RegistroDto) {
    const email = d.email.trim().toLowerCase();
    if (new Date(d.fechaNacimiento) > new Date())
      throw new BadRequestException({ errores: [{ campo: 'fechaNacimiento', mensaje: 'La fecha de nacimiento no puede ser futura.' }] });
    if (await this.db.usuario.findUnique({ where: { email } }))
      throw new ConflictException({ errores: [{ campo: 'email', mensaje: 'Ese correo ya está registrado.' }] });
    const u = await this.db.usuario.create({
      data: {
        nombre: d.nombre.trim(),
        email,
        passwordHash: await hash(d.password, 10),
        fechaNacimiento: new Date(d.fechaNacimiento),
        genero: d.genero as never,
        consentimientoDatosEn: new Date(),
        versionPolitica: VERSION_POLITICA,
      },
    });
    return { id: u.id, mensaje: 'Cuenta creada. Ya puedes iniciar sesión.' };
  }

  async login(d: LoginDto) {
    const u = await this.db.usuario.findUnique({ where: { email: d.email.trim().toLowerCase() } });
    // Mensaje genérico: no revela cuál dato falló (HU-002).
    if (!u || !(await compare(d.password, u.passwordHash))) throw new UnauthorizedException('Correo o contraseña incorrectos.');
    return { token: this.jwt.sign({ sub: u.id, nombre: u.nombre } satisfies UsuarioJwt) };
  }

  async yo(id: string) {
    const u = await this.db.usuario.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        puntos: true,
        nivel: true,
        membresias: { select: { esResponsable: true, comunidad: { select: { id: true, nombre: true, puntosTotales: true } } } },
      },
    });
    const { membresias, ...resto } = u;
    const m = membresias[0];
    return { ...resto, comunidad: m ? { ...m.comunidad, esResponsable: m.esResponsable } : null };
  }
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('registro')
  registro(@Body() d: RegistroDto) {
    return this.auth.registrar(d);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() d: LoginDto) {
    return this.auth.login(d);
  }

  @Get('yo')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  yo(@Usuario() u: UsuarioJwt) {
    return this.auth.yo(u.sub);
  }
}
