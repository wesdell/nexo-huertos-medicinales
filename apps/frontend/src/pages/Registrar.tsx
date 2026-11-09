import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  COLORES_SENALETICA,
  ESTRUCTURAS,
  LABORES_CUIDADO,
  LUGARES_SECADO,
  MAX_HORAS_DIA,
  METODOS_RIEGO,
  NOMBRE_FASE,
  PARTES_COSECHA,
  RECOMENDACION_POR_FASE,
  TECNICAS_SIEMBRA,
  TIPOS_SIEMBRA,
  faseLunar,
  type Advertencia,
  type Paso,
} from '@nexo/shared';
import { AlertCircle, Camera, X } from 'lucide-react';
import { api } from '../api';
import { hoyLocal, useDatos } from '../datos';
import { useEnvio } from '../formulario';
import { Luna } from '../Luna';
import { AreaTexto, Banner, Boton, Campo, Cargando, Casilla, Dialogo, EnlaceBoton, Encabezado, EstadoVacio, Guia, ResumenErrores, Selector, Tarjeta, useToast } from '../ui';
import type { Ciclo } from './Ciclos';
import { useHuerto } from './Panel';

interface Voluntario {
  id: string;
  nombre: string;
  activo: boolean;
}

/** Elige el ciclo cuando se entra desde la barra («Registrar»). */
function ElegirCiclo({ ciclos }: { ciclos: Ciclo[] }) {
  const activos = ciclos.filter((c) => c.estado === 'ACTIVO');
  if (!activos.length)
    return (
      <EstadoVacio
        titulo="No hay ciclos en curso"
        texto="Empieza un ciclo con una de tus plantas para registrar sus pasos."
        accion={<EnlaceBoton to="/panel/ciclos">Ir a actividades</EnlaceBoton>}
      />
    );
  return (
    <div className="space-y-6">
      <Encabezado titulo="Registrar actividad" texto="¿En qué planta trabajaron?" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {activos.map((c) => (
          <li key={c.id}>
            <Link to={`/panel/registrar/${c.id}`} className="presionable block h-full rounded-tarjeta bg-white p-5 shadow-tarjeta hover:bg-tierra-50">
              <p className="font-display text-xl font-extrabold">{c.planta.nombreComun}</p>
              <p className="text-luna-600">{c.siguiente ? `Sigue: ${c.siguiente.nombre}` : 'Ciclo completo'}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Registro de un paso del ciclo (reunión MSP): después de hacerlo, con los voluntarios, sus horas y evidencia real.
 * Errores bloquean; las recomendaciones del calendario se pueden confirmar (sin bono).
 */
export function Registrar() {
  const { cicloId } = useParams();
  const huertoId = useHuerto();
  const ciclos = useDatos<Ciclo[]>(huertoId ? `/huertos/${huertoId}/ciclos` : null);
  const vols = useDatos<Voluntario[]>(huertoId ? `/huertos/${huertoId}/voluntarios` : null);
  const navegar = useNavigate();
  const toast = useToast();
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [tipo, setTipo] = useState('');
  const [base, setBase] = useState({ fecha: hoyLocal(), hora: '' });
  const [detalle, setDetalle] = useState<Record<string, unknown>>({});
  const [horas, setHoras] = useState<Record<string, string>>({});
  const [archivos, setArchivos] = useState<File[]>([]);
  const [advertencias, setAdvertencias] = useState<Advertencia[]>([]);

  if (ciclos.error) return <Banner tipo="error">{ciclos.error}</Banner>;
  if (!ciclos.datos || !vols.datos) return <Cargando />;
  if (!cicloId) return <ElegirCiclo ciclos={ciclos.datos} />;
  const ciclo = ciclos.datos.find((c) => c.id === cicloId);
  if (!ciclo || ciclo.estado !== 'ACTIVO' || !ciclo.siguiente)
    return <EstadoVacio titulo="Este ciclo ya terminó" texto="Elige otro ciclo en curso." accion={<EnlaceBoton to="/panel/ciclos">Ir a actividades</EnlaceBoton>} />;

  const opciones: Paso[] = [ciclo.siguiente, ...ciclo.repetibles.filter((r) => r.tipo !== ciclo.siguiente!.tipo)];
  const paso = opciones.find((p) => p.tipo === tipo) ?? (opciones.length === 1 ? opciones[0] : undefined);
  const activos = vols.datos.filter((v) => v.activo);
  const fase = base.fecha ? faseLunar(base.fecha) : null;
  const conHora = paso && ['RITUAL_SIEMBRA', 'SIEMBRA', 'RITUAL_GRATITUD', 'COSECHA'].includes(paso.tipo);

  async function guardar(confirmarAdvertencias = false) {
    if (!paso) return;
    setAdvertencias([]);
    const participantes = Object.entries(horas)
      .filter(([, h]) => h !== '')
      .map(([voluntarioId, h]) => ({ voluntarioId, horas: Number(h.replace(',', '.')) }));
    const f = new FormData();
    f.append('datos', JSON.stringify({ tipo: paso.tipo, ...base, hora: base.hora || undefined, participantes, detalle, confirmarAdvertencias }));
    archivos.forEach((a) => f.append('evidencias', a));
    const r = await enviar(
      () => api<{ conBono: boolean; siguiente: Paso | null }>(`/ciclos/${ciclo!.id}/actividades`, { body: f }),
      (e) => {
        if (e.status !== 409 || !e.advertencias.length) return false;
        setAdvertencias(e.advertencias);
        return true;
      },
    );
    if (!r) return;
    toast(`Actividad registrada${r.conBono ? ' siguiendo el calendario (+10 %)' : ''}. Los puntos llegarán cuando el MSP valide la evidencia.`);
    navegar('/panel/virtual', { state: { brotar: ciclo!.id } });
  }

  function alEnviar(e: FormEvent) {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!paso) x.tipo = 'Elige qué hicieron.';
    if (!Object.values(horas).some((h) => h !== '')) x.participantes = 'Marca quién participó y cuántas horas.';
    if (!archivos.length) x.evidencias = 'Adjunta al menos una foto o video real de la actividad.';
    if (Object.keys(x).length) return setErrores(x);
    void guardar();
  }

  const marcar = (campo: string) => (e: React.ChangeEvent<HTMLInputElement>) => setDetalle({ ...detalle, [campo]: e.target.checked });
  const elegir = (campo: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => setDetalle({ ...detalle, [campo]: e.target.value });
  const labores = (detalle.labores as string[] | undefined) ?? [];

  return (
    <div className="space-y-6">
      <Encabezado titulo={`Registrar: ${ciclo.planta.nombreComun}`} texto="Registra lo que ya hicieron. Las fechas futuras no se aceptan." />
      <form onSubmit={alEnviar} noValidate className="space-y-6">
        <ResumenErrores errores={resumen} />
        {opciones.length > 1 && (
          <Tarjeta>
            <fieldset>
              <legend className="mb-3 font-display text-xl font-extrabold">¿Qué hicieron?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {opciones.map((p) => (
                  <label
                    key={p.tipo}
                    htmlFor={`paso-${p.tipo}`}
                    className={`presionable grid cursor-pointer grid-cols-[auto_1fr] items-start gap-x-3 rounded-2xl border-2 p-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-oro ${paso?.tipo === p.tipo ? 'border-primary-600 bg-primary-50' : 'border-tierra-300 bg-white'}`}
                  >
                    <input
                      id={`paso-${p.tipo}`}
                      type="radio"
                      name="tipo"
                      checked={paso?.tipo === p.tipo}
                      onChange={() => {
                        setTipo(p.tipo);
                        setDetalle({});
                      }}
                      className="row-span-2 mt-1 size-5 shrink-0"
                    />
                    <span className="font-bold">{p.nombre}</span>
                    <span className="text-sm text-luna-600">{p.tipo === ciclo.siguiente!.tipo ? `Paso ${p.orden}: el siguiente` : 'Se puede repetir'}</span>
                  </label>
                ))}
              </div>
              {errores.tipo && <p className="mt-2 text-sm font-bold text-error-800">{errores.tipo}</p>}
            </fieldset>
          </Tarjeta>
        )}

        {paso && (
          <>
            <Tarjeta className="space-y-3">
              <h2 className="text-2xl">
                Paso {paso.orden}: {paso.nombre}
              </h2>
              <Guia cuando={paso.cuando} como={paso.como} />
            </Tarjeta>

            <Tarjeta className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Fecha" type="date" max={hoyLocal()} value={base.fecha} error={errores.fecha} onChange={(e) => setBase({ ...base, fecha: e.target.value })} />
                <Campo
                  etiqueta={conHora ? 'Hora' : 'Hora (opcional)'}
                  type="time"
                  value={base.hora}
                  error={errores.hora}
                  onChange={(e) => setBase({ ...base, hora: e.target.value })}
                />
              </div>
              {fase && (
                <div role="status" className="flex items-center gap-3 rounded-2xl bg-tierra-100 p-4">
                  <Luna fase={fase} className="size-10 shrink-0" />
                  <p>
                    <strong>{NOMBRE_FASE[fase]}.</strong> {RECOMENDACION_POR_FASE[fase]}
                  </p>
                </div>
              )}

              {paso.tipo === 'PREPARACION_TIERRA' && (
                <fieldset className="space-y-1">
                  <legend className="mb-2 font-bold">Pasos realizados</legend>
                  <Casilla etiqueta="Retiramos la maleza en un día soleado" checked={detalle.retiroMaleza === true} error={errores.retiroMaleza} onChange={marcar('retiroMaleza')} />
                  <Casilla etiqueta="Esparcimos la maleza desmenuzada" checked={detalle.esparcido === true} error={errores.esparcido} onChange={marcar('esparcido')} />
                  <Casilla etiqueta="Removimos la tierra con azadón o pala" checked={detalle.remocion === true} error={errores.remocion} onChange={marcar('remocion')} />
                  <Casilla etiqueta="Usamos abono orgánico (opcional)" checked={detalle.abonoOrganico === true} onChange={marcar('abonoOrganico')} />
                </fieldset>
              )}
              {paso.tipo === 'ESTRUCTURA_SIEMBRA' && (
                <Selector etiqueta="Estructura elaborada" opciones={ESTRUCTURAS} value={String(detalle.estructura ?? '')} error={errores.estructura} onChange={elegir('estructura')} />
              )}
              {paso.tipo === 'SIEMBRA' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Selector etiqueta="Técnica" opciones={TECNICAS_SIEMBRA} value={String(detalle.tecnica ?? '')} error={errores.tecnica} onChange={elegir('tecnica')} />
                  <Selector etiqueta="Tipo de siembra" opciones={TIPOS_SIEMBRA} value={String(detalle.tipoSiembra ?? '')} error={errores.tipoSiembra} onChange={elegir('tipoSiembra')} />
                </div>
              )}
              {paso.tipo === 'SENALETICA' && (
                <div className="space-y-2">
                  <Selector
                    etiqueta="Color de la señalética"
                    ayuda={`${ciclo.planta.nombreComun} es una planta ${ciclo.planta.cualidad === 'CALIENTE' ? 'caliente: rojo' : 'fría: verde o blanco'}.`}
                    opciones={COLORES_SENALETICA}
                    value={String(detalle.color ?? '')}
                    error={errores.color}
                    onChange={elegir('color')}
                  />
                  <Casilla etiqueta="Incluye nombre local, común y científico" checked={detalle.incluyeNombres === true} error={errores.incluyeNombres} onChange={marcar('incluyeNombres')} />
                  <Casilla etiqueta="Incluye el uso general" checked={detalle.incluyeUsos === true} error={errores.incluyeUsos} onChange={marcar('incluyeUsos')} />
                </div>
              )}
              {paso.tipo === 'CUIDADO_CRECIMIENTO' && (
                <fieldset>
                  <legend className="mb-2 font-bold">Labores de cuidado</legend>
                  {Object.entries(LABORES_CUIDADO).map(([k, t]) => (
                    <Casilla
                      key={k}
                      etiqueta={t}
                      checked={labores.includes(k)}
                      onChange={(e) => setDetalle({ ...detalle, labores: e.target.checked ? [...labores, k] : labores.filter((l) => l !== k) })}
                    />
                  ))}
                  {errores.labores && <p className="text-sm font-bold text-error-800">{errores.labores}</p>}
                </fieldset>
              )}
              {paso.tipo === 'RIEGO' && <Selector etiqueta="Método de riego" opciones={METODOS_RIEGO} value={String(detalle.metodo ?? '')} error={errores.metodo} onChange={elegir('metodo')} />}
              {paso.tipo === 'COSECHA' && <Selector etiqueta="Parte cosechada" opciones={PARTES_COSECHA} value={String(detalle.parte ?? '')} error={errores.parte} onChange={elegir('parte')} />}
              {paso.tipo === 'SECADO' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Selector etiqueta="Dónde se secaron" opciones={LUGARES_SECADO} value={String(detalle.lugar ?? '')} error={errores.lugar} onChange={elegir('lugar')} />
                  <Campo etiqueta="Días de secado" inputMode="numeric" value={String(detalle.dias ?? '')} error={errores.dias} onChange={(e) => setDetalle({ ...detalle, dias: Number(e.target.value) || '' })} />
                </div>
              )}
              {paso.tipo === 'EMPAQUETADO' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Campo etiqueta="Paquetes hechos" inputMode="numeric" value={String(detalle.cantidad ?? '')} error={errores.cantidad} onChange={(e) => setDetalle({ ...detalle, cantidad: Number(e.target.value) || '' })} />
                    <Campo etiqueta="Fecha de caducidad" type="date" ayuda="Máximo 12 meses." value={String(detalle.fechaCaducidad ?? '')} error={errores.fechaCaducidad} onChange={elegir('fechaCaducidad')} />
                  </div>
                  <AreaTexto etiqueta="Indicaciones de uso" rows={2} value={String(detalle.indicacionesUso ?? '')} error={errores.indicacionesUso} onChange={elegir('indicacionesUso')} />
                  <AreaTexto etiqueta="Dosificación" rows={2} value={String(detalle.dosificacion ?? '')} error={errores.dosificacion} onChange={elegir('dosificacion')} />
                  <AreaTexto etiqueta="Contraindicaciones" rows={2} value={String(detalle.contraindicaciones ?? '')} error={errores.contraindicaciones} onChange={elegir('contraindicaciones')} />
                </div>
              )}
            </Tarjeta>

            <Tarjeta className="space-y-3">
              <fieldset>
                <legend className="font-display text-xl font-extrabold">¿Quién participó y cuántas horas?</legend>
                <p className="text-sm text-luna-600">1 hora = 10 puntos para cada voluntario. Máximo {MAX_HORAS_DIA} horas por persona en el día. Deja vacío a quien no participó.</p>
                {activos.length === 0 ? (
                  <p className="mt-3">
                    No hay voluntarios activos.{' '}
                    <Link to="/panel/voluntarios" className="font-bold text-primary-700 underline">
                      Agrega voluntarios
                    </Link>
                    .
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-tierra-100">
                    {activos.map((v) => (
                      <li key={v.id} className="flex items-center justify-between gap-3 py-2">
                        <label htmlFor={`h-${v.id}`} className="font-bold">
                          {v.nombre}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id={`h-${v.id}`}
                            inputMode="decimal"
                            placeholder="0"
                            value={horas[v.id] ?? ''}
                            onChange={(e) => setHoras({ ...horas, [v.id]: e.target.value.replace(/[^\d.,]/g, '') })}
                            className="min-h-11 w-20 rounded-xl border-2 border-tierra-300 bg-white px-3 text-right tabular-nums"
                          />
                          <span aria-hidden="true">h</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {errores.participantes && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-error-800">
                    <AlertCircle aria-hidden="true" className="size-4" />
                    {errores.participantes}
                  </p>
                )}
              </fieldset>
            </Tarjeta>

            <Tarjeta className="space-y-3">
              <h2 className="text-xl">Evidencia</h2>
              <p className="text-sm text-luna-600">Fotos (hasta 10 MB) o videos (hasta 50 MB) reales de este huerto, sin inteligencia artificial. Máximo 5 archivos.</p>
              <label className="presionable inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border-2 border-luna-800 bg-white px-6 font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-oro">
                <Camera aria-hidden="true" className="size-5" />
                Tomar o elegir fotos
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="sr-only"
                  aria-describedby={errores.evidencias ? 'error-evidencias' : undefined}
                  onChange={(e) => {
                    setArchivos([...archivos, ...[...(e.target.files ?? [])]].slice(0, 5));
                    e.target.value = '';
                  }}
                />
              </label>
              {archivos.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {archivos.map((a, i) => (
                    <li key={`${a.name}-${i}`} className="flex items-center gap-2 rounded-xl bg-tierra-100 py-1 pl-3 pr-1 text-sm">
                      {a.name}
                      <button
                        type="button"
                        onClick={() => setArchivos(archivos.filter((_, k) => k !== i))}
                        className="grid size-9 place-items-center rounded-lg hover:bg-tierra-300"
                        aria-label={`Quitar ${a.name}`}
                      >
                        <X aria-hidden="true" className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {errores.evidencias && (
                <p id="error-evidencias" className="flex items-center gap-1.5 text-sm font-bold text-error-800">
                  <AlertCircle aria-hidden="true" className="size-4" />
                  {errores.evidencias}
                </p>
              )}
            </Tarjeta>

            <Boton type="submit" cargando={enviando} className="w-full sm:w-auto">
              Registrar actividad
            </Boton>
          </>
        )}
      </form>

      <Dialogo
        abierto={advertencias.length > 0}
        titulo="Recomendaciones de los saberes ancestrales"
        onCerrar={() => {
          setAdvertencias([]);
          document.querySelector<HTMLElement>('form button[type="submit"]')?.focus();
        }}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => void guardar(true)} cargando={enviando}>
              Registrar de todas formas
            </Boton>
            <Boton onClick={() => setAdvertencias([])} data-foco>
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
        <p className="text-sm text-luna-600">Si registras de todas formas, la actividad suma sus puntos pero sin el 10 % del saber ancestral.</p>
      </Dialogo>
    </div>
  );
}
