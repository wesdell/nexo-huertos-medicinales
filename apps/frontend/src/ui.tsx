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
import { AlertCircle, CheckCircle2, ChevronDown, Info, Sprout, TriangleAlert, XCircle, type LucideIcon } from 'lucide-react';

// Componentes base. Alto mínimo 44 px, foco visible y estados con texto e icono (nunca solo color).
// El verde de acción aparece solo en lo que se puede tocar.

type Variante = 'primario' | 'secundario' | 'texto';
const VARIANTES: Record<Variante, string> = {
  primario: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 disabled:bg-tierra-300 disabled:text-luna-600 disabled:shadow-none',
  secundario: 'border-2 border-luna-800 bg-white text-luna-800 hover:bg-tierra-100 disabled:border-tierra-300 disabled:text-luna-600',
  texto: 'text-primary-700 underline decoration-2 hover:decoration-primary-600',
};
const BASE_BOTON =
  'presionable inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-base font-bold disabled:cursor-not-allowed';

export function Boton({
  variante = 'primario',
  cargando,
  textoCargando = 'Guardando…',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  cargando?: boolean;
  textoCargando?: string;
}) {
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

export function EnlaceBoton({
  to,
  variante = 'primario',
  className = '',
  children,
}: {
  to: string;
  variante?: Variante;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={`${BASE_BOTON} ${VARIANTES[variante]} ${className}`}>
      {children}
    </Link>
  );
}

interface PropsCampo {
  etiqueta: string;
  error?: string;
  ayuda?: string;
}

function MensajeError({ id, texto }: { id: string; texto: string }) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-semibold text-error-800">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {texto}
    </p>
  );
}

function Envoltura({ id, etiqueta, error, ayuda, children }: PropsCampo & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {etiqueta}
      </label>
      {ayuda && (
        <p id={`${id}-ayuda`} className="-mt-1 text-sm text-luna-600">
          {ayuda}
        </p>
      )}
      {children}
      {error && <MensajeError id={`${id}-error`} texto={error} />}
    </div>
  );
}

const describe = (id: string, p: PropsCampo) => [p.ayuda && `${id}-ayuda`, p.error && `${id}-error`].filter(Boolean).join(' ') || undefined;
const CLASE_INPUT = (error?: string) =>
  `min-h-12 w-full rounded-xl border-2 bg-white px-4 py-2 text-base text-luna-800 transition-colors placeholder:text-luna-600 disabled:bg-tierra-100 disabled:text-luna-600 ${
    error ? 'border-error-800' : 'border-tierra-300 hover:border-luna-600'
  } focus:border-primary-600 focus:outline-none focus-visible:outline-3 focus-visible:outline-oro`;

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
}: PropsCampo &
  SelectHTMLAttributes<HTMLSelectElement> & {
    opciones: Record<string, string>;
  }) {
  const id = useId();
  return (
    <Envoltura id={id} etiqueta={etiqueta} error={error} ayuda={ayuda}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={describe(id, { etiqueta, error, ayuda })}
          className={`${CLASE_INPUT(error)} appearance-none pr-11`}
          {...props}
        >
          <option value="">Elige una opción</option>
          {Object.entries(opciones).map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-luna-600" />
      </div>
    </Envoltura>
  );
}

export function Casilla({
  etiqueta,
  error,
  ...props
}: {
  etiqueta: ReactNode;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <div className="flex min-h-11 items-start gap-3 py-1">
        <input
          id={id}
          type="checkbox"
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-6 shrink-0 cursor-pointer rounded-md accent-primary-600"
          {...props}
        />
        <label htmlFor={id} className="cursor-pointer">
          {etiqueta}
        </label>
      </div>
      {error && (
        <div className="ml-9">
          <MensajeError id={`${id}-error`} texto={error} />
        </div>
      )}
    </div>
  );
}

const BANNER: Record<'exito' | 'aviso' | 'error' | 'info', { clase: string; Icono: LucideIcon }> = {
  exito: { clase: 'bg-exito-100 text-exito-800', Icono: CheckCircle2 },
  aviso: { clase: 'bg-aviso-100 text-aviso-800', Icono: TriangleAlert },
  error: { clase: 'bg-error-100 text-error-800', Icono: XCircle },
  info: { clase: 'bg-info-100 text-info-800', Icono: Info },
};

export function Banner({ tipo, children, enfocar }: { tipo: keyof typeof BANNER; children: ReactNode; enfocar?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (enfocar) ref.current?.focus();
  }, [enfocar, children]);
  const { clase, Icono } = BANNER[tipo];
  return (
    <div
      ref={ref}
      tabIndex={enfocar ? -1 : undefined}
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-2xl p-4 ${clase}`}
    >
      <Icono aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

/** Resumen de errores arriba del formulario (recibe el foco para lectores de pantalla). */
export function ResumenErrores({ errores }: { errores: string[] }) {
  if (!errores.length) return null;
  return (
    <Banner tipo="error" enfocar>
      <p className="font-bold">Revisa estos datos:</p>
      <ul className="mt-1 list-disc pl-5">
        {errores.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </Banner>
  );
}

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-tarjeta bg-white p-5 shadow-tarjeta sm:p-6 ${className}`}>{children}</section>;
}

export function BarraProgreso({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="font-bold">{etiqueta}</span>
        <span className="font-extrabold tabular-nums">{valor} %</span>
      </div>
      <div
        role="progressbar"
        aria-label={etiqueta}
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3 overflow-hidden rounded-full bg-tierra-100"
      >
        <div
          className="h-full rounded-full bg-luna-800 transition-[width] duration-700 ease-[var(--ease-salida)]"
          style={{ width: `${valor}%` }}
        />
      </div>
    </div>
  );
}

export function EstadoVacio({ titulo, texto, accion }: { titulo: string; texto: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-tarjeta bg-white px-6 py-10 text-center shadow-tarjeta">
      <img src="/etapas/etapa-0-inicial.svg" alt="" className="size-24" />
      <h2 className="text-xl">{titulo}</h2>
      <p className="max-w-prose text-luna-600">{texto}</p>
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  );
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">{texto}</span>
      <div className="h-28 animate-pulse rounded-tarjeta bg-tierra-100" />
      <div className="h-28 animate-pulse rounded-tarjeta bg-tierra-100" />
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
    // showModal enfoca el primer botón; se mueve el foco a la acción segura marcada con data-foco.
    if (abierto && !d.open) {
      d.showModal();
      d.querySelector<HTMLElement>('[data-foco]')?.focus();
    }
    if (!abierto && d.open) d.close();
  }, [abierto]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-tarjeta bg-white p-0 text-luna-800 shadow-flotante"
    >
      <div className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-aviso-100 text-aviso-800">
            <TriangleAlert aria-hidden="true" className="size-5" />
          </span>
          <h2 id={idTitulo} className="pt-1 text-xl">
            {titulo}
          </h2>
        </div>
        {children}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">{acciones}</div>
      </div>
    </dialog>
  );
}

// Toast de logro: 6 s, aria-live="polite".
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
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4">
        {texto && (
          <p className="aparecer pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-luna-800 px-5 py-3 font-bold text-white shadow-flotante">
            <Sprout aria-hidden="true" className="size-5 shrink-0 text-tierra-300" />
            {texto}
          </p>
        )}
      </div>
    </ContextoToast.Provider>
  );
}
