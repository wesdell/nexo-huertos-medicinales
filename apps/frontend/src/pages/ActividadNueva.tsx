import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  ACTIVIDADES_V1,
  METODOS_RIEGO,
  NOMBRE_ACTIVIDAD,
  NOMBRE_FASE,
  PARTES_COSECHA,
  RECOMENDACION_POR_FASE,
  TECNICAS_SIEMBRA,
  TIPOS_SIEMBRA,
  faseLunar,
  type Advertencia,
  type TipoActividadV1,
} from '@nexo/shared';
import { api } from '../api';
import { useDatos, type HuertoMio } from '../datos';
import { useEnvio } from '../formulario';
import { useSesion } from '../sesion';
import { Banner, Boton, Campo, Cargando, Casilla, Dialogo, EnlaceBoton, EstadoVacio, ResumenErrores, Selector, Tarjeta, useToast } from '../ui';

const hoyLocal = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const AYUDA: Record<TipoActividadV1, string> = {
  PREPARACION_TIERRA: 'Retiro de maleza, esparcido y remoción de la tierra.',
  SIEMBRA: 'Siembra de una planta registrada.',
  RIEGO: 'Riego de las plantas ya sembradas.',
  COSECHA: 'Cosecha de una parte de la planta.',
};

interface Respuesta {
  puntos: { base: number; bono: number };
  repetida: boolean;
}

