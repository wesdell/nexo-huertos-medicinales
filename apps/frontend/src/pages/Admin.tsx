import { useState, type FormEvent } from 'react';
import { NOMBRE_ROL, type Rol } from '@nexo/shared';
import { Database, Download, HardDrive, Mail, Server, UserPlus } from 'lucide-react';
import { api, ApiError, token } from '../api';
import { fechaCorta, numero, useDatos } from '../datos';
import { useEnvio } from '../formulario';
import { useSesion } from '../sesion';
import { Banner, Boton, Campo, Cargando, Chip, Cifra, Encabezado, ResumenErrores, Tarjeta, useToast } from '../ui';

interface EstadoSistema {
  version: string;
  baseDatos: { latenciaMs: number; bytes: number; tablas: { tabla: string; filas: number }[] };
  archivos: { cantidad: number; bytes: number };
  memoriaMb: number;
  activoDesde: string;
}
const mb = (b: number) => `${(b / 1048576).toLocaleString('es-EC', { maximumFractionDigits: 1 })} MB`;

/** Administrador técnico del sistema: respaldos, base de datos y soporte (distinto del técnico del MSP). */
export function PanelAdmin() {
  const { datos: e, error, recargar } = useDatos<EstadoSistema>('/admin/estado');
  const [descargando, setDescargando] = useState(false);
  const [errorRespaldo, setErrorRespaldo] = useState('');

  async function respaldo() {
    setDescargando(true);
    setErrorRespaldo('');
    try {
      const res = await fetch('/api/admin/respaldo', { headers: { Authorization: `Bearer ${token.leer()}` } });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo generar el respaldo.');
      const nombre = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'respaldo-nexo.sql';
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = nombre;
      a.click();
      URL.revokeObjectURL(url);
    } catch (x) {
      setErrorRespaldo((x as Error).message);
    } finally {
      setDescargando(false);
    }
  }

  if (error) return <Banner tipo="error">{error}</Banner>;
  if (!e) return <Cargando />;
  return (
    <div className="space-y-6">
      <Encabezado
        titulo="Estado del sistema"
        texto={`Versión ${e.version} · en línea desde ${fechaCorta(e.activoDesde)}`}
        accion={
          <Boton variante="secundario" onClick={() => void recargar()}>
            Actualizar
          </Boton>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Cifra valor={`${e.baseDatos.latenciaMs} ms`} etiqueta="Respuesta de la base" Icono={Database} />
        <Cifra valor={mb(e.baseDatos.bytes)} etiqueta="Tamaño de la base" Icono={HardDrive} />
        <Cifra valor={`${numero(e.archivos.cantidad)} · ${mb(e.archivos.bytes)}`} etiqueta="Fotos y videos" Icono={HardDrive} />
        <Cifra valor={`${e.memoriaMb} MB`} etiqueta="Memoria de la API" Icono={Server} />
      </div>
      <Tarjeta className="space-y-3">
        <h2 className="text-2xl">Respaldo</h2>
        <p>
          Descarga un respaldo completo de la base de datos (SQL de PostgreSQL) y guárdalo fuera del servidor. Las fotos y videos se respaldan copiando el
          volumen de archivos.
        </p>
        <Boton onClick={() => void respaldo()} cargando={descargando} textoCargando="Generando respaldo…">
          <Download aria-hidden="true" className="size-5" />
          Descargar respaldo
        </Boton>
        {errorRespaldo && <Banner tipo="error">{errorRespaldo}</Banner>}
        <p className="text-sm text-luna-600">
          Para restaurar: <code className="rounded bg-tierra-100 px-1">psql -U nexo -d nexo -f respaldo.sql</code> sobre una base vacía.
        </p>
      </Tarjeta>
      <Tarjeta className="space-y-3">
        <h2 className="text-2xl">Tablas</h2>
        <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {e.baseDatos.tablas.map((t) => (
            <li key={t.tabla} className="flex justify-between border-b border-tierra-100 py-1">
              <span>{t.tabla}</span>
              <span className="font-bold tabular-nums">{numero(t.filas)}</span>
            </li>
          ))}
        </ul>
      </Tarjeta>
      <Banner tipo="info">
        <Mail aria-hidden="true" className="mr-1 inline size-4" />
        En la demo, los correos con las contraseñas temporales llegan a la bandeja de Mailpit: http://localhost:8025
      </Banner>
    </div>
  );
}

interface Cuenta {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  debeCambiarClave: boolean;
  creadoEn: string;
  _count: { huertos: number };
}

export function Usuarios() {
  const { yo } = useSesion();
  const { datos, cargando, recargar } = useDatos<Cuenta[]>('/admin/usuarios');
  const toast = useToast();
  const { errores, setErrores, enviando, enviar, resumen } = useEnvio();
  const [d, setD] = useState({ nombre: '', email: '' });
  const [error, setError] = useState('');

  async function crear(e: FormEvent) {
    e.preventDefault();
    const f: Record<string, string> = {};
    if (!d.nombre.trim()) f.nombre = 'El nombre es obligatorio.';
    if (!/^\S+@\S+\.\S+$/.test(d.email)) f.email = 'Escribe un correo válido.';
    if (Object.keys(f).length) return setErrores(f);
    await enviar(async () => {
      await api('/admin/tecnicos', { body: d });
      toast(`Cuenta de técnico creada. La contraseña temporal se envió a ${d.email}.`);
      setD({ nombre: '', email: '' });
      void recargar();
    });
  }
  async function alternar(c: Cuenta) {
    setError('');
    try {
      await api(`/admin/usuarios/${c.id}/${c.activo ? 'desactivar' : 'activar'}`, { method: 'POST' });
      void recargar();
    } catch (x) {
      setError(x instanceof ApiError ? x.message : 'No se pudo cambiar.');
    }
  }

  return (
    <div className="space-y-6">
      <Encabezado titulo="Cuentas" texto="Crea cuentas para los técnicos del MSP. Las de responsables nacen al aprobar un huerto." />
      <Tarjeta>
        <form onSubmit={crear} noValidate className="space-y-4">
          <h2 className="text-xl">Nuevo técnico del MSP</h2>
          <ResumenErrores errores={resumen} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre" value={d.nombre} error={errores.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} />
            <Campo etiqueta="Correo" type="email" value={d.email} error={errores.email} onChange={(e) => setD({ ...d, email: e.target.value })} />
          </div>
          <Boton type="submit" cargando={enviando}>
            <UserPlus aria-hidden="true" className="size-5" />
            Crear cuenta
          </Boton>
        </form>
      </Tarjeta>
      {error && <Banner tipo="error">{error}</Banner>}
      {cargando && !datos ? (
        <Cargando />
      ) : (
        <Tarjeta className="p-0 sm:p-0">
          <ul className="divide-y divide-tierra-100">
            {datos?.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <span>
                  <strong>{c.nombre}</strong>
                  <span className="block text-sm text-luna-600">
                    {c.email} · {NOMBRE_ROL[c.rol]}
                    {c.rol === 'RESPONSABLE' && ` · ${c._count.huertos} huerto${c._count.huertos === 1 ? '' : 's'}`}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  {c.debeCambiarClave && <Chip tono="aviso">Clave temporal</Chip>}
                  {!c.activo && <Chip tono="error">Inactiva</Chip>}
                  {c.id !== yo?.id && (
                    <Boton variante="texto" onClick={() => void alternar(c)}>
                      {c.activo ? 'Desactivar' : 'Activar'}
                    </Boton>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}
    </div>
  );
}
