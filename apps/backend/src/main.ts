import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { DIR_ARCHIVOS, URL_ARCHIVOS } from './archivos';

/** Errores de validación con el mismo formato que @nexo/shared: { errores: [{ campo, mensaje }] }. */
function aErrores(errors: ValidationError[]) {
  return new BadRequestException({
    errores: errors.map((e) => ({ campo: e.property, mensaje: Object.values(e.constraints ?? {})[0] ?? 'Dato inválido.' })),
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Fotos y videos de evidencias y plantas (nombres aleatorios, sin listado de carpeta).
  app.useStaticAssets(DIR_ARCHIVOS, { prefix: URL_ARCHIVOS, index: false, maxAge: '7d' });
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, stopAtFirstError: true, exceptionFactory: aErrores }));

  const doc = new DocumentBuilder().setTitle('Nexo Huertos API').setVersion('2.0.0').addBearerAuth().build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, doc));

  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}
void bootstrap();
