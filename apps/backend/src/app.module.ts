import { Controller, Get, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController, AuthService, JwtGuard } from './auth';
import { ComunidadesController, ComunidadesService, GeografiaController } from './comunidades';
import { HuertosController, HuertosService } from './huertos';
import { PrismaService } from './prisma.service';

@Controller('salud')
class SaludController {
  @Get()
  salud() {
    return { estado: 'ok' };
  }
}

if (!process.env.JWT_SECRET) throw new Error('Falta la variable de entorno JWT_SECRET.');

// ponytail: un solo módulo para v1; se separa por dominio cuando crezca (v2).
@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '7d' } })],
  controllers: [SaludController, AuthController, ComunidadesController, GeografiaController, HuertosController],
  providers: [PrismaService, AuthService, JwtGuard, ComunidadesService, HuertosService],
})
export class AppModule {}
