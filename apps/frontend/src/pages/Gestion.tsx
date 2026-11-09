import { useEffect, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router';
import {
  CONSEJOS_ANCESTRALES,
  MAX_SUBTIPOS,
  NOMBRE_ABONO,
  NOMBRE_AGUA,
  NOMBRE_CERCA,
  NOMBRE_CUALIDAD,
  NOMBRE_DISENO,
  NOMBRE_ESPACIO,
  NOMBRE_SUELO,
  NOMBRE_VARIANTE,
  VARIANTES_POR_DISENO,
  type EspacioBodega,
  type TipoDiseno,
  type VarianteDiseno,
} from '@nexo/shared';
import { Award, Check, Package, Pencil, Trash2, Trophy } from 'lucide-react';
import { api } from '../api';
import { fechaCorta, numero, useDatos } from '../datos';
import { useEnvio } from '../formulario';
import { Banner, BarraProgreso, Boton, Campo, Cargando, Casilla, Chip, Cifra, Encabezado, EstadoVacio, ResumenErrores, Selector, Tarjeta, useToast } from '../ui';
import { useHuerto } from './Panel';
import { Espejo, type EspejoDatos } from './Publico';

interface DatosHuerto {
  id: string;
  nombre: string;
  tipo: TipoDiseno;
  subtipos: VarianteDiseno[];
  direccion: string | null;
  tipoCerca: string | null;
  materialCerca: string | null;
  areaM2: string | null;
  tipoSuelo: string | null;
  tipoAgua: string | null;
  detalleAgua: string | null;
  tipoAbono: string | null;
}

/** Información operativa que el responsable completa después de la aprobación. */
export function DatosHuerto() {
  const id = useHuerto();
  const { datos, cargando } = useDatos<DatosHuerto>(id ? `/huertos/${id}` : null);
  const toast = useToast();
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [d, setD] = useState<Record<string, string>>({});
  const [subtipos, setSubtipos] = useState<VarianteDiseno[]>([]);
  useEffect(() => {
    if (!datos) return;
    setD({
      direccion: datos.direccion ?? '',
      tipoCerca: datos.tipoCerca ?? '',
      materialCerca: datos.materialCerca ?? '',
      areaM2: datos.areaM2 ? String(Number(datos.areaM2)) : '',
      tipoSuelo: datos.tipoSuelo ?? '',
      tipoAgua: datos.tipoAgua ?? '',
      detalleAgua: datos.detalleAgua ?? '',
      tipoAbono: datos.tipoAbono ?? '',
    });
    setSubtipos(datos.subtipos);
  }, [datos]);
  if (cargando || !datos) return <Cargando />;

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!subtipos.length) return setErrores({ subtipos: 'Elige al menos un subtipo.' });
    const limpio = Object.fromEntries(Object.entries(d).filter(([, v]) => v !== ''));
    await enviar(async () => {
      await api(`/huertos/${id}`, { method: 'PATCH', body: { ...limpio, subtipos, ...(limpio.areaM2 ? { areaM2: Number(limpio.areaM2.replace(',', '.')) } : {}) } });
      toast('Datos del huerto guardados.');
    });
  }
  const cambiar = (k: string) => (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value });

  return (
    <div className="space-y-6">
      <Encabezado titulo="Datos del huerto" texto={`${datos.nombre} · ${NOMBRE_DISENO[datos.tipo]}. Completa la información operativa del huerto real.`} />
      <form onSubmit={guardar} noValidate className="space-y-6">
        <ResumenErrores errores={resumen} />
        <Tarjeta className="space-y-3">
          <fieldset>
            <legend className="font-display text-xl font-extrabold">Subtipos (hasta {MAX_SUBTIPOS})</legend>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {VARIANTES_POR_DISENO[datos.tipo].map((v) => (
                <Casilla
                  key={v}
                  etiqueta={NOMBRE_VARIANTE[v]}
                  checked={subtipos.includes(v)}
                  disabled={!subtipos.includes(v) && subtipos.length >= MAX_SUBTIPOS}
                  onChange={() => setSubtipos(subtipos.includes(v) ? subtipos.filter((s) => s !== v) : [...subtipos, v])}
                />
              ))}
            </div>
            {errores.subtipos && <p className="text-sm font-bold text-error-800">{errores.subtipos}</p>}
          </fieldset>
          <Campo etiqueta="Dirección o referencia" value={d.direccion ?? ''} onChange={cambiar('direccion')} />
          <Campo etiqueta="Área total (m²)" inputMode="decimal" value={d.areaM2 ?? ''} error={errores.areaM2} onChange={cambiar('areaM2')} />
        </Tarjeta>
        <Tarjeta className="space-y-4">
          <h2 className="text-xl">Recursos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Selector etiqueta="Tipo de suelo" opciones={NOMBRE_SUELO} value={d.tipoSuelo ?? ''} onChange={cambiar('tipoSuelo')} />
            <Selector etiqueta="Abono natural" opciones={NOMBRE_ABONO} value={d.tipoAbono ?? ''} onChange={cambiar('tipoAbono')} />
            <Selector etiqueta="Agua para riego" opciones={NOMBRE_AGUA} value={d.tipoAgua ?? ''} onChange={cambiar('tipoAgua')} />
            {d.tipoAgua === 'OTRO' && <Campo etiqueta="¿Qué agua?" value={d.detalleAgua ?? ''} onChange={cambiar('detalleAgua')} />}
          </div>
        </Tarjeta>
        <Tarjeta className="space-y-4">
          <h2 className="text-xl">Cerca de seguridad</h2>
          <Selector etiqueta="Tipo de cerca" opciones={NOMBRE_CERCA} value={d.tipoCerca ?? ''} onChange={cambiar('tipoCerca')} />
          <Campo etiqueta="Material o especies" ayuda="Por ejemplo: higuerilla y lavanda." value={d.materialCerca ?? ''} onChange={cambiar('materialCerca')} />
          <Banner tipo="info">{CONSEJOS_ANCESTRALES.cerca.join(' ')}</Banner>
        </Tarjeta>
        <Boton type="submit" cargando={enviando}>
          Guardar datos
        </Boton>
      </form>
    </div>
  );
}

