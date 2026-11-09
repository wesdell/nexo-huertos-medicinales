import type { Advertencia, ErrorCampo } from '@nexo/shared';

const CLAVE = 'nexo.token';
export const token = {
  leer: () => {
    try {
      return localStorage.getItem(CLAVE);
    } catch {
      return null;
    }
  },
  guardar: (t: string | null) => {
    try {
      if (t) localStorage.setItem(CLAVE, t);
      else localStorage.removeItem(CLAVE);
    } catch {
      /* almacenamiento bloqueado: la sesión dura lo que la pestaña */
    }
  },
};

/** Error de la API con los errores por campo y las advertencias por confirmar, si las hay. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errores: ErrorCampo[] = [],
    readonly advertencias: Advertencia[] = [],
  ) {
    super(message);
  }
}

/** Llama a la API. `body` FormData se envía como multipart (archivos de evidencia). */
export async function api<T>(ruta: string, opciones: { method?: string; body?: unknown } = {}): Promise<T> {
  const t = token.leer();
  const formulario = opciones.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`/api${ruta}`, {
      method: opciones.method ?? (opciones.body ? 'POST' : 'GET'),
      headers: {
        ...(opciones.body && !formulario ? { 'Content-Type': 'application/json' } : {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: formulario ? (opciones.body as FormData) : opciones.body ? JSON.stringify(opciones.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.');
  }
  const datos = await res.json().catch(() => ({}));
  if (res.ok) return datos as T;

  if (res.status === 401 && t) {
    token.guardar(null);
    window.dispatchEvent(new Event('nexo:sesion-expirada'));
  }
  const m = datos.message;
  const mensaje = typeof m === 'string' ? m : (m?.message ?? datos.errores?.[0]?.mensaje ?? 'Algo salió mal. Inténtalo de nuevo.');
  throw new ApiError(res.status, mensaje, m?.errores ?? datos.errores, m?.advertencias ?? datos.advertencias);
}
