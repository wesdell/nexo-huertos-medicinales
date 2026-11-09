import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { Rol } from '@nexo/shared';
import { api, token } from './api';
import { Cargando } from './ui';

export interface Yo {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  debeCambiarClave: boolean;
  huertos: { id: string; nombre: string; tipo: string; puntosTotales: number }[];
}

interface Sesion {
  yo: Yo | null;
  cargando: boolean;
  /** Huerto con el que trabaja el responsable (puede tener más de uno). */
  huertoId: string | null;
  elegirHuerto: (id: string) => void;
  entrar: (t: string) => Promise<void>;
  salir: () => void;
  recargar: () => Promise<void>;
}

const Contexto = createContext<Sesion>(null!);
export const useSesion = () => useContext(Contexto);
const CLAVE_HUERTO = 'nexo.huerto';

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [yo, setYo] = useState<Yo | null>(null);
  const [cargando, setCargando] = useState(!!token.leer());
  const [elegido, setElegido] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CLAVE_HUERTO);
    } catch {
      return null;
    }
  });

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
  // JWT sin estado: cerrar sesión es olvidar el token.
  const salir = useCallback(() => {
    token.guardar(null);
    setYo(null);
  }, []);
  const elegirHuerto = useCallback((id: string) => {
    setElegido(id);
    try {
      localStorage.setItem(CLAVE_HUERTO, id);
    } catch {
      /* sin almacenamiento: vale por la pestaña */
    }
  }, []);

  const huertoId = yo?.huertos.find((h) => h.id === elegido)?.id ?? yo?.huertos[0]?.id ?? null;
  return <Contexto.Provider value={{ yo, cargando, huertoId, elegirHuerto, entrar, salir, recargar }}>{children}</Contexto.Provider>;
}

/** Sin sesión redirige a /login; con clave temporal, a cambiarla; con otro rol, al panel. */
export function Protegida({ children, roles }: { children: ReactNode; roles?: Rol[] }) {
  const { yo, cargando } = useSesion();
  const loc = useLocation();
  if (cargando) return <Cargando />;
  if (!yo) return <Navigate to="/login" replace state={{ desde: loc.pathname }} />;
  if (yo.debeCambiarClave && loc.pathname !== '/panel/clave') return <Navigate to="/panel/clave" replace />;
  if (roles && !roles.includes(yo.rol)) return <Navigate to="/panel" replace />;
  return children;
}