/** Huerto virtual: espejo digital del huerto real. La planta recién trabajada «brota». */
export function Virtual() {
  const id = useHuerto();
  const loc = useLocation();
  const [brota] = useState(() => {
    const st = loc.state as { brotar?: string } | null;
    if (st?.brotar) window.history.replaceState({ ...window.history.state, usr: null }, '');
    return st?.brotar;
  });
  const { datos, cargando, error } = useDatos<EspejoDatos>(id ? `/huertos/${id}/virtual` : null);
  if (error) return <Banner tipo="error">{error}</Banner>;
  if (cargando || !datos) return <Cargando />;
  return (
    <div className="space-y-6">
      <Encabezado titulo="Huerto virtual" texto="Cada planta muestra la etapa de su ciclo actual. Avanza con cada paso que registras." />
      <Tarjeta>
        <Espejo espejo={datos} brota={brota} />
      </Tarjeta>
    </div>
  );
}

interface Mision {
  codigo: string;
  nombre: string;
  insignia: string;
  descripcion: string;
  meta: number;
  actual: number;
  cumplida: boolean;
}
interface Puntos {
  puntosTotales: number;
  ranking: { posicion: number; total: number; indice: number; puntosAnio: number } | null;
  movimientos: { puntos: number; horas: number; creadoEn: string; voluntario: { nombre: string }; paso: string | null; actividad: { intento: number } | null }[];
}

