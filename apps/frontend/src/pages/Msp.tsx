import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import {
  NOMBRE_CICLO,
  NOMBRE_CUALIDAD,
  NOMBRE_DISENO,
  NOMBRE_FASE,
  NOMBRE_NIVEL,
  NOMBRE_VARIANTE,
  type FaseLunar,
  type NivelMiembro,
  type TipoDiseno,
  type VarianteDiseno,
} from '@nexo/shared';
import { Check, ClipboardCheck, Download, Flag, KeyRound, Leaf, Medal, ShieldCheck, Sprout, Upload, UserCog, X } from 'lucide-react';
import { api, ApiError, token } from '../api';
import { fechaCorta, numero, useDatos, type PlantaCatalogo } from '../datos';
import { useEnvio } from '../formulario';
import {
  AreaTexto,
  Banner,
  Boton,
  Campo,
  Cargando,
  Chip,
  Cifra,
  Dialogo,
  DialogoMotivo,
  EnlaceBoton,
  Encabezado,
  Estado,
  EstadoVacio,
  Filtros,
  ResumenErrores,
  Selector,
  Tarjeta,
  useToast,
} from '../ui';

interface Resumen {
  solicitudes: number;
  evidencias: number;
  plantas: number;
  niveles: number;
  reportes: number;
  huertos: number;
}

