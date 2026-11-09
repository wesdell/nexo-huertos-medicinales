import { Link } from 'react-router';
import { NOMBRE_DISENO, type Paso, type TipoDiseno } from '@nexo/shared';
import { Award, ChevronRight, Leaf, Plus, ShieldAlert, Users } from 'lucide-react';
import { useDatos, numero } from '../datos';
import { Luna } from '../Luna';
import { useSesion } from '../sesion';
import { Banner, Cargando, Cifra, EnlaceBoton, Encabezado, EstadoVacio, Tarjeta } from '../ui';
import { PanelAdmin } from './Admin';
import { ResumenMsp } from './Msp';
import { Espejo, type EspejoDatos } from './Publico';

export interface HuertoDetalle {
  id: string;
  nombre: string;
  tipo: TipoDiseno;
  altitud: number;
  puntosTotales: number;
  provincia: { nombre: string };
  parroquia: { nombre: string };
  plantas: { plantaId: string; fueraDeAltitud: boolean; planta: { id: string; nombreComun: string; cualidad: 'CALIENTE' | 'FRIA' } }[];
  _count: { voluntarios: number };
  ciclosActivos: { id: string; planta: { nombreComun: string }; siguiente: Paso | null; repetibles: Paso[] }[];
  evidencias: { pendientes: number; rechazadas: number };
  recomendacion: { fase: string; nombre: string; texto: string } | null;
}

/** El panel depende del rol: responsable, técnico del MSP o administrador. */
export function Panel() {
  const { yo } = useSesion();
  if (yo?.rol === 'TECNICO_MSP') return <ResumenMsp />;
  if (yo?.rol === 'ADMIN') return <PanelAdmin />;
  return <InicioResponsable />;
}

export function useHuerto() {
  const { huertoId } = useSesion();
  return huertoId;
}

function InicioResponsable() {
  const { yo } = useSesion();
  const id = useHuerto();
  const { datos: h, cargando, error } = useDatos<HuertoDetalle>(id ? `/huertos/${id}` : null);
  const espejo = useDatos<EspejoDatos>(id ? `/huertos/${id}/virtual` : null);

  if (!id)
    return (
      <EstadoVacio
        titulo="Aún no tienes un huerto activo"
        texto="Cuando el MSP apruebe tu solicitud, tu huerto aparecerá aquí."
        accion={<EnlaceBoton to="/solicitar">Solicitar un huerto</EnlaceBoton>}
      />
    );
  if (error) return <Banner tipo="error">{error}</Banner>;
  if (cargando || !h) return <Cargando />;
  const rec = h.recomendacion;

  return (
    <div className="space-y-6">
      <Encabezado
        titulo={`Hola, ${yo?.nombre.split(' ')[0]}`}
        texto={`${h.nombre} · ${NOMBRE_DISENO[h.tipo]} · ${h.parroquia.nombre}, ${h.provincia.nombre} · ${numero(h.altitud)} m`}
      />

      {h.evidencias.rechazadas > 0 && (
        <Banner tipo="aviso">
          El MSP rechazó {h.evidencias.rechazadas === 1 ? 'una evidencia' : `${h.evidencias.rechazadas} evidencias`}. Tienes una segunda oportunidad:{' '}
          <Link to="/panel/ciclos" className="font-bold underline">
            revisa y vuelve a subir las fotos
          </Link>
          .
        </Banner>
      )}

      {rec && (
        <Tarjeta className="flex items-center gap-5">
          <Luna fase={rec.fase} className="size-20 shrink-0" />
          <div>
            <h2 className="text-2xl">Hoy: {rec.nombre.toLowerCase()}</h2>
            <p className="mt-1 text-lg">{rec.texto}</p>
          </div>
        </Tarjeta>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Cifra valor={numero(h.puntosTotales)} etiqueta="Puntos del huerto" Icono={Award} />
        <Cifra valor={h._count.voluntarios} etiqueta="Voluntarios activos" Icono={Users} />
        <Cifra valor={h.plantas.length} etiqueta="Plantas" Icono={Leaf} />
        <Cifra valor={h.evidencias.pendientes} etiqueta="Evidencias por validar" Icono={ShieldAlert} />
      </div>

      {h._count.voluntarios === 0 && (
        <Banner tipo="info">
          Registra a las personas que trabajan contigo (y a ti mismo como voluntario) para anotar sus horas.{' '}
          <Link to="/panel/voluntarios" className="font-bold underline">
            Agregar voluntarios
          </Link>
        </Banner>
      )}

      <section className="space-y-3" aria-labelledby="que-sigue">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="que-sigue" className="text-2xl">
            Qué sigue en cada planta
          </h2>
          <EnlaceBoton to="/panel/ciclos" variante="texto">
            Ver todas las actividades
          </EnlaceBoton>
        </div>
        {h.ciclosActivos.length === 0 ? (
          <EstadoVacio
            titulo={h.plantas.length ? 'Empieza un ciclo de siembra' : 'Elige tus primeras plantas'}
            texto={
              h.plantas.length
                ? 'Cada planta tiene su ciclo: desde preparar la tierra hasta empaquetar. Empieza uno para ver el primer paso.'
                : 'Escoge plantas medicinales del catálogo del MSP según la altitud de tu huerto.'
            }
            accion={<EnlaceBoton to={h.plantas.length ? '/panel/ciclos' : '/panel/plantas'}>{h.plantas.length ? 'Empezar un ciclo' : 'Elegir plantas'}</EnlaceBoton>}
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {h.ciclosActivos.map((c) => (
              <li key={c.id}>
                <Tarjeta className="flex h-full flex-col gap-3">
                  <p className="text-sm font-bold uppercase tracking-wide text-luna-600">{c.planta.nombreComun}</p>
                  {c.siguiente ? (
                    <>
                      <h3 className="text-xl">
                        Paso {c.siguiente.orden}: {c.siguiente.nombre}
                      </h3>
                      <p className="text-luna-600">{c.siguiente.cuando}</p>
                    </>
                  ) : (
                    <h3 className="text-xl">Ciclo completo</h3>
                  )}
                  {c.repetibles.length > 0 && <p className="text-sm">También puedes registrar: {c.repetibles.map((r) => r.nombre.toLowerCase()).join(' o ')}.</p>}
                  <div className="mt-auto">
                    <EnlaceBoton to={`/panel/registrar/${c.id}`} className="w-full sm:w-auto">
                      <Plus aria-hidden="true" className="size-5" />
                      Registrar lo que hicimos
                    </EnlaceBoton>
                  </div>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </section>

      {espejo.datos && espejo.datos.plantas.length > 0 && (
        <Tarjeta className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl">Tu huerto virtual</h2>
            <Link to="/panel/virtual" className="inline-flex min-h-11 items-center gap-1 font-bold text-primary-700 underline">
              Ver <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <Espejo espejo={espejo.datos} />
        </Tarjeta>
      )}
    </div>
  );
}
