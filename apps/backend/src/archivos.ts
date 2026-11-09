import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdirSync, unlinkSync } from 'node:fs';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const DIR_ARCHIVOS = process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
mkdirSync(DIR_ARCHIVOS, { recursive: true });
/** Ruta pública con la que se sirven los archivos (ver main.ts). */
export const URL_ARCHIVOS = '/api/archivos/';

const MIME: Record<string, { tipo: 'FOTO' | 'VIDEO'; max: number }> = {
  'image/jpeg': { tipo: 'FOTO', max: 10 * 1024 * 1024 },
  'image/png': { tipo: 'FOTO', max: 10 * 1024 * 1024 },
  'image/webp': { tipo: 'FOTO', max: 10 * 1024 * 1024 },
  'video/mp4': { tipo: 'VIDEO', max: 50 * 1024 * 1024 },
  'video/webm': { tipo: 'VIDEO', max: 50 * 1024 * 1024 },
  'video/quicktime': { tipo: 'VIDEO', max: 50 * 1024 * 1024 },
};
export const MAX_EVIDENCIAS = 5;

/** Fotos (JPG, PNG, WebP hasta 10 MB) y videos (MP4, WebM, MOV hasta 50 MB) guardados con nombre aleatorio. */
export const opcionesArchivos: MulterOptions = {
  storage: diskStorage({
    destination: DIR_ARCHIVOS,
    filename: (_req, f, cb) => cb(null, `${randomUUID()}${extname(f.originalname).toLowerCase().slice(0, 6)}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024, files: MAX_EVIDENCIAS },
  fileFilter: (_req, f, cb) =>
    MIME[f.mimetype]
      ? cb(null, true)
      : cb(new BadRequestException({ errores: [{ campo: 'evidencias', mensaje: 'Solo se aceptan fotos (JPG, PNG, WebP) o videos (MP4, WebM, MOV).' }] }), false),
};

const borrar = (fs: Express.Multer.File[]) => fs.forEach((f) => { try { unlinkSync(f.path); } catch { /* ya no existe */ } });

/** Revisa tamaños por tipo y devuelve los datos para guardar; si algo falla, borra lo subido. */
export function aArchivos(fs: Express.Multer.File[] | undefined, { requerido = true } = {}) {
  const lista = fs ?? [];
  if (requerido && !lista.length) {
    throw new BadRequestException({ errores: [{ campo: 'evidencias', mensaje: 'Adjunta al menos una foto o video real de la actividad.' }] });
  }
  const grande = lista.find((f) => f.size > MIME[f.mimetype].max);
  if (grande) {
    borrar(lista);
    throw new BadRequestException({ errores: [{ campo: 'evidencias', mensaje: 'Cada foto puede pesar hasta 10 MB y cada video hasta 50 MB.' }] });
  }
  return lista.map((f) => ({
    tipo: MIME[f.mimetype].tipo,
    url: URL_ARCHIVOS + f.filename,
    nombre: f.originalname.slice(0, 200),
    mime: f.mimetype,
    bytes: f.size,
  }));
}

export { borrar as borrarArchivos };
