import {
  Archive,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Database,
  FileSpreadsheet,
  Flower2,
  House,
  Leaf,
  ListChecks,
  LogOut,
  Map,
  Medal,
  Menu,
  MessagesSquare,
  Package,
  Plus,
  ShieldCheck,
  Sprout,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { NOMBRE_ROL, type Rol } from '@nexo/shared';
import { useSesion } from './sesion';
import { EnlaceBoton } from './ui';

interface Destino {
  a: string;
  texto: string;
  Icono: LucideIcon;
  /** Aparece en la barra inferior del móvil. */
  barra?: boolean;
  accion?: boolean;
}

const DESTINOS: Record<Rol, Destino[]> = {
  RESPONSABLE: [
    { a: '/panel', texto: 'Inicio', Icono: House, barra: true },
    { a: '/panel/ciclos', texto: 'Actividades', Icono: ListChecks, barra: true },
    { a: '/panel/registrar', texto: 'Registrar', Icono: Plus, barra: true, accion: true },
    { a: '/panel/voluntarios', texto: 'Voluntarios', Icono: Users, barra: true },
    { a: '/panel/plantas', texto: 'Plantas', Icono: Leaf },
    { a: '/panel/virtual', texto: 'Huerto virtual', Icono: Flower2 },
    { a: '/panel/misiones', texto: 'Misiones y puntos', Icono: Medal },
    { a: '/panel/bodega', texto: 'Bodega', Icono: Archive },
    { a: '/panel/produccion', texto: 'Producción', Icono: Package },
    { a: '/panel/huerto', texto: 'Datos del huerto', Icono: Sprout },
    { a: '/foro', texto: 'Foro', Icono: MessagesSquare },
  ],
  TECNICO_MSP: [
    { a: '/panel', texto: 'Resumen', Icono: House, barra: true },
    { a: '/panel/solicitudes', texto: 'Solicitudes', Icono: ClipboardCheck, barra: true },
    { a: '/panel/evidencias', texto: 'Evidencias', Icono: ShieldCheck, barra: true },
    { a: '/panel/catalogo', texto: 'Catálogo', Icono: Leaf, barra: true },
    { a: '/panel/niveles', texto: 'Niveles', Icono: Medal },
    { a: '/panel/registro', texto: 'Registro de huertos', Icono: FileSpreadsheet },
    { a: '/panel/moderacion', texto: 'Moderación del foro', Icono: MessagesSquare },
    { a: '/estadisticas', texto: 'Estadísticas', Icono: BarChart3 },
  ],
  ADMIN: [
    { a: '/panel', texto: 'Estado del sistema', Icono: Database, barra: true },
    { a: '/panel/usuarios', texto: 'Cuentas', Icono: Users, barra: true },
  ],
};

export function Marca({ claro = false }: { claro?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/logo.svg" alt="" className="size-9" />
      <span className={`font-display text-2xl font-black tracking-tight ${claro ? 'text-white' : 'text-luna-800'}`}>Nexo</span>
    </span>
  );
}

function SaltarContenido() {
  return (
    <a
      href="#contenido"
      className="sr-only z-50 rounded-xl bg-white font-bold shadow-flotante focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:px-4 focus:py-3"
    >
      Saltar al contenido
    </a>
  );
}

const claseEnlace = (accion?: boolean) => ({ isActive }: { isActive: boolean }) =>
  `presionable flex min-h-12 items-center gap-3 rounded-2xl px-4 font-bold ${
    accion
      ? 'mb-2 bg-primary-600 text-white hover:bg-primary-700'
      : isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-luna-600 hover:bg-tierra-100 hover:text-luna-800'
  }`;

/** Panel privado. Móvil: barra inferior y menú completo; escritorio: menú lateral. */
export function Layout() {
  const { yo, salir, huertoId, elegirHuerto } = useSesion();
  const navegar = useNavigate();
  const loc = useLocation();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [loc.pathname]);
  if (!yo) return null;
  const destinos = DESTINOS[yo.rol];
  const cerrar = () => {
    salir();
    navegar('/login');
  };
  const huerto = yo.huertos.find((h) => h.id === huertoId);

  const pie = (
    <div className="rounded-2xl bg-tierra-50 p-4">
      <p className="font-bold">{yo.nombre}</p>
      <p className="text-sm text-luna-600">{NOMBRE_ROL[yo.rol]}</p>
      {yo.rol === 'RESPONSABLE' && yo.huertos.length > 1 && (
        <label className="mt-2 block text-sm font-bold">
          Huerto
          <select
            value={huertoId ?? ''}
            onChange={(e) => elegirHuerto(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border-2 border-tierra-300 bg-white px-3"
          >
            {yo.huertos.map((h) => (
              <option key={h.id} value={h.id}>
                {h.nombre}
              </option>
            ))}
          </select>
        </label>
      )}
      <button onClick={cerrar} className="presionable mt-3 flex min-h-11 items-center gap-2 font-bold text-primary-700">
        <LogOut aria-hidden="true" className="size-4" />
        Cerrar sesión
      </button>
    </div>
  );

  return (
    <div className="min-h-dvh md:flex">
      <SaltarContenido />
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col overflow-y-auto border-r border-tierra-300 bg-white px-5 py-6 md:flex">
        <Link to="/" aria-label="Nexo, ir a la portada pública">
          <Marca />
        </Link>
        {huerto && <p className="mt-3 text-sm font-bold text-luna-600">{huerto.nombre}</p>}
        <nav aria-label="Principal" className="mt-6 flex flex-1 flex-col gap-1">
          {destinos.map(({ a, texto, Icono, accion }) => (
            <NavLink key={a} to={a} end={a === '/panel'} className={claseEnlace(accion)}>
              <Icono aria-hidden="true" className="size-5" />
              {texto}
            </NavLink>
          ))}
        </nav>
        {pie}
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-4 pt-4 md:hidden">
          <Link to="/" aria-label="Nexo, ir a la portada pública">
            <Marca />
          </Link>
          <button
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-controls="menu-movil"
            className="presionable flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 font-bold shadow-tarjeta"
          >
            {menu ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            Menú
          </button>
        </header>
        {menu && (
          <div id="menu-movil" className="aparecer mx-4 mt-3 space-y-3 rounded-tarjeta bg-white p-3 shadow-flotante md:hidden">
            <nav aria-label="Menú completo" className="grid gap-1">
              {destinos.map(({ a, texto, Icono }) => (
                <NavLink key={a} to={a} end={a === '/panel'} className={claseEnlace()}>
                  <Icono aria-hidden="true" className="size-5" />
                  {texto}
                </NavLink>
              ))}
            </nav>
            {pie}
          </div>
        )}

        <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-5 md:px-10 md:pb-12 md:pt-10">
          <Outlet />
        </main>

        <nav
          aria-label="Accesos rápidos"
          className="fixed inset-x-3 bottom-3 z-40 grid auto-cols-fr grid-flow-col rounded-3xl bg-white p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-flotante md:hidden"
        >
          {destinos
            .filter((d) => d.barra)
            .map(({ a, texto, Icono, accion }) => (
              <NavLink
                key={a}
                to={a}
                end={a === '/panel'}
                className={({ isActive }) =>
                  `presionable flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-bold ${
                    accion ? 'bg-primary-600 text-white' : isActive ? 'bg-primary-50 text-primary-700' : 'text-luna-600'
                  }`
                }
              >
                <Icono aria-hidden="true" className="size-6" />
                {texto}
              </NavLink>
            ))}
        </nav>
      </div>
    </div>
  );
}

const PUBLICOS: Destino[] = [
  { a: '/mapa', texto: 'Mapa', Icono: Map },
  { a: '/ranking', texto: 'Ranking', Icono: Trophy },
  { a: '/estadisticas', texto: 'Estadísticas', Icono: BarChart3 },
  { a: '/plantas', texto: 'Plantas', Icono: Leaf },
  { a: '/saberes', texto: 'Saberes', Icono: BookOpen },
  { a: '/foro', texto: 'Foro', Icono: MessagesSquare },
];

/** Parte pública (sin iniciar sesión): consulta de huertos, estadísticas, saberes y solicitud de huerto. */
export function LayoutPublico() {
  const { yo } = useSesion();
  const loc = useLocation();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [loc.pathname]);

  const enlaces = PUBLICOS.map(({ a, texto, Icono }) => (
    <NavLink
      key={a}
      to={a}
      className={({ isActive }) =>
        `presionable flex min-h-11 items-center gap-2 rounded-2xl px-3 font-bold ${isActive ? 'bg-primary-50 text-primary-700' : 'text-luna-600 hover:bg-tierra-100 hover:text-luna-800'}`
      }
    >
      <Icono aria-hidden="true" className="size-5" />
      {texto}
    </NavLink>
  ));
  const cuenta = yo ? (
    <EnlaceBoton to="/panel" variante="secundario">
      Mi panel
    </EnlaceBoton>
  ) : (
    <EnlaceBoton to="/login" variante="secundario">
      Ingresar
    </EnlaceBoton>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <SaltarContenido />
      <header className="sticky top-0 z-40 border-b border-tierra-300 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" aria-label="Nexo, inicio">
            <Marca />
          </Link>
          <nav aria-label="Principal" className="hidden items-center gap-1 xl:flex">
            {enlaces}
          </nav>
          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            {cuenta}
            <EnlaceBoton to="/solicitar">Solicitar huerto</EnlaceBoton>
          </div>
          <button
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-controls="menu-publico"
            className="presionable flex min-h-11 items-center gap-2 rounded-2xl px-3 font-bold xl:hidden"
          >
            {menu ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            Menú
          </button>
        </div>
        {menu && (
          <div id="menu-publico" className="aparecer border-t border-tierra-300 px-4 pb-4 xl:hidden">
            <nav aria-label="Principal" className="grid gap-1 py-3">
              {enlaces}
            </nav>
            <div className="grid gap-2 sm:grid-cols-2">
              <EnlaceBoton to="/solicitar">Solicitar huerto</EnlaceBoton>
              {cuenta}
            </div>
          </div>
        )}
      </header>
      <main id="contenido" className="mx-auto min-h-dvh w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
        <Outlet />
      </main>
      <footer className="border-t border-tierra-300 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-luna-600 sm:flex-row sm:justify-between">
          <p>Nexo · Huertos medicinales comunitarios con el Ministerio de Salud Pública del Ecuador.</p>
          <p className="flex gap-4">
            <Link to="/puntos" className="font-bold underline">
              Cómo funcionan los puntos
            </Link>
            <Link to="/privacidad" className="font-bold underline">
              Privacidad
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
