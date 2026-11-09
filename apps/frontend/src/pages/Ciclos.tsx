import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { MAX_INTENTOS, NOMBRE_ACTIVIDAD, NOMBRE_CAUSA, NOMBRE_FASE, type FaseLunar, type Paso, type TipoActividad } from '@nexo/shared';
import { Camera, CircleSlash, CloudHail, Plus, Upload } from 'lucide-react';
import { api, ApiError } from '../api';
import { fechaCorta, useDatos } from '../datos';
import { useEnvio } from '../formulario';
import { AreaTexto, Banner, Boton, Cargando, Chip, Dialogo, EnlaceBoton, Encabezado, Estado, EstadoVacio, ResumenErrores, Selector, Tarjeta, useToast } from '../ui';
import { useHuerto, type HuertoDetalle } from './Panel';

export interface ActividadCiclo {
  id: string;
  tipo: TipoActividad;
  fecha: string;
  hora: string | null;
  faseLunar: FaseLunar | null;
  advertencias: string[];
  cumplida: boolean;
  estadoEvidencia: string;
  intento: number;
  motivoRechazo: string | null;
  puntosOtorgados: number;
  participaciones: { horas: number; voluntario: { id: string; nombre: string } }[];
  archivos: { id: string; url: string; tipo: 'FOTO' | 'VIDEO'; nombre: string; intento: number }[];
}

export interface Ciclo {
  id: string;
  estado: 'ACTIVO' | 'COMPLETADO' | 'FALLIDO';
  causaFracaso: keyof typeof NOMBRE_CAUSA | null;
  justificacion: string | null;
  iniciadoEn: string;
  planta: { id: string; nombreComun: string; cualidad: 'CALIENTE' | 'FRIA' };
  actividades: ActividadCiclo[];
  siguiente: Paso | null;
  repetibles: Paso[];
}

