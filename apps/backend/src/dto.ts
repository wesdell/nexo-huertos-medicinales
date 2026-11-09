import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  Equals,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import {
  CategoriaAporte,
  CausaFracaso,
  CicloPlanta,
  CONTRASENA_MIN,
  CualidadPlanta,
  EspacioBodega,
  Genero,
  MAX_SUBTIPOS,
  TipoAbono,
  TipoAgua,
  TipoCerca,
  TipoDiseno,
  TipoSuelo,
  VarianteDiseno,
  cedulaValida,
} from '@nexo/shared';

const requerido = (campo: string, predicado = 'es obligatorio') => ({ message: `${campo} ${predicado}.` });

@ValidatorConstraint({ name: 'cedula' })
class CedulaEcuador implements ValidatorConstraintInterface {
  validate = (v: unknown) => typeof v === 'string' && cedulaValida(v);
  defaultMessage = () => 'La cédula no es válida: revisa los 10 dígitos.';
}
const CELULAR = { message: 'El celular debe tener 10 dígitos y empezar con 09.' };

// ─────────── Cuentas ───────────
export class LoginDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('El correo')) email: string;
  @ApiProperty() @IsString() @IsNotEmpty(requerido('La contraseña', 'es obligatoria')) password: string;
}

export class CambioClaveDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('La contraseña actual', 'es obligatoria')) actual: string;
  @ApiProperty({ minLength: CONTRASENA_MIN })
  @IsString()
  @MinLength(CONTRASENA_MIN, { message: `La nueva contraseña debe tener al menos ${CONTRASENA_MIN} caracteres.` })
  nueva: string;
}

export class PersonaCuentaDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('El nombre')) @MaxLength(120) nombre: string;
  @ApiProperty() @IsEmail({}, { message: 'Escribe un correo válido, por ejemplo nombre@correo.com.' }) email: string;
}

export class ResponsableDto extends PersonaCuentaDto {
  @ApiProperty() @Validate(CedulaEcuador) cedula: string;
  @ApiProperty() @Matches(/^09\d{8}$/, CELULAR) celular: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) motivo?: string;
}

// ─────────── Solicitud pública de huerto ───────────
export class SolicitudHuertoDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('El nombre del huerto')) @MaxLength(120) nombreHuerto: string;
  @ApiProperty({ enum: Object.values(TipoDiseno) }) @IsIn(Object.values(TipoDiseno), { message: 'Elige el tipo de huerto.' }) tipo: string;
  @ApiProperty({ enum: Object.values(VarianteDiseno), isArray: true })
  @IsArray()
  @ArrayMinSize(1, { message: 'Elige al menos un subtipo.' })
  @ArrayMaxSize(MAX_SUBTIPOS, { message: `Elige como máximo ${MAX_SUBTIPOS} subtipos.` })
  @IsIn(Object.values(VarianteDiseno), { each: true, message: 'Subtipo no válido.' })
  subtipos: string[];
  @ApiProperty() @Type(() => Number) @IsInt({ message: 'Elige la provincia.' }) provinciaId: number;
  @ApiProperty() @Type(() => Number) @IsInt({ message: 'Elige la parroquia.' }) parroquiaId: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) direccion?: string;
  @ApiProperty() @Type(() => Number) @IsLatitude({ message: 'Marca la ubicación del huerto en el mapa.' }) latitud: number;
  @ApiProperty() @Type(() => Number) @IsLongitude({ message: 'Marca la ubicación del huerto en el mapa.' }) longitud: number;
  @ApiProperty({ description: 'msnm' })
  @Type(() => Number)
  @IsInt({ message: 'Indica la altitud en metros (número entero).' })
  @Min(0, { message: 'La altitud no puede ser negativa.' })
  @Max(6300, { message: 'La altitud máxima en Ecuador es 6300 m.' })
  altitud: number;
  @ApiProperty() @IsString() @IsNotEmpty(requerido('Tu nombre')) @MaxLength(120) nombreResponsable: string;
  @ApiProperty() @Validate(CedulaEcuador) cedula: string;
  @ApiProperty() @IsEmail({}, { message: 'Escribe un correo válido, por ejemplo nombre@correo.com.' }) email: string;
  @ApiProperty() @Matches(/^09\d{8}$/, CELULAR) celular: string;
  @ApiProperty() @Equals(true, { message: 'Debes aceptar la política de tratamiento de datos para enviar la solicitud.' }) aceptaPrivacidad: boolean;
}

