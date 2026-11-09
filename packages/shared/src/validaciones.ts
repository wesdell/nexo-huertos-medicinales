/**
 * Cédula ecuatoriana: 10 dígitos, provincia 01–24 (o 30 para ecuatorianos en el exterior),
 * tercer dígito menor que 6 y dígito verificador por módulo 10.
 */
export function cedulaValida(cedula: string) {
  if (!/^\d{10}$/.test(cedula)) return false;
  const provincia = Number(cedula.slice(0, 2));
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30) || Number(cedula[2]) >= 6) return false;
  const suma = [...cedula.slice(0, 9)].reduce((s, c, i) => {
    const n = Number(c) * (i % 2 === 0 ? 2 : 1);
    return s + (n > 9 ? n - 9 : n);
  }, 0);
  return (10 - (suma % 10)) % 10 === Number(cedula[9]);
}

/** Celular ecuatoriano: 09 seguido de 8 dígitos. */
export const celularValido = (celular: string) => /^09\d{8}$/.test(celular);

/** Ecuador continental e insular, con margen: descarta coordenadas fuera del país. */
export const coordenadasEnEcuador = (lat: number, lng: number) => lat >= -5.1 && lat <= 1.7 && lng >= -92.1 && lng <= -75.1;

/** Altitud de un huerto en Ecuador (msnm): del nivel del mar a la cima del Chimborazo. */
export const altitudValida = (m: number) => Number.isInteger(m) && m >= 0 && m <= 6300;

/** ¿La altitud del huerto está dentro del rango de la planta? Sin rango definido, se acepta. */
export const plantaAptaAltitud = (altitud: number, min: number | null, max: number | null) =>
  (min === null || altitud >= min) && (max === null || altitud <= max);
