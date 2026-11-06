import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { Link } from 'react-router';

// Componentes base de diseno.md §2.3. Alto mínimo 44 px, foco visible y estados con texto (nunca solo color).

type Variante = 'primario' | 'secundario' | 'texto';
const VARIANTES: Record<Variante, string> = {
  primario: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-luna-600',
  secundario: 'border-2 border-primary-600 text-primary-700 bg-white hover:bg-primary-50',
  texto: 'text-primary-700 underline-offset-4 hover:underline',
};
const BASE_BOTON =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 font-semibold transition-colors disabled:cursor-not-allowed';

export function Boton({
  variante = 'primario',
  cargando,
  textoCargando = 'Guardando…',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; cargando?: boolean; textoCargando?: string }) {
  return (
    <button
      {...props}
      disabled={props.disabled || cargando}
      aria-busy={cargando || undefined}
      className={`${BASE_BOTON} ${VARIANTES[variante]} ${className}`}
    >
      {cargando ? textoCargando : children}
    </button>
  );
}

export function EnlaceBoton({ to, variante = 'primario', children }: { to: string; variante?: Variante; children: ReactNode }) {
  return (
    <Link to={to} className={`${BASE_BOTON} ${VARIANTES[variante]}`}>
      {children}
    </Link>
  );
}

interface PropsCampo {
  etiqueta: string;
  error?: string;
  ayuda?: string;
}

function Envoltura({ id, etiqueta, error, ayuda, children }: PropsCampo & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium">
        {etiqueta}
      </label>
      {ayuda && (
        <p id={`${id}-ayuda`} className="text-sm text-luna-600">
          {ayuda}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1 text-sm font-medium text-error-800">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

const describe = (id: string, p: PropsCampo) =>
  [p.ayuda && `${id}-ayuda`, p.error && `${id}-error`].filter(Boolean).join(' ') || undefined;
const CLASE_INPUT = (error?: string) =>
  `min-h-11 w-full rounded-lg border-2 bg-white px-3 py-2 text-base ${error ? 'border-error-800' : 'border-tierra-300'} focus:border-primary-600`;

export function Campo({ etiqueta, error, ayuda, ...props }: PropsCampo & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Envoltura id={id} etiqueta={etiqueta} error={error} ayuda={ayuda}>
      <input
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={describe(id, { etiqueta, error, ayuda })}
        className={CLASE_INPUT(error)}
        {...props}
      />
    </Envoltura>
  );
}

export function Selector({
  etiqueta,
  error,
  ayuda,
  opciones,
  ...props
}: PropsCampo & SelectHTMLAttributes<HTMLSelectElement> & { opciones: Record<string, string> }) {
  const id = useId();
  return (
    <Envoltura id={id} etiqueta={etiqueta} error={error} ayuda={ayuda}>
      <select
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={describe(id, { etiqueta, error, ayuda })}
        className={CLASE_INPUT(error)}
        {...props}
      >
        <option value="">Elige una opción</option>
        {Object.entries(opciones).map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </Envoltura>
  );
}

export function Casilla({ etiqueta, error, ...props }: { etiqueta: ReactNode; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <div className="flex min-h-11 items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-1 size-5 shrink-0 accent-primary-600"
          {...props}
        />
        <label htmlFor={id}>{etiqueta}</label>
      </div>
      {error && (
        <p id={`${id}-error`} className="ml-8 text-sm font-medium text-error-800">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  );
}

const BANNER = {
  exito: { clase: 'bg-exito-100 text-exito-800 border-exito-800', icono: '✓' },
  aviso: { clase: 'bg-aviso-100 text-aviso-800 border-aviso-800', icono: '!' },
  error: { clase: 'bg-error-100 text-error-800 border-error-800', icono: '✕' },
  info: { clase: 'bg-info-100 text-info-800 border-info-800', icono: 'i' },
} as const;

export function Banner({ tipo, children, enfocar }: { tipo: keyof typeof BANNER; children: ReactNode; enfocar?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (enfocar) ref.current?.focus();
  }, [enfocar, children]);
  const { clase, icono } = BANNER[tipo];
  return (
    <div
      ref={ref}
      tabIndex={enfocar ? -1 : undefined}
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-lg border p-3 ${clase}`}
    >
      <span aria-hidden="true" className="font-bold">
        {icono}
      </span>
      <div>{children}</div>
    </div>
  );
}

/** Resumen de errores arriba del formulario: «Falta completar: …» (diseno.md §7). */
export function ResumenErrores({ errores }: { errores: string[] }) {
  if (!errores.length) return null;
  return (
    <Banner tipo="error" enfocar>
      <p className="font-semibold">Revisa estos datos:</p>
      <ul className="list-disc pl-5">
        {errores.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </Banner>
  );
}

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-tarjeta bg-white p-4 shadow-tarjeta sm:p-6 ${className}`}>{children}</section>;
}

export function BarraProgreso({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between font-medium">
        <span>{etiqueta}</span>
        <span>{valor} %</span>
      </div>
      <div
        role="progressbar"
        aria-label={etiqueta}
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3 overflow-hidden rounded-full bg-tierra-100"
      >
        <div className="h-full rounded-full bg-primary-600 transition-[width] duration-500" style={{ width: `${valor}%` }} />
      </div>
    </div>
  );
}

export function EstadoVacio({ titulo, texto, accion }: { titulo: string; texto: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-tarjeta border-2 border-dashed border-tierra-300 p-8 text-center">
      <img src="/etapas/etapa-0-inicial.svg" alt="" className="size-20" />
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <p className="max-w-prose text-luna-600">{texto}</p>
      {accion}
    </div>
  );
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">{texto}</span>
      <div className="h-24 animate-pulse rounded-tarjeta bg-tierra-100" />
      <div className="h-24 animate-pulse rounded-tarjeta bg-tierra-100" />
    </div>
  );
}

/** Diálogo nativo (<dialog>): atrapa el foco y se cierra con Escape. */
export function Dialogo({
  abierto,
  titulo,
  children,
  acciones,
  onCerrar,
}: {
  abierto: boolean;
  titulo: string;
  children: ReactNode;
  acciones: ReactNode;
  onCerrar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-tarjeta bg-white p-0 text-luna-800"
    >
      <div className="space-y-4 p-6">
        <h2 id={idTitulo} className="text-xl font-semibold">
          {titulo}
        </h2>
        {children}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{acciones}</div>
      </div>
    </dialog>
  );
}

// Toast de logro: 6 s, aria-live="polite" (diseno.md §2.3).
const ContextoToast = createContext<(texto: string) => void>(() => {});
export const useToast = () => useContext(ContextoToast);

export function ProveedorToast({ children }: { children: ReactNode }) {
  const [texto, setTexto] = useState('');
  const temporizador = useRef<number>(undefined);
  const mostrar = useCallback((t: string) => {
    setTexto(t);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setTexto(''), 6000);
  }, []);
  return (
    <ContextoToast.Provider value={mostrar}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        {texto && (
          <p className="animar-entrada pointer-events-auto rounded-xl bg-primary-800 px-5 py-3 font-semibold text-white shadow-lg">
            <span aria-hidden="true">🌱 </span>
            {texto}
          </p>
        )}
      </div>
    </ContextoToast.Provider>
  );
}
