import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Genero } from '@nexo/shared';
import { api } from '../api';
import { useEnvio } from '../formulario';
import { Marca } from '../Layout';
import { useSesion } from '../sesion';
import { Banner, Boton, Campo, Casilla, ResumenErrores, Selector, Tarjeta } from '../ui';

const GENEROS: Record<Genero, string> = {
  FEMENINO: 'Femenino',
  MASCULINO: 'Masculino',
  OTRO: 'Otro',
  PREFIERO_NO_DECIR: 'Prefiero no decirlo',
};

export function PaginaPublica({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh px-4 py-8 sm:py-14">
      <main className="mx-auto max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Marca />
          <p className="text-luna-600">Saberes ancestrales para huertos medicinales comunitarios</p>
        </div>
        <Tarjeta>
          <h1 className="mb-6 text-2xl">{titulo}</h1>
          {children}
        </Tarjeta>
      </main>
    </div>
  );
}

export function Login() {
  const { yo, entrar } = useSesion();
  const navegar = useNavigate();
  const loc = useLocation();
  const { errores, enviando, enviar, resumen } = useEnvio();
  const [datos, setDatos] = useState({ email: '', password: '' });
  const creada = (loc.state as { creada?: boolean } | null)?.creada;

  if (yo) return <Navigate to="/" replace />;

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    await enviar(async () => {
      const { token } = await api<{ token: string }>('/auth/login', {
        body: datos,
      });
      await entrar(token);
      navegar((loc.state as { desde?: string } | null)?.desde ?? '/', {
        replace: true,
      });
    });
  }

  return (
    <PaginaPublica titulo="Inicia sesión">
      <form onSubmit={alEnviar} noValidate className="flex flex-col gap-4">
        {creada && <Banner tipo="exito">Cuenta creada. Ya puedes iniciar sesión.</Banner>}
        <ResumenErrores errores={resumen} />
        <Campo
          etiqueta="Correo"
          type="email"
          autoComplete="email"
          required
          value={datos.email}
          error={errores.email}
          onChange={(e) => setDatos({ ...datos, email: e.target.value })}
        />
        <CampoContrasena
          autoComplete="current-password"
          value={datos.password}
          error={errores.password}
          onChange={(v) => setDatos({ ...datos, password: v })}
        />
        <Boton type="submit" cargando={enviando} textoCargando="Entrando…">
          Entrar
        </Boton>
        <p className="text-center">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-bold text-primary-700 underline decoration-2">
            Regístrate
          </Link>
        </p>
      </form>
    </PaginaPublica>
  );
}

function CampoContrasena(p: { value: string; error?: string; autoComplete: string; ayuda?: string; onChange: (v: string) => void }) {
  const [ver, setVer] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <Campo
        etiqueta="Contraseña"
        type={ver ? 'text' : 'password'}
        required
        autoComplete={p.autoComplete}
        value={p.value}
        error={p.error}
        ayuda={p.ayuda}
        onChange={(e) => p.onChange(e.target.value)}
      />
      <Casilla etiqueta="Mostrar contraseña" checked={ver} onChange={(e) => setVer(e.target.checked)} />
    </div>
  );
}

const hoy = () => new Date().toISOString().slice(0, 10);

export function Registro() {
  const navegar = useNavigate();
  const { yo } = useSesion();
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [d, setD] = useState({
    nombre: '',
    email: '',
    password: '',
    fechaNacimiento: '',
    genero: '',
    aceptaPrivacidad: false,
  });

  if (yo) return <Navigate to="/" replace />;

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    // Validación previa en el navegador (el servidor vuelve a validar todo).
    const faltan: Record<string, string> = {};
    if (!d.nombre.trim()) faltan.nombre = 'El nombre es obligatorio.';
    if (!d.email.trim()) faltan.email = 'El correo es obligatorio.';
    if (d.password.length < 8) faltan.password = 'La contraseña debe tener al menos 8 caracteres.';
    if (!d.fechaNacimiento) faltan.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
    else if (d.fechaNacimiento > hoy()) faltan.fechaNacimiento = 'La fecha de nacimiento no puede ser futura.';
    if (!d.genero) faltan.genero = 'Elige una opción de género.';
    if (!d.aceptaPrivacidad) faltan.aceptaPrivacidad = 'Debes aceptar la política de tratamiento de datos para crear tu cuenta.';
    if (Object.keys(faltan).length) return setErrores(faltan);

    await enviar(async () => {
      await api('/auth/registro', { body: d });
      navegar('/login', { state: { creada: true } });
    });
  }

  return (
    <PaginaPublica titulo="Crea tu cuenta de voluntario">
      <form onSubmit={alEnviar} noValidate className="flex flex-col gap-4">
        <ResumenErrores errores={resumen} />
        <Campo
          etiqueta="Nombre completo"
          autoComplete="name"
          required
          value={d.nombre}
          error={errores.nombre}
          onChange={(e) => setD({ ...d, nombre: e.target.value })}
        />
        <Campo
          etiqueta="Correo"
          type="email"
          autoComplete="email"
          required
          value={d.email}
          error={errores.email}
          onChange={(e) => setD({ ...d, email: e.target.value })}
        />
        <CampoContrasena
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres."
          value={d.password}
          error={errores.password}
          onChange={(v) => setD({ ...d, password: v })}
        />
        <Campo
          etiqueta="Fecha de nacimiento"
          type="date"
          max={hoy()}
          required
          value={d.fechaNacimiento}
          error={errores.fechaNacimiento}
          onChange={(e) => setD({ ...d, fechaNacimiento: e.target.value })}
        />
        <Selector
          etiqueta="Género"
          opciones={GENEROS}
          required
          value={d.genero}
          error={errores.genero}
          onChange={(e) => setD({ ...d, genero: e.target.value })}
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
        <Boton type="submit" cargando={enviando} textoCargando="Creando cuenta…">
          Crear cuenta
        </Boton>
        <p className="text-center">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-bold text-primary-700 underline decoration-2">
            Inicia sesión
          </Link>
        </p>
      </form>
    </PaginaPublica>
  );
}
