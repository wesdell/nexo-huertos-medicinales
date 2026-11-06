import { CONSEJOS_ANCESTRALES, type Etapa } from '@nexo/shared';
import { ChevronRight, Flower2, Leaf, Plus, Sprout, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { useDatos, type HuertoMio } from '../datos';
import { Luna } from '../Luna';
import { useSesion } from '../sesion';
import { Banner, Cargando, EnlaceBoton, Tarjeta } from '../ui';

interface Virtual {
  progreso: number;
  plantas: { plantaId: string; nombreComun: string; etapa: Etapa }[];
}

function AccionRapida({ to, texto, Icono, principal }: { to: string; texto: string; Icono: LucideIcon; principal?: boolean }) {
  return (
    <Link to={to} className="presionable group flex flex-col items-center gap-2 text-center text-sm font-bold">
      <span
        className={`grid size-16 place-items-center rounded-full ${
          principal
            ? 'bg-primary-600 text-white group-hover:bg-primary-700'
            : 'border-2 border-tierra-300 bg-white text-luna-800 group-hover:border-luna-600'
        }`}
      >
        <Icono aria-hidden="true" className="size-7" strokeWidth={2.25} />
      </span>
      {texto}
    </Link>
  );
}

export function Inicio() {
  const { yo } = useSesion();
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
        <Tarjeta className="flex items-center gap-4">
          <Luna fase={rec.fase} className="size-16 shrink-0" />
          <div>
            <h2 className="text-lg">Hoy: {rec.nombre.toLowerCase()}</h2>
            <p className="text-luna-600">{rec.texto}</p>
          </div>
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

          <nav aria-label="Acciones rápidas" className="grid grid-cols-3 gap-2 py-1">
            <AccionRapida to="/actividades/nueva" texto="Registrar actividad" Icono={Plus} principal />
            <AccionRapida to="/huerto" texto="Mi huerto" Icono={Sprout} />
            <AccionRapida to="/huerto/virtual" texto="Huerto virtual" Icono={Flower2} />
          </nav>
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
    </div>
  );
}