export class MotivoDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('El motivo')) @MaxLength(500) motivo: string;
}

// ─────────── Huerto (información operativa) ───────────
export class HuertoOperativoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) direccion?: string;
  @ApiPropertyOptional({ enum: Object.values(VarianteDiseno), isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Elige al menos un subtipo.' })
  @ArrayMaxSize(MAX_SUBTIPOS, { message: `Elige como máximo ${MAX_SUBTIPOS} subtipos.` })
  @IsIn(Object.values(VarianteDiseno), { each: true, message: 'Subtipo no válido.' })
  subtipos?: string[];
  @ApiPropertyOptional() @IsOptional() @IsIn(Object.values(TipoCerca), { message: 'Elige el tipo de cerca.' }) tipoCerca?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) materialCerca?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El área debe ser un número.' })
  @Min(0.1, { message: 'El área debe ser mayor que 0.' })
  @Max(1_000_000, { message: 'El área es demasiado grande.' })
  areaM2?: number;
  @ApiPropertyOptional() @IsOptional() @IsIn(Object.values(TipoSuelo), { message: 'Elige el tipo de suelo.' }) tipoSuelo?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(Object.values(TipoAgua), { message: 'Elige el tipo de agua.' }) tipoAgua?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) detalleAgua?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(Object.values(TipoAbono), { message: 'Elige el tipo de abono.' }) tipoAbono?: string;
}

// ─────────── Voluntarios ───────────
export class VoluntarioDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('El nombre')) @MaxLength(120) nombre: string;
  @ApiPropertyOptional({ description: 'Si ya está en otro huerto, se reutiliza su registro.' })
  @IsOptional()
  @Validate(CedulaEcuador)
  cedula?: string;
  @ApiProperty({ example: '1990-05-20' }) @IsDateString({ strict: true }, { message: 'Indica la fecha de nacimiento.' }) fechaNacimiento: string;
  @ApiProperty({ enum: Object.values(Genero) }) @IsIn(Object.values(Genero), { message: 'Elige una opción de género.' }) genero: string;
  @ApiPropertyOptional({ enum: ['OFICIAL', 'MAESTRO'] })
  @IsOptional()
  @IsIn(['OFICIAL', 'MAESTRO'], { message: 'El nivel con experiencia puede ser Oficial o Maestro.' })
  nivelSolicitado?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) justificacion?: string;
}

export class EstadoVoluntarioDto {
  @ApiProperty() @IsBoolean() activo: boolean;
}

export class SolicitudNivelDto {
  @ApiProperty({ enum: ['OFICIAL', 'MAESTRO'] }) @IsIn(['OFICIAL', 'MAESTRO'], { message: 'Elige Oficial o Maestro.' }) nivel: string;
  @ApiProperty() @IsString() @MinLength(20, { message: 'Explica la experiencia del voluntario (al menos 20 caracteres).' }) @MaxLength(500) justificacion: string;
}

// ─────────── Plantas ───────────
export class ElegirPlantaDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('La planta', 'es obligatoria')) plantaId: string;
  @ApiPropertyOptional({ description: 'Confirma una planta fuera del rango de altitud del huerto.' }) @IsOptional() @IsBoolean() confirmarAltitud?: boolean;
}

