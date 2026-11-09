import { useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { NOMBRE_CATEGORIA, NOMBRE_ROL, REGLAS_FORO, type Rol } from '@nexo/shared';
import { ChevronLeft, Flag, MessageCircle, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { fechaCorta, useDatos } from '../datos';
import { useEnvio } from '../formulario';
import { useSesion } from '../sesion';
import { AreaTexto, Banner, Boton, Campo, Cargando, Casilla, Chip, DialogoMotivo, EnlaceBoton, Encabezado, ResumenErrores, Selector, Tarjeta, useToast } from '../ui';

interface Aporte {
  id: string;
  categoria: keyof typeof NOMBRE_CATEGORIA;
  titulo: string | null;
  contenido: string;
  creadoEn: string;
  retirado: boolean;
  motivoRetiro: string | null;
  reportes: number;
  autor: { nombre: string; rol: Rol; huertos: { nombre: string }[] };
  _count?: { respuestas: number };
  respuestas?: Aporte[];
}

function Autor({ a }: { a: Aporte }) {
  return (
    <p className="text-sm text-luna-600">
      <strong className="text-luna-800">{a.autor.nombre}</strong>
      {a.autor.rol === 'TECNICO_MSP' ? (
        <>
          {' '}
          · <ShieldCheck aria-hidden="true" className="inline size-4" /> {NOMBRE_ROL.TECNICO_MSP}
        </>
      ) : (
        a.autor.huertos[0] && <> · {a.autor.huertos[0].nombre}</>
      )}{' '}
      · {fechaCorta(a.creadoEn)}
    </p>
  );
}

function Cuerpo({ a }: { a: Aporte }) {
  if (a.retirado) return <p className="italic text-luna-600">Aporte retirado por moderación{a.motivoRetiro ? `: ${a.motivoRetiro}` : '.'}</p>;
  return <p className="whitespace-pre-line">{a.contenido}</p>;
}

function Reglas() {
  return (
    <Tarjeta className="space-y-2">
      <h2 className="text-xl">Reglas de participación</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {REGLAS_FORO.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </Tarjeta>
  );
}

function Publicar({ padreId, onListo }: { padreId?: string; onListo: () => void }) {
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [d, setD] = useState({ categoria: '', titulo: '', contenido: '', aceptaReglas: false });
  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    const f: Record<string, string> = {};
    if (!padreId && !d.categoria) f.categoria = 'Elige la categoría.';
    if (!padreId && !d.titulo.trim()) f.titulo = 'El título es obligatorio.';
    if (d.contenido.trim().length < 10) f.contenido = 'Escribe al menos 10 caracteres.';
    if (!d.aceptaReglas) f.aceptaReglas = 'Acepta las reglas de participación para publicar.';
    if (Object.keys(f).length) return setErrores(f);
    await enviar(async () => {
      await api('/foro', { body: { ...d, categoria: d.categoria || 'SABERES', padreId, titulo: padreId ? undefined : d.titulo } });
      setD({ categoria: '', titulo: '', contenido: '', aceptaReglas: false });
      onListo();
    });
  }
  return (
    <form onSubmit={alEnviar} noValidate className="space-y-4">
      <ResumenErrores errores={resumen} />
      {!padreId && (
        <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
          <Selector etiqueta="Categoría" opciones={NOMBRE_CATEGORIA} value={d.categoria} error={errores.categoria} onChange={(e) => setD({ ...d, categoria: e.target.value })} />
          <Campo etiqueta="Título" value={d.titulo} error={errores.titulo} maxLength={140} onChange={(e) => setD({ ...d, titulo: e.target.value })} />
        </div>
      )}
      <AreaTexto
        etiqueta={padreId ? 'Tu respuesta' : 'Tu aporte'}
        value={d.contenido}
        error={errores.contenido}
        maxLength={4000}
        onChange={(e) => setD({ ...d, contenido: e.target.value })}
      />
      <Casilla
        etiqueta="Acepto las reglas de participación del foro"
        checked={d.aceptaReglas}
        error={errores.aceptaReglas}
        onChange={(e) => setD({ ...d, aceptaReglas: e.target.checked })}
      />
      <Boton type="submit" cargando={enviando} textoCargando="Publicando…">
        Publicar
      </Boton>
    </form>
  );
}

/** Foro para compartir prácticas, saberes y sentires. Lectura pública; publican responsables y técnicos. */
export function Foro() {
  const { yo } = useSesion();
  const [params, setParams] = useSearchParams();
  const categoria = params.get('categoria') ?? '';
  const { datos, cargando, recargar } = useDatos<Aporte[]>(`/foro${categoria ? `?categoria=${categoria}` : ''}`);
  const toast = useToast();
  return (
    <div className="space-y-6">
      <Encabezado titulo="Foro de saberes" texto="Prácticas, saberes y sentires sobre el cultivo y el uso de las plantas medicinales." />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div role="group" aria-label="Categoría" className="flex flex-wrap gap-2">
            {[['', 'Todo'], ...Object.entries(NOMBRE_CATEGORIA)].map(([c, t]) => (
              <button
                key={c}
                onClick={() => setParams(c ? { categoria: c } : {})}
                aria-pressed={categoria === c}
                className={`presionable min-h-11 rounded-full border-2 px-4 font-bold ${categoria === c ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-tierra-300 bg-white text-luna-600'}`}
              >
                {t}
              </button>
            ))}
          </div>
          {yo ? (
            <Tarjeta className="space-y-3">
              <h2 className="text-xl">Comparte un aporte</h2>
              <Publicar
                onListo={() => {
                  toast('Aporte publicado. ¡Gracias por compartir!');
                  void recargar();
                }}
              />
            </Tarjeta>
          ) : (
            <Banner tipo="info">
              Los responsables de huerto y el personal del MSP pueden publicar.{' '}
              <Link to="/login" state={{ desde: '/foro' }} className="font-bold underline">
                Ingresa
              </Link>{' '}
              para participar.
            </Banner>
          )}
          {cargando && !datos ? (
            <Cargando />
          ) : (
            <ul className="space-y-3">
              {datos?.map((a) => (
                <li key={a.id}>
                  <Tarjeta className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip>{NOMBRE_CATEGORIA[a.categoria]}</Chip>
                    </div>
                    <h2 className="text-xl">
                      <Link to={`/foro/${a.id}`} className="hover:underline">
                        {a.retirado ? 'Aporte retirado' : a.titulo}
                      </Link>
                    </h2>
                    <Autor a={a} />
                    {!a.retirado && <p className="line-clamp-3">{a.contenido}</p>}
                    <Link to={`/foro/${a.id}`} className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary-700 underline">
                      <MessageCircle aria-hidden="true" className="size-4" />
                      {a._count?.respuestas ?? 0} respuestas
                    </Link>
                  </Tarjeta>
                </li>
              ))}
            </ul>
          )}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Reglas />
        </aside>
      </div>
    </div>
  );
}

export function Hilo() {
  const { id } = useParams();
  const { yo } = useSesion();
  const toast = useToast();
  const { datos: a, cargando, error, recargar } = useDatos<Aporte>(`/foro/${id}`);
  const [retirar, setRetirar] = useState<string | null>(null);
  if (error) return <Banner tipo="error">{error}</Banner>;
  if (cargando && !a) return <Cargando />;
  if (!a) return null;
  const tecnico = yo?.rol === 'TECNICO_MSP';

  async function reportar(aid: string) {
    const r = await api<{ mensaje: string }>(`/foro/${aid}/reportar`, { method: 'POST' });
    toast(r.mensaje);
  }
  const acciones = (x: Aporte) =>
    yo &&
    !x.retirado && (
      <div className="flex flex-wrap gap-2">
        <Boton variante="texto" className="min-h-11 px-0" onClick={() => void reportar(x.id)}>
          <Flag aria-hidden="true" className="size-4" /> Reportar
        </Boton>
        {tecnico && (
          <Boton variante="texto" className="min-h-11 px-2" onClick={() => setRetirar(x.id)}>
            Retirar
          </Boton>
        )}
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/foro" className="inline-flex min-h-11 items-center gap-1 font-bold text-primary-700 underline">
        <ChevronLeft aria-hidden="true" className="size-4" /> Foro
      </Link>
      <Tarjeta className="space-y-3">
        <Chip>{NOMBRE_CATEGORIA[a.categoria]}</Chip>
        <h1 className="text-3xl">{a.retirado ? 'Aporte retirado' : a.titulo}</h1>
        <Autor a={a} />
        <Cuerpo a={a} />
        {acciones(a)}
      </Tarjeta>
      <h2 className="text-2xl">Respuestas</h2>
      <ul className="space-y-3">
        {a.respuestas?.map((r) => (
          <li key={r.id}>
            <Tarjeta className="space-y-2">
              <Autor a={r} />
              <Cuerpo a={r} />
              {acciones(r)}
            </Tarjeta>
          </li>
        ))}
        {!a.respuestas?.length && <li className="text-luna-600">Aún no hay respuestas.</li>}
      </ul>
      {yo && !a.retirado ? (
        <Tarjeta className="space-y-3">
          <h2 className="text-xl">Responder</h2>
          <Publicar
            padreId={a.id}
            onListo={() => {
              toast('Respuesta publicada.');
              void recargar();
            }}
          />
        </Tarjeta>
      ) : (
        !yo && <EnlaceBoton to="/login">Ingresa para responder</EnlaceBoton>
      )}
      <DialogoMotivo
        abierto={!!retirar}
        titulo="Retirar aporte"
        texto="El aporte dejará de verse. El motivo queda visible para todas las personas."
        accion="Retirar"
        onCerrar={() => setRetirar(null)}
        onConfirmar={async (motivo) => {
          await api(`/foro/${retirar}/retirar`, { body: { motivo } });
          setRetirar(null);
          toast('Aporte retirado.');
          await recargar();
        }}
      />
    </div>
  );
}