/** Reenvía la evidencia de una actividad rechazada (segunda oportunidad). */
function Reenviar({ a, onListo }: { a: ActividadCiclo; onListo: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const toast = useToast();
  async function subir(files: FileList | null) {
    if (!files?.length) return;
    const f = new FormData();
    [...files].forEach((x) => f.append('evidencias', x));
    setEnviando(true);
    setError('');
    try {
      await api(`/actividades/${a.id}/evidencia`, { body: f });
      toast('Evidencia enviada otra vez. El MSP la revisará.');
      onListo();
    } catch (e) {
      setError(e instanceof ApiError ? (e.errores[0]?.mensaje ?? e.message) : 'No se pudo subir.');
    } finally {
      setEnviando(false);
      if (ref.current) ref.current.value = '';
    }
  }
  return (
    <div className="space-y-1">
      <input ref={ref} type="file" accept="image/*,video/*" multiple className="sr-only" tabIndex={-1} aria-label="Nueva evidencia" id={`reenviar-${a.id}`} onChange={(e) => void subir(e.target.files)} />
      <Boton variante="secundario" cargando={enviando} textoCargando="Subiendo…" onClick={() => ref.current?.click()}>
        <Upload aria-hidden="true" className="size-5" />
        Subir nueva evidencia (vale el 50 %)
      </Boton>
      {error && <p className="text-sm font-bold text-error-800">{error}</p>}
    </div>
  );
}

function LineaActividad({ a, onCambio }: { a: ActividadCiclo; onCambio: () => void }) {
  const horas = a.participaciones.reduce((s, p) => s + p.horas, 0);
  return (
    <li className="relative border-l-4 border-tierra-300 pb-5 pl-5 last:pb-0">
      <span className={`absolute -left-[0.6rem] top-1 size-4 rounded-full ${a.cumplida ? 'bg-primary-600' : 'bg-tierra-300'}`} aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-bold">{NOMBRE_ACTIVIDAD[a.tipo]}</h4>
        <Estado estado={a.estadoEvidencia} />
        {a.estadoEvidencia === 'APROBADA' && <Chip tono="exito">+{a.puntosOtorgados} pts</Chip>}
        {a.intento > 1 && <Chip>Intento {a.intento}</Chip>}
        {a.cumplida && a.advertencias.length === 0 && <Chip tono="info">Siguió el calendario</Chip>}
      </div>
      <p className="text-sm text-luna-600">
        {fechaCorta(a.fecha)}
        {a.hora && ` · ${a.hora}`}
        {a.faseLunar && ` · ${NOMBRE_FASE[a.faseLunar]}`}
        {a.cumplida && ` · ${horas} h de ${a.participaciones.map((p) => p.voluntario.nombre.split(' ')[0]).join(', ')}`}
      </p>
      {a.archivos.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {a.archivos.map((f) => (
            <li key={f.id}>
              <a href={f.url} target="_blank" rel="noreferrer" className="block">
                {f.tipo === 'FOTO' ? (
                  <img src={f.url} alt={`Evidencia: ${f.nombre}`} className="size-16 rounded-lg object-cover" loading="lazy" />
                ) : (
                  <span className="grid size-16 place-items-center rounded-lg bg-tierra-100 text-xs font-bold">Video</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
      {a.estadoEvidencia === 'RECHAZADA' && (
        <div className="mt-2 space-y-2">
          <Banner tipo="error">
            <strong>Motivo del MSP:</strong> {a.motivoRechazo}
          </Banner>
          {a.intento < MAX_INTENTOS ? (
            <Reenviar a={a} onListo={onCambio} />
          ) : (
            <p className="text-sm text-luna-600">Ya se usó la segunda oportunidad: esta actividad no suma puntos, pero el ciclo sigue.</p>
          )}
        </div>
      )}
    </li>
  );
}

function TarjetaCiclo({ c, onCambio }: { c: Ciclo; onCambio: () => void }) {
  const toast = useToast();
  const [omitir, setOmitir] = useState(false);
  const [fracaso, setFracaso] = useState(false);
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [f, setF] = useState({ causa: '', justificacion: '' });

  async function confirmarOmitir() {
    await api(`/ciclos/${c.id}/omitir`, { body: { tipo: c.siguiente!.tipo } });
    setOmitir(false);
    toast(`«${c.siguiente!.nombre}» quedó como no cumplido.`);
    onCambio();
  }
  async function confirmarFracaso(e?: FormEvent) {
    e?.preventDefault();
    const x: Record<string, string> = {};
    if (!f.causa) x.causa = 'Elige la causa.';
    if (!f.justificacion.trim()) x.justificacion = 'La justificación es obligatoria.';
    if (Object.keys(x).length) return setErrores(x);
    await enviar(async () => {
      await api(`/ciclos/${c.id}/fracaso`, { body: f });
      setFracaso(false);
      toast('Ciclo cerrado. Puedes empezar uno nuevo con la misma planta.');
      onCambio();
    });
  }

  return (
    <Tarjeta className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl">{c.planta.nombreComun}</h3>
          <p className="text-sm text-luna-600">Desde {fechaCorta(c.iniciadoEn)}</p>
        </div>
        <Estado estado={c.estado} />
      </div>
      {c.estado === 'FALLIDO' && (
        <Banner tipo="aviso">
          <strong>{c.causaFracaso && NOMBRE_CAUSA[c.causaFracaso]}.</strong> {c.justificacion}
        </Banner>
      )}
      {c.estado === 'ACTIVO' && c.siguiente && (
        <div className="space-y-3 rounded-2xl bg-primary-50 p-4">
          <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Paso {c.siguiente.orden} de 13</p>
          <p className="text-xl font-extrabold">{c.siguiente.nombre}</p>
          <p>{c.siguiente.cuando}</p>
          <div className="flex flex-wrap gap-2">
            <EnlaceBoton to={`/panel/registrar/${c.id}`}>
              <Plus aria-hidden="true" className="size-5" />
              Registrar
            </EnlaceBoton>
            <Boton variante="secundario" onClick={() => setOmitir(true)}>
              <CircleSlash aria-hidden="true" className="size-5" />
              No lo hicimos
            </Boton>
            <Boton variante="texto" onClick={() => setFracaso(true)}>
              <CloudHail aria-hidden="true" className="size-5" />
              Se dañó la cosecha
            </Boton>
          </div>
        </div>
      )}
      {c.actividades.length > 0 && (
        <ol className="ml-2" aria-label={`Actividades de ${c.planta.nombreComun}`}>
          {c.actividades.map((a) => (
            <LineaActividad key={a.id} a={a} onCambio={onCambio} />
          ))}
        </ol>
      )}

      <Dialogo
        abierto={omitir}
        titulo="¿Marcar el paso como no realizado?"
        onCerrar={() => setOmitir(false)}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => void confirmarOmitir()}>
              Sí, no lo hicimos
            </Boton>
            <Boton onClick={() => setOmitir(false)} data-foco>
              Cancelar
            </Boton>
          </>
        }
      >
        <p>«{c.siguiente?.nombre}» quedará como no cumplido y no sumará puntos. El ciclo sigue con el paso siguiente.</p>
      </Dialogo>

      <Dialogo
        abierto={fracaso}
        titulo="Registrar que la cosecha se dañó"
        onCerrar={() => setFracaso(false)}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => setFracaso(false)} data-foco>
              Cancelar
            </Boton>
            <Boton onClick={() => void confirmarFracaso()} cargando={enviando}>
              Cerrar ciclo
            </Boton>
          </>
        }
      >
        <p>Nadie es penalizado: el ciclo se cierra, deja de ganar los puntos restantes y puedes empezar otro.</p>
        <ResumenErrores errores={resumen} />
        <Selector etiqueta="Causa" opciones={NOMBRE_CAUSA} value={f.causa} error={errores.causa} onChange={(e) => setF({ ...f, causa: e.target.value })} />
        <AreaTexto
          etiqueta="Justificación"
          value={f.justificacion}
          error={errores.justificacion}
          maxLength={500}
          onChange={(e) => setF({ ...f, justificacion: e.target.value })}
        />
      </Dialogo>
    </Tarjeta>
  );
}

/** Ciclos de siembra y cosecha del huerto, con su línea de tiempo de actividades. */
export function Ciclos() {
  const id = useHuerto();
  const { datos, cargando, error, recargar } = useDatos<Ciclo[]>(id ? `/huertos/${id}/ciclos` : null);
  const huerto = useDatos<HuertoDetalle>(id ? `/huertos/${id}` : null);
  const toast = useToast();
  const [planta, setPlanta] = useState('');
  const [errorPlanta, setErrorPlanta] = useState('');
  const activas = new Set(datos?.filter((c) => c.estado === 'ACTIVO').map((c) => c.planta.id));
  const disponibles = Object.fromEntries((huerto.datos?.plantas ?? []).filter((p) => !activas.has(p.plantaId)).map((p) => [p.plantaId, p.planta.nombreComun]));

  async function iniciar(e: FormEvent) {
    e.preventDefault();
    if (!planta) return setErrorPlanta('Elige la planta.');
    try {
      await api(`/huertos/${id}/ciclos`, { body: { plantaId: planta } });
      setPlanta('');
      setErrorPlanta('');
      toast('Ciclo iniciado. El primer paso es preparar la tierra.');
      void recargar();
      void huerto.recargar();
    } catch (err) {
      setErrorPlanta(err instanceof ApiError ? err.message : 'No se pudo iniciar.');
    }
  }

  if (error) return <Banner tipo="error">{error}</Banner>;
  if (cargando && !datos) return <Cargando />;
  const activos = datos?.filter((c) => c.estado === 'ACTIVO') ?? [];
  const cerrados = datos?.filter((c) => c.estado !== 'ACTIVO') ?? [];

  return (
    <div className="space-y-6">
      <Encabezado
        titulo="Actividades"
        texto="Registra cada paso después de hacerlo, con quién trabajó, cuántas horas y fotos o videos reales. Los puntos llegan cuando el MSP valida la evidencia."
      />
      <Tarjeta>
        <form onSubmit={iniciar} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Selector
              etiqueta="Empezar un ciclo con la planta"
              ayuda="Las plantas del mismo tipo se siembran y cosechan juntas."
              opciones={disponibles}
              value={planta}
              error={errorPlanta}
              onChange={(e) => setPlanta(e.target.value)}
            />
          </div>
          <Boton type="submit">
            <Plus aria-hidden="true" className="size-5" />
            Empezar ciclo
          </Boton>
        </form>
        {huerto.datos && huerto.datos.plantas.length === 0 && (
          <p className="mt-3">
            Primero{' '}
            <Link to="/panel/plantas" className="font-bold text-primary-700 underline">
              elige plantas del catálogo
            </Link>
            .
          </p>
        )}
      </Tarjeta>
      <section className="space-y-4" aria-labelledby="activos">
        <h2 id="activos" className="text-2xl">
          En curso
        </h2>
        {activos.length ? (
          activos.map((c) => <TarjetaCiclo key={c.id} c={c} onCambio={() => void recargar()} />)
        ) : (
          <EstadoVacio titulo="No hay ciclos en curso" texto="Empieza un ciclo con una de tus plantas para ver el primer paso." />
        )}
      </section>
      {cerrados.length > 0 && (
        <section className="space-y-4" aria-labelledby="cerrados">
          <h2 id="cerrados" className="text-2xl">
            Ciclos cerrados
          </h2>
          {cerrados.map((c) => (
            <TarjetaCiclo key={c.id} c={c} onCambio={() => void recargar()} />
          ))}
        </section>
      )}
      <p className="flex items-center gap-2 text-sm text-luna-600">
        <Camera aria-hidden="true" className="size-4" /> Solo fotos y videos reales del huerto, sin inteligencia artificial: el MSP las revisa.
      </p>
    </div>
  );
}
