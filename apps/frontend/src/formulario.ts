import { useState } from 'react';
import { ApiError } from './api';

/** Estado común de un formulario: errores por campo, mensaje general y envío. No borra lo escrito al fallar. */
export function useEnvio() {
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar<T>(accion: () => Promise<T>, alFallar?: (e: ApiError) => boolean): Promise<T | undefined> {
    setEnviando(true);
    setErrores({});
    setGeneral('');
    try {
      return await accion();
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
      if (alFallar?.(e)) return;
      if (e.errores.length) setErrores(Object.fromEntries(e.errores.map((x) => [x.campo, x.mensaje])));
      else setGeneral(e.message);
    } finally {
      setEnviando(false);
    }
  }

  const resumen = [...Object.values(errores), ...(general ? [general] : [])];
  return { errores, setErrores, general, enviando, enviar, resumen };
}