export class PlantaDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('El nombre común')) @MaxLength(120) nombreComun: string;
  @ApiProperty() @IsString() @IsNotEmpty(requerido('El nombre científico')) @MaxLength(120) nombreCientifico: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) otrosNombres?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) familiaBotanica?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt({ message: 'La altitud mínima debe ser un número entero.' }) @Min(0) @Max(6300) altitudMin?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt({ message: 'La altitud máxima debe ser un número entero.' }) @Min(0) @Max(6300) altitudMax?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) provincias?: string[];
  @ApiProperty({ enum: Object.values(CicloPlanta) }) @IsIn(Object.values(CicloPlanta), { message: 'Elige el ciclo.' }) ciclo: string;
  @ApiProperty({ enum: Object.values(CualidadPlanta) }) @IsIn(Object.values(CualidadPlanta), { message: 'Elige si es caliente o fría.' }) cualidad: string;
  @ApiProperty() @IsString() @IsNotEmpty(requerido('Los usos medicinales', 'son obligatorios')) @MaxLength(800) usosMedicinales: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) parteUsada?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) dosificacion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) contraindicaciones?: string;
  @ApiProperty({ description: 'Solo se admiten plantas medicinales.' })
  @Equals(true, { message: 'Confirma que es una planta medicinal: el catálogo no admite otras plantas.' })
  esMedicinal: boolean;
}

export class ImportarPlantasDto {
  @ApiProperty({ description: 'CSV con encabezado: nombreComun;nombreCientifico;familiaBotanica;altitudMin;altitudMax;ciclo;cualidad;usosMedicinales;provincias(separadas por |)' })
  @IsString()
  @IsNotEmpty(requerido('El archivo CSV'))
  @MaxLength(500_000)
  csv: string;
}

// ─────────── Ciclos y actividades ───────────
export class CicloDto {
  @ApiProperty() @IsString() @IsNotEmpty(requerido('La planta', 'es obligatoria')) plantaId: string;
}

export class FracasoDto {
  @ApiProperty({ enum: Object.values(CausaFracaso) }) @IsIn(Object.values(CausaFracaso), { message: 'Elige la causa.' }) causa: string;
  @ApiProperty() @IsString() @IsNotEmpty(requerido('La justificación', 'es obligatoria')) @MaxLength(500) justificacion: string;
}

/** Va como texto JSON en el campo `datos` del formulario multipart, junto con los archivos `evidencias`. */
export interface ActividadEntrada {
  tipo: string;
  fecha?: string;
  hora?: string;
  participantes?: { voluntarioId: string; horas: number }[];
  detalle?: Record<string, unknown>;
  confirmarAdvertencias?: boolean;
}

export class OmitirPasoDto {
  @ApiProperty() @IsString() @IsNotEmpty() tipo: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) nota?: string;
}

// ─────────── Bodega ───────────
export class BodegaItemDto {
  @ApiProperty({ enum: Object.values(EspacioBodega) }) @IsIn(Object.values(EspacioBodega), { message: 'Elige el espacio.' }) espacio: string;
  @ApiProperty() @IsString() @IsNotEmpty(requerido('El nombre')) @MaxLength(120) nombre: string;
  @ApiProperty() @Type(() => Number) @IsNumber({}, { message: 'La cantidad debe ser un número.' }) @Min(0, { message: 'La cantidad no puede ser negativa.' }) cantidad: number;
  @ApiProperty() @IsString() @IsNotEmpty(requerido('La unidad', 'es obligatoria')) @MaxLength(30) unidad: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) nota?: string;
}

// ─────────── Foro ───────────
export class AporteDto {
  @ApiProperty({ enum: Object.values(CategoriaAporte) }) @IsIn(Object.values(CategoriaAporte), { message: 'Elige la categoría.' }) categoria: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(140) titulo?: string;
  @ApiProperty() @IsString() @MinLength(10, { message: 'Escribe al menos 10 caracteres.' }) @MaxLength(4000) contenido: string;
  @ApiPropertyOptional() @IsOptional() @IsString() padreId?: string;
  @ApiProperty() @Equals(true, { message: 'Acepta las reglas de participación para publicar.' }) aceptaReglas: boolean;
}

