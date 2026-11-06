import { NavLink, Outlet, useNavigate } from 'react-router';
import { useSesion } from './sesion';

const DESTINOS = [
  { a: '/', texto: 'Inicio', icono: '⌂' },
  { a: '/huerto', texto: 'Mi huerto', icono: '❦' },
  { a: '/actividades/nueva', texto: 'Registrar', icono: '+', destacado: true },
  { a: '/huerto/virtual', texto: 'Huerto virtual', icono: '✿' },
];

/** Móvil: barra inferior. Escritorio: menú lateral (diseno.md §3). */
export function Layout() {
  const { yo, salir } = useSesion();
  const navegar = useNavigate();
  const cerrar = () => {
    salir();
    navegar('/login');
  };

  return (
    <div className="min-h-dvh md:flex">
      <a href="#contenido" className="sr-only z-50 bg-white p-3 focus:not-sr-only focus:fixed focus:left-2 focus:top-2">
        Saltar al contenido
      </a>

      <aside className="hidden w-64 shrink-0 flex-col bg-primary-800 p-4 text-white md:flex">
        <p className="mb-8 font-display text-2xl font-bold">Nexo</p>
        <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
          {DESTINOS.map((d) => (
            <NavLink
              key={d.a}
              to={d.a}
              end
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-lg px-3 font-medium ${isActive ? 'bg-white text-primary-800' : 'hover:bg-primary-700'}`
              }
            >
              <span aria-hidden="true" className="w-5 text-center text-lg">
                {d.icono}
              </span>
              {d.texto}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-primary-700 pt-4 text-sm">
          <p className="font-semibold">{yo?.nombre}</p>
          <p className="text-primary-100">{yo?.puntos ?? 0} puntos</p>
          <button onClick={cerrar} className="mt-3 min-h-11 font-semibold underline underline-offset-4">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="flex items-center justify-between bg-primary-800 px-4 py-3 text-white md:hidden">
          <p className="font-display text-xl font-bold">Nexo</p>
          <button onClick={cerrar} className="min-h-11 px-2 text-sm font-semibold underline underline-offset-4">
            Cerrar sesión
          </button>
        </header>

        <main id="contenido" className="mx-auto w-full max-w-4xl flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-10">
          <Outlet />
        </main>

        <nav
          aria-label="Principal"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-tierra-300 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          {DESTINOS.map((d) => (
            <NavLink
              key={d.a}
              to={d.a}
              end
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-medium ${isActive ? 'text-primary-700' : 'text-luna-600'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`grid size-8 place-items-center rounded-full text-lg ${d.destacado ? 'bg-primary-600 text-white' : isActive ? 'bg-primary-50' : ''}`}
                  >
                    {d.icono}
                  </span>
                  <span className={isActive ? 'font-semibold' : ''}>{d.texto}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