export function ResumenMsp() {
  const { datos: r } = useDatos<Resumen>('/msp/resumen');
  if (!r) return <Cargando />;
  const tareas = [
    { a: '/panel/solicitudes', n: r.solicitudes, t: 'solicitudes de huerto por revisar', Icono: ClipboardCheck },
    { a: '/panel/evidencias', n: r.evidencias, t: 'evidencias por validar', Icono: ShieldCheck },
    { a: '/panel/catalogo/PENDIENTE', n: r.plantas, t: 'plantas propuestas por analizar', Icono: Leaf },
    { a: '/panel/niveles', n: r.niveles, t: 'solicitudes de nivel por experiencia', Icono: Medal },
    { a: '/panel/moderacion', n: r.reportes, t: 'aportes reportados en el foro', Icono: Flag },
  ];
  return (
    <div className="space-y-6">
      <Encabezado titulo="Panel del MSP" texto="Lo que espera tu revisión. Las evidencias aprobadas otorgan los puntos a los voluntarios." />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tareas.map(({ a, n, t, Icono }) => (
          <li key={a}>
            <Link to={a} className={`presionable flex h-full items-center gap-4 rounded-tarjeta p-5 shadow-tarjeta ${n ? 'bg-white hover:bg-tierra-50' : 'bg-tierra-100'}`}>
              <Icono aria-hidden="true" className={`size-8 shrink-0 ${n ? 'text-primary-700' : 'text-luna-600'}`} />
              <span>
                <span className="block font-display text-3xl font-black tabular-nums">{n}</span>
                <span className="font-bold">{t}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Cifra valor={r.huertos} etiqueta="Huertos activos registrados" Icono={Sprout} />
    </div>
  );
}

interface Solicitud {
  id: string;
  nombreHuerto: string;
  tipo: TipoDiseno;
  subtipos: VarianteDiseno[];
  latitud: string;
  longitud: string;
  altitud: number;
  direccion: string | null;
  nombreResponsable: string;
  cedula: string;
  email: string;
  celular: string;
  estado: string;
  motivo: string | null;
  creadaEn: string;
  revisadaEn: string | null;
  provincia: { nombre: string };
  parroquia: { nombre: string };
  revisadaPor: { nombre: string } | null;
}

/** Reunión MSP: el técnico contacta a la persona fuera del sistema y luego aprueba o rechaza con motivo. */
export function Solicitudes() {
  const { estado = 'PENDIENTE' } = useParams();
  const { datos, cargando, recargar } = useDatos<Solicitud[]>(`/msp/solicitudes?estado=${estado}`);
  const toast = useToast();
  const [rechazar, setRechazar] = useState<Solicitud | null>(null);
  const [aprobando, setAprobando] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function aprobar(s: Solicitud) {
    setAprobando(s.id);
    setError('');
    try {
      const r = await api<{ cuentaNueva: boolean }>(`/msp/solicitudes/${s.id}/aprobar`, { method: 'POST' });
      toast(r.cuentaNueva ? `Huerto aprobado. Se envió usuario y contraseña temporal a ${s.email}.` : `Huerto aprobado y asignado a la cuenta de ${s.email}.`);
      void recargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo aprobar.');
    } finally {
      setAprobando(null);
    }
  }

  return (
    <div className="space-y-6">
      <Encabezado titulo="Solicitudes de huerto" texto="Contacta a la persona por celular o correo antes de decidir." />
      <Filtros
        etiqueta="Estado"
        opciones={[
          { a: '/panel/solicitudes', texto: 'Pendientes' },
          { a: '/panel/solicitudes/APROBADA', texto: 'Aprobadas' },
          { a: '/panel/solicitudes/RECHAZADA', texto: 'Rechazadas' },
        ]}
      />
      {error && <Banner tipo="error">{error}</Banner>}
      {cargando && !datos ? (
        <Cargando />
      ) : !datos?.length ? (
        <EstadoVacio titulo="No hay solicitudes aquí" texto="Las nuevas solicitudes del público aparecerán en Pendientes." />
      ) : (
        <ul className="space-y-3">
          {datos.map((s) => (
            <li key={s.id}>
              <Tarjeta className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl">{s.nombreHuerto}</h2>
                    <p className="text-luna-600">
                      {s.parroquia.nombre}, {s.provincia.nombre} · {NOMBRE_DISENO[s.tipo]} ({s.subtipos.map((v) => NOMBRE_VARIANTE[v]).join(', ')}) · {numero(s.altitud)} m
                    </p>
                  </div>
                  <Estado estado={s.estado} />
                </div>
                <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-luna-600">Responsable</dt>
                    <dd className="font-bold">{s.nombreResponsable}</dd>
                  </div>
                  <div>
                    <dt className="text-luna-600">Cédula</dt>
                    <dd className="font-bold tabular-nums">{s.cedula}</dd>
                  </div>
                  <div>
                    <dt className="text-luna-600">Celular</dt>
                    <dd>
                      <a href={`tel:${s.celular}`} className="font-bold text-primary-700 underline tabular-nums">
                        {s.celular}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-luna-600">Correo</dt>
                    <dd className="break-all font-bold">{s.email}</dd>
                  </div>
                </dl>
                <p className="text-sm text-luna-600">
                  Enviada el {fechaCorta(s.creadaEn)} ·{' '}
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${s.latitud}&mlon=${s.longitud}#map=17/${s.latitud}/${s.longitud}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-primary-700 underline"
                  >
                    ver ubicación en el mapa<span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                  {s.direccion && ` · ${s.direccion}`}
                </p>
                {s.motivo && (
                  <Banner tipo="aviso">
                    <strong>Motivo:</strong> {s.motivo}
                  </Banner>
                )}
                {s.revisadaPor && (
                  <p className="text-sm text-luna-600">
                    Revisada por {s.revisadaPor.nombre} el {fechaCorta(s.revisadaEn!)}
                  </p>
                )}
                {s.estado === 'PENDIENTE' && (
                  <div className="flex flex-wrap gap-2">
                    <Boton onClick={() => void aprobar(s)} cargando={aprobando === s.id} textoCargando="Aprobando y enviando correo…">
                      <Check aria-hidden="true" className="size-5" />
                      Aprobar huerto y responsable
                    </Boton>
                    <Boton variante="secundario" onClick={() => setRechazar(s)}>
                      <X aria-hidden="true" className="size-5" />
                      Rechazar
                    </Boton>
                  </div>
                )}
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
      <DialogoMotivo
        abierto={!!rechazar}
        titulo="Rechazar solicitud"
        texto="La solicitud queda archivada con el motivo y se avisa a la persona por correo."
        accion="Rechazar"
        onCerrar={() => setRechazar(null)}
        onConfirmar={async (motivo) => {
          await api(`/msp/solicitudes/${rechazar!.id}/rechazar`, { body: { motivo } });
          setRechazar(null);
          toast('Solicitud rechazada y archivada.');
          void recargar();
        }}
      />
    </div>
  );
}

interface Evidencia {
  id: string;
  paso: string;
  fecha: string;
  hora: string | null;
  faseLunar: FaseLunar | null;
  advertencias: string[];
  intento: number;
  horas: number;
  motivoRechazo: string | null;
  puntosOtorgados: number;
  estadoEvidencia: string;
  huerto: { id: string; nombre: string; provincia: { nombre: string } };
  ciclo: { planta: { nombreComun: string; cualidad: 'CALIENTE' | 'FRIA' } };
  participaciones: { nombre: string; horas: number }[];
  archivos: { id: string; url: string; tipo: 'FOTO' | 'VIDEO'; nombre: string; intento: number }[];
  revisadaPor: { nombre: string } | null;
}

/** Validación de evidencias: fotos y videos reales, sin IA, del huerto correcto. Aprobar acredita los puntos. */
export function Evidencias() {
  const { estado = 'PENDIENTE' } = useParams();
  const { datos, cargando, recargar } = useDatos<Evidencia[]>(`/msp/evidencias?estado=${estado}`);
  const toast = useToast();
  const [rechazar, setRechazar] = useState<Evidencia | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

  async function aprobar(e: Evidencia) {
    setOcupado(e.id);
    try {
      const r = await api<{ puntos: number }>(`/msp/evidencias/${e.id}/aprobar`, { method: 'POST' });
      toast(`Evidencia aprobada: +${r.puntos} puntos para ${e.huerto.nombre}.`);
      void recargar();
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div className="space-y-6">
      <Encabezado titulo="Evidencias" texto="Revisa que las fotos o videos sean reales, del huerto correcto y de la actividad registrada." />
      <Filtros
        etiqueta="Estado"
        opciones={[
          { a: '/panel/evidencias', texto: 'Por validar' },
          { a: '/panel/evidencias/APROBADA', texto: 'Aprobadas' },
          { a: '/panel/evidencias/RECHAZADA', texto: 'Rechazadas' },
        ]}
      />
      {cargando && !datos ? (
        <Cargando />
      ) : !datos?.length ? (
        <EstadoVacio titulo="Nada por aquí" texto="Cuando los responsables registren actividades, sus evidencias aparecerán para validar." />
      ) : (
        <ul className="space-y-4">
          {datos.map((e) => {
            const actuales = e.archivos.filter((a) => a.intento === e.intento);
            return (
              <li key={e.id}>
                <Tarjeta className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-xl">
                        {e.paso}: {e.ciclo.planta.nombreComun}
                      </h2>
                      <p className="text-luna-600">
                        {e.huerto.nombre} · {e.huerto.provincia.nombre} · {fechaCorta(e.fecha)}
                        {e.hora && ` ${e.hora}`}
                        {e.faseLunar && ` · ${NOMBRE_FASE[e.faseLunar]}`}
                      </p>
                    </div>
                    <span className="flex flex-wrap gap-1.5">
                      {e.intento > 1 && <Chip tono="aviso">Segundo intento (50 %)</Chip>}
                      {e.advertencias.length === 0 ? <Chip tono="info">Siguió el calendario (+10 %)</Chip> : <Chip>Sin bono</Chip>}
                      <Estado estado={e.estadoEvidencia} />
                    </span>
                  </div>
                  <p className="text-sm">
                    <strong>{e.horas} h</strong> de {e.participaciones.map((p) => `${p.nombre} (${p.horas} h)`).join(', ')}
                  </p>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {actuales.map((a) => (
                      <li key={a.id}>
                        {a.tipo === 'FOTO' ? (
                          <a href={a.url} target="_blank" rel="noreferrer">
                            <img src={a.url} alt={`Evidencia ${a.nombre}`} className="aspect-[4/3] w-full rounded-xl object-cover" />
                          </a>
                        ) : (
                          // Videos grabados por la comunidad como evidencia: no tienen subtítulos que agregar.
                          // eslint-disable-next-line jsx-a11y/media-has-caption
                          <video src={a.url} controls className="aspect-[4/3] w-full rounded-xl bg-luna-800" aria-label={`Video ${a.nombre}`} />
                        )}
                      </li>
                    ))}
                  </ul>
                  {e.motivoRechazo && (
                    <Banner tipo={e.estadoEvidencia === 'RECHAZADA' ? 'error' : 'info'}>
                      <strong>{e.estadoEvidencia === 'RECHAZADA' ? 'Motivo del rechazo' : 'Rechazo anterior'}:</strong> {e.motivoRechazo}
                    </Banner>
                  )}
                  {e.estadoEvidencia === 'APROBADA' && <Chip tono="exito">+{e.puntosOtorgados} puntos otorgados</Chip>}
                  {e.estadoEvidencia === 'PENDIENTE' && (
                    <div className="flex flex-wrap gap-2">
                      <Boton onClick={() => void aprobar(e)} cargando={ocupado === e.id} textoCargando="Aprobando…">
                        <Check aria-hidden="true" className="size-5" />
                        Evidencia válida
                      </Boton>
                      <Boton variante="secundario" onClick={() => setRechazar(e)}>
                        <X aria-hidden="true" className="size-5" />
                        No es válida
                      </Boton>
                    </div>
                  )}
                </Tarjeta>
              </li>
            );
          })}
        </ul>
      )}
      <DialogoMotivo
        abierto={!!rechazar}
        titulo="Evidencia no válida"
        texto={
          rechazar?.intento === 1
            ? 'El responsable podrá subir una nueva evidencia una vez más; si se aprueba, vale la mitad de los puntos.'
            : 'Era la segunda oportunidad: esta actividad ya no sumará puntos, pero el huerto puede seguir.'
        }
        accion="Rechazar evidencia"
        onCerrar={() => setRechazar(null)}
        onConfirmar={async (motivo) => {
          await api(`/msp/evidencias/${rechazar!.id}/rechazar`, { body: { motivo } });
          setRechazar(null);
          toast('Evidencia rechazada. El responsable verá el motivo.');
          void recargar();
        }}
      />
    </div>
  );
}

type PlantaMsp = PlantaCatalogo & { estado: string; motivo: string | null; propuestaPor: { nombre: string } | null; _count: { huertos: number } };
const FORM_PLANTA = {
  nombreComun: '',
  nombreCientifico: '',
  familiaBotanica: '',
  otrosNombres: '',
  altitudMin: '',
  altitudMax: '',
  provincias: '',
  ciclo: '',
  cualidad: '',
  usosMedicinales: '',
  parteUsada: '',
  dosificacion: '',
  contraindicaciones: '',
};

function FormPlanta({ inicial, onListo, onCancelar }: { inicial?: PlantaMsp; onListo: () => void; onCancelar: () => void }) {
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [d, setD] = useState(
    inicial
      ? {
          ...FORM_PLANTA,
          ...Object.fromEntries(Object.entries(inicial).map(([k, v]) => [k, v === null ? '' : Array.isArray(v) ? v.join(', ') : String(v)])),
        }
      : FORM_PLANTA,
  );
  const [foto, setFoto] = useState<File | null>(null);
  const c = (k: keyof typeof FORM_PLANTA) => (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value });
  async function guardar(e: FormEvent) {
    e.preventDefault();
    const f: Record<string, string> = {};
    if (!d.nombreComun.trim()) f.nombreComun = 'El nombre común es obligatorio.';
    if (!d.nombreCientifico.trim()) f.nombreCientifico = 'El nombre científico es obligatorio.';
    if (!d.ciclo) f.ciclo = 'Elige el ciclo.';
    if (!d.cualidad) f.cualidad = 'Elige si es caliente o fría.';
    if (!d.usosMedicinales.trim()) f.usosMedicinales = 'Los usos medicinales son obligatorios.';
    if (Object.keys(f).length) return setErrores(f);
    const lista = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
    const vacio = (s: string) => s.trim() || undefined;
    const body = {
      nombreComun: d.nombreComun,
      nombreCientifico: d.nombreCientifico,
      familiaBotanica: vacio(d.familiaBotanica),
      otrosNombres: lista(d.otrosNombres),
      provincias: lista(d.provincias),
      altitudMin: d.altitudMin ? Number(d.altitudMin) : undefined,
      altitudMax: d.altitudMax ? Number(d.altitudMax) : undefined,
      ciclo: d.ciclo,
      cualidad: d.cualidad,
      usosMedicinales: d.usosMedicinales,
      parteUsada: vacio(d.parteUsada),
      dosificacion: vacio(d.dosificacion),
      contraindicaciones: vacio(d.contraindicaciones),
      esMedicinal: true,
    };
    await enviar(async () => {
      const r = await api<{ id: string }>(inicial ? `/msp/plantas/${inicial.id}` : '/msp/plantas', { method: inicial ? 'PATCH' : 'POST', body });
      if (foto) {
        const form = new FormData();
        form.append('foto', foto);
        await api(`/msp/plantas/${r.id}/foto`, { body: form });
      }
      onListo();
    });
  }
  return (
    <form onSubmit={guardar} noValidate className="space-y-4">
      <ResumenErrores errores={resumen} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre común" value={d.nombreComun} error={errores.nombreComun} onChange={c('nombreComun')} />
        <Campo etiqueta="Nombre científico" value={d.nombreCientifico} error={errores.nombreCientifico} onChange={c('nombreCientifico')} />
        <Campo etiqueta="Otros nombres (separados por coma)" value={d.otrosNombres} onChange={c('otrosNombres')} />
        <Campo etiqueta="Familia botánica" value={d.familiaBotanica} onChange={c('familiaBotanica')} />
        <Campo etiqueta="Altitud mínima (m)" inputMode="numeric" value={d.altitudMin} onChange={c('altitudMin')} />
        <Campo etiqueta="Altitud máxima (m)" inputMode="numeric" value={d.altitudMax} onChange={c('altitudMax')} />
        <Selector etiqueta="Ciclo" opciones={NOMBRE_CICLO} value={d.ciclo} error={errores.ciclo} onChange={c('ciclo')} />
        <Selector etiqueta="Caliente o fría" opciones={NOMBRE_CUALIDAD} value={d.cualidad} error={errores.cualidad} onChange={c('cualidad')} />
        <Campo etiqueta="Provincias (separadas por coma)" value={d.provincias} onChange={c('provincias')} />
        <Campo etiqueta="Parte que se usa" value={d.parteUsada} onChange={c('parteUsada')} />
      </div>
      <AreaTexto etiqueta="Usos medicinales" rows={2} value={d.usosMedicinales} error={errores.usosMedicinales} onChange={c('usosMedicinales')} />
      <AreaTexto etiqueta="Dosificación" rows={2} value={d.dosificacion} onChange={c('dosificacion')} />
      <AreaTexto etiqueta="Contraindicaciones" rows={2} value={d.contraindicaciones} onChange={c('contraindicaciones')} />
      <label className="block font-bold">
        Foto (opcional)
        <input type="file" accept="image/*" className="mt-1 block" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
      </label>
      <div className="flex flex-wrap gap-2">
        <Boton type="submit" cargando={enviando}>
          Guardar planta
        </Boton>
        <Boton type="button" variante="texto" onClick={onCancelar}>
          Cancelar
        </Boton>
      </div>
    </form>
  );
}

/** Interfaz de carga del catálogo: alta, edición, carga masiva CSV y análisis de propuestas. */
export function Catalogo() {
  const { estado = 'APROBADA' } = useParams();
  const { datos, cargando, recargar } = useDatos<PlantaMsp[]>(`/msp/plantas?estado=${estado}`);
  const toast = useToast();
  const [form, setForm] = useState<PlantaMsp | 'nueva' | null>(null);
  const [csv, setCsv] = useState(false);
  const [resultado, setResultado] = useState<{ creadas: number; actualizadas: number; errores: { linea: number; mensaje: string }[] } | null>(null);
  const [rechazar, setRechazar] = useState<PlantaMsp | null>(null);

  async function importar(archivo: File | undefined) {
    if (!archivo) return;
    const r = await api<typeof resultado>('/msp/plantas/importar', { body: { csv: await archivo.text() } });
    setResultado(r);
    void recargar();
  }
  async function aprobar(p: PlantaMsp) {
    await api(`/msp/plantas/${p.id}/aprobar`, { method: 'POST' });
    toast(`${p.nombreComun} se sumó al catálogo.`);
    void recargar();
  }

  return (
    <div className="space-y-6">
      <Encabezado
        titulo="Catálogo de plantas"
        texto="Precargado y administrado por el MSP. Los responsables eligen de aquí, filtrado por la altitud de su huerto."
        accion={
          <div className="flex flex-wrap gap-2">
            <Boton onClick={() => setForm('nueva')}>
              <Leaf aria-hidden="true" className="size-5" />
              Nueva planta
            </Boton>
            <Boton variante="secundario" onClick={() => setCsv(!csv)} aria-expanded={csv}>
              <Upload aria-hidden="true" className="size-5" />
              Cargar CSV
            </Boton>
          </div>
        }
      />
      {csv && (
        <Tarjeta className="space-y-3">
          <h2 className="text-xl">Carga masiva</h2>
          <p className="text-sm">
            Archivo CSV separado por punto y coma, con encabezado:{' '}
            <code className="rounded bg-tierra-100 px-1">nombreComun;nombreCientifico;familiaBotanica;altitudMin;altitudMax;ciclo;cualidad;usosMedicinales;provincias</code>. El
            ciclo es CORTO o LARGO, la cualidad CALIENTE o FRIA y las provincias se separan con «|». Si el nombre científico ya existe, se actualiza.
          </p>
          <input type="file" accept=".csv,text/csv" aria-label="Archivo CSV del catálogo" onChange={(e) => void importar(e.target.files?.[0])} />
          {resultado && (
            <Banner tipo={resultado.errores.length ? 'aviso' : 'exito'}>
              {resultado.creadas} plantas nuevas, {resultado.actualizadas} actualizadas.
              {resultado.errores.length > 0 && (
                <ul className="mt-1 list-disc pl-5">
                  {resultado.errores.map((e) => (
                    <li key={e.linea}>
                      Línea {e.linea}: {e.mensaje}
                    </li>
                  ))}
                </ul>
              )}
            </Banner>
          )}
        </Tarjeta>
      )}
      {form && (
        <Tarjeta className="space-y-3">
          <h2 className="text-xl">{form === 'nueva' ? 'Nueva planta medicinal' : `Editar ${form.nombreComun}`}</h2>
          <FormPlanta
            key={form === 'nueva' ? 'nueva' : form.id}
            inicial={form === 'nueva' ? undefined : form}
            onCancelar={() => setForm(null)}
            onListo={() => {
              setForm(null);
              toast('Planta guardada.');
              void recargar();
            }}
          />
        </Tarjeta>
      )}
      <Filtros
        etiqueta="Estado"
        opciones={[
          { a: '/panel/catalogo', texto: 'En el catálogo' },
          { a: '/panel/catalogo/PENDIENTE', texto: 'Propuestas' },
          { a: '/panel/catalogo/RECHAZADA', texto: 'Rechazadas' },
        ]}
      />
      {cargando && !datos ? (
        <Cargando />
      ) : !datos?.length ? (
        <EstadoVacio titulo="Sin plantas aquí" texto="Las propuestas de los responsables aparecerán en Propuestas." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {datos.map((p) => (
            <li key={p.id}>
              <Tarjeta className="h-full space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg">{p.nombreComun}</h2>
                    <p className="text-sm italic text-luna-600">{p.nombreCientifico}</p>
                  </div>
                  <span className="flex flex-wrap gap-1.5">
                    <Chip tono={p.cualidad === 'CALIENTE' ? 'caliente' : 'fria'}>{NOMBRE_CUALIDAD[p.cualidad]}</Chip>
                    <Chip>
                      {p.altitudMin ?? 0}–{p.altitudMax ?? '…'} m
                    </Chip>
                  </span>
                </div>
                <p className="line-clamp-2 text-sm">{p.usosMedicinales}</p>
                <p className="text-sm text-luna-600">
                  {p.propuestaPor ? `Propuesta por ${p.propuestaPor.nombre}` : `En ${p._count.huertos} huertos`}
                  {p.motivo && ` · ${p.motivo}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.estado === 'PENDIENTE' && (
                    <>
                      <Boton onClick={() => void aprobar(p)}>
                        <Check aria-hidden="true" className="size-5" />
                        Aprobar
                      </Boton>
                      <Boton variante="secundario" onClick={() => setRechazar(p)}>
                        Rechazar
                      </Boton>
                    </>
                  )}
                  <Boton variante="texto" onClick={() => setForm(p)}>
                    Editar
                  </Boton>
                </div>
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
      <DialogoMotivo
        abierto={!!rechazar}
        titulo="Rechazar planta propuesta"
        texto="Por ejemplo: no es medicinal, ya existe con otro nombre o falta información."
        accion="Rechazar"
        onCerrar={() => setRechazar(null)}
        onConfirmar={async (motivo) => {
          await api(`/msp/plantas/${rechazar!.id}/rechazar`, { body: { motivo } });
          setRechazar(null);
          void recargar();
        }}
      />
    </div>
  );
}

interface SolNivel {
  id: string;
  nivel: NivelMiembro;
  justificacion: string;
  estado: string;
  motivo: string | null;
  creadaEn: string;
  voluntario: { nombre: string; nivel: NivelMiembro };
  huerto: { nombre: string };
}

export function Niveles() {
  const { datos, cargando, recargar } = useDatos<SolNivel[]>('/msp/niveles');
  const toast = useToast();
  const [rechazar, setRechazar] = useState<SolNivel | null>(null);
  return (
    <div className="space-y-6">
      <Encabezado titulo="Niveles por experiencia" texto="El responsable pide que una persona con experiencia entre como Oficial o Maestro, con su justificación." />
      {cargando && !datos ? (
        <Cargando />
      ) : !datos?.length ? (
        <EstadoVacio titulo="No hay solicitudes pendientes" texto="Aparecerán aquí cuando un responsable las envíe." />
      ) : (
        <ul className="space-y-3">
          {datos.map((s) => (
            <li key={s.id}>
              <Tarjeta className="space-y-2">
                <h2 className="text-xl">
                  {s.voluntario.nombre}: de {NOMBRE_NIVEL[s.voluntario.nivel]} a {NOMBRE_NIVEL[s.nivel]}
                </h2>
                <p className="text-luna-600">
                  {s.huerto.nombre} · {fechaCorta(s.creadaEn)}
                </p>
                <blockquote className="border-l-4 border-tierra-300 pl-3">{s.justificacion}</blockquote>
                <div className="flex flex-wrap gap-2">
                  <Boton
                    onClick={async () => {
                      await api(`/msp/niveles/${s.id}/aprobar`, { method: 'POST' });
                      toast(`${s.voluntario.nombre} ahora es ${NOMBRE_NIVEL[s.nivel]}.`);
                      void recargar();
                    }}
                  >
                    <Check aria-hidden="true" className="size-5" />
                    Aprobar
                  </Boton>
                  <Boton variante="secundario" onClick={() => setRechazar(s)}>
                    Rechazar
                  </Boton>
                </div>
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
      <DialogoMotivo
        abierto={!!rechazar}
        titulo="Rechazar nivel"
        texto="El voluntario empezará como Aprendiz y subirá de nivel automáticamente con sus horas."
        accion="Rechazar"
        onCerrar={() => setRechazar(null)}
        onConfirmar={async (motivo) => {
          await api(`/msp/niveles/${rechazar!.id}/rechazar`, { body: { motivo } });
          setRechazar(null);
          void recargar();
        }}
      />
    </div>
  );
}

interface HuertoRegistro {
  id: string;
  nombre: string;
  tipo: TipoDiseno;
  activo: boolean;
  altitud: number;
  puntosTotales: number;
  provincia: { nombre: string };
  parroquia: { nombre: string };
  responsable: { id: string; nombre: string; email: string; cedula: string | null; celular: string | null };
  voluntarios: { id: string; nombre: string; nivel: NivelMiembro; puntos: number }[];
  _count: { plantas: number; ciclos: number };
}

/** Registro centralizado de huertos, responsables y voluntarios (base del financiamiento). */
export function Registro() {
  const { datos, cargando, recargar } = useDatos<HuertoRegistro[]>('/msp/huertos');
  const toast = useToast();
  const [q, setQ] = useState('');
  const [cambio, setCambio] = useState<HuertoRegistro | null>(null);
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [r, setR] = useState({ nombre: '', email: '', cedula: '', celular: '', motivo: '' });

  async function descargar() {
    const res = await fetch('/api/msp/registro.csv', { headers: { Authorization: `Bearer ${token.leer()}` } });
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registro-huertos.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  async function cambiarResponsable() {
    const f: Record<string, string> = {};
    if (!r.nombre.trim()) f.nombre = 'El nombre es obligatorio.';
    if (!/^\S+@\S+\.\S+$/.test(r.email)) f.email = 'Escribe un correo válido.';
    if (!/^\d{10}$/.test(r.cedula)) f.cedula = 'La cédula tiene 10 dígitos.';
    if (!/^09\d{8}$/.test(r.celular)) f.celular = 'El celular debe tener 10 dígitos y empezar con 09.';
    if (Object.keys(f).length) return setErrores(f);
    await enviar(async () => {
      await api(`/msp/huertos/${cambio!.id}/responsable`, { body: { ...r, motivo: r.motivo || undefined } });
      setCambio(null);
      toast('Responsable cambiado. Se le envió su acceso por correo.');
      void recargar();
    });
  }
  async function restablecer(h: HuertoRegistro) {
    await api(`/msp/usuarios/${h.responsable.id}/restablecer`, { method: 'POST' });
    toast(`Se envió una contraseña temporal a ${h.responsable.email}.`);
  }
  async function activar(h: HuertoRegistro) {
    await api(`/msp/huertos/${h.id}/${h.activo ? 'desactivar' : 'activar'}`, { method: 'POST' });
    void recargar();
  }

  const lista = (datos ?? []).filter((h) => `${h.nombre} ${h.responsable.nombre} ${h.provincia.nombre}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <Encabezado
        titulo="Registro de huertos"
        texto="Huertos, responsables y voluntarios registrados en el MSP."
        accion={
          <Boton variante="secundario" onClick={() => void descargar()}>
            <Download aria-hidden="true" className="size-5" />
            Exportar CSV
          </Boton>
        }
      />
      <Campo etiqueta="Buscar por huerto, responsable o provincia" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
      {cargando && !datos ? (
        <Cargando />
      ) : (
        <ul className="space-y-3">
          {lista.map((h) => (
            <li key={h.id}>
              <Tarjeta className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl">
                      <Link to={`/huertos/${h.id}`} className="hover:underline">
                        {h.nombre}
                      </Link>
                    </h2>
                    <p className="text-luna-600">
                      {h.parroquia.nombre}, {h.provincia.nombre} · {NOMBRE_DISENO[h.tipo]} · {numero(h.puntosTotales)} puntos · {h._count.plantas} plantas
                    </p>
                  </div>
                  {!h.activo && <Chip tono="error">Inactivo</Chip>}
                </div>
                <p className="text-sm">
                  <strong>Responsable:</strong> {h.responsable.nombre} · {h.responsable.cedula} · {h.responsable.email} · {h.responsable.celular}
                </p>
                <details>
                  <summary className="min-h-11 cursor-pointer py-2 font-bold text-primary-700">{h.voluntarios.length} voluntarios activos</summary>
                  <ul className="flex flex-wrap gap-1.5">
                    {h.voluntarios.map((v) => (
                      <li key={v.id}>
                        <Chip>
                          {v.nombre} · {NOMBRE_NIVEL[v.nivel]}
                        </Chip>
                      </li>
                    ))}
                  </ul>
                </details>
                <div className="flex flex-wrap gap-2">
                  <Boton
                    variante="secundario"
                    onClick={() => {
                      setR({ nombre: '', email: '', cedula: '', celular: '', motivo: '' });
                      setErrores({});
                      setCambio(h);
                    }}
                  >
                    <UserCog aria-hidden="true" className="size-5" />
                    Cambiar responsable
                  </Boton>
                  <Boton variante="texto" onClick={() => void restablecer(h)}>
                    <KeyRound aria-hidden="true" className="size-5" />
                    Restablecer contraseña
                  </Boton>
                  <Boton variante="texto" onClick={() => void activar(h)}>
                    {h.activo ? 'Desactivar huerto' : 'Reactivar huerto'}
                  </Boton>
                </div>
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
      <Dialogo
        abierto={!!cambio}
        titulo={`Nuevo responsable de ${cambio?.nombre ?? ''}`}
        onCerrar={() => setCambio(null)}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => setCambio(null)} data-foco>
              Cancelar
            </Boton>
            <Boton onClick={() => void cambiarResponsable()} cargando={enviando}>
              Cambiar responsable
            </Boton>
          </>
        }
      >
        <p className="text-sm">Un huerto tiene un solo responsable a la vez. Si la persona no tiene cuenta, recibirá su usuario y contraseña temporal por correo.</p>
        <ResumenErrores errores={resumen} />
        <Campo etiqueta="Nombre" value={r.nombre} error={errores.nombre} onChange={(e) => setR({ ...r, nombre: e.target.value })} />
        <Campo etiqueta="Correo" type="email" value={r.email} error={errores.email} onChange={(e) => setR({ ...r, email: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Cédula" inputMode="numeric" value={r.cedula} error={errores.cedula} onChange={(e) => setR({ ...r, cedula: e.target.value })} />
          <Campo etiqueta="Celular" inputMode="numeric" value={r.celular} error={errores.celular} onChange={(e) => setR({ ...r, celular: e.target.value })} />
        </div>
        <Campo etiqueta="Motivo (opcional)" value={r.motivo} onChange={(e) => setR({ ...r, motivo: e.target.value })} />
      </Dialogo>
    </div>
  );
}

interface Reportado {
  id: string;
  titulo: string | null;
  contenido: string;
  reportes: number;
  padreId: string | null;
  autor: { nombre: string };
}

export function Moderacion() {
  const { datos, cargando, recargar } = useDatos<Reportado[]>('/foro/moderacion');
  const toast = useToast();
  const [retirar, setRetirar] = useState<Reportado | null>(null);
  return (
    <div className="space-y-6">
      <Encabezado
        titulo="Moderación del foro"
        texto={
          <>
            Aportes reportados por la comunidad. Revisa las{' '}
            <Link to="/foro" className="font-bold text-primary-700 underline">
              reglas de participación
            </Link>
            .
          </>
        }
      />
      {cargando && !datos ? (
        <Cargando />
      ) : !datos?.length ? (
        <EstadoVacio titulo="No hay reportes" texto="El foro está en calma." />
      ) : (
        <ul className="space-y-3">
          {datos.map((a) => (
            <li key={a.id}>
              <Tarjeta className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg">{a.titulo ?? 'Respuesta'}</h2>
                  <Chip tono="aviso" Icono={Flag}>
                    {a.reportes} reportes
                  </Chip>
                </div>
                <p className="text-sm text-luna-600">{a.autor.nombre}</p>
                <p className="whitespace-pre-line">{a.contenido}</p>
                <div className="flex flex-wrap gap-2">
                  <Boton onClick={() => setRetirar(a)}>Retirar aporte</Boton>
                  <Boton
                    variante="secundario"
                    onClick={async () => {
                      await api(`/foro/${a.id}/restaurar`, { method: 'POST' });
                      toast('Reportes descartados: el aporte sigue visible.');
                      void recargar();
                    }}
                  >
                    Descartar reportes
                  </Boton>
                  <EnlaceBoton to={`/foro/${a.padreId ?? a.id}`} variante="texto">
                    Ver en el foro
                  </EnlaceBoton>
                </div>
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
      <DialogoMotivo
        abierto={!!retirar}
        titulo="Retirar aporte"
        texto="El motivo queda visible en lugar del aporte."
        accion="Retirar"
        onCerrar={() => setRetirar(null)}
        onConfirmar={async (motivo) => {
          await api(`/foro/${retirar!.id}/retirar`, { body: { motivo } });
          setRetirar(null);
          toast('Aporte retirado.');
          void recargar();
        }}
      />
    </div>
  );
}

