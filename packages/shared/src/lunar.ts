import { FaseLunar } from './enums';

const MES_SINODICO = 29.530588853;
// Luna nueva de referencia: 6 de enero de 2000, 18:14 UTC.
const REFERENCIA_MS = Date.UTC(2000, 0, 6, 18, 14);
const DIA_MS = 86_400_000;

/**
 * Fase lunar de una fecha local de Ecuador ("AAAA-MM-DD"), calculada al mediodía (UTC−5).
 * Método del mes sinódico medio: precisión ±1 día entre 1900 y 2100.
 * Devuelve null si la fecha es inválida o está fuera de rango (HU-017 «fase no disponible»).
 */
export function faseLunar(fecha: string): FaseLunar | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!m) return null;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (anio < 1900 || anio > 2100) return null;
  const ms = Date.UTC(anio, mes - 1, dia, 17); // 12:00 en Ecuador
  const d = new Date(ms);
  if (d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;

  const edad = ((((ms - REFERENCIA_MS) / DIA_MS) % MES_SINODICO) + MES_SINODICO) % MES_SINODICO;
  const cuarto = MES_SINODICO / 4;
  if (edad < cuarto / 2 || edad >= MES_SINODICO - cuarto / 2) return FaseLunar.LUNA_NUEVA;
  if (edad < cuarto * 1.5) return FaseLunar.CRECIENTE;
  if (edad < cuarto * 2.5) return FaseLunar.LLENA;
  return FaseLunar.MENGUANTE;
}

export const NOMBRE_FASE: Record<FaseLunar, string> = {
  LUNA_NUEVA: 'Luna oscura (nueva)',
  CRECIENTE: 'Luna creciente',
  LLENA: 'Luna llena',
  MENGUANTE: 'Cuarto menguante',
};

/** Actividades recomendadas por fase (HU-017). */
export const RECOMENDACION_POR_FASE: Record<FaseLunar, string> = {
  LUNA_NUEVA: 'Buen momento para retirar maleza y preparar la tierra.',
  CRECIENTE: 'Buen momento para el ritual y la siembra, y para cosechar hojas, flores y frutos.',
  LLENA: 'Buen momento para el ritual y la siembra, y para cosechar hojas, flores y frutos.',
  MENGUANTE: 'Buen momento para cosechar semillas y raíces.',
};

export function recomendacionDelDia(fecha: string) {
  const fase = faseLunar(fecha);
  if (!fase) return null;
  return { fase, nombre: NOMBRE_FASE[fase], texto: RECOMENDACION_POR_FASE[fase] };
}
