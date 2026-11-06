import type { Etapa } from '@nexo/shared';
import { useDatos, type HuertoMio } from '../datos';
import { useSesion } from '../sesion';
import { BarraProgreso, Banner, Cargando, EnlaceBoton, EstadoVacio, Tarjeta } from '../ui';

interface Virtual {
  progreso: number;
  plantas: { plantaId: string; nombreComun: string; etapa: Etapa }[];
}

/** HU-016: una tarjeta por planta con su etapa más avanzada; progreso = promedio. */
export function HuertoVirtual() {
  const { yo } = useSesion();
  const mio = useDatos<HuertoMio>(yo?.comunidad ? '/huertos/mio' : null);
  const id = mio.datos?.huerto?.id;
  const v = useDatos<Virtual>(id ? `/huertos/${id}/virtual` : null);

  if (!yo?.comunidad || (!mio.cargando && !id))
    return (
      <EstadoVacio
        titulo="Tu huerto virtual aparecerá aquí"
        texto="Cuando registres tu huerto y sus plantas, verás cómo avanza cada una."
        accion={<EnlaceBoton to={yo?.comunidad ? '/huerto' : '/comunidad/nueva'}>Configurar huerto</EnlaceBoton>}
      />
    );
  if (mio.cargando || v.cargando || !v.datos) return v.error ? <Banner tipo="error">{v.error}</Banner> : <Cargando />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Huerto virtual</h1>
      {v.datos.plantas.length === 0 ? (
        <EstadoVacio titulo="Parcela vacía" texto="Registra tus plantas para verlas crecer aquí." accion={<EnlaceBoton to="/huerto">Registrar plantas</EnlaceBoton>} />
      ) : (
        <>
          <Tarjeta>
            <BarraProgreso valor={v.datos.progreso} etiqueta="Progreso del huerto" />
          </Tarjeta>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {v.datos.plantas.map((p) => (
              <li key={p.plantaId} className="flex flex-col items-center rounded-tarjeta bg-white p-3 text-center shadow-tarjeta">
                <img key={p.etapa.recurso} src={`/etapas/${p.etapa.recurso}`} alt="" className="animar-entrada aspect-square w-full max-w-36" />
                <p className="mt-2 font-semibold">{p.nombreComun}</p>
                <p className="text-sm text-luna-600">
                  Etapa {p.etapa.nivel}: {p.etapa.nombre}
                </p>
              </li>
            ))}
          </ul>
          <EnlaceBoton to="/actividades/nueva">Registrar actividad</EnlaceBoton>
        </>
      )}
    </div>
  );
}
