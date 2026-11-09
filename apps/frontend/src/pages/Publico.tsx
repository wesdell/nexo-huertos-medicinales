import { useParams, useSearchParams, Link } from 'react-router';
import {
  BONO_SABER,
  FACTOR_INTENTO,
  MAX_HORAS_DIA,
  NOMBRE_CUALIDAD,
  NOMBRE_DISENO,
  NOMBRE_NIVEL,
  NOMBRE_VARIANTE,
  NOMBRE_SUELO,
  NOMBRE_AGUA,
  NOMBRE_ABONO,
  NOMBRE_ACTIVIDAD,
  PUNTOS_POR_HORA,
  REQUISITOS_NIVEL,
  TALENTOS,
  MISIONES,
  PARTICIPACIONES_TALENTO,
  TipoDiseno,
  type Etapa,
  type TipoActividad,
  type VarianteDiseno,
} from '@nexo/shared';
import { Award, Leaf, MapPin, Mountain, Package, Sprout, Trophy, Users } from 'lucide-react';
import { fechaCorta, numero, useDatos } from '../datos';
import { Luna } from '../Luna';
import { MapaHuertos, type PinHuerto, COLOR_TIPO } from '../Mapa';
import { Banner, BarraProgreso, Cargando, Chip, Cifra, EnlaceBoton, Encabezado, Tarjeta } from '../ui';

interface Resumen {
  huertos: number;
  voluntarios: number;
  provincias: number;
  paquetes: number;
  plantas: number;
  recomendacion: { fase: string; nombre: string; texto: string } | null;
}

/** Portada pública: qué es, cómo participar, cifras y el día lunar. */
const cifra = (n?: number) => (n === undefined ? '…' : numero(n));

export function Portada() {
  const r = useDatos<Resumen>('/publico/resumen');
  const mapa = useDatos<PinHuerto[]>('/publico/huertos');
  return (
    <div className="space-y-14">
      <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <h1 className="text-4xl leading-tight sm:text-5xl">Huertos medicinales comunitarios para cuidar la salud con los saberes ancestrales</h1>
          <p className="max-w-prose text-lg text-luna-600">
            Con el Ministerio de Salud Pública, las comunidades crean huertos de plantas medicinales, aprenden cada paso según el calendario lunar y
            entregan plantas secas a la población. Cada hora de trabajo cuenta.
          </p>
          <div className="flex flex-wrap gap-3">
            <EnlaceBoton to="/solicitar">Solicitar mi huerto</EnlaceBoton>
            <EnlaceBoton to="/saberes" variante="secundario">
              Aprender los saberes
            </EnlaceBoton>
          </div>
        </div>
        {/* Espacio reservado para que la tarjeta no empuje el contenido al cargar (CLS). */}
        <div className="min-h-36">
          {r.datos?.recomendacion && (
            <Tarjeta className="flex items-center gap-5">
              <Luna fase={r.datos.recomendacion.fase} className="size-24 shrink-0" />
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-luna-600">Hoy en el huerto</p>
                <h2 className="text-2xl">{r.datos.recomendacion.nombre}</h2>
                <p className="mt-1">{r.datos.recomendacion.texto}</p>
              </div>
            </Tarjeta>
          )}
        </div>
      </section>

      <section aria-labelledby="cifras" className="space-y-4" aria-busy={!r.datos}>
        <h2 id="cifras" className="text-2xl">
          El país que siembra
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Cifra valor={cifra(r.datos?.huertos)} etiqueta="Huertos activos" Icono={Sprout} />
          <Cifra valor={cifra(r.datos?.voluntarios)} etiqueta="Voluntarios" Icono={Users} />
          <Cifra valor={cifra(r.datos?.provincias)} etiqueta="Provincias" Icono={MapPin} />
          <Cifra valor={cifra(r.datos?.paquetes)} etiqueta="Paquetes entregados" Icono={Package} />
          <Cifra valor={cifra(r.datos?.plantas)} etiqueta="Plantas en el catálogo" Icono={Leaf} />
        </div>
      </section>

      <section aria-labelledby="pasos" className="space-y-4">
        <h2 id="pasos" className="text-2xl">
          Cómo participar
        </h2>
        <ol className="grid gap-3 md:grid-cols-4">
          {[
            ['Solicita tu huerto', 'Basta con una persona responsable. Marca la ubicación, el tipo de huerto y tus datos de contacto.'],
            ['El MSP te contacta', 'Un técnico revisa la solicitud. Si se aprueba, recibes tu usuario y contraseña por correo.'],
            ['Siembra con los saberes', 'Elige plantas del catálogo según tu altitud y sigue cada paso con su fase lunar.'],
            ['Registra y suma', 'Registra quién trabajó y cuántas horas, con fotos reales. El MSP valida y suben los puntos y niveles.'],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-tarjeta bg-white p-5 shadow-tarjeta">
              <span className="grid size-10 place-items-center rounded-full bg-primary-600 font-black text-white" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg">{t}</h3>
              <p className="mt-1 text-luna-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {mapa.datos && mapa.datos.length > 0 && (
        <section aria-labelledby="mapa" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="mapa" className="text-2xl">
              Huertos en el mapa
            </h2>
            <EnlaceBoton to="/mapa" variante="texto">
              Ver todos los huertos
            </EnlaceBoton>
          </div>
          <MapaHuertos huertos={mapa.datos} alto="h-80" />
        </section>
      )}
    </div>
  );
}

