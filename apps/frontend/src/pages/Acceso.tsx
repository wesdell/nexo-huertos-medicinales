import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { CONTRASENA_MIN } from '@nexo/shared';
import { api } from '../api';
import { useEnvio } from '../formulario';
import { Marca } from '../Layout';
import { useSesion } from '../sesion';
import { Banner, Boton, Campo, Casilla, ResumenErrores, Tarjeta } from '../ui';

export function PaginaPublica({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh px-4 py-8 sm:py-14">
      <main id="contenido" className="mx-auto max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Link to="/" aria-label="Nexo, ir a la portada">
            <Marca />
          </Link>
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

/** Ingreso de responsables, técnicos del MSP y administradores. Los voluntarios no tienen cuenta. */
export function Login() {
  const { yo, entrar } = useSesion();
  const navegar = useNavigate();
  const loc = useLocation();
  const { errores, enviando, enviar, resumen } = useEnvio();
  const [datos, setDatos] = useState({ email: '', password: '' });

  if (yo) return <Navigate to="/panel" replace />;

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    await enviar(async () => {
      const { token, debeCambiarClave } = await api<{ token: string; debeCambiarClave: boolean }>('/auth/login', { body: datos });
      await entrar(token);
      navegar(debeCambiarClave ? '/panel/clave' : ((loc.state as { desde?: string } | null)?.desde ?? '/panel'), { replace: true });
    });
  }

  return (
    <PaginaPublica titulo="Ingresa a tu panel">
      <form onSubmit={alEnviar} noValidate className="flex flex-col gap-4">
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
          etiqueta="Contraseña"
          autoComplete="current-password"
          value={datos.password}
          error={errores.password}
          onChange={(v) => setDatos({ ...datos, password: v })}
        />
        <Boton type="submit" cargando={enviando} textoCargando="Entrando…">
          Entrar
        </Boton>
        <p className="text-sm text-luna-600">
          Solo tienen cuenta el responsable de cada huerto y el personal del MSP. ¿Quieres un huerto?{' '}
          <Link to="/solicitar" className="font-bold text-primary-700 underline decoration-2">
            Solicítalo aquí
          </Link>
          . ¿Olvidaste tu contraseña? Pide al técnico del MSP que la restablezca.
        </p>
      </form>
    </PaginaPublica>
  );
}

function CampoContrasena(p: { etiqueta: string; value: string; error?: string; autoComplete: string; ayuda?: string; onChange: (v: string) => void }) {
  const [ver, setVer] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <Campo
        etiqueta={p.etiqueta}
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

/** Reunión MSP: la clave inicial llega por correo y debe cambiarse en el primer ingreso. */
export function CambioClave() {
  const { yo, recargar } = useSesion();
  const navegar = useNavigate();
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [d, setD] = useState({ actual: '', nueva: '', repetir: '' });

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    if (d.nueva.length < CONTRASENA_MIN) return setErrores({ nueva: `La nueva contraseña debe tener al menos ${CONTRASENA_MIN} caracteres.` });
    if (d.nueva !== d.repetir) return setErrores({ repetir: 'Las contraseñas no coinciden.' });
    await enviar(async () => {
      await api('/auth/clave', { body: { actual: d.actual, nueva: d.nueva } });
      await recargar();
      navegar('/panel', { replace: true });
    });
  }

  return (
    <PaginaPublica titulo={yo?.debeCambiarClave ? 'Crea tu contraseña' : 'Cambiar contraseña'}>
      <form onSubmit={alEnviar} noValidate className="flex flex-col gap-4">
        {yo?.debeCambiarClave && (
          <Banner tipo="info">Bienvenida o bienvenido, {yo.nombre.split(' ')[0]}. Por seguridad, cambia la contraseña temporal que recibiste por correo.</Banner>
        )}
        <ResumenErrores errores={resumen} />
        <CampoContrasena
          etiqueta="Contraseña actual (la del correo)"
          autoComplete="current-password"
          value={d.actual}
          error={errores.actual}
          onChange={(v) => setD({ ...d, actual: v })}
        />
        <CampoContrasena
          etiqueta="Nueva contraseña"
          ayuda={`Mínimo ${CONTRASENA_MIN} caracteres.`}
          autoComplete="new-password"
          value={d.nueva}
          error={errores.nueva}
          onChange={(v) => setD({ ...d, nueva: v })}
        />
        <Campo
          etiqueta="Repite la nueva contraseña"
          type="password"
          autoComplete="new-password"
          value={d.repetir}
          error={errores.repetir}
          onChange={(e) => setD({ ...d, repetir: e.target.value })}
        />
        <Boton type="submit" cargando={enviando}>
          Guardar contraseña
        </Boton>
      </form>
    </PaginaPublica>
  );
}
