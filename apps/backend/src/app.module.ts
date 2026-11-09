import { Controller, Get, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController, AdminService } from './admin';
import { AuthController, AuthGuard, AuthService } from './auth';
import { CorreoService } from './correo';
import { ForoController, ForoService } from './foro';
import { GamificacionService } from './gamificacion';
import { GeografiaController } from './geografia';
import { HuertosController, HuertosService } from './huertos';
import { MspController, MspService } from './msp';
import { PrismaService } from './prisma.service';
import { PublicoController, PublicoService } from './publico';

@Controller('salud')
class SaludController {
  @Get()
  salud() {
    return { estado: 'ok' };
  }
}

if (!process.env.JWT_SECRET) throw new Error('Falta la variable de entorno JWT_SECRET.');

// ponytail: un solo módulo; cada archivo es un dominio (público, responsable, MSP, admin, foro).
@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '7d' } })],
  controllers: [SaludController, AuthController, GeografiaController, PublicoController, HuertosController, MspController, AdminController, ForoController],
  providers: [PrismaService, AuthService, AuthGuard, CorreoService, GamificacionService, PublicoService, HuertosService, MspService, AdminService, ForoService],
})
export class AppModule {}