/** HU-018, 021, 023 y 025: un formulario por tipo, mismo endpoint. Errores bloquean; advertencias se confirman. */
export function ActividadNueva() {
  const { yo, recargar: recargarSesion } = useSesion();
  const { datos, cargando } = useDatos<HuertoMio>(yo?.comunidad ? '/huertos/mio' : null);
  const navegar = useNavigate();
  const toast = useToast();
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [tipo, setTipo] = useState<TipoActividadV1 | ''>('');
  const [base, setBase] = useState({ fecha: hoyLocal(), hora: '', plantaId: '' });
  const [detalle, setDetalle] = useState<Record<string, unknown>>({});
  const [advertencias, setAdvertencias] = useState<Advertencia[]>([]);

  const huerto = datos?.huerto;
  const fase = base.fecha ? faseLunar(base.fecha) : null;
  const plantas = Object.fromEntries((huerto?.plantas ?? []).map((p) => [p.id, p.nombreComun]));

  if (!yo?.comunidad || (!cargando && !huerto))
    return (
      <EstadoVacio
        titulo="Primero registra tu huerto"
        texto="Para registrar actividades necesitas un huerto con plantas."
        accion={<EnlaceBoton to={yo?.comunidad ? '/huerto' : '/comunidad/nueva'}>Ir a configurarlo</EnlaceBoton>}
      />
    );
  if (!huerto) return <Cargando />;

  async function guardar(confirmarAdvertencias = false) {
    setAdvertencias([]);
    const r = await enviar(
      () =>
        api<Respuesta>(`/huertos/${huerto!.id}/actividades`, {
          body: { tipo, ...base, hora: base.hora || undefined, plantaId: base.plantaId || undefined, detalle, confirmarAdvertencias },
        }),
      (e) => {
        if (e.status !== 409 || !e.advertencias.length) return false;
        setAdvertencias(e.advertencias);
        return true;
      },
    );
    if (!r) return;
    const total = r.puntos.base + r.puntos.bono;
    toast(
      r.repetida
        ? 'Actividad guardada. Ya la habías registrado hoy, así que no suma puntos.'
        : `Actividad guardada: +${total} puntos${r.puntos.bono ? ' (incluye bono por seguir la recomendación)' : ''}.`,
    );
    await recargarSesion();
    navegar('/huerto/virtual');
  }

  function alEnviar(e: FormEvent) {
    e.preventDefault();
    if (!tipo) return setErrores({ tipo: 'Elige el tipo de actividad.' });
    void guardar();
  }

  const marcar = (campo: string) => (e: React.ChangeEvent<HTMLInputElement>) => setDetalle({ ...detalle, [campo]: e.target.checked });
  const elegir = (campo: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setDetalle({ ...detalle, [campo]: e.target.value });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Registrar actividad</h1>
      <form onSubmit={alEnviar} noValidate className="space-y-6">
        <ResumenErrores errores={resumen} />

        <Tarjeta>
          <fieldset>
            <legend className="mb-3 text-xl font-semibold font-display">¿Qué hiciste?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {ACTIVIDADES_V1.map((t) => (
                <label
                  key={t}
                  className={`flex min-h-11 cursor-pointer gap-3 rounded-lg border-2 p-3 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-oro ${tipo === t ? 'border-primary-600 bg-primary-50' : 'border-tierra-300'}`}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value={t}
                    checked={tipo === t}
                    onChange={() => {
                      setTipo(t);
                      setDetalle({});
                      setErrores({});
                    }}
                    className="mt-1 size-5 accent-primary-600"
                  />
                  <span>
                    <span className="block font-semibold">{NOMBRE_ACTIVIDAD[t]}</span>
                    <span className="text-sm text-luna-600">{AYUDA[t]}</span>
                  </span>
                </label>
              ))}
            </div>
            {errores.tipo && <p className="mt-2 text-sm font-medium text-error-800">⚠ {errores.tipo}</p>}
          </fieldset>
        </Tarjeta>

        {tipo && (
          <Tarjeta className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Fecha" type="date" max={hoyLocal()} required value={base.fecha} error={errores.fecha} onChange={(e) => setBase({ ...base, fecha: e.target.value })} />
              <Campo
                etiqueta={tipo === 'SIEMBRA' || tipo === 'COSECHA' ? 'Hora' : 'Hora (opcional)'}
                type="time"
                value={base.hora}
                error={errores.hora}
                onChange={(e) => setBase({ ...base, hora: e.target.value })}
              />
            </div>
            {fase && (
              <Banner tipo="info">
                <strong>{NOMBRE_FASE[fase]}.</strong> {RECOMENDACION_POR_FASE[fase]}
              </Banner>
            )}

            {tipo !== 'PREPARACION_TIERRA' && (
              <Selector
                etiqueta={tipo === 'RIEGO' ? 'Planta (opcional: vacío riega todo el huerto)' : 'Planta'}
                opciones={plantas}
                value={base.plantaId}
                error={errores.plantaId}
                onChange={(e) => setBase({ ...base, plantaId: e.target.value })}
              />
            )}

            {tipo === 'PREPARACION_TIERRA' && (
              <fieldset className="space-y-1">
                <legend className="mb-2 font-semibold">Pasos realizados</legend>
                <Casilla etiqueta="Retiré la maleza en un día soleado" checked={detalle.retiroMaleza === true} error={errores.retiroMaleza} onChange={marcar('retiroMaleza')} />
                <Casilla etiqueta="Esparcí la maleza desmenuzada" checked={detalle.esparcido === true} error={errores.esparcido} onChange={marcar('esparcido')} />
                <Casilla etiqueta="Removí la tierra con azadón o pala" checked={detalle.remocion === true} error={errores.remocion} onChange={marcar('remocion')} />
                <Casilla etiqueta="Usé abono orgánico (opcional)" checked={detalle.abonoOrganico === true} onChange={marcar('abonoOrganico')} />
              </fieldset>
            )}
            {tipo === 'SIEMBRA' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Selector etiqueta="Técnica" opciones={TECNICAS_SIEMBRA} value={String(detalle.tecnica ?? '')} error={errores.tecnica} onChange={elegir('tecnica')} />
                <Selector etiqueta="Tipo de siembra" opciones={TIPOS_SIEMBRA} value={String(detalle.tipoSiembra ?? '')} error={errores.tipoSiembra} onChange={elegir('tipoSiembra')} />
              </div>
            )}
            {tipo === 'RIEGO' && (
              <Selector etiqueta="Método de riego" opciones={METODOS_RIEGO} value={String(detalle.metodo ?? '')} error={errores.metodo} onChange={elegir('metodo')} />
            )}
            {tipo === 'COSECHA' && (
              <Selector etiqueta="Parte cosechada" opciones={PARTES_COSECHA} value={String(detalle.parte ?? '')} error={errores.parte} onChange={elegir('parte')} />
            )}

            <Boton type="submit" cargando={enviando} className="w-full sm:w-auto">
              Guardar actividad
            </Boton>
          </Tarjeta>
        )}
      </form>

      <Dialogo
        abierto={advertencias.length > 0}
        titulo="Recomendaciones del calendario ancestral"
        onCerrar={() => setAdvertencias([])}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => void guardar(true)} cargando={enviando}>
              Guardar de todas formas
            </Boton>
            <Boton onClick={() => setAdvertencias([])} autoFocus>
              Corregir
            </Boton>
          </>
        }
      >
        <ul className="list-disc space-y-1 pl-5">
          {advertencias.map((a) => (
            <li key={a.codigo}>{a.mensaje}</li>
          ))}
        </ul>
        <p className="text-sm text-luna-600">Si guardas de todas formas, la actividad suma sus puntos pero sin el bono de 5 puntos.</p>
      </Dialogo>
    </div>
  );
}
