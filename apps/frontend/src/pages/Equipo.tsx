import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import {
  CicloPlanta,
  CualidadPlanta,
  NOMBRE_CICLO,
  NOMBRE_CUALIDAD,
  NOMBRE_GENERO,
  NOMBRE_NIVEL,
  cedulaValida,
  type NivelMiembro,
} from '@nexo/shared';
import { Award, Check, Plus, UserMinus, UserPlus } from 'lucide-react';
import { api } from '../api';
import { hoyLocal, useDatos, type PlantaCatalogo } from '../datos';
import { useEnvio } from '../formulario';
import {
  AreaTexto,
  Banner,
  BarraProgreso,
  Boton,
  Campo,
  Cargando,
  Casilla,
  Chip,
  Dialogo,
  Encabezado,
  Estado,
  EstadoVacio,
  ResumenErrores,
  Selector,
  Tarjeta,
  useToast,
} from '../ui';
import { useHuerto } from './Panel';

interface Voluntario {
  id: string;
  nombre: string;
  fechaNacimiento: string;
  genero: keyof typeof NOMBRE_GENERO;
  nivel: NivelMiembro;
  puntos: number;
  horas: number;
  otrosHuertos: number;
  activo: boolean;
  solicitudNivel: { nivel: NivelMiembro; estado: string; motivo: string | null } | null;
  avance: { horas: number; tipos: number; ciclos: number };
  siguiente: { nivel: NivelMiembro; faltan: { horas: number; tipos: number; ciclos: number }; progreso: number } | null;
  talentos: string[];
}

const VACIO = { nombre: '', cedula: '', fechaNacimiento: '', genero: '', conExperiencia: false, nivelSolicitado: '', justificacion: '' };

