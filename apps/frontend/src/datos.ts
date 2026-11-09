import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from './api';

/** GET simple con estados de carga y error; `recargar` vuelve a pedir. */
export function useDatos<T>(ruta: string | null) {
  const [datos, setDatos] = useState<T>();
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(!!ruta);

  const recargar = useCallback(async () => {
    if (!ruta) return;
    setCargando(true);
    setError('');
    try {
      setDatos(await api<T>(ruta));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Algo salió mal.');
    } finally {
      setCargando(false);
    }
  }, [ruta]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { datos, error, cargando, recargar };
}

/** Fecha local AAAA-MM-DD (para inputs de fecha). */
export const hoyLocal = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/** 2026-11-09 → 9 nov 2026 */
export const fechaCorta = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' });

export const numero = (n: number) => n.toLocaleString('es-EC');

export interface PlantaCatalogo {
  id: string;
  nombreComun: string;
  nombreCientifico: string;
  otrosNombres: string[];
  familiaBotanica: string | null;
  altitudMin: number | null;
  altitudMax: number | null;
  provincias: string[];
  ciclo: 'CORTO' | 'LARGO';
  cualidad: 'CALIENTE' | 'FRIA';
  usosMedicinales: string;
  parteUsada: string | null;
  dosificacion: string | null;
  contraindicaciones: string | null;
  fotoUrl: string | null;
  apta?: boolean | null;
}

export interface Provincia {
  id: number;
  nombre: string;
  region: string;
  parroquias: { id: number; nombre: string }[];
}
