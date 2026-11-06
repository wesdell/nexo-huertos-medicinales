import { CONSEJOS_ANCESTRALES } from '@nexo/shared';
import { useDatos, type HuertoMio } from '../datos';
import { useSesion } from '../sesion';
import { Banner, Cargando, EnlaceBoton, Tarjeta } from '../ui';

const LUNA: Record<string, string> = { LUNA_NUEVA: '🌑', CRECIENTE: '🌓', LLENA: '🌕', MENGUANTE: '🌗' };

export function Inicio() {
  const { yo } = useSesion();
  const { datos, error, cargando } = useDatos<HuertoMio>('/huertos/mio');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Hola, {yo?.nombre.split(' ')[0]}</h1>
        {yo?.comunidad && <p className="text-luna-600">{yo.comunidad.nombre}</p>}
      </header>

      {datos?.recomendacion && (
        <Tarjeta className="border-l-8 border-oro">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <span aria-hidden="true">{LUNA[datos.recomendacion.fase]}</span>
            Recomendación del día
          </h2>
          <p className="mt-1 font-medium">Hoy: {datos.recomendacion.nombre}</p>
          <p className="mt-1 text-luna-600">{datos.recomendacion.texto}</p>
        </Tarjeta>
      )}

      {!yo?.comunidad ? (
        <Tarjeta>
          <h2 className="text-xl font-semibold">Crea tu comunidad de siembra</h2>
          <p className="mb-4 mt-1 text-luna-600">
            Para registrar un huerto y sus actividades, primero necesitas una comunidad. Puede ser de una sola persona o de todo un barrio.
          </p>
          <EnlaceBoton to="/comunidad/nueva">Crear comunidad</EnlaceBoton>
        </Tarjeta>
      ) : cargando ? (
        <Cargando />
      ) : error ? (
        <Banner tipo="error">{error}</Banner>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Tarjeta>
            <p className="text-sm text-luna-600">Mis puntos</p>
            <p className="font-display text-4xl font-bold text-primary-700">{yo.puntos}</p>
          </Tarjeta>
          <Tarjeta>
            <p className="text-sm text-luna-600">Puntos de la comunidad</p>
            <p className="font-display text-4xl font-bold text-primary-700">{yo.comunidad.puntosTotales}</p>
          </Tarjeta>
          <Tarjeta>
            <p className="text-sm text-luna-600">Plantas en el huerto</p>
            <p className="font-display text-4xl font-bold text-primary-700">{datos?.huerto?.plantas.length ?? 0}</p>
          </Tarjeta>
          <div className="flex flex-col gap-3 sm:col-span-3 sm:flex-row">
            {datos?.huerto ? (
              <>
                <EnlaceBoton to="/actividades/nueva">Registrar actividad</EnlaceBoton>
                <EnlaceBoton to="/huerto/virtual" variante="secundario">
                  Ver huerto virtual
                </EnlaceBoton>
              </>
            ) : (
              <EnlaceBoton to="/huerto">{yo.comunidad.esResponsable ? 'Registrar el huerto' : 'Ver mi huerto'}</EnlaceBoton>
            )}
          </div>
        </div>
      )}

      <Tarjeta>
        <h2 className="text-xl font-semibold">Saberes ancestrales</h2>
        <ul className="mt-3 space-y-2">
          {[...CONSEJOS_ANCESTRALES.general, ...CONSEJOS_ANCESTRALES.ubicacion.slice(0, 1)].map((c) => (
            <li key={c} className="flex gap-2">
              <span aria-hidden="true" className="text-primary-600">
                ❦
              </span>
              {c}
            </li>
          ))}
        </ul>
      </Tarjeta>
    </div>
  );
}