export function Misiones() {
  const id = useHuerto();
  const m = useDatos<Mision[]>(id ? `/huertos/${id}/misiones` : null);
  const p = useDatos<Puntos>(id ? `/huertos/${id}/puntos` : null);
  if (!m.datos || !p.datos) return <Cargando />;
  const cumplidas = m.datos.filter((x) => x.cumplida);
  return (
    <div className="space-y-6">
      <Encabezado titulo="Misiones y puntos" texto="Las misiones del huerto dan insignias. Los puntos vienen de las horas validadas por el MSP." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Cifra valor={numero(p.datos.puntosTotales)} etiqueta="Puntos totales" Icono={Award} />
        <Cifra valor={p.datos.ranking ? `${p.datos.ranking.posicion}.º de ${p.datos.ranking.total}` : '—'} etiqueta="Ranking de tu tipo" Icono={Trophy} />
        <Cifra valor={p.datos.ranking ? numero(p.datos.ranking.indice) : '—'} etiqueta="Índice del ranking" Icono={Trophy} />
        <Cifra valor={`${cumplidas.length}/${m.datos.length}`} etiqueta="Insignias" Icono={Award} />
      </div>
      <section className="space-y-3" aria-labelledby="misiones">
        <h2 id="misiones" className="text-2xl">
          Misiones
        </h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {m.datos.map((x) => (
            <li key={x.codigo}>
              <Tarjeta className={`h-full space-y-2 ${x.cumplida ? 'ring-2 ring-primary-600' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg">{x.nombre}</h3>
                  {x.cumplida && (
                    <Chip tono="exito" Icono={Check}>
                      {x.insignia}
                    </Chip>
                  )}
                </div>
                <p className="text-luna-600">{x.descripcion}</p>
                <BarraProgreso valor={Math.round((x.actual / x.meta) * 100)} etiqueta={`${x.actual} de ${x.meta}`} />
              </Tarjeta>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3" aria-labelledby="movimientos">
        <h2 id="movimientos" className="text-2xl">
          Últimos puntos
        </h2>
        {p.datos.movimientos.length ? (
          <Tarjeta className="p-0 sm:p-0">
            <ul className="divide-y divide-tierra-100">
              {p.datos.movimientos.map((x, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span>
                    <strong>{x.voluntario.nombre}</strong>
                    <span className="block text-sm text-luna-600">
                      {x.paso} · {x.horas} h · {fechaCorta(x.creadoEn)}
                      {x.actividad && x.actividad.intento > 1 && ' · segundo intento'}
                    </span>
                  </span>
                  <span className="font-black tabular-nums text-primary-700">+{x.puntos}</span>
                </li>
              ))}
            </ul>
          </Tarjeta>
        ) : (
          <p className="text-luna-600">Los puntos aparecerán cuando el MSP valide tus evidencias.</p>
        )}
      </section>
    </div>
  );
}

interface Item {
  id: string;
  espacio: EspacioBodega;
  nombre: string;
  cantidad: number;
  unidad: string;
  nota: string | null;
}
const ITEM_VACIO = { espacio: '', nombre: '', cantidad: '', unidad: '', nota: '' };

/** Bodega: herramientas, semillas y plántulas, y abonos. */
export function Bodega() {
  const id = useHuerto();
  const { datos, cargando, recargar } = useDatos<Item[]>(id ? `/huertos/${id}/bodega` : null);
  const toast = useToast();
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [d, setD] = useState(ITEM_VACIO);
  const [editando, setEditando] = useState<string | null>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const f: Record<string, string> = {};
    if (!d.espacio) f.espacio = 'Elige el espacio.';
    if (!d.nombre.trim()) f.nombre = 'El nombre es obligatorio.';
    if (d.cantidad === '' || Number(d.cantidad.replace(',', '.')) < 0) f.cantidad = 'Indica la cantidad.';
    if (!d.unidad.trim()) f.unidad = 'Indica la unidad.';
    if (Object.keys(f).length) return setErrores(f);
    await enviar(async () => {
      await api(`/huertos/${id}/bodega${editando ? `/${editando}` : ''}`, {
        method: editando ? 'PATCH' : 'POST',
        body: { ...d, cantidad: Number(d.cantidad.replace(',', '.')), nota: d.nota || undefined },
      });
      toast(editando ? 'Elemento actualizado.' : 'Elemento agregado a la bodega.');
      setD(ITEM_VACIO);
      setEditando(null);
      void recargar();
    });
  }
  async function borrar(i: Item) {
    await api(`/huertos/${id}/bodega/${i.id}`, { method: 'DELETE' });
    toast(`${i.nombre} se quitó de la bodega.`);
    void recargar();
  }
  if (cargando && !datos) return <Cargando />;

  return (
    <div className="space-y-6">
      <Encabezado titulo="Bodega" texto="Un lugar seco, con luz natural y seguro para las herramientas, el material de siembra y los abonos." />
      <Tarjeta>
        <form onSubmit={guardar} noValidate className="space-y-4">
          <h2 className="text-xl">{editando ? 'Editar elemento' : 'Agregar a la bodega'}</h2>
          <ResumenErrores errores={resumen} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Selector etiqueta="Espacio" opciones={NOMBRE_ESPACIO} value={d.espacio} error={errores.espacio} onChange={(e) => setD({ ...d, espacio: e.target.value })} />
            <Campo etiqueta="Nombre" value={d.nombre} error={errores.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} />
            <Campo etiqueta="Cantidad" inputMode="decimal" value={d.cantidad} error={errores.cantidad} onChange={(e) => setD({ ...d, cantidad: e.target.value })} />
            <Campo etiqueta="Unidad" ayuda="kg, unidades, gramos…" value={d.unidad} error={errores.unidad} onChange={(e) => setD({ ...d, unidad: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Boton type="submit" cargando={enviando}>
              {editando ? 'Guardar cambios' : 'Agregar'}
            </Boton>
            {editando && (
              <Boton
                type="button"
                variante="texto"
                onClick={() => {
                  setEditando(null);
                  setD(ITEM_VACIO);
                }}
              >
                Cancelar
              </Boton>
            )}
          </div>
        </form>
      </Tarjeta>
      {(Object.keys(NOMBRE_ESPACIO) as EspacioBodega[]).map((esp) => {
        const items = datos?.filter((i) => i.espacio === esp) ?? [];
        return (
          <section key={esp} className="space-y-2" aria-labelledby={`esp-${esp}`}>
            <h2 id={`esp-${esp}`} className="text-xl">
              {NOMBRE_ESPACIO[esp]}
            </h2>
            {items.length ? (
              <Tarjeta className="p-0 sm:p-0">
                <ul className="divide-y divide-tierra-100">
                  {items.map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-3 px-5 py-2">
                      <span>
                        <strong>{i.nombre}</strong>
                        <span className="ml-2 tabular-nums text-luna-600">
                          {numero(i.cantidad)} {i.unidad}
                        </span>
                      </span>
                      <span className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditando(i.id);
                            setD({ espacio: i.espacio, nombre: i.nombre, cantidad: String(i.cantidad), unidad: i.unidad, nota: i.nota ?? '' });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="grid size-11 place-items-center rounded-xl hover:bg-tierra-100"
                          aria-label={`Editar ${i.nombre}`}
                        >
                          <Pencil aria-hidden="true" className="size-5" />
                        </button>
                        <button onClick={() => void borrar(i)} className="grid size-11 place-items-center rounded-xl hover:bg-error-100" aria-label={`Quitar ${i.nombre}`}>
                          <Trash2 aria-hidden="true" className="size-5" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </Tarjeta>
            ) : (
              <p className="text-luna-600">Vacío.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

interface Paquete {
  id: string;
  planta: string;
  cantidad: number;
  cualidad: 'CALIENTE' | 'FRIA';
  indicacionesUso: string;
  dosificacion: string;
  contraindicaciones: string;
  fechaEmpaquetado: string;
  fechaCaducidad: string;
  vencido: boolean;
  validado: boolean;
}

/** Producción: paquetes etiquetados (la base del financiamiento del MSP). */
export function Produccion() {
  const id = useHuerto();
  const { datos, cargando } = useDatos<Paquete[]>(id ? `/huertos/${id}/produccion` : null);
  if (cargando && !datos) return <Cargando />;
  const total = datos?.filter((p) => p.validado).reduce((s, p) => s + p.cantidad, 0) ?? 0;
  return (
    <div className="space-y-6">
      <Encabezado titulo="Producción" texto="Paquetes de plantas secas para entregar gratis a la población. Solo cuentan los validados por el MSP." />
      <Cifra valor={numero(total)} etiqueta="Paquetes validados" Icono={Package} />
      {!datos?.length ? (
        <EstadoVacio titulo="Aún no hay paquetes" texto="Al registrar el empaquetado de un ciclo, sus paquetes aparecerán aquí." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {datos.map((p) => (
            <li key={p.id}>
              <Tarjeta className="h-full space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl">
                    {p.planta} · {p.cantidad} paquetes
                  </h2>
                  <span className="flex gap-1.5">
                    <Chip tono={p.cualidad === 'CALIENTE' ? 'caliente' : 'fria'}>{NOMBRE_CUALIDAD[p.cualidad]}</Chip>
                    {p.validado ? <Chip tono="exito">Validado</Chip> : <Chip tono="aviso">Por validar</Chip>}
                    {p.vencido && <Chip tono="error">Vencido</Chip>}
                  </span>
                </div>
                <dl className="space-y-1 text-sm">
                  <div>
                    <dt className="inline font-bold">Uso: </dt>
                    <dd className="inline">{p.indicacionesUso}</dd>
                  </div>
                  <div>
                    <dt className="inline font-bold">Dosis: </dt>
                    <dd className="inline">{p.dosificacion}</dd>
                  </div>
                  <div>
                    <dt className="inline font-bold">Contraindicaciones: </dt>
                    <dd className="inline">{p.contraindicaciones}</dd>
                  </div>
                  <div>
                    <dt className="inline font-bold">Empaquetado: </dt>
                    <dd className="inline">
                      {fechaCorta(p.fechaEmpaquetado)} · caduca {fechaCorta(p.fechaCaducidad)}
                    </dd>
                  </div>
                </dl>
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
