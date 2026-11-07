import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator';
import { AppModule } from './app.module';

/** Errores de validación con el mismo formato que @nexo/shared: { errores: [{ campo, mensaje }] }. */
function aErrores(errors: ValidationError[]) {
  return new BadRequestException({
    errores: errors.map((e) => ({ campo: e.property, mensaje: Object.values(e.constraints ?? {})[0] ?? 'Dato inválido.' })),
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, stopAtFirstError: true, exceptionFactory: aErrores }));

  const doc = new DocumentBuilder().setTitle('Nexo Huertos API').setVersion('1.0.0').addBearerAuth().build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, doc));

  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}
void bootstrap();
