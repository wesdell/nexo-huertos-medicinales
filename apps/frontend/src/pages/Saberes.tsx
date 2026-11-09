import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { calendarioLunar, NOMBRE_CICLO, NOMBRE_CUALIDAD, NOMBRE_FASE, PASOS, RECOMENDACION_POR_FASE, type FaseLunar } from '@nexo/shared';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useDatos, type PlantaCatalogo } from '../datos';
import { Luna } from '../Luna';
import { Banner, Boton, Campo, Cargando, Chip, Encabezado, Guia, Tarjeta } from '../ui';

const ETAPAS = { PREPARACION: 'Preparación', SIEMBRA: 'Siembra', CRECIMIENTO: 'Crecimiento', COSECHA: 'Cosecha', POSTCOSECHA: 'Postcosecha' } as const;
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Calendario lunar del mes: cada día con su fase y, al elegirlo, lo que conviene hacer. */
export function CalendarioLunar() {
  const hoy = new Date();
  const [mes, setMes] = useState({ anio: hoy.getFullYear(), mes: hoy.getMonth() + 1 });
  const dias = calendarioLunar(mes.anio, mes.mes);
  const hoyIso = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const [elegido, setElegido] = useState(hoyIso);
  const fase = dias.find((d) => d.fecha === elegido)?.fase;
  const blancos = (new Date(Date.UTC(mes.anio, mes.mes - 1, 1)).getUTCDay() + 6) % 7; // semana desde el lunes
  const mover = (n: number) => {
    const d = new Date(Date.UTC(mes.anio, mes.mes - 1 + n, 1));
    setMes({ anio: d.getUTCFullYear(), mes: d.getUTCMonth() + 1 });
  };
  return (
    <Tarjeta className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl" aria-live="polite">
          {MESES[mes.mes - 1]} de {mes.anio}
        </h2>
        <div className="flex gap-2">
          <Boton variante="secundario" onClick={() => mover(-1)} className="px-3" aria-label="Mes anterior">
            <ChevronLeft aria-hidden="true" className="size-5" />
          </Boton>
          <Boton variante="secundario" onClick={() => mover(1)} className="px-3" aria-label="Mes siguiente">
            <ChevronRight aria-hidden="true" className="size-5" />
          </Boton>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-bold text-luna-600" aria-hidden="true">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <ul className="grid grid-cols-7 gap-1">
        {Array.from({ length: blancos }, (_, i) => (
          <li key={`b${i}`} aria-hidden="true" />
        ))}
        {dias.map((d) => (
          <li key={d.fecha}>
            <button
              onClick={() => setElegido(d.fecha)}
              aria-pressed={elegido === d.fecha}
              aria-label={`${Number(d.fecha.slice(8))} de ${MESES[mes.mes - 1]}: ${d.fase ? NOMBRE_FASE[d.fase] : ''}`}
              className={`presionable flex w-full flex-col items-center gap-1 rounded-xl py-1.5 ${elegido === d.fecha ? 'bg-primary-50 ring-2 ring-primary-600' : 'hover:bg-tierra-100'} ${d.fecha === hoyIso ? 'font-black' : ''}`}
            >
              <span className="text-sm tabular-nums">{Number(d.fecha.slice(8))}</span>
              {d.fase && <Luna fase={d.fase} className="size-6" />}
            </button>
          </li>
        ))}
      </ul>
      {fase && (
        <div role="status" className="flex items-center gap-3 rounded-2xl bg-tierra-100 p-4">
          <Luna fase={fase} className="size-10 shrink-0" />
          <p>
            <strong>{NOMBRE_FASE[fase as FaseLunar]}.</strong> {RECOMENDACION_POR_FASE[fase as FaseLunar]}
          </p>
        </div>
      )}
    </Tarjeta>
  );
}

/** Parte educativa: los pasos del huerto según los lineamientos del MSP y el calendario lunar. */
export function Saberes() {
  return (
    <div className="space-y-8">
      <Encabezado
        titulo="Saberes ancestrales del huerto"
        texto="Los 13 pasos de un ciclo de plantas medicinales, desde la preparación de la tierra hasta el empaquetado, según los lineamientos del Ministerio de Salud Pública (2017)."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <ol className="space-y-4">
          {PASOS.map((p) => (
            <li key={p.tipo}>
              <Tarjeta className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-luna-800 font-black text-white" aria-hidden="true">
                    {p.orden}
                  </span>
                  <h2 className="text-xl">{p.nombre}</h2>
                  <Chip>{ETAPAS[p.etapa]}</Chip>
                  {p.repetible && <Chip tono="info">Se repite</Chip>}
                </div>
                <Guia cuando={p.cuando} como={p.como} />
                {p.fases && (
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    Fases recomendadas:
                    {p.fases.map((f) => (
                      <span key={f} className="inline-flex items-center gap-1 font-bold">
                        <Luna fase={f} className="size-5" />
                        {NOMBRE_FASE[f]}
                      </span>
                    ))}
                  </p>
                )}
              </Tarjeta>
            </li>
          ))}
        </ol>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <CalendarioLunar />
          <Banner tipo="info">
            En la línea ecuatorial la luna creciente y la menguante se ven como un bote. Las mujeres y hombres de sabiduría de cada territorio guían los
            rituales.
          </Banner>
        </aside>
      </div>
    </div>
  );
}

