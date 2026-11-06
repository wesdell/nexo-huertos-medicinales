import { Flower2, House, LogOut, Plus, Sprout, type LucideIcon } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useSesion } from './sesion';

const DESTINOS: {
  a: string;
  texto: string;
  Icono: LucideIcon;
  accion?: boolean;
}[] = [
  { a: '/', texto: 'Inicio', Icono: House },
  { a: '/huerto', texto: 'Mi huerto', Icono: Sprout },
  { a: '/actividades/nueva', texto: 'Registrar', Icono: Plus, accion: true },
  { a: '/huerto/virtual', texto: 'Huerto virtual', Icono: Flower2 },
];

export function Marca({ claro = false }: { claro?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/logo.svg" alt="" className="size-9" />
      <span className={`font-display text-2xl font-black tracking-tight ${claro ? 'text-white' : 'text-luna-800'}`}>Nexo</span>
    </span>
  );
}

/** Móvil: barra inferior al alcance del pulgar. Escritorio: menú lateral. */
export function Layout() {
  const { yo, salir } = useSesion();
  const navegar = useNavigate();
  const cerrar = () => {
    salir();
    navegar('/login');
  };

  return (
    <div className="min-h-dvh md:flex">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-xl bg-white p-3 font-bold focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>

      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r border-tierra-300 bg-white px-5 py-6 md:flex">
        <Marca />
        <nav aria-label="Principal" className="mt-10 flex flex-1 flex-col gap-1.5">
          {DESTINOS.map(({ a, texto, Icono, accion }) => (
            <NavLink
              key={a}
              to={a}
              end
              className={({ isActive }) =>
                `presionable flex min-h-12 items-center gap-3 rounded-2xl px-4 font-bold ${
                  accion
                    ? 'mb-2 bg-primary-600 text-white hover:bg-primary-700'
                    : isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-luna-600 hover:bg-tierra-100 hover:text-luna-800'
                }`
              }
            >
              <Icono aria-hidden="true" className="size-5" strokeWidth={2.25} />
              {texto}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-2xl bg-tierra-50 p-4">
          <p className="font-bold">{yo?.nombre}</p>
          <p className="text-sm text-luna-600">
            <span className="tabular-nums">{yo?.puntos ?? 0}</span> puntos
          </p>
          <button onClick={cerrar} className="presionable mt-3 flex min-h-11 items-center gap-2 font-bold text-primary-700">
            <LogOut aria-hidden="true" className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="flex items-center justify-between px-4 pt-4 md:hidden">
          <Marca />
          <button
            onClick={cerrar}
            className="presionable flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-primary-700"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Cerrar sesión
          </button>
        </header>

        <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 pt-5 md:px-10 md:pb-12 md:pt-10">
          <Outlet />
        </main>

        <nav
          aria-label="Principal"
          className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-3xl bg-white p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-[0_8px_30px_-6px_rgb(42_36_29/0.25)] md:hidden"
        >
          {DESTINOS.map(({ a, texto, Icono, accion }) => (
            <NavLink
              key={a}
              to={a}
              end
              className={({ isActive }) =>
                `presionable flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-bold ${
                  accion ? 'bg-primary-600 text-white' : isActive ? 'bg-primary-50 text-primary-700' : 'text-luna-600'
                }`
              }
            >
              <Icono aria-hidden="true" className="size-6" strokeWidth={2.25} />
              {texto}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
