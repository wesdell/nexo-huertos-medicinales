import { CONSEJOS_ANCESTRALES, type Etapa } from '@nexo/shared';
import { ChevronRight, Leaf, LogOut, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useDatos, type HuertoMio } from '../datos';
import { Luna } from '../Luna';
import { useSesion } from '../sesion';
import { Banner, Cargando, EnlaceBoton, Tarjeta } from '../ui';

interface Virtual {
  progreso: number;
  plantas: { plantaId: string; nombreComun: string; etapa: Etapa }[];
}

export function Inicio() {
  const { yo, salir } = useSesion();
  const navegar = useNavigate();
  const { datos, error, cargando } = useDatos<HuertoMio>('/huertos/mio');
  const huertoId = datos?.huerto?.id;
  const virtual = useDatos<Virtual>(huertoId ? `/huertos/${huertoId}/virtual` : null);
  const rec = datos?.recomendacion;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl sm:text-4xl">Hola, {yo?.nombre.split(' ')[0]}</h1>
        <p className="mt-1 text-luna-600">{yo?.comunidad ? yo.comunidad.nombre : 'Aún no perteneces a una comunidad'}</p>
      </header>

      {rec && (
        <Tarjeta className="space-y-5">
          <div className="flex items-center gap-5">
            <Luna fase={rec.fase} className="size-24 shrink-0" />
            <div>
              <h2 className="text-2xl sm:text-3xl">Hoy: {rec.nombre.toLowerCase()}</h2>
              <p className="mt-1 text-lg">{rec.texto}</p>
            </div>
          </div>
          {datos?.huerto && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <EnlaceBoton to="/actividades/nueva" className="w-full sm:w-auto">
                <Plus aria-hidden="true" className="size-5" strokeWidth={2.5} />
                Registrar actividad
              </EnlaceBoton>
              <p className="text-sm text-luna-600">Si sigues la recomendación de la luna, ganas 5 puntos extra.</p>
            </div>
          )}
        </Tarjeta>
      )}

      {!yo?.comunidad ? (
        <Tarjeta>
          <h2 className="text-xl">Empieza tu comunidad de siembra</h2>
          <p className="mb-5 mt-1 text-luna-600">
            Puede ser de una sola persona o de todo un barrio. Con ella registras tu huerto y sus actividades.
          </p>
          <EnlaceBoton to="/comunidad/nueva">Crear comunidad</EnlaceBoton>
        </Tarjeta>
      ) : cargando ? (
        <Cargando />
      ) : error ? (
        <Banner tipo="error">{error}</Banner>
      ) : !datos?.huerto ? (
        <Tarjeta>
          <h2 className="text-xl">Registra tu huerto</h2>
          <p className="mb-5 mt-1 text-luna-600">
            {yo.comunidad.esResponsable
              ? 'Indica dónde está y agrega tus plantas medicinales.'
              : 'El responsable de tu comunidad debe registrarlo.'}
          </p>
          {yo.comunidad.esResponsable && <EnlaceBoton to="/huerto">Registrar el huerto</EnlaceBoton>}
        </Tarjeta>
      ) : (
        <>
          <Link
            to="/huerto/virtual"
            className="presionable block rounded-tarjeta bg-white p-5 shadow-tarjeta hover:shadow-[0_10px_24px_-6px_rgb(42_36_29/0.18)] sm:p-6"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-display text-xl font-extrabold">Tu huerto virtual</span>
              <ChevronRight aria-hidden="true" className="size-6 text-luna-600" />
            </span>
            {virtual.datos && virtual.datos.plantas.length > 0 ? (
              <>
                <span className="mt-4 flex gap-3 overflow-hidden">
                  {virtual.datos.plantas.slice(0, 5).map((p) => (
                    <span key={p.plantaId} className="flex w-16 shrink-0 flex-col items-center">
                      <img src={`/etapas/${p.etapa.recurso}`} alt="" className="size-16" />
                      <span className="mt-1 w-full truncate text-center text-xs font-bold">{p.nombreComun}</span>
                    </span>
                  ))}
                </span>
                <span className="mt-4 block text-luna-600">
                  Avance del huerto: <strong className="text-luna-800">{virtual.datos.progreso} %</strong> · Tienes{' '}
                  <strong className="tabular-nums text-luna-800">{yo.puntos}</strong> puntos y tu comunidad{' '}
                  <strong className="tabular-nums text-luna-800">{yo.comunidad.puntosTotales}</strong>.
                </span>
              </>
            ) : (
              <span className="mt-2 block text-luna-600">Agrega plantas para verlas crecer aquí.</span>
            )}
          </Link>
        </>
      )}

      <Tarjeta>
        <h2 className="text-lg">Saberes de nuestros mayores</h2>
        <ul className="mt-3 space-y-3">
          {[...CONSEJOS_ANCESTRALES.general, CONSEJOS_ANCESTRALES.ubicacion[0]].map((c) => (
            <li key={c} className="flex gap-3">
              <Leaf aria-hidden="true" className="mt-1 size-5 shrink-0 text-luna-600" />
              {c}
            </li>
          ))}
        </ul>
      </Tarjeta>

      {/* En móvil, cerrar sesión vive aquí y no en la cabecera, lejos de toques accidentales. */}
      <button
        onClick={() => {
          salir();
          navegar('/login');
        }}
        className="presionable flex min-h-11 items-center gap-2 font-bold text-primary-700 md:hidden"
      >
        <LogOut aria-hidden="true" className="size-5" />
        Cerrar sesión
      </button>
    </div>
  );
}
