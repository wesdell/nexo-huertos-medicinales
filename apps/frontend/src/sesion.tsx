import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { api, token } from './api';
import { Cargando } from './ui';

export interface Yo {
  id: string;
  nombre: string;
  email: string;
  puntos: number;
  nivel: string;
  comunidad: { id: string; nombre: string; puntosTotales: number; esResponsable: boolean } | null;
}

interface Sesion {
  yo: Yo | null;
  cargando: boolean;
  entrar: (t: string) => Promise<void>;
  salir: () => void;
  recargar: () => Promise<void>;
}

const Contexto = createContext<Sesion>(null!);
export const useSesion = () => useContext(Contexto);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [yo, setYo] = useState<Yo | null>(null);
  const [cargando, setCargando] = useState(!!token.leer());

  const recargar = useCallback(async () => {
    if (!token.leer()) return setYo(null);
    try {
      setYo(await api<Yo>('/auth/yo'));
    } catch {
      setYo(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
    const expirada = () => setYo(null);
    window.addEventListener('nexo:sesion-expirada', expirada);
    return () => window.removeEventListener('nexo:sesion-expirada', expirada);
  }, [recargar]);

  const entrar = useCallback(
    async (t: string) => {
      token.guardar(t);
      await recargar();
    },
    [recargar],
  );
  // JWT sin estado: cerrar sesión es olvidar el token (HU-002).
  const salir = useCallback(() => {
    token.guardar(null);
    setYo(null);
  }, []);

  return <Contexto.Provider value={{ yo, cargando, entrar, salir, recargar }}>{children}</Contexto.Provider>;
}

/** Sin sesión, cualquier ruta protegida redirige a /login (HU-002). */
export function Protegida({ children }: { children: ReactNode }) {
  const { yo, cargando } = useSesion();
  const loc = useLocation();
  if (cargando) return <Cargando />;
  if (!yo) return <Navigate to="/login" replace state={{ desde: loc.pathname }} />;
  return children;
}