export function Plantas() {
  const [q, setQ] = useState('');
  const [altitud, setAltitud] = useState('');
  const ruta = `/publico/plantas?${new URLSearchParams({ ...(q.trim() ? { q: q.trim() } : {}), ...(altitud ? { altitud } : {}) })}`;
  const { datos, cargando, error } = useDatos<PlantaCatalogo[]>(ruta);
  return (
    <div className="space-y-6">
      <Encabezado titulo="Catálogo de plantas medicinales" texto="Lo administra el Ministerio de Salud Pública. Solo incluye plantas medicinales." />
      <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
        <Campo etiqueta="Buscar por nombre" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ejemplo: manzanilla" />
        <Campo etiqueta="Altitud de tu huerto (m)" inputMode="numeric" value={altitud} onChange={(e) => setAltitud(e.target.value.replace(/\D/g, ''))} />
      </div>
      {error && <Banner tipo="error">{error}</Banner>}
      {cargando && !datos ? (
        <Cargando />
      ) : datos?.length === 0 ? (
        <p className="flex items-center gap-2 text-luna-600">
          <Search aria-hidden="true" className="size-5" /> No hay plantas con ese nombre.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {datos?.map((p) => (
            <li key={p.id}>
              <Link to={`/plantas/${p.id}`} className="presionable block h-full rounded-tarjeta bg-white p-5 shadow-tarjeta hover:bg-tierra-50">
                <p className="font-display text-lg font-extrabold">{p.nombreComun}</p>
                <p className="italic text-luna-600">{p.nombreCientifico}</p>
                <p className="mt-2 line-clamp-2 text-sm">{p.usosMedicinales}</p>
                <p className="mt-3 flex flex-wrap gap-2">
                  <Chip tono={p.cualidad === 'CALIENTE' ? 'caliente' : 'fria'}>{NOMBRE_CUALIDAD[p.cualidad]}</Chip>
                  <Chip>
                    {p.altitudMin ?? 0}–{p.altitudMax ?? '…'} m
                  </Chip>
                  {p.apta === true && <Chip tono="exito">Apta para tu altitud</Chip>}
                  {p.apta === false && <Chip tono="aviso">Otra altitud</Chip>}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PlantaDetalle() {
  const { id } = useParams();
  const { datos: p, cargando, error } = useDatos<PlantaCatalogo & { _count: { huertos: number } }>(`/publico/plantas/${id}`);
  if (error) return <Banner tipo="error">{error}</Banner>;
  if (cargando || !p) return <Cargando />;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/plantas" className="inline-flex min-h-11 items-center gap-1 font-bold text-primary-700 underline">
        <ChevronLeft aria-hidden="true" className="size-4" /> Catálogo
      </Link>
      <Encabezado titulo={p.nombreComun} texto={<em>{p.nombreCientifico}</em>} />
      <div className="flex flex-wrap gap-2">
        <Chip tono={p.cualidad === 'CALIENTE' ? 'caliente' : 'fria'}>Planta {NOMBRE_CUALIDAD[p.cualidad].toLowerCase()}</Chip>
        <Chip>{NOMBRE_CICLO[p.ciclo]}</Chip>
        <Chip>
          {p.altitudMin ?? 0} a {p.altitudMax ?? '…'} m
        </Chip>
        <Chip tono="info">En {p._count.huertos} huertos</Chip>
      </div>
      {p.fotoUrl && <img src={p.fotoUrl} alt={`Foto de ${p.nombreComun}`} className="max-h-80 w-full rounded-tarjeta object-cover" />}
      <Tarjeta className="space-y-3">
        <dl className="space-y-3">
          {[
            ['Usos medicinales', p.usosMedicinales],
            ['Parte que se usa', p.parteUsada],
            ['Dosificación', p.dosificacion],
            ['Contraindicaciones', p.contraindicaciones],
            ['Otros nombres', p.otrosNombres.join(', ')],
            ['Familia botánica', p.familiaBotanica],
            ['Provincias donde crece', p.provincias.join(', ')],
          ]
            .filter(([, v]) => v)
            .map(([t, v]) => (
              <div key={t}>
                <dt className="font-bold">{t}</dt>
                <dd className="text-luna-600">{v}</dd>
              </div>
            ))}
        </dl>
      </Tarjeta>
      <Banner tipo="aviso">Esta información es educativa. Ante síntomas graves, acude al centro de salud más cercano.</Banner>
    </div>
  );
}
