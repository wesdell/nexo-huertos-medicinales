import { useState, type FormEvent } from 'react';
import { CONSEJOS_ANCESTRALES, type Etapa } from '@nexo/shared';
import { Leaf, LocateFixed, MapPin, Snowflake, Sun } from 'lucide-react';
import { api } from '../api';
import { useDatos, type HuertoMio, type Planta } from '../datos';
import { useEnvio } from '../formulario';
import { useSesion } from '../sesion';
import { Banner, Boton, Campo, Cargando, EnlaceBoton, EstadoVacio, ResumenErrores, Selector, Tarjeta, useToast } from '../ui';

interface Provincia {
  id: number;
  nombre: string;
  parroquias: { id: number; nombre: string }[];
}

function Consejos({ titulo, consejos }: { titulo: string; consejos: readonly string[] }) {
  return (
    <aside className="rounded-2xl bg-tierra-100 p-4" aria-label={titulo}>
      <p className="font-bold">{titulo}</p>
      <ul className="mt-2 space-y-1">
        {consejos.map((c) => (
          <li key={c} className="flex gap-2">
            <Leaf aria-hidden="true" className="mt-1 size-4 shrink-0" />
            {c}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** HU-010 (parcial en v1): provincia, parroquia y coordenadas por GPS del navegador o manuales. */
function FormularioHuerto({ alCrear }: { alCrear: () => void }) {
  const { datos: provincias } = useDatos<Provincia[]>('/provincias');
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [d, setD] = useState({
    nombre: '',
    provinciaId: '',
    parroquiaId: '',
    latitud: '',
    longitud: '',
  });
  const [gps, setGps] = useState<'' | 'buscando' | 'denegado'>('');
  const toast = useToast();
  const parroquias = provincias?.find((p) => String(p.id) === d.provinciaId)?.parroquias ?? [];

  function usarUbicacion() {
    if (!navigator.geolocation) return setGps('denegado');
    setGps('buscando');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setD((x) => ({
          ...x,
          latitud: pos.coords.latitude.toFixed(6),
          longitud: pos.coords.longitude.toFixed(6),
        }));
        setGps('');
      },
      () => setGps('denegado'),
      { timeout: 10000 },
    );
  }

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    const faltan: Record<string, string> = {};
    if (!d.provinciaId) faltan.provinciaId = 'Elige la provincia.';
    if (!d.parroquiaId) faltan.parroquiaId = 'Elige la parroquia.';
    if (d.latitud === '' || isNaN(Number(d.latitud))) faltan.latitud = 'Indica la latitud (por ejemplo, -0.180653).';
    if (d.longitud === '' || isNaN(Number(d.longitud))) faltan.longitud = 'Indica la longitud (por ejemplo, -78.467834).';
    if (Object.keys(faltan).length) return setErrores(faltan);
    await enviar(async () => {
      await api('/huertos', {
        body: {
          ...d,
          nombre: d.nombre || undefined,
          provinciaId: +d.provinciaId,
          parroquiaId: +d.parroquiaId,
          latitud: +d.latitud,
          longitud: +d.longitud,
        },
      });
      toast('Huerto registrado. Ahora agrega tus plantas.');
      alCrear();
    });
  }

  return (
    <Tarjeta>
      <h2 className="mb-4 text-xl">Registrar el huerto</h2>
      <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
        <form onSubmit={alEnviar} noValidate className="flex flex-col gap-4">
          <ResumenErrores errores={resumen} />
          <Campo etiqueta="Nombre del huerto (opcional)" value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Selector
              etiqueta="Provincia"
              required
              opciones={Object.fromEntries((provincias ?? []).map((p) => [p.id, p.nombre]))}
              value={d.provinciaId}
              error={errores.provinciaId}
              onChange={(e) => setD({ ...d, provinciaId: e.target.value, parroquiaId: '' })}
            />
            <Selector
              etiqueta="Parroquia"
              required
              disabled={!d.provinciaId}
              ayuda={d.provinciaId ? undefined : 'Primero elige la provincia.'}
              opciones={Object.fromEntries(parroquias.map((p) => [p.id, p.nombre]))}
              value={d.parroquiaId}
              error={errores.parroquiaId}
              onChange={(e) => setD({ ...d, parroquiaId: e.target.value })}
            />
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 font-bold">Ubicación</legend>
            <Boton
              type="button"
              variante="secundario"
              onClick={usarUbicacion}
              cargando={gps === 'buscando'}
              textoCargando="Buscando ubicación…"
              className="sm:self-start"
            >
              <LocateFixed aria-hidden="true" className="size-5" />
              Usar mi ubicación actual
            </Boton>
            {gps === 'denegado' && <Banner tipo="aviso">No pudimos obtener tu ubicación. Escribe las coordenadas manualmente.</Banner>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                etiqueta="Latitud"
                inputMode="decimal"
                required
                value={d.latitud}
                error={errores.latitud}
                onChange={(e) => setD({ ...d, latitud: e.target.value })}
              />
              <Campo
                etiqueta="Longitud"
                inputMode="decimal"
                required
                value={d.longitud}
                error={errores.longitud}
                onChange={(e) => setD({ ...d, longitud: e.target.value })}
              />
            </div>
          </fieldset>
          <Boton type="submit" cargando={enviando} className="sm:self-start">
            Guardar huerto
          </Boton>
        </form>
        <div className="space-y-4">
          <Consejos titulo="Consejo ancestral: ubicación" consejos={CONSEJOS_ANCESTRALES.ubicacion} />
          <Consejos titulo="Consejo ancestral: cerca" consejos={CONSEJOS_ANCESTRALES.cerca} />
        </div>
      </div>
    </Tarjeta>
  );
}

const CICLOS = { CORTO: 'Ciclo corto', LARGO: 'Ciclo largo' };
const CUALIDADES = { CALIENTE: 'Caliente', FRIA: 'Fría' };

function ChipCualidad({ cualidad }: { cualidad: Planta['cualidad'] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-tierra-100 px-3 py-1 text-sm font-bold text-luna-800">
      {cualidad === 'CALIENTE' ? (
        <Sun aria-hidden="true" className="size-4 text-caliente" strokeWidth={2.5} />
      ) : (
        <Snowflake aria-hidden="true" className="size-4 text-info-800" strokeWidth={2.5} />
      )}
      {CUALIDADES[cualidad]}
    </span>
  );
}

/** HU-014 (sin fotos en v1). */
function FormularioPlanta({ huertoId, alCrear }: { huertoId: string; alCrear: () => void }) {
  const vacio = {
    nombreComun: '',
    nombreCientifico: '',
    ciclo: '',
    cualidad: '',
    usosMedicinales: '',
  };
  const [d, setD] = useState(vacio);
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const toast = useToast();

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    const faltan: Record<string, string> = {};
    if (!d.nombreComun.trim()) faltan.nombreComun = 'El nombre común es obligatorio.';
    if (!d.ciclo) faltan.ciclo = 'Elige el ciclo.';
    if (!d.cualidad) faltan.cualidad = 'Elige la cualidad.';
    if (!d.usosMedicinales.trim()) faltan.usosMedicinales = 'Los usos medicinales son obligatorios.';
    if (Object.keys(faltan).length) return setErrores(faltan);
    await enviar(async () => {
      await api(`/huertos/${huertoId}/plantas`, {
        body: { ...d, nombreCientifico: d.nombreCientifico || undefined },
      });
      toast(`${d.nombreComun} se agregó al huerto.`);
      setD(vacio);
      alCrear();
    });
  }

  return (
    <form onSubmit={alEnviar} noValidate className="flex flex-col gap-4">
      <h3 className="text-lg">Agregar planta</h3>
      <ResumenErrores errores={resumen} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Nombre común"
          required
          value={d.nombreComun}
          error={errores.nombreComun}
          onChange={(e) => setD({ ...d, nombreComun: e.target.value })}
        />
        <Campo
          etiqueta="Nombre científico (opcional)"
          value={d.nombreCientifico}
          onChange={(e) => setD({ ...d, nombreCientifico: e.target.value })}
        />
        <Selector
          etiqueta="Ciclo"
          required
          opciones={CICLOS}
          value={d.ciclo}
          error={errores.ciclo}
          onChange={(e) => setD({ ...d, ciclo: e.target.value })}
        />
        <Selector
          etiqueta="Cualidad"
          required
          ayuda="Según la medicina ancestral."
          opciones={CUALIDADES}
          value={d.cualidad}
          error={errores.cualidad}
          onChange={(e) => setD({ ...d, cualidad: e.target.value })}
        />
      </div>
      <Campo
        etiqueta="Usos medicinales"
        required
        ayuda="Sepáralos con comas. Ejemplo: digestivo, calmante."
        value={d.usosMedicinales}
        error={errores.usosMedicinales}
        onChange={(e) => setD({ ...d, usosMedicinales: e.target.value })}
      />
      <Boton type="submit" cargando={enviando} className="sm:self-start">
        Agregar planta
      </Boton>
    </form>
  );
}

export function Huerto() {
  const { yo } = useSesion();
  const { datos, error, cargando, recargar } = useDatos<HuertoMio>(yo?.comunidad ? '/huertos/mio' : null);
  const responsable = !!yo?.comunidad?.esResponsable;
  const h = datos?.huerto;
  const virtual = useDatos<{ plantas: { plantaId: string; etapa: Etapa }[] }>(h ? `/huertos/${h.id}/virtual` : null);
  const etapas = new Map(virtual.datos?.plantas.map((p) => [p.plantaId, p.etapa]));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl sm:text-4xl">Mi huerto</h1>
      {!yo?.comunidad ? (
        <EstadoVacio
          titulo="Aún no tienes comunidad"
          texto="Crea una comunidad para registrar tu huerto."
          accion={<EnlaceBoton to="/comunidad/nueva">Crear comunidad</EnlaceBoton>}
        />
      ) : cargando && !datos ? (
        <Cargando />
      ) : error ? (
        <Banner tipo="error">{error}</Banner>
      ) : !h ? (
        responsable ? (
          <FormularioHuerto alCrear={recargar} />
        ) : (
          <EstadoVacio titulo="Tu comunidad aún no tiene huerto" texto="El responsable de la comunidad debe registrarlo." />
        )
      ) : (
        <>
          <Tarjeta>
            <h2 className="text-xl">{h.nombre ?? 'Huerto de la comunidad'}</h2>
            <p className="flex items-center gap-1.5 text-luna-600">
              <MapPin aria-hidden="true" className="size-4" />
              {h.parroquia.nombre}, {h.provincia.nombre}
            </p>
          </Tarjeta>
          <Tarjeta>
            <h2 className="mb-2 text-xl">Plantas ({h.plantas.length})</h2>
            {h.plantas.length === 0 ? (
              <p className="mb-4 text-luna-600">Todavía no hay plantas registradas.</p>
            ) : (
              <ul className="mb-6 divide-y divide-tierra-300">
                {h.plantas.map((p) => {
                  const etapa = etapas.get(p.id);
                  return (
                    <li key={p.id} className="flex items-center gap-4 py-4">
                      <span className="grid size-16 shrink-0 place-items-center rounded-full bg-tierra-100">
                        <img src={`/etapas/${etapa?.recurso ?? 'etapa-0-inicial.svg'}`} alt="" className="size-14" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="font-bold">{p.nombreComun}</p>
                          <ChipCualidad cualidad={p.cualidad} />
                        </div>
                        <p className="text-sm text-luna-600">
                          {etapa ? `Etapa ${etapa.nivel}: ${etapa.nombre}` : 'Sin iniciar'} · {CICLOS[p.ciclo]}
                        </p>
                        <p className="text-sm">{p.usosMedicinales}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {responsable ? (
              <div className="border-t border-tierra-300 pt-6">
                <FormularioPlanta huertoId={h.id} alCrear={recargar} />
              </div>
            ) : (
              <p className="text-sm text-luna-600">Solo el responsable de la comunidad puede agregar plantas.</p>
            )}
          </Tarjeta>
        </>
      )}
    </div>
  );
}
