import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import {
  CONSEJOS_ANCESTRALES,
  MAX_SUBTIPOS,
  NOMBRE_DISENO,
  NOMBRE_VARIANTE,
  VARIANTES_POR_DISENO,
  cedulaValida,
  celularValido,
  coordenadasEnEcuador,
  type TipoDiseno,
  type VarianteDiseno,
} from '@nexo/shared';
import { CheckCircle2, LocateFixed } from 'lucide-react';
import { api } from '../api';
import { useDatos, type Provincia } from '../datos';
import { useEnvio } from '../formulario';
import { SelectorUbicacion } from '../Mapa';
import { Banner, Boton, Campo, Casilla, Encabezado, EnlaceBoton, ResumenErrores, Selector, Tarjeta } from '../ui';

const VACIO = {
  nombreHuerto: '',
  tipo: '' as TipoDiseno | '',
  subtipos: [] as VarianteDiseno[],
  provinciaId: '',
  parroquiaId: '',
  direccion: '',
  latitud: '',
  longitud: '',
  altitud: '',
  nombreResponsable: '',
  cedula: '',
  email: '',
  celular: '',
  aceptaPrivacidad: false,
};

/** Reunión MSP: «Solicitar crear huerto» pide lo mínimo: ubicación, tipo y subtipo, nombre, cédula, correo y celular. */
export function Solicitar() {
  const provincias = useDatos<Provincia[]>('/provincias');
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [d, setD] = useState(VACIO);
  const [enviada, setEnviada] = useState(false);
  const [gps, setGps] = useState('');
  const parroquias = provincias.datos?.find((p) => String(p.id) === d.provinciaId)?.parroquias ?? [];
  const cambiar = (campo: keyof typeof VACIO) => (e: { target: { value: string } }) => setD({ ...d, [campo]: e.target.value });

  function usarGps() {
    if (!navigator.geolocation) return setGps('Tu navegador no permite obtener la ubicación. Márcala en el mapa.');
    setGps('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setD((x) => ({
          ...x,
          latitud: p.coords.latitude.toFixed(6),
          longitud: p.coords.longitude.toFixed(6),
          altitud: p.coords.altitude ? String(Math.round(p.coords.altitude)) : x.altitud,
        }));
        setGps('Ubicación tomada del GPS. Revisa el punto en el mapa.');
      },
      () => setGps('No se pudo obtener la ubicación. Márcala en el mapa.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function alternarSubtipo(v: VarianteDiseno) {
    setD((x) => ({ ...x, subtipos: x.subtipos.includes(v) ? x.subtipos.filter((s) => s !== v) : [...x.subtipos, v] }));
  }

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    const f: Record<string, string> = {};
    if (!d.nombreHuerto.trim()) f.nombreHuerto = 'El nombre del huerto es obligatorio.';
    if (!d.tipo) f.tipo = 'Elige el tipo de huerto.';
    if (!d.subtipos.length) f.subtipos = 'Elige al menos un subtipo.';
    else if (d.subtipos.length > MAX_SUBTIPOS) f.subtipos = `Elige como máximo ${MAX_SUBTIPOS} subtipos.`;
    if (!d.provinciaId) f.provinciaId = 'Elige la provincia.';
    if (!d.parroquiaId) f.parroquiaId = 'Elige la parroquia.';
    if (!d.latitud || !d.longitud) f.latitud = 'Marca la ubicación del huerto en el mapa.';
    else if (!coordenadasEnEcuador(Number(d.latitud), Number(d.longitud))) f.latitud = 'La ubicación debe estar dentro de Ecuador.';
    if (!d.altitud) f.altitud = 'Indica la altitud aproximada en metros.';
    if (!d.nombreResponsable.trim()) f.nombreResponsable = 'Tu nombre es obligatorio.';
    if (!cedulaValida(d.cedula)) f.cedula = 'La cédula no es válida: revisa los 10 dígitos.';
    if (!/^\S+@\S+\.\S+$/.test(d.email)) f.email = 'Escribe un correo válido, por ejemplo nombre@correo.com.';
    if (!celularValido(d.celular)) f.celular = 'El celular debe tener 10 dígitos y empezar con 09.';
    if (!d.aceptaPrivacidad) f.aceptaPrivacidad = 'Debes aceptar la política de tratamiento de datos para enviar la solicitud.';
    if (Object.keys(f).length) return setErrores(f);
    await enviar(async () => {
      await api('/publico/solicitudes', {
        body: {
          ...d,
          provinciaId: Number(d.provinciaId),
          parroquiaId: Number(d.parroquiaId),
          latitud: Number(d.latitud),
          longitud: Number(d.longitud),
          altitud: Number(d.altitud),
          direccion: d.direccion || undefined,
        },
      });
      setEnviada(true);
      window.scrollTo({ top: 0 });
    });
  }

  if (enviada)
    return (
      <div className="mx-auto max-w-xl space-y-5 text-center">
        <CheckCircle2 aria-hidden="true" className="mx-auto size-16 text-primary-600" />
        <h1 className="text-3xl">Solicitud enviada</h1>
        <p className="text-lg">
          Un técnico del Ministerio de Salud Pública te contactará al celular o correo que registraste. Si se aprueba, recibirás por correo tu usuario y una
          contraseña temporal.
        </p>
        <p className="text-luna-600">Mientras tanto, aprende los pasos del huerto medicinal.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <EnlaceBoton to="/saberes">Ver los saberes</EnlaceBoton>
          <EnlaceBoton to="/plantas" variante="secundario">
            Conocer las plantas
          </EnlaceBoton>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Encabezado
        titulo="Solicitar un huerto"
        texto="Un huerto puede empezar con una sola persona: tú serás la persona responsable. Después de la aprobación podrás registrar a tus voluntarios."
      />
      <form onSubmit={alEnviar} noValidate className="space-y-6">
        <ResumenErrores errores={resumen} />
        <Tarjeta className="space-y-4">
          <h2 className="text-xl">El huerto</h2>
          <Campo etiqueta="Nombre del huerto" value={d.nombreHuerto} error={errores.nombreHuerto} onChange={cambiar('nombreHuerto')} maxLength={120} />
          <Selector
            etiqueta="Tipo de huerto"
            opciones={NOMBRE_DISENO}
            value={d.tipo}
            error={errores.tipo}
            onChange={(e) => setD({ ...d, tipo: e.target.value as TipoDiseno, subtipos: [] })}
          />
          {d.tipo && (
            <fieldset aria-describedby="ayuda-subtipos">
              <legend className="font-bold">Subtipos</legend>
              <p id="ayuda-subtipos" className="text-sm text-luna-600">
                Hasta {MAX_SUBTIPOS}, con el mismo grupo de voluntarios y el mismo responsable.
              </p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                {VARIANTES_POR_DISENO[d.tipo].map((v) => (
                  <Casilla
                    key={v}
                    etiqueta={NOMBRE_VARIANTE[v]}
                    checked={d.subtipos.includes(v)}
                    disabled={!d.subtipos.includes(v) && d.subtipos.length >= MAX_SUBTIPOS}
                    onChange={() => alternarSubtipo(v)}
                  />
                ))}
              </div>
              {errores.subtipos && <p className="mt-1 text-sm font-bold text-error-800">{errores.subtipos}</p>}
            </fieldset>
          )}
        </Tarjeta>

        <Tarjeta className="space-y-4">
          <h2 className="text-xl">Ubicación</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Selector
              etiqueta="Provincia"
              opciones={Object.fromEntries((provincias.datos ?? []).map((p) => [p.id, p.nombre]))}
              value={d.provinciaId}
              error={errores.provinciaId}
              onChange={(e) => setD({ ...d, provinciaId: e.target.value, parroquiaId: '' })}
            />
            <Selector
              etiqueta="Parroquia"
              opciones={Object.fromEntries(parroquias.map((p) => [p.id, p.nombre]))}
              value={d.parroquiaId}
              error={errores.parroquiaId}
              disabled={!d.provinciaId}
              onChange={cambiar('parroquiaId')}
            />
          </div>
          <Campo etiqueta="Dirección o referencia (opcional)" value={d.direccion} onChange={cambiar('direccion')} maxLength={200} />
          <div className="space-y-2">
            <p className="font-bold">Marca el huerto en el mapa</p>
            <p className="text-sm text-luna-600">Toca el lugar exacto. También puedes usar el GPS de tu teléfono o escribir las coordenadas.</p>
            <SelectorUbicacion
              lat={d.latitud ? Number(d.latitud) : undefined}
              lng={d.longitud ? Number(d.longitud) : undefined}
              onElegir={(lat, lng) => setD((x) => ({ ...x, latitud: String(lat), longitud: String(lng) }))}
            />
            <Boton type="button" variante="secundario" onClick={usarGps}>
              <LocateFixed aria-hidden="true" className="size-5" />
              Usar mi ubicación
            </Boton>
            {gps && <p role="status">{gps}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo etiqueta="Latitud" inputMode="decimal" value={d.latitud} error={errores.latitud} onChange={cambiar('latitud')} />
            <Campo etiqueta="Longitud" inputMode="decimal" value={d.longitud} onChange={cambiar('longitud')} />
            <Campo
              etiqueta="Altitud (m)"
              ayuda="Sirve para sugerir plantas."
              inputMode="numeric"
              value={d.altitud}
              error={errores.altitud}
              onChange={cambiar('altitud')}
            />
          </div>
          <Banner tipo="info">{CONSEJOS_ANCESTRALES.ubicacion.join(' ')}</Banner>
        </Tarjeta>

        <Tarjeta className="space-y-4">
          <h2 className="text-xl">Persona responsable</h2>
          <Campo etiqueta="Nombre completo" autoComplete="name" value={d.nombreResponsable} error={errores.nombreResponsable} onChange={cambiar('nombreResponsable')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Cédula" inputMode="numeric" maxLength={10} value={d.cedula} error={errores.cedula} onChange={cambiar('cedula')} />
            <Campo
              etiqueta="Celular"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              maxLength={10}
              ayuda="Ejemplo: 0991234567"
              value={d.celular}
              error={errores.celular}
              onChange={cambiar('celular')}
            />
          </div>
          <Campo
            etiqueta="Correo"
            type="email"
            autoComplete="email"
            ayuda="Aquí recibirás tu usuario y contraseña si se aprueba."
            value={d.email}
            error={errores.email}
            onChange={cambiar('email')}
          />
          <Casilla
            checked={d.aceptaPrivacidad}
            error={errores.aceptaPrivacidad}
            onChange={(e) => setD({ ...d, aceptaPrivacidad: e.target.checked })}
            etiqueta={
              <>
                Acepto el tratamiento de mis datos personales según la{' '}
                <Link to="/privacidad" target="_blank" className="font-bold text-primary-700 underline decoration-2">
                  política de privacidad
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </Link>
                , conforme a la Ley Orgánica de Protección de Datos Personales.
              </>
            }
          />
        </Tarjeta>
        <Boton type="submit" cargando={enviando} textoCargando="Enviando…" className="w-full sm:w-auto">
          Enviar solicitud
        </Boton>
      </form>
    </div>
  );
}
