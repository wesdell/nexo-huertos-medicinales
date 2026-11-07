import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CicloPlanta, CualidadPlanta, Genero } from '@nexo/shared';

const requerido = (campo: string, predicado = 'es obligatorio') => ({ message: `${campo} ${predicado}.` });

export class RegistroDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty(requerido('El nombre'))
  @MaxLength(120)
  nombre: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Escribe un correo válido, por ejemplo nombre@correo.com.' })
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string;

  @ApiProperty({ example: '1990-05-20' })
  @IsDateString({ strict: true }, { message: 'Usa una fecha válida (dd/mm/aaaa).' })
  fechaNacimiento: string;

  @ApiProperty({ enum: Object.values(Genero) })
  @IsIn(Object.values(Genero), { message: 'Elige una opción de género.' })
  genero: string;

  @ApiProperty({ description: 'Debe ser true: acepta la política de tratamiento de datos.' })
  @Equals(true, { message: 'Debes aceptar la política de tratamiento de datos para crear tu cuenta.' })
  aceptaPrivacidad: boolean;
}

export class LoginDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('El correo')) email: string;
  @ApiProperty() @IsString() @IsNotEmpty(requerido('La contraseña', 'es obligatoria')) password: string;
}

export class ComunidadDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('El nombre')) @MaxLength(120) nombre: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) contactoNombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) contactoTelefono?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'Escribe un correo de contacto válido.' })
  contactoCorreo?: string;
}

export class HuertoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) nombre?: string;
  @ApiProperty() @Type(() => Number) @IsInt({ message: 'Elige la provincia.' }) provinciaId: number;
  @ApiProperty() @Type(() => Number) @IsInt({ message: 'Elige la parroquia.' }) parroquiaId: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) direccion?: string;
  @ApiProperty() @Type(() => Number) @IsLatitude({ message: 'La latitud debe estar entre -90 y 90.' }) latitud: number;
  @ApiProperty() @Type(() => Number) @IsLongitude({ message: 'La longitud debe estar entre -180 y 180.' }) longitud: number;
}

export class PlantaDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('El nombre común')) @MaxLength(120) nombreComun: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) nombreCientifico?: string;
  @ApiProperty({ enum: Object.values(CicloPlanta) })
  @IsIn(Object.values(CicloPlanta), { message: 'Elige el ciclo.' })
  ciclo: string;
  @ApiProperty({ enum: Object.values(CualidadPlanta) })
  @IsIn(Object.values(CualidadPlanta), { message: 'Elige la cualidad.' })
  cualidad: string;
  @ApiProperty() @IsString() @IsNotEmpty(requerido('Los usos medicinales', 'son obligatorios')) @MaxLength(500) usosMedicinales: string;
}

export class ActividadDto {
  @ApiProperty() @IsString() tipo: string;
  @ApiPropertyOptional({ example: '2026-11-05' }) @IsOptional() @IsString() fecha?: string;
  @ApiPropertyOptional({ example: '08:30' }) @IsOptional() @IsString() hora?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() plantaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() detalle?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() confirmarAdvertencias?: boolean;
}
