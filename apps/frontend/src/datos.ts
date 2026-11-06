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

export interface Planta {
  id: string;
  nombreComun: string;
  nombreCientifico: string | null;
  ciclo: 'CORTO' | 'LARGO';
  cualidad: 'CALIENTE' | 'FRIA';
  usosMedicinales: string;
}

export interface HuertoMio {
  huerto: null | {
    id: string;
    nombre: string | null;
    latitud: string;
    longitud: string;
    provincia: { nombre: string };
    parroquia: { nombre: string };
    plantas: Planta[];
  };
  recomendacion: null | { fase: string; nombre: string; texto: string };
}