/** Reunión MSP: los voluntarios no tienen cuenta; el responsable los agrega o los marca como inactivos. */
export function Voluntarios() {
  const id = useHuerto();
  const { datos, cargando, error, recargar } = useDatos<Voluntario[]>(id ? `/huertos/${id}/voluntarios` : null);
  const toast = useToast();
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [d, setD] = useState(VACIO);
  const [abierto, setAbierto] = useState(false);
  const [nivel, setNivel] = useState<Voluntario | null>(null);
  const [n, setN] = useState({ nivel: '', justificacion: '' });

  async function agregar(e: FormEvent) {
    e.preventDefault();
    const f: Record<string, string> = {};
    if (!d.nombre.trim()) f.nombre = 'El nombre es obligatorio.';
    if (d.cedula && !cedulaValida(d.cedula)) f.cedula = 'La cédula no es válida: revisa los 10 dígitos.';
    if (!d.fechaNacimiento) f.fechaNacimiento = 'Indica la fecha de nacimiento.';
    if (!d.genero) f.genero = 'Elige una opción de género.';
    if (d.conExperiencia && !d.nivelSolicitado) f.nivelSolicitado = 'Elige el nivel.';
    if (d.conExperiencia && d.justificacion.trim().length < 20) f.justificacion = 'Explica la experiencia del voluntario (al menos 20 caracteres).';
    if (Object.keys(f).length) return setErrores(f);
    await enviar(async () => {
      const r = await api<{ reutilizado: boolean }>(`/huertos/${id}/voluntarios`, {
        body: {
          nombre: d.nombre,
          cedula: d.cedula || undefined,
          fechaNacimiento: d.fechaNacimiento,
          genero: d.genero,
          ...(d.conExperiencia ? { nivelSolicitado: d.nivelSolicitado, justificacion: d.justificacion } : {}),
        },
      });
      setD(VACIO);
      setAbierto(false);
      toast(r.reutilizado ? 'Ya estaba en otro huerto: se sumó también al tuyo.' : `Voluntario agregado${d.conExperiencia ? '. El MSP revisará su nivel.' : '.'}`);
      void recargar();
    });
  }

  async function cambiarEstado(v: Voluntario) {
    await api(`/huertos/${id}/voluntarios/${v.id}`, { method: 'PATCH', body: { activo: !v.activo } });
    toast(v.activo ? `${v.nombre} quedó como inactivo.` : `${v.nombre} volvió a estar activo.`);
    void recargar();
  }

  async function pedirNivel() {
    await api(`/huertos/${id}/voluntarios/${nivel!.id}/nivel`, { body: n });
    setNivel(null);
    toast('Solicitud enviada al MSP.');
    void recargar();
  }

  if (error) return <Banner tipo="error">{error}</Banner>;
  if (cargando && !datos) return <Cargando />;

  return (
    <div className="space-y-6">
      <Encabezado
        titulo="Voluntarios"
        texto="Las personas que trabajan en el huerto. No necesitan cuenta: tú registras sus horas. Un voluntario puede estar en varios huertos."
        accion={
          <Boton onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
            <UserPlus aria-hidden="true" className="size-5" />
            Agregar voluntario
          </Boton>
        }
      />
      {abierto && (
        <Tarjeta>
          <form onSubmit={agregar} noValidate className="space-y-4">
            <ResumenErrores errores={resumen} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Nombre completo" value={d.nombre} error={errores.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} />
              <Campo
                etiqueta="Cédula (opcional)"
                ayuda="Si ya está en otro huerto, se reconoce por su cédula."
                inputMode="numeric"
                maxLength={10}
                value={d.cedula}
                error={errores.cedula}
                onChange={(e) => setD({ ...d, cedula: e.target.value })}
              />
              <Campo
                etiqueta="Fecha de nacimiento"
                type="date"
                max={hoyLocal()}
                value={d.fechaNacimiento}
                error={errores.fechaNacimiento}
                onChange={(e) => setD({ ...d, fechaNacimiento: e.target.value })}
              />
              <Selector etiqueta="Género" opciones={NOMBRE_GENERO} value={d.genero} error={errores.genero} onChange={(e) => setD({ ...d, genero: e.target.value })} />
            </div>
            <Casilla
              etiqueta="Tiene experiencia: pedir al MSP que entre como Oficial o Maestro"
              checked={d.conExperiencia}
              onChange={(e) => setD({ ...d, conExperiencia: e.target.checked })}
            />
            {d.conExperiencia && (
              <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
                <Selector
                  etiqueta="Nivel"
                  opciones={{ OFICIAL: 'Oficial', MAESTRO: 'Maestro' }}
                  value={d.nivelSolicitado}
                  error={errores.nivelSolicitado}
                  onChange={(e) => setD({ ...d, nivelSolicitado: e.target.value })}
                />
                <AreaTexto
                  etiqueta="Justificación"
                  ayuda="Cuenta su experiencia: años, saberes, rituales que guía."
                  value={d.justificacion}
                  error={errores.justificacion}
                  rows={3}
                  onChange={(e) => setD({ ...d, justificacion: e.target.value })}
                />
              </div>
            )}
            <Boton type="submit" cargando={enviando}>
              Guardar voluntario
            </Boton>
          </form>
        </Tarjeta>
      )}
      {!datos?.length ? (
        <EstadoVacio titulo="Aún no hay voluntarios" texto="Agrégate también a ti para registrar tus horas." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {datos.map((v) => (
            <li key={v.id}>
              <Tarjeta className={`h-full space-y-3 ${v.activo ? '' : 'opacity-75'}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl">{v.nombre}</h2>
                    <p className="text-sm text-luna-600">
                      {v.horas} h validadas · {v.puntos} puntos{v.otrosHuertos > 0 && ` · también en ${v.otrosHuertos} huerto${v.otrosHuertos > 1 ? 's' : ''} más`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Chip tono={v.nivel === 'MAESTRO' ? 'exito' : v.nivel === 'OFICIAL' ? 'info' : 'neutro'} Icono={Award}>
                      {NOMBRE_NIVEL[v.nivel]}
                    </Chip>
                    {!v.activo && <Chip>Inactivo</Chip>}
                  </div>
                </div>
                {v.siguiente && (
                  <div className="space-y-1">
                    <BarraProgreso valor={v.siguiente.progreso} etiqueta={`Camino a ${NOMBRE_NIVEL[v.siguiente.nivel]}`} />
                    <p className="text-sm text-luna-600">
                      Faltan {v.siguiente.faltan.horas} h
                      {v.siguiente.faltan.tipos > 0 && `, ${v.siguiente.faltan.tipos} tipos de actividad`}
                      {v.siguiente.faltan.ciclos > 0 && `, ${v.siguiente.faltan.ciclos} ciclo completo`}.
                    </p>
                  </div>
                )}
                {v.talentos.length > 0 && (
                  <p className="flex flex-wrap gap-1.5">
                    {v.talentos.map((t) => (
                      <Chip key={t} tono="exito" Icono={Check}>
                        {t}
                      </Chip>
                    ))}
                  </p>
                )}
                {v.solicitudNivel && (
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    Solicitud de nivel {NOMBRE_NIVEL[v.solicitudNivel.nivel]}: <Estado estado={v.solicitudNivel.estado} />
                    {v.solicitudNivel.motivo && <span className="text-luna-600">{v.solicitudNivel.motivo}</span>}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Boton variante="secundario" onClick={() => void cambiarEstado(v)}>
                    {v.activo ? <UserMinus aria-hidden="true" className="size-5" /> : <UserPlus aria-hidden="true" className="size-5" />}
                    {v.activo ? 'Marcar inactivo' : 'Reactivar'}
                  </Boton>
                  {v.nivel !== 'MAESTRO' && v.solicitudNivel?.estado !== 'PENDIENTE' && (
                    <Boton
                      variante="texto"
                      onClick={() => {
                        setN({ nivel: '', justificacion: '' });
                        setNivel(v);
                      }}
                    >
                      Pedir nivel por experiencia
                    </Boton>
                  )}
                </div>
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
      <Dialogo
        abierto={!!nivel}
        titulo={`Nivel por experiencia: ${nivel?.nombre ?? ''}`}
        onCerrar={() => setNivel(null)}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => setNivel(null)} data-foco>
              Cancelar
            </Boton>
            <Boton onClick={() => void pedirNivel()} disabled={!n.nivel || n.justificacion.trim().length < 20}>
              Enviar al MSP
            </Boton>
          </>
        }
      >
        <Selector etiqueta="Nivel" opciones={{ OFICIAL: 'Oficial', MAESTRO: 'Maestro' }} value={n.nivel} onChange={(e) => setN({ ...n, nivel: e.target.value })} />
        <AreaTexto etiqueta="Justificación (mínimo 20 caracteres)" value={n.justificacion} rows={3} onChange={(e) => setN({ ...n, justificacion: e.target.value })} />
      </Dialogo>
    </div>
  );
}

interface Catalogo {
  altitud: number;
  plantas: (PlantaCatalogo & { apta: boolean; elegida: boolean })[];
  propuestas: (PlantaCatalogo & { estado: string; motivo: string | null })[];
}

const PLANTA_VACIA = {
  nombreComun: '',
  nombreCientifico: '',
  familiaBotanica: '',
  altitudMin: '',
  altitudMax: '',
  ciclo: '',
  cualidad: '',
  usosMedicinales: '',
  parteUsada: '',
  esMedicinal: false,
};

/** Plantas del huerto: se eligen del catálogo del MSP filtrado por altitud; las de otra altitud piden confirmación. */
export function PlantasHuerto() {
  const id = useHuerto();
  const { datos, cargando, error, recargar } = useDatos<Catalogo>(id ? `/huertos/${id}/catalogo` : null);
  const toast = useToast();
  const [verTodas, setVerTodas] = useState(false);
  const [confirmar, setConfirmar] = useState<{ planta: PlantaCatalogo; mensaje: string } | null>(null);
  const [proponer, setProponer] = useState(false);
  const [p, setP] = useState(PLANTA_VACIA);
  const [foto, setFoto] = useState<File | null>(null);
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();

  async function elegir(planta: PlantaCatalogo, confirmarAltitud = false) {
    await enviar(
      async () => {
        await api(`/huertos/${id}/plantas`, { body: { plantaId: planta.id, confirmarAltitud } });
        setConfirmar(null);
        toast(`${planta.nombreComun} se agregó a tu huerto.`);
        void recargar();
      },
      (e) => {
        if (e.status !== 409 || !e.advertencias.length) return false;
        setConfirmar({ planta, mensaje: e.advertencias[0].mensaje });
        return true;
      },
    );
  }

  async function enviarPropuesta(e: FormEvent) {
    e.preventDefault();
    const f: Record<string, string> = {};
    if (!p.nombreComun.trim()) f.nombreComun = 'El nombre común es obligatorio.';
    if (!p.nombreCientifico.trim()) f.nombreCientifico = 'El nombre científico es obligatorio.';
    if (!p.ciclo) f.ciclo = 'Elige el ciclo.';
    if (!p.cualidad) f.cualidad = 'Elige si es caliente o fría.';
    if (!p.usosMedicinales.trim()) f.usosMedicinales = 'Los usos medicinales son obligatorios.';
    if (!p.esMedicinal) f.esMedicinal = 'Confirma que es una planta medicinal: el catálogo no admite otras plantas.';
    if (Object.keys(f).length) return setErrores(f);
    const form = new FormData();
    form.append(
      'datos',
      JSON.stringify({
        ...p,
        altitudMin: p.altitudMin ? Number(p.altitudMin) : undefined,
        altitudMax: p.altitudMax ? Number(p.altitudMax) : undefined,
        familiaBotanica: p.familiaBotanica || undefined,
        parteUsada: p.parteUsada || undefined,
      }),
    );
    if (foto) form.append('foto', foto);
    await enviar(async () => {
      await api(`/huertos/${id}/plantas/propuestas`, { body: form });
      setP(PLANTA_VACIA);
      setFoto(null);
      setProponer(false);
      toast('Planta enviada al MSP para su análisis.');
      void recargar();
    });
  }

  if (error) return <Banner tipo="error">{error}</Banner>;
  if (cargando && !datos) return <Cargando />;
  if (!datos) return null;
  const mias = datos.plantas.filter((x) => x.elegida);
  const visibles = datos.plantas.filter((x) => !x.elegida && (verTodas || x.apta));

  return (
    <div className="space-y-6">
      <Encabezado titulo="Plantas del huerto" texto={`Tu huerto está a ${datos.altitud} m. Te mostramos primero las plantas del catálogo del MSP que crecen a esa altitud.`} />
      <section className="space-y-3" aria-labelledby="mias">
        <h2 id="mias" className="text-2xl">
          En tu huerto ({mias.length})
        </h2>
        {mias.length ? (
          <ul className="flex flex-wrap gap-2">
            {mias.map((x) => (
              <li key={x.id}>
                <Chip tono={x.cualidad === 'CALIENTE' ? 'caliente' : 'fria'}>
                  {x.nombreComun} · {NOMBRE_CUALIDAD[x.cualidad].toLowerCase()}
                </Chip>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-luna-600">Aún no has elegido plantas.</p>
        )}
      </section>
      <section className="space-y-3" aria-labelledby="catalogo">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="catalogo" className="text-2xl">
            Catálogo del MSP
          </h2>
          <Casilla etiqueta="Mostrar también las de otra altitud" checked={verTodas} onChange={(e) => setVerTodas(e.target.checked)} />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((x) => (
            <li key={x.id}>
              <Tarjeta className="flex h-full flex-col gap-2">
                <h3 className="text-lg">{x.nombreComun}</h3>
                <p className="text-sm italic text-luna-600">{x.nombreCientifico}</p>
                <p className="line-clamp-2 text-sm">{x.usosMedicinales}</p>
                <p className="flex flex-wrap gap-1.5">
                  <Chip tono={x.cualidad === 'CALIENTE' ? 'caliente' : 'fria'}>{NOMBRE_CUALIDAD[x.cualidad]}</Chip>
                  <Chip tono={x.apta ? 'exito' : 'aviso'}>
                    {x.altitudMin ?? 0}–{x.altitudMax ?? '…'} m
                  </Chip>
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Boton variante="secundario" onClick={() => void elegir(x)}>
                    <Plus aria-hidden="true" className="size-5" />
                    Agregar
                  </Boton>
                  <Link to={`/plantas/${x.id}`} className="inline-flex min-h-12 items-center font-bold text-primary-700 underline">
                    Ficha
                  </Link>
                </div>
              </Tarjeta>
            </li>
          ))}
        </ul>
      </section>
      <Tarjeta className="space-y-3">
        <h2 className="text-2xl">¿Falta una planta medicinal?</h2>
        <p>Envíala al MSP con toda su información. La analizarán antes de sumarla al catálogo.</p>
        {datos.propuestas.length > 0 && (
          <ul className="space-y-1">
            {datos.propuestas.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center gap-2">
                <strong>{x.nombreComun}</strong> <Estado estado={x.estado} />
                {x.motivo && <span className="text-sm text-luna-600">{x.motivo}</span>}
              </li>
            ))}
          </ul>
        )}
        {!proponer ? (
          <Boton variante="secundario" onClick={() => setProponer(true)}>
            Solicitar añadir planta
          </Boton>
        ) : (
          <form onSubmit={enviarPropuesta} noValidate className="space-y-4">
            <ResumenErrores errores={resumen} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Nombre común" value={p.nombreComun} error={errores.nombreComun} onChange={(e) => setP({ ...p, nombreComun: e.target.value })} />
              <Campo etiqueta="Nombre científico" value={p.nombreCientifico} error={errores.nombreCientifico} onChange={(e) => setP({ ...p, nombreCientifico: e.target.value })} />
              <Campo etiqueta="Familia botánica (opcional)" value={p.familiaBotanica} onChange={(e) => setP({ ...p, familiaBotanica: e.target.value })} />
              <Campo etiqueta="Parte que se usa (opcional)" value={p.parteUsada} onChange={(e) => setP({ ...p, parteUsada: e.target.value })} />
              <Selector etiqueta="Ciclo" opciones={NOMBRE_CICLO} value={p.ciclo} error={errores.ciclo} onChange={(e) => setP({ ...p, ciclo: e.target.value as CicloPlanta })} />
              <Selector
                etiqueta="Caliente o fría"
                opciones={NOMBRE_CUALIDAD}
                value={p.cualidad}
                error={errores.cualidad}
                onChange={(e) => setP({ ...p, cualidad: e.target.value as CualidadPlanta })}
              />
              <Campo etiqueta="Altitud mínima (m)" inputMode="numeric" value={p.altitudMin} onChange={(e) => setP({ ...p, altitudMin: e.target.value.replace(/\D/g, '') })} />
              <Campo etiqueta="Altitud máxima (m)" inputMode="numeric" value={p.altitudMax} onChange={(e) => setP({ ...p, altitudMax: e.target.value.replace(/\D/g, '') })} />
            </div>
            <AreaTexto etiqueta="Usos medicinales" value={p.usosMedicinales} error={errores.usosMedicinales} onChange={(e) => setP({ ...p, usosMedicinales: e.target.value })} />
            <label className="block font-bold">
              Foto (opcional)
              <input type="file" accept="image/*" className="mt-1 block" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
            </label>
            <Casilla etiqueta="Confirmo que es una planta medicinal" checked={p.esMedicinal} error={errores.esMedicinal} onChange={(e) => setP({ ...p, esMedicinal: e.target.checked })} />
            <div className="flex flex-wrap gap-2">
              <Boton type="submit" cargando={enviando}>
                Enviar al MSP
              </Boton>
              <Boton type="button" variante="texto" onClick={() => setProponer(false)}>
                Cancelar
              </Boton>
            </div>
          </form>
        )}
      </Tarjeta>
      <Dialogo
        abierto={!!confirmar}
        titulo="¿Estás seguro?"
        onCerrar={() => setConfirmar(null)}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => confirmar && void elegir(confirmar.planta, true)}>
              Agregar de todas formas
            </Boton>
            <Boton onClick={() => setConfirmar(null)} data-foco>
              Elegir otra
            </Boton>
          </>
        }
      >
        <p>{confirmar?.mensaje}</p>
      </Dialogo>
    </div>
  );
}
