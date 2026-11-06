import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { api } from '../api';
import { useEnvio } from '../formulario';
import { useSesion } from '../sesion';
import { Boton, Campo, ResumenErrores, Tarjeta, useToast } from '../ui';

/** HU-004: quien crea la comunidad queda como responsable. */
export function ComunidadNueva() {
  const { yo, recargar } = useSesion();
  const navegar = useNavigate();
  const toast = useToast();
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [d, setD] = useState({ nombre: '', contactoNombre: '', contactoTelefono: '', contactoCorreo: '' });

  if (yo?.comunidad) return <Navigate to="/" replace />;

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    if (!d.nombre.trim()) return setErrores({ nombre: 'El nombre de la comunidad es obligatorio.' });
    const cuerpo = Object.fromEntries(Object.entries(d).filter(([, v]) => v.trim()));
    await enviar(async () => {
      await api('/comunidades', { body: cuerpo });
      // Navegar antes de recargar: con la comunidad ya cargada esta página redirige a Inicio.
      navegar('/huerto', { replace: true });
      toast('¡Comunidad creada! Ahora eres su responsable.');
      await recargar();
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Crear comunidad</h1>
      <Tarjeta>
        <form onSubmit={alEnviar} noValidate className="flex flex-col gap-4">
          <ResumenErrores errores={resumen} />
          <Campo etiqueta="Nombre de la comunidad" required value={d.nombre} error={errores.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} />
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-2 font-semibold">Contacto (opcional)</legend>
            <Campo etiqueta="Nombre" autoComplete="name" value={d.contactoNombre} onChange={(e) => setD({ ...d, contactoNombre: e.target.value })} />
            <Campo etiqueta="Teléfono" type="tel" autoComplete="tel" value={d.contactoTelefono} onChange={(e) => setD({ ...d, contactoTelefono: e.target.value })} />
            <div className="sm:col-span-2">
              <Campo etiqueta="Correo" type="email" autoComplete="email" value={d.contactoCorreo} error={errores.contactoCorreo} onChange={(e) => setD({ ...d, contactoCorreo: e.target.value })} />
            </div>
          </fieldset>
          <Boton type="submit" cargando={enviando} className="sm:self-start">
            Crear comunidad
          </Boton>
        </form>
      </Tarjeta>
    </div>
  );
}