export function PaginaMapa() {
  const { datos, cargando, error } = useDatos<(PinHuerto & { parroquia: { nombre: string }; plantas: number })[]>('/publico/huertos');
  return (
    <div className="space-y-6">
      <Encabezado titulo="Mapa de huertos" texto="La ubicación es aproximada (unos 1 km) para cuidar la privacidad de quienes siembran en casa." />
      {error && <Banner tipo="error">{error}</Banner>}
      {cargando || !datos ? (
        <Cargando />
      ) : (
        <>
          <MapaHuertos huertos={datos} />
          <ul className="flex flex-wrap gap-3 text-sm" aria-label="Leyenda">
            {Object.values(TipoDiseno).map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ background: COLOR_TIPO[t] }} aria-hidden="true" />
                {NOMBRE_DISENO[t]}
              </li>
            ))}
          </ul>
          <h2 className="text-2xl">Todos los huertos</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {datos.map((h) => (
              <li key={h.id}>
                <Link to={`/huertos/${h.id}`} className="presionable block h-full rounded-tarjeta bg-white p-5 shadow-tarjeta hover:bg-tierra-50">
                  <p className="font-display text-lg font-extrabold">{h.nombre}</p>
                  <p className="text-luna-600">
                    {h.parroquia.nombre}, {h.provincia.nombre}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-2">
                    <Chip>{NOMBRE_DISENO[h.tipo]}</Chip>
                    <Chip tono="info">{h.voluntarios} voluntarios</Chip>
                    <Chip tono="exito">{h.plantas} plantas</Chip>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

interface Ficha {
  id: string;
  nombre: string;
  tipo: TipoDiseno;
  subtipos: VarianteDiseno[];
  altitud: number;
  tipoSuelo: keyof typeof NOMBRE_SUELO | null;
  tipoAgua: keyof typeof NOMBRE_AGUA | null;
  tipoAbono: keyof typeof NOMBRE_ABONO | null;
  areaM2: string | null;
  puntosTotales: number;
  creadoEn: string;
  provincia: { nombre: string };
  parroquia: { nombre: string };
  plantas: { id: string; nombreComun: string; nombreCientifico: string; cualidad: 'CALIENTE' | 'FRIA' }[];
  voluntarios: number;
  niveles: Record<'APRENDIZ' | 'OFICIAL' | 'MAESTRO', number>;
  espejo: EspejoDatos;
  insignias: { codigo: string; insignia: string; descripcion: string }[];
  posicion: number | null;
  totalRanking: number;
  paquetes: number;
  historia: { id: string; url: string; actividad: { tipo: TipoActividad; fecha: string; ciclo: { planta: { nombreComun: string } } } }[];
}

export interface EspejoDatos {
  progreso: number;
  plantas: { cicloId: string; planta: { nombreComun: string }; estado: string; etapa: Etapa; siguiente: string | null }[];
}

/** Espejo digital: cada planta muestra la etapa de su ciclo actual. */
export function Espejo({ espejo, brota }: { espejo: EspejoDatos; brota?: string }) {
  if (!espejo.plantas.length) return <p className="text-luna-600">Aún no hay ciclos de siembra.</p>;
  return (
    <div className="space-y-4">
      <BarraProgreso valor={espejo.progreso} etiqueta="Avance del huerto" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {espejo.plantas.map((p) => (
          <li key={p.cicloId} className="flex flex-col items-center rounded-tarjeta bg-tierra-50 p-3 text-center">
            <img src={`/etapas/${p.etapa.recurso}`} alt="" className={`aspect-square w-full max-w-32 ${brota === p.cicloId ? 'brotar' : ''}`} />
            <p className="mt-2 font-bold">{p.planta.nombreComun}</p>
            <p className="text-sm text-luna-600">
              Etapa {p.etapa.nivel}: {p.etapa.nombre}
            </p>
            {p.siguiente && <p className="mt-1 text-sm">Sigue: {p.siguiente}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FichaHuerto() {
  const { id } = useParams();
  const { datos: h, cargando, error } = useDatos<Ficha>(`/publico/huertos/${id}`);
  if (error) return <Banner tipo="error">{error}</Banner>;
  if (cargando || !h) return <Cargando />;
  return (
    <div className="space-y-6">
      <Encabezado
        titulo={h.nombre}
        texto={`${h.parroquia.nombre}, ${h.provincia.nombre} · ${NOMBRE_DISENO[h.tipo]} (${h.subtipos.map((s) => NOMBRE_VARIANTE[s]).join(', ')}) · ${numero(h.altitud)} m`}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Cifra valor={h.posicion ? `${h.posicion}.º de ${h.totalRanking}` : '—'} etiqueta={`Ranking ${NOMBRE_DISENO[h.tipo].toLowerCase()}`} Icono={Trophy} />
        <Cifra valor={h.voluntarios} etiqueta="Voluntarios activos" Icono={Users} />
        <Cifra valor={numero(h.puntosTotales)} etiqueta="Puntos" Icono={Award} />
        <Cifra valor={numero(h.paquetes)} etiqueta="Paquetes entregados" Icono={Package} />
      </div>
      <Tarjeta className="space-y-4">
        <h2 className="text-2xl">Huerto virtual</h2>
        <Espejo espejo={h.espejo} />
      </Tarjeta>
      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta className="space-y-3">
          <h2 className="text-2xl">Plantas</h2>
          <ul className="space-y-2">
            {h.plantas.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <Link to={`/plantas/${p.id}`} className="font-bold text-primary-700 underline decoration-2">
                  {p.nombreComun} <span className="font-normal italic text-luna-600">({p.nombreCientifico})</span>
                </Link>
                <Chip tono={p.cualidad === 'CALIENTE' ? 'caliente' : 'fria'}>{NOMBRE_CUALIDAD[p.cualidad]}</Chip>
              </li>
            ))}
          </ul>
        </Tarjeta>
        <Tarjeta className="space-y-3">
          <h2 className="text-2xl">Comunidad</h2>
          <ul className="flex flex-wrap gap-2">
            {(['APRENDIZ', 'OFICIAL', 'MAESTRO'] as const).map((n) => (
              <li key={n}>
                <Chip tono="info">
                  {h.niveles[n]} {h.niveles[n] === 1 ? NOMBRE_NIVEL[n].toLowerCase() : PLURAL_NIVEL[n]}
                </Chip>
              </li>
            ))}
          </ul>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {h.tipoSuelo && <Dato t="Suelo" v={NOMBRE_SUELO[h.tipoSuelo]} />}
            {h.tipoAgua && <Dato t="Agua" v={NOMBRE_AGUA[h.tipoAgua]} />}
            {h.tipoAbono && <Dato t="Abono" v={NOMBRE_ABONO[h.tipoAbono]} />}
            {h.areaM2 && <Dato t="Área" v={`${numero(Number(h.areaM2))} m²`} />}
            <Dato t="Desde" v={fechaCorta(h.creadoEn)} />
          </dl>
          <h3 className="pt-2 text-lg">Insignias</h3>
          {h.insignias.length ? (
            <ul className="flex flex-wrap gap-2">
              {h.insignias.map((i) => (
                <li key={i.codigo} title={i.descripcion}>
                  <Chip tono="exito" Icono={Award}>
                    {i.insignia}
                  </Chip>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-luna-600">Aún sin insignias.</p>
          )}
        </Tarjeta>
      </div>
      <Tarjeta className="space-y-3">
        <h2 className="text-2xl">Historia visual</h2>
        {h.historia.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {h.historia.map((f) => (
              <li key={f.id}>
                <figure>
                  <img src={f.url} alt={`${NOMBRE_ACTIVIDAD[f.actividad.tipo]} de ${f.actividad.ciclo.planta.nombreComun}`} className="aspect-[4/3] w-full rounded-xl object-cover" loading="lazy" />
                  <figcaption className="mt-1 text-sm text-luna-600">
                    {NOMBRE_ACTIVIDAD[f.actividad.tipo]} · {fechaCorta(f.actividad.fecha)}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-luna-600">Las fotos validadas por el MSP aparecerán aquí.</p>
        )}
      </Tarjeta>
    </div>
  );
}

const PLURAL_NIVEL = { APRENDIZ: 'aprendices', OFICIAL: 'oficiales', MAESTRO: 'maestros' } as const;

const Dato = ({ t, v }: { t: string; v: string }) => (
  <div>
    <dt className="text-luna-600">{t}</dt>
    <dd className="font-bold">{v}</dd>
  </div>
);

interface FilaRanking {
  id: string;
  nombre: string;
  tipo: TipoDiseno;
  provincia: string;
  puntos: number;
  voluntarios: number;
  indice: number;
  posicion: number;
}

export function Ranking() {
  const [params, setParams] = useSearchParams();
  const tipo = params.get('tipo') ?? 'EN_TIERRA';
  const r = useDatos<FilaRanking[]>(`/publico/ranking?tipo=${tipo}`);
  const p = useDatos<{ id: string; nombre: string; tipo: TipoDiseno; paquetes: number; posicion: number }[]>('/publico/ranking/produccion');
  return (
    <div className="space-y-6">
      <Encabezado
        titulo="Ranking de huertos"
        texto={
          <>
            Un ranking por tipo de huerto. El índice divide los puntos de los últimos 12 meses entre la raíz de los voluntarios activos más uno, para que
            huertos grandes y pequeños compitan en igualdad.{' '}
            <Link to="/puntos" className="font-bold text-primary-700 underline">
              Cómo se calcula
            </Link>
          </>
        }
      />
      <div role="group" aria-label="Tipo de huerto" className="flex flex-wrap gap-2">
        {Object.values(TipoDiseno).map((t) => (
          <button
            key={t}
            onClick={() => setParams({ tipo: t })}
            aria-pressed={tipo === t}
            className={`presionable min-h-11 rounded-full border-2 px-4 font-bold ${tipo === t ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-tierra-300 bg-white text-luna-600'}`}
          >
            {NOMBRE_DISENO[t]}
          </button>
        ))}
      </div>
      <Tarjeta className="overflow-x-auto p-0 sm:p-0">
        {r.cargando ? (
          <div className="p-5">
            <Cargando />
          </div>
        ) : !r.datos?.length ? (
          <p className="p-5 text-luna-600">Aún no hay huertos de este tipo.</p>
        ) : (
          <table className="w-full min-w-[36rem] text-left">
            <caption className="sr-only">Ranking de huertos {NOMBRE_DISENO[tipo as TipoDiseno]?.toLowerCase()}</caption>
            <thead className="border-b border-tierra-300 text-sm text-luna-600">
              <tr>
                <th className="px-5 py-3">Puesto</th>
                <th className="px-3 py-3">Huerto</th>
                <th className="px-3 py-3 text-right">Puntos (12 meses)</th>
                <th className="px-3 py-3 text-right">Voluntarios</th>
                <th className="px-5 py-3 text-right">Índice</th>
              </tr>
            </thead>
            <tbody>
              {r.datos.map((f) => (
                <tr key={f.id} className="border-b border-tierra-100 last:border-0">
                  <td className="px-5 py-3 font-black tabular-nums">
                    {f.posicion <= 3 ? <Trophy aria-hidden="true" className={`mr-1 inline size-5 ${f.posicion === 1 ? 'text-oro' : 'text-luna-600'}`} /> : null}
                    {f.posicion}
                  </td>
                  <td className="px-3 py-3">
                    <Link to={`/huertos/${f.id}`} className="font-bold text-primary-700 underline decoration-2">
                      {f.nombre}
                    </Link>
                    <span className="block text-sm text-luna-600">{f.provincia}</span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{numero(f.puntos)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{f.voluntarios}</td>
                  <td className="px-5 py-3 text-right font-bold tabular-nums">{numero(f.indice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>
      <section className="space-y-3">
        <h2 className="text-2xl">Producción del año</h2>
        <p className="text-luna-600">Paquetes de plantas secas entregados con evidencia validada. El financiamiento futuro del MSP se basa en este histórico.</p>
        {p.datos?.length ? (
          <ol className="grid gap-2 sm:grid-cols-2">
            {p.datos.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-tarjeta">
                <span>
                  <span className="mr-2 font-black tabular-nums">{f.posicion}.</span>
                  <Link to={`/huertos/${f.id}`} className="font-bold text-primary-700 underline">
                    {f.nombre}
                  </Link>
                </span>
                <Chip tono="exito" Icono={Package}>
                  {numero(f.paquetes)} paquetes
                </Chip>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-luna-600">Aún no hay producción registrada este año.</p>
        )}
      </section>
    </div>
  );
}

interface Stats {
  porProvincia: { id: number; nombre: string; region: string; huertos: number }[];
  porTipo: { tipo: TipoDiseno; huertos: number }[];
  porNivel: { nivel: 'APRENDIZ' | 'OFICIAL' | 'MAESTRO'; voluntarios: number }[];
  produccionPorAnio: { anio: number; paquetes: number }[];
  plantasMasCultivadas: { planta: string; huertos: number }[];
  ciclos: Partial<Record<'ACTIVO' | 'COMPLETADO' | 'FALLIDO', number>>;
}

/** Barras horizontales con el número escrito: se leen sin depender del color ni del tamaño. */
function Barras({ titulo, filas }: { titulo: string; filas: { etiqueta: string; valor: number }[] }) {
  const max = Math.max(1, ...filas.map((f) => f.valor));
  return (
    <Tarjeta className="space-y-3">
      <h2 className="text-xl">{titulo}</h2>
      <ul className="space-y-2">
        {filas.map((f) => (
          <li key={f.etiqueta} className="grid grid-cols-[minmax(7rem,10rem)_1fr_auto] items-center gap-3 text-sm">
            <span className="truncate font-bold" title={f.etiqueta}>
              {f.etiqueta}
            </span>
            <span className="h-3 overflow-hidden rounded-full bg-tierra-100" aria-hidden="true">
              <span className="block h-full rounded-full bg-primary-600" style={{ width: `${(f.valor / max) * 100}%` }} />
            </span>
            <span className="w-10 text-right font-bold tabular-nums">{numero(f.valor)}</span>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

export function Estadisticas() {
  const { datos: s, cargando, error } = useDatos<Stats>('/publico/estadisticas');
  if (error) return <Banner tipo="error">{error}</Banner>;
  if (cargando || !s) return <Cargando />;
  const conHuertos = s.porProvincia.filter((p) => p.huertos > 0).sort((a, b) => b.huertos - a.huertos);
  const sin = s.porProvincia.filter((p) => p.huertos === 0);
  return (
    <div className="space-y-6">
      <Encabezado titulo="Estadísticas" texto="Información pública para conocer el alcance de los huertos medicinales comunitarios." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Cifra valor={s.ciclos.ACTIVO ?? 0} etiqueta="Ciclos en curso" Icono={Sprout} />
        <Cifra valor={s.ciclos.COMPLETADO ?? 0} etiqueta="Ciclos completados" Icono={Award} />
        <Cifra valor={s.ciclos.FALLIDO ?? 0} etiqueta="Cosechas perdidas" Icono={Mountain} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Barras titulo="Huertos por provincia" filas={conHuertos.map((p) => ({ etiqueta: p.nombre, valor: p.huertos }))} />
        <div className="space-y-6">
          <Barras titulo="Huertos por tipo" filas={s.porTipo.map((t) => ({ etiqueta: NOMBRE_DISENO[t.tipo], valor: t.huertos }))} />
          <Barras titulo="Voluntarios por nivel" filas={s.porNivel.map((n) => ({ etiqueta: NOMBRE_NIVEL[n.nivel], valor: n.voluntarios }))} />
        </div>
        <Barras titulo="Plantas más cultivadas (huertos)" filas={s.plantasMasCultivadas.map((p) => ({ etiqueta: p.planta, valor: p.huertos }))} />
        <Barras titulo="Paquetes entregados por año" filas={s.produccionPorAnio.map((p) => ({ etiqueta: String(p.anio), valor: p.paquetes }))} />
      </div>
      {sin.length > 0 && (
        <Banner tipo="info">
          Provincias que aún no tienen huerto: {sin.map((p) => p.nombre).join(', ')}.{' '}
          <Link to="/solicitar" className="font-bold underline">
            Solicita el primero
          </Link>
          .
        </Banner>
      )}
    </div>
  );
}

/** Reglas de puntos, niveles, talentos y misiones (propuesta del equipo a los pendientes de la reunión MSP). */
export function ComoPuntos() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Encabezado titulo="Cómo funcionan los puntos" texto="Reglas de la gamificación acordadas con el Ministerio de Salud Pública." />
      <Tarjeta className="space-y-3">
        <h2 className="text-2xl">Puntos por hora</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Cada hora trabajada vale <strong>{PUNTOS_POR_HORA} puntos</strong> para cada voluntario, sin importar el tipo de trabajo.
          </li>
          <li>
            Si la actividad siguió el calendario lunar y los horarios de los saberes, suma un <strong>{BONO_SABER * 100} % extra</strong>.
          </li>
          <li>
            Los puntos llegan cuando el <strong>técnico del MSP valida la evidencia</strong> (fotos o videos reales del huerto). Si la evidencia no es válida, hay
            una segunda oportunidad que vale el {FACTOR_INTENTO[1] * 100} %. Si vuelve a fallar no hay puntos, pero el huerto sigue.
          </li>
          <li>Un paso que no se hizo queda como «no cumplido» y no suma. Nadie es expulsado ni penalizado.</li>
          <li>Nadie puede sumar más de {MAX_HORAS_DIA} horas en un día. El responsable es el primer filtro; el MSP, el segundo.</li>
        </ul>
      </Tarjeta>
      <Tarjeta className="space-y-3">
        <h2 className="text-2xl">Niveles</h2>
        <p>El nivel sube solo y nunca baja. Quien tiene experiencia puede entrar como Oficial o Maestro si el MSP aprueba la justificación del responsable.</p>
        <ul className="space-y-2">
          <li>
            <Chip>Aprendiz</Chip> al empezar.
          </li>
          <li>
            <Chip tono="info">Oficial</Chip> con {REQUISITOS_NIVEL.OFICIAL.horas} horas validadas en al menos {REQUISITOS_NIVEL.OFICIAL.tipos} tipos de actividad.
          </li>
          <li>
            <Chip tono="exito">Maestro</Chip> con {REQUISITOS_NIVEL.MAESTRO.horas} horas, {REQUISITOS_NIVEL.MAESTRO.tipos} tipos de actividad y al menos un ciclo
            completo hasta el empaquetado.
          </li>
        </ul>
      </Tarjeta>
      <Tarjeta className="space-y-3">
        <h2 className="text-2xl">Talentos certificados</h2>
        <p>Un talento se certifica con {PARTICIPACIONES_TALENTO} participaciones validadas en sus actividades.</p>
        <ul className="flex flex-wrap gap-2">
          {TALENTOS.map((t) => (
            <li key={t.codigo}>
              <Chip tono="info">{t.nombre}</Chip>
            </li>
          ))}
        </ul>
      </Tarjeta>
      <Tarjeta className="space-y-3">
        <h2 className="text-2xl">Misiones e insignias del huerto</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {MISIONES.map((m) => (
            <li key={m.codigo} className="rounded-2xl bg-tierra-50 p-3">
              <p className="font-bold">{m.nombre}</p>
              <p className="text-sm text-luna-600">{m.descripcion}</p>
              <p className="mt-1 text-sm">
                Insignia: <strong>{m.insignia}</strong>
              </p>
            </li>
          ))}
        </ul>
      </Tarjeta>
      <Tarjeta className="space-y-3">
        <h2 className="text-2xl">Rankings</h2>
        <p>
          Hay un ranking por tipo de huerto (en tierra, vertical, colgante y en piso). El índice es <strong>puntos de los últimos 12 meses ÷ √(voluntarios activos + 1)</strong>
          : la raíz evita que un huerto de una sola persona gane solo por dividir entre uno y no castiga a los grupos grandes. Además se publica la producción del año
          (paquetes entregados), base del financiamiento.
        </p>
      </Tarjeta>
    </div>
  );
}

